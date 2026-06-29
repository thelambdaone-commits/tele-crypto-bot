import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectChain } from '../src/shared/address-detector.js';

test('detects prefixless Bitcoin Cash cashaddr before Solana', () => {
  assert.equal(detectChain('qrmfkegyf83zh5kauzwgygf82sdahd5a55x9wse7ve'), 'bch');
  assert.equal(detectChain('bitcoincash:qrmfkegyf83zh5kauzwgygf82sdahd5a55x9wse7ve'), 'bch');
});

test('detects common chain address formats', () => {
  assert.equal(detectChain('0x742d35Cc6634C0532925a3b844Bc454e4438f44e'), 'eth');
  assert.equal(detectChain('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'), 'btc');
  assert.equal(detectChain('ltc1qr07zu594qf63xm7l7x6pu3a2v39m2z6hh5pp4t'), 'ltc');
  assert.equal(detectChain('So11111111111111111111111111111111111111112'), 'sol');
});

test('detects Tron base58check addresses before Solana', () => {
  // Tron and Solana share the base58 alphabet and Tron's 34-char length fits
  // Solana's 32-44 range, so this only resolves via base58check + 0x41 prefix.
  assert.equal(detectChain('TM5n4iJYktXWaAPHwxxUns3XRTFSZXFwFc'), 'trx');
  assert.equal(detectChain('TLKhqL4yXaRSkCSQ4vRncPVwvb3JdvdStr'), 'trx');
  // A 34-char "T…" string with a bad checksum is not Tron — falls through to Solana.
  assert.equal(detectChain('TMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'), 'sol');
});

test('rejects unsupported address input', () => {
  assert.equal(detectChain('not-an-address'), null);
  assert.equal(detectChain(''), null);
  assert.equal(detectChain(null), null);
});
