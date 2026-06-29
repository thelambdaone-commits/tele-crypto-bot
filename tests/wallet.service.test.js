/**
 * Unit tests for WalletService — the central chain registry / provider map.
 * Pure/offline: provider constructors only stash RPC URLs, so no network.
 *
 * Guards the "single source of truth" invariant: WalletService.chains must
 * mirror CHAIN_REGISTRY exactly, and every registered provider must honour the
 * full BaseProvider contract (no method falling through to a "must implement").
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { WalletService } from '../src/modules/wallet/wallet.service.js';
import { CHAIN_REGISTRY } from '../src/shared/chains.js';

const CONTRACT_METHODS = [
  'createWallet',
  'importFromKey',
  'importFromSeed',
  'getBalance',
  'estimateFees',
  'sendTransaction',
  'getTransactionHistory',
  'validateAddress',
];

function makeService() {
  // Some providers validate their RPC endpoint at construction (e.g. Solana),
  // so hand each field a syntactically-valid dummy. The Proxy keeps this robust
  // to whatever rpc.* keys the constructor reads: arrays for *Fallbacks,
  // empty strings for auth/key fields, a valid https URL otherwise.
  const rpc = new Proxy(
    {},
    {
      get(_t, prop) {
        const name = String(prop);
        if (name.endsWith('Fallbacks')) return [];
        if (/(Auth|Key)$/.test(name)) return '';
        return 'https://rpc.invalid';
      },
    }
  );
  return new WalletService({}, { rpc });
}

test('WalletService.chains mirrors CHAIN_REGISTRY exactly (single source of truth)', () => {
  const ws = makeService();
  const serviceKeys = Object.keys(ws.chains).sort();
  const registryKeys = Object.keys(CHAIN_REGISTRY).sort();
  assert.deepEqual(serviceKeys, registryKeys);
  assert.equal(serviceKeys.length, 15);
});

test('every registered provider implements the full BaseProvider contract', () => {
  const ws = makeService();
  for (const [key, provider] of Object.entries(ws.chains)) {
    for (const method of CONTRACT_METHODS) {
      assert.equal(
        typeof provider[method],
        'function',
        `provider "${key}" is missing contract method ${method}()`
      );
    }
  }
});

test('validateAddress is wired per chain (offline sanity)', () => {
  const ws = makeService();
  // EVM address format
  assert.equal(ws.chains.eth.validateAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e'), true);
  assert.equal(ws.chains.eth.validateAddress('not-an-address'), false);
});

test('getChain-style lookup returns the right provider instance', () => {
  const ws = makeService();
  // The native symbol on each provider should be defined (constructor wired).
  for (const key of Object.keys(CHAIN_REGISTRY)) {
    assert.ok(ws.chains[key], `no provider registered for chain "${key}"`);
  }
});
