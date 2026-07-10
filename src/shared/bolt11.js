/**
 * Minimal BOLT11 Lightning invoice decoder.
 *
 * Extracts the amount (in sats) from the human-readable part of a BOLT11
 * invoice. The full cryptographic verification is NOT performed here —
 * phoenixd handles that when paying.
 *
 * BOLT11 format: ln{prefix}{amount}{separator}{data}
 *   prefix: bc (mainnet), tb (testnet), bcrt (regtest)
 *   amount: optional, with multiplier (n=pico, u=milli, m=milli, no suffix=sat)
 *   separator: 1
 *   data: bech32-encoded data + signature
 */

const BOLT11_AMOUNT_MULTIPLIERS = {
  p: 0.000_000_000_001, // picoBTC → BTC
  n: 0.000_000_001,     // nanoBTC → BTC
  u: 0.000_001,         // microBTC → BTC
  m: 0.001,             // milliBTC → BTC
  '': 1,                // BTC (no suffix)
};

/**
 * Check if a string looks like a BOLT11 Lightning invoice.
 * Starts with lnbc (mainnet), lntb (testnet), or lnbcrt (regtest).
 */
export function isBolt11(text) {
  return /^ln(bc|tb|bcrt)/i.test(text.trim());
}

/**
 * Decode the amount from a BOLT11 invoice's human-readable part.
 * Returns { amountSat, description } or null if decoding fails.
 * amountSat may be null if the invoice has no amount embedded.
 */
export function decodeBolt11(invoice) {
  const raw = invoice.trim().toLowerCase();

  // Find the separator '1' — everything before it is the human-readable part
  const sepIdx = raw.indexOf('1');
  if (sepIdx < 3) return null;

  const hrp = raw.slice(0, sepIdx);
  // Strip the "ln" prefix and network prefix (bc, tb, bcrt)
  let rest = hrp.replace(/^ln(bcrt|tb|bc)/, '');

  // The remaining part is the amount + multiplier
  if (rest.length === 0) {
    // No amount in invoice
    return { amountSat: null };
  }

  // Last char might be a multiplier
  const lastChar = rest[rest.length - 1];
  let multiplier = '';
  let amountStr = rest;

  if (BOLT11_AMOUNT_MULTIPLIERS[lastChar] !== undefined) {
    multiplier = lastChar;
    amountStr = rest.slice(0, -1);
  }

  if (amountStr.length === 0) {
    // Multiplier only, no numeric value — shouldn't happen
    return { amountSat: null };
  }

  const amountNum = Number(amountStr);
  if (!Number.isFinite(amountNum) || amountNum < 0) return null;

  const btcAmount = amountNum * BOLT11_AMOUNT_MULTIPLIERS[multiplier];
  const amountSat = Math.round(btcAmount * 100_000_000);

  return { amountSat: amountSat > 0 ? amountSat : null };
}
