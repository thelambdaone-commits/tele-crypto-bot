import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPaymentURI } from '../src/shared/payment-uri.js';

const EVM_ADDR = '0x1111111111111111111111111111111111111111';
const SOL_ADDR = 'So11111111111111111111111111111111111111112';
const USDT_ERC20 = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_SPL = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

test('EVM native encodes EIP-681 with chainId', () => {
  assert.equal(buildPaymentURI('eth', EVM_ADDR), `ethereum:${EVM_ADDR}@1`);
  assert.equal(buildPaymentURI('base', EVM_ADDR), `ethereum:${EVM_ADDR}@8453`);
  assert.equal(buildPaymentURI('op', EVM_ADDR), `ethereum:${EVM_ADDR}@10`);
});

test('EVM token encodes EIP-681 transfer to the contract', () => {
  assert.equal(
    buildPaymentURI('eth', EVM_ADDR, { contract: USDT_ERC20 }),
    `ethereum:${USDT_ERC20}@1/transfer?address=${EVM_ADDR}`
  );
});

test('Solana uses Solana Pay, with spl-token for SPL deposits', () => {
  assert.equal(buildPaymentURI('sol', SOL_ADDR), `solana:${SOL_ADDR}`);
  assert.equal(
    buildPaymentURI('sol', SOL_ADDR, { mint: USDT_SPL }),
    `solana:${SOL_ADDR}?spl-token=${USDT_SPL}`
  );
});

test('UTXO / privacy chains use their BIP-21-style scheme', () => {
  assert.equal(buildPaymentURI('btc', 'bc1qxyz'), 'bitcoin:bc1qxyz');
  assert.equal(buildPaymentURI('ltc', 'ltc1qxyz'), 'litecoin:ltc1qxyz');
  assert.equal(buildPaymentURI('xmr', '4xyz'), 'monero:4xyz');
  assert.equal(buildPaymentURI('zec', 't1xyz'), 'zcash:t1xyz');
});

test('does not double a scheme already present on the address (BCH cashaddr)', () => {
  assert.equal(
    buildPaymentURI('bch', 'bitcoincash:qrxyz'),
    'bitcoincash:qrxyz'
  );
  assert.equal(buildPaymentURI('bch', 'qrxyz'), 'bitcoincash:qrxyz');
});

test('Tron uses the tron: scheme', () => {
  const addr = 'TWer2Ygk5TEheHp3TPuYeqxmB6SsGZmaL6';
  assert.equal(buildPaymentURI('trx', addr), `tron:${addr}`);
  // TRC-20 deposits still resolve to a scannable tron: URI.
  assert.equal(buildPaymentURI('trx', addr, { contract: 'TR7N...' }), `tron:${addr}`);
});

test('unknown chain falls back to the bare address', () => {
  assert.equal(buildPaymentURI('doge', 'Dxyz'), 'Dxyz');
});
