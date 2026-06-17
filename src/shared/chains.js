/**
 * Canonical chain key lists — single source of truth shared by handlers so the
 * supported-chain set can't drift between /bal, /send, /tx, the analyze flow and
 * the deposit flow. Mirrors the chains registered in WalletService.chains.
 */
export const SUPPORTED_CHAINS = [
  'eth',
  'btc',
  'sol',
  'arb',
  'matic',
  'op',
  'base',
  'avax',
  'ltc',
  'bch',
  'xmr',
  'zec',
  'trx',
];

// EVM chains share one 0x address format and can receive on any EVM network.
export const EVM_CHAINS = new Set(['eth', 'arb', 'op', 'base', 'matic', 'avax']);

export function isEvmChain(chain) {
  return EVM_CHAINS.has(String(chain || '').toLowerCase());
}

export function isSupportedChain(chain) {
  return SUPPORTED_CHAINS.includes(String(chain || '').toLowerCase());
}
