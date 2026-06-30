import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as tinysecp from 'tiny-secp256k1';
import { BitcoinCashChain } from '../src/providers/bitcoincash.js';

const ECPair = ECPairFactory(tinysecp);

// Build a signed BCH tx fully offline: stub the UTXO fetch and broadcast, capture
// the produced hex, and verify the BCH (BIP143 + SIGHASH_FORKID) signatures.
async function buildSignedTx({ inputs = 1, amountBch = 0.0005 } = {}) {
  const bch = new BitcoinCashChain();
  const wallet = await bch.createWallet();
  const keyPair = ECPair.fromWIF(wallet.privateKey, bch.network);
  const pubkey = Buffer.from(keyPair.publicKey);

  const utxos = Array.from({ length: inputs }, (_, i) => ({
    txHash: (i + 1).toString(16).padStart(2, '0').repeat(32),
    index: i,
    value: 100000,
  }));
  bch.getUtxos = async () => utxos;

  let capturedHex = null;
  bch.broadcastTransaction = async (hex) => {
    capturedHex = hex;
    return 'deadbeef'.repeat(8);
  };

  const result = await bch.sendTransaction(wallet.privateKey, wallet.address, amountBch);
  return { bch, wallet, keyPair, pubkey, utxos, capturedHex, result };
}

test('BCH sendTransaction produces a parseable, correctly-structured tx', async () => {
  const { capturedHex, result } = await buildSignedTx();
  assert.ok(capturedHex, 'broadcast received a tx hex');
  const tx = bitcoin.Transaction.fromHex(capturedHex);
  assert.equal(tx.version, 2);
  assert.equal(tx.ins.length, 1);
  // recipient + change (100000 in, 50000 out, fee ~226 → change well above dust)
  assert.equal(tx.outs.length, 2);
  assert.equal(result.status, 'broadcast');
  assert.equal(result.hash, 'deadbeef'.repeat(8));
});

test('every BCH input is signed with SIGHASH_FORKID (0x41) and verifies', async () => {
  const { capturedHex, keyPair, pubkey, utxos, bch } = await buildSignedTx({ inputs: 2 });
  const tx = bitcoin.Transaction.fromHex(capturedHex);
  assert.equal(tx.ins.length, 2);

  const prevScript = bitcoin.payments.p2pkh({ pubkey, network: bch.network }).output;

  for (let i = 0; i < tx.ins.length; i++) {
    const chunks = bitcoin.script.decompile(tx.ins[i].script);
    assert.equal(chunks.length, 2, 'scriptSig is [signature, pubkey]');
    const [sigChunk, pubChunk] = chunks;

    // pubkey matches the signer
    assert.equal(Buffer.from(pubChunk).toString('hex'), pubkey.toString('hex'));

    // trailing hashtype byte must be 0x41 (SIGHASH_ALL | SIGHASH_FORKID)
    assert.equal(sigChunk[sigChunk.length - 1], 0x41, 'forkid hashtype');

    // recompute the BCH BIP143 sighash and verify the DER signature against it
    const sighash = tx.hashForWitnessV0(i, prevScript, BigInt(utxos[i].value), 0x41);
    const decoded = bitcoin.script.signature.decode(
      Buffer.concat([sigChunk.subarray(0, sigChunk.length - 1), Buffer.from([0x01])])
    );
    assert.ok(keyPair.verify(sighash, decoded.signature), `input ${i} signature verifies`);
  }
});

test('BCH send rejects when balance cannot cover amount + fee', async () => {
  const bch = new BitcoinCashChain();
  const wallet = await bch.createWallet();
  bch.getUtxos = async () => [{ txHash: 'ab'.repeat(32), index: 0, value: 1000 }];
  bch.broadcastTransaction = async () => 'x';
  await assert.rejects(
    () => bch.sendTransaction(wallet.privateKey, wallet.address, 1), // 1 BCH ≫ 1000 sats
    /insuffisant/i
  );
});

test('BCH send omits a dust change output', async () => {
  const bch = new BitcoinCashChain();
  const wallet = await bch.createWallet();
  // input only marginally above amount+fee → change would be dust → single output
  bch.getUtxos = async () => [{ txHash: 'cd'.repeat(32), index: 0, value: 50500 }];
  let hex = null;
  bch.broadcastTransaction = async (h) => ((hex = h), 'txid');
  await bch.sendTransaction(wallet.privateKey, wallet.address, 0.0005); // 50000 sats
  const tx = bitcoin.Transaction.fromHex(hex);
  assert.equal(tx.outs.length, 1, 'dust change is dropped, only the recipient output remains');
});
