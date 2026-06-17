/**
 * Address-validation + key/seed import tests for the non-EVM, non-Bitcoin-family
 * providers: Tron (base58check + BIP-44/195 import), Monero and Zcash (address
 * shape validation). monero-ts is lazy-loaded inside MoneroChain, so importing
 * the provider here does not pull the heavy WASM module.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TronChain } from '../src/providers/tron.js';
import { MoneroChain } from '../src/providers/monero.js';
import { ZcashChain } from '../src/providers/zcash.js';

const TEST_MNEMONIC = 'test test test test test test test test test test test junk';
const TEST_PRIVKEY = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// ── Tron ─────────────────────────────────────────────────────────────────────

test('Tron: validateAddress accepts a real T-address, rejects junk', () => {
  const trx = new TronChain();
  // USDT-TRC20 contract — a well-known valid base58check Tron address.
  assert.equal(trx.validateAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'), true);
  assert.equal(trx.validateAddress('TInvalidAddressZzzzzzzzzzzzzzzzzzzz'), false);
  assert.equal(trx.validateAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'), false);
  assert.equal(trx.validateAddress(''), false);
});

test('Tron: importFromKey returns a valid T-address', async () => {
  const trx = new TronChain();
  const w = await trx.importFromKey(TEST_PRIVKEY);
  assert.match(w.address, /^T[1-9A-HJ-NP-Za-km-z]{33}$/);
  assert.equal(trx.validateAddress(w.address), true);
  assert.equal(w.privateKey, TEST_PRIVKEY);
});

test('Tron: importFromSeed validates the mnemonic and derives a T-address', async () => {
  const trx = new TronChain();
  const w = await trx.importFromSeed(TEST_MNEMONIC);
  assert.equal(trx.validateAddress(w.address), true);
  assert.equal(w.mnemonic, TEST_MNEMONIC);
  await assert.rejects(() => trx.importFromSeed('not a valid mnemonic'), /invalide/i);
});

// ── Monero ───────────────────────────────────────────────────────────────────

test('Monero: validateAddress accepts standard (95) and integrated (106) shapes', () => {
  const xmr = new MoneroChain();
  assert.equal(xmr.validateAddress('4' + 'x'.repeat(94)), true); // standard
  assert.equal(xmr.validateAddress('8' + 'y'.repeat(94)), true); // sub/standard
  assert.equal(xmr.validateAddress('4' + 'z'.repeat(105)), true); // integrated
  assert.equal(xmr.validateAddress('5' + 'x'.repeat(94)), false); // wrong prefix
  assert.equal(xmr.validateAddress('4' + 'x'.repeat(90)), false); // wrong length
  assert.equal(xmr.validateAddress(''), false);
});

// ── Zcash ────────────────────────────────────────────────────────────────────

test('Zcash: validateAddress accepts transparent t1/t3, rejects others', () => {
  const zec = new ZcashChain();
  assert.equal(zec.validateAddress('t1' + 'x'.repeat(33)), true);
  assert.equal(zec.validateAddress('t3' + 'x'.repeat(33)), true);
  assert.equal(zec.validateAddress('t2' + 'x'.repeat(33)), false); // no t2
  assert.equal(zec.validateAddress('t1' + 'x'.repeat(30)), false); // too short
  assert.equal(zec.validateAddress('bc1qxyz'), false);
  assert.equal(zec.validateAddress(''), false);
});
