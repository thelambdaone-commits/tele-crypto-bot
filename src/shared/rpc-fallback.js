import { withTimeout } from './rpc-timeout.js';

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BASE_DELAY = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function rpcFallback(
  endpoints,
  fn,
  { timeout = DEFAULT_TIMEOUT, maxRetries = DEFAULT_MAX_RETRIES, baseDelay = DEFAULT_BASE_DELAY } = {}
) {
  const endpointList = Array.isArray(endpoints) ? endpoints : [endpoints];
  const totalAttempts = Math.max(1, maxRetries + 1);

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const endpoint = endpointList[attempt % endpointList.length];

    try {
      const result = await withTimeout(fn(endpoint), timeout, `RPC timeout after ${timeout}ms`);
      return result;
    } catch (error) {
      const isLastAttempt = attempt === totalAttempts - 1;
      if (isLastAttempt) {
        throw error;
      }

      if (attempt > 0 && endpointList.length > 1) {
        await sleep(baseDelay * Math.pow(2, attempt - 1));
      }
    }
  }
}
