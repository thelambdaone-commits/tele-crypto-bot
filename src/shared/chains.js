/**
 * Single source of truth for per-chain metadata. The display/label/logo maps
 * used across the bot are DERIVED from CHAIN_REGISTRY so adding a chain means
 * editing one entry here instead of 4-5 scattered maps. Values are locked by
 * tests/chain-registry.test.js (derived maps must equal the historical values).
 *
 * Fields:
 *  - name:      human network label (qr badge / pickers)
 *  - emoji:     canonical chain glyph
 *  - logo:      cryptocurrency-icons symbol for the QR center (EVM L2s reuse eth)
 *  - native:    native asset symbol
 *  - evm:       true for EVM chains (share the 0x address format)
 *  - coingecko: CoinGecko id of the NATIVE asset (reference; price maps are not
 *               rewired here to avoid the chain-key/token-symbol collisions in
 *               coingecko.js)
 */
export const CHAIN_REGISTRY = {
  eth: { name: 'Ethereum', emoji: 'Ξ', logo: 'eth', native: 'ETH', evm: true, chainId: 1, coingecko: 'ethereum' },
  btc: { name: 'Bitcoin', emoji: '₿', logo: 'btc', native: 'BTC', evm: false, coingecko: 'bitcoin' },
  sol: { name: 'Solana', emoji: '◎', logo: 'sol', native: 'SOL', evm: false, coingecko: 'solana' },
  arb: { name: 'Arbitrum', emoji: '🔵', logo: 'eth', native: 'ETH', evm: true, chainId: 42161, coingecko: 'ethereum' },
  matic: { name: 'Polygon', emoji: '⬡', logo: 'matic', native: 'MATIC', evm: true, chainId: 137, coingecko: 'polygon-ecosystem-token' },
  op: { name: 'Optimism', emoji: '🔴', logo: 'eth', native: 'ETH', evm: true, chainId: 10, coingecko: 'ethereum' },
  base: { name: 'Base', emoji: '🟦', logo: 'eth', native: 'ETH', evm: true, chainId: 8453, coingecko: 'ethereum' },
  avax: { name: 'Avalanche', emoji: '🔺', logo: 'avax', native: 'AVAX', evm: true, chainId: 43114, coingecko: 'avalanche-2' },
  ltc: { name: 'Litecoin', emoji: 'Ł', logo: 'ltc', native: 'LTC', evm: false, coingecko: 'litecoin' },
  bch: { name: 'Bitcoin Cash', emoji: '🅑', logo: 'bch', native: 'BCH', evm: false, coingecko: 'bitcoin-cash' },
  xmr: { name: 'Monero', emoji: 'ɱ', logo: 'xmr', native: 'XMR', evm: false, coingecko: 'monero' },
  zec: { name: 'Zcash', emoji: 'Ⓩ', logo: 'zec', native: 'ZEC', evm: false, coingecko: 'zcash' },
  trx: { name: 'Tron', emoji: '🟥', logo: 'trx', native: 'TRX', evm: false, coingecko: 'tron' },
  ton: { name: 'TON', emoji: '💎', logo: 'ton', native: 'TON', evm: false, coingecko: 'the-open-network' },
  bsc: { name: 'BNB Chain', emoji: '🟡', logo: 'bnb', native: 'BNB', evm: true, chainId: 56, coingecko: 'binancecoin' },
};

// ── Derived lists/maps (do not hand-edit — change CHAIN_REGISTRY) ─────────────

export const SUPPORTED_CHAINS = Object.keys(CHAIN_REGISTRY);

export const EVM_CHAINS = new Set(
  Object.entries(CHAIN_REGISTRY)
    .filter(([, m]) => m.evm)
    .map(([chain]) => chain)
);

// chain → canonical glyph (was CHAIN_EMOJIS in ui/formatters.js)
export const CHAIN_EMOJIS = Object.fromEntries(
  Object.entries(CHAIN_REGISTRY).map(([chain, m]) => [chain, m.emoji])
);

// chain → cryptocurrency-icons symbol for the QR center logo
export const LOGO_SYMBOL = Object.fromEntries(
  Object.entries(CHAIN_REGISTRY).map(([chain, m]) => [chain, m.logo])
);

// chain → human network label drawn under the QR logo
export const NETWORK_LABEL = Object.fromEntries(
  Object.entries(CHAIN_REGISTRY).map(([chain, m]) => [chain, m.name])
);

// EVM chain key → EIP-155 chain id (only chains carrying a chainId). Drives
// EIP-681 payment URIs, so a new EVM chain only needs its chainId in the registry.
export const EVM_CHAIN_IDS = Object.fromEntries(
  Object.entries(CHAIN_REGISTRY)
    .filter(([, m]) => m.evm && m.chainId)
    .map(([chain, m]) => [chain, m.chainId])
);

// native asset symbol (BTC, ETH, TON, …) → canonical glyph, for any UI keyed by
// coin symbol rather than chain key (e.g. the deposit asset picker). The FIRST
// chain for a symbol wins, so ETH maps to Ξ (the L1) rather than an L2's glyph.
export const NATIVE_ICON = Object.values(CHAIN_REGISTRY).reduce((acc, m) => {
  if (!(m.native in acc)) acc[m.native] = m.emoji;
  return acc;
}, {});

export function isEvmChain(chain) {
  return EVM_CHAINS.has(String(chain || '').toLowerCase());
}

export function isSupportedChain(chain) {
  return SUPPORTED_CHAINS.includes(String(chain || '').toLowerCase());
}
