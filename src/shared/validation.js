/**
 * Centralized Validation Utilities
 */

/**
 * Basic check for EVM/Solana/BTC address formats
 * @param {string} address 
 * @param {string} chain 
 * @returns {boolean}
 */
export function isValidAddress(address, chain = null) {
  if (!address || typeof address !== 'string') return false;
  
  const trimmed = address.trim();
  
  // EVM (Ethereum, Arbitrum, etc.)
  if (chain === 'eth' || chain === 'arb' || chain === 'matic' || chain === 'base' || chain === 'op') {
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  }
  
  // Solana
  if (chain === 'sol') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
  }
  
  // Bitcoin (Basic check for P2PKH, P2SH, Segwit)
  if (chain === 'btc') {
    return /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(trimmed);
  }
  
  // Generic fallback if chain not specified
  if (!chain) {
    return /^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44}|(1|3|bc1)[a-zA-Z0-9]{25,62})$/.test(trimmed);
  }
  
  return false;
}

/**
 * Validate amount is a positive number
 * @param {any} amount 
 * @returns {boolean}
 */
export function isValidAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && isFinite(num) && num > 0;
}
