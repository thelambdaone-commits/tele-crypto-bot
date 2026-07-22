/**
 * Solana key import tests — verifies that importFromKey handles every common
 * secret-key format: JSON array, Base58 (64-byte full key + 32-byte seed),
 * Hex (with and without 0x prefix).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SolanaChain } from '../src/providers/solana.js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const solana = new SolanaChain('https://api.mainnet-beta.solana.com');

// Generate a reference keypair once for all tests
const refKeypair = Keypair.generate();
const ADDRESS = refKeypair.publicKey.toString();
const SECRET_KEY = refKeypair.secretKey; // 64 bytes
const SEED = SECRET_KEY.slice(0, 32); // 32-byte seed

const testCases = [
  { name: 'JSON Array (64 bytes)', input: JSON.stringify(Array.from(SECRET_KEY)) },
  { name: 'Base58 (64 bytes)', input: bs58.encode(SECRET_KEY) },
  { name: 'Base58 (32 bytes seed)', input: bs58.encode(SEED) },
  { name: 'Hex (64 bytes)', input: Buffer.from(SECRET_KEY).toString('hex') },
  { name: 'Hex (32 bytes seed)', input: Buffer.from(SEED).toString('hex') },
  { name: 'Hex with 0x (64 bytes)', input: '0x' + Buffer.from(SECRET_KEY).toString('hex') },
];

for (const tc of testCases) {
  test(`Solana importFromKey: ${tc.name}`, async () => {
    const result = await solana.importFromKey(tc.input);
    assert.equal(result.address, ADDRESS, `should derive the same address from ${tc.name}`);
  });
}
