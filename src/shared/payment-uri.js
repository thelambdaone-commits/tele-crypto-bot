/**
 * Build a network-aware payment URI for a deposit QR code.
 *
 * Encoding the right URI scheme lets the sender's wallet recognise the network
 * (and, for tokens, pre-select the right asset) instead of treating the QR as a
 * bare string. We deliberately DO NOT encode an amount — a receive address is
 * open-ended — and we fall back to the plain address for anything we can't
 * model, so a QR is never *less* useful than before.
 *
 * Standards used:
 *  - EVM native : EIP-681  `ethereum:<addr>@<chainId>`
 *  - EVM token  : EIP-681  `ethereum:<token>@<chainId>/transfer?address=<addr>`
 *  - Solana     : Solana Pay `solana:<addr>[?spl-token=<mint>]`
 *  - UTXO/others: BIP-21-style scheme  `bitcoin:<addr>`, `litecoin:<addr>`, ...
 */

const EVM_CHAIN_IDS = {
  eth: 1,
  op: 10,
  arb: 42161,
  matic: 137,
  base: 8453,
  avax: 43114,
};

// Single-asset chains whose address maps to a simple URI scheme.
const SIMPLE_SCHEMES = {
  btc: 'bitcoin',
  ltc: 'litecoin',
  bch: 'bitcoincash',
  xmr: 'monero',
  zec: 'zcash',
  trx: 'tron',
};

/**
 * @param {string} chain   chain key (eth, btc, sol, op, ...)
 * @param {string} address recipient wallet address
 * @param {{contract?: string, mint?: string}|null} [token] token metadata
 *        for non-native deposits (EVM `contract` or Solana `mint`)
 * @returns {string} a payment URI, or the bare address as a safe fallback
 */
export function buildPaymentURI(chain, address, token = null) {
  if (!address) return address;
  const addr = String(address);

  // EVM chains (native + ERC-20).
  if (chain in EVM_CHAIN_IDS) {
    const chainId = EVM_CHAIN_IDS[chain];
    if (token?.contract) {
      return `ethereum:${token.contract}@${chainId}/transfer?address=${addr}`;
    }
    return `ethereum:${addr}@${chainId}`;
  }

  // Solana (native SOL + SPL tokens) via Solana Pay.
  if (chain === 'sol') {
    return token?.mint ? `solana:${addr}?spl-token=${token.mint}` : `solana:${addr}`;
  }

  // Simple single-asset schemes. Don't double a scheme already on the address
  // (BCH cashaddr can already carry a `bitcoincash:` prefix).
  const scheme = SIMPLE_SCHEMES[chain];
  if (scheme) {
    return addr.includes(':') ? addr : `${scheme}:${addr}`;
  }

  // Unknown chain → bare address (still a valid, scannable QR).
  return addr;
}
