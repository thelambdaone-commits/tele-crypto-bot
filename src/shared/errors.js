/**
 * Custom Error Hierarchy for the application
 */

export class TransactionError extends Error {
  constructor(message, { code = 'UNKNOWN', txHash, chain, details } = {}) {
    super(message);
    this.name = 'TransactionError';
    this.code = code;
    this.txHash = txHash;
    this.chain = chain;
    this.details = details;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TransactionError);
    }
  }
}

/**
 * Standard Error Codes for Transactions
 */
export const ERROR_CODES = {
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_GAS: 'INSUFFICIENT_GAS',
  RPC_ERROR: 'RPC_ERROR',
  BROADCAST_FAILED: 'BROADCAST_FAILED',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  NO_UTXOS: 'NO_UTXOS',
  SIMULATION_ERROR: 'SIMULATION_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  TIMEOUT: 'TIMEOUT',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  DUPLICATE_TX: 'DUPLICATE_TX',
  SAME_ADDRESS: 'SAME_ADDRESS',
  UNKNOWN: 'UNKNOWN'
};
