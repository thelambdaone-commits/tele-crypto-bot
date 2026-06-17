/**
 * KyberSwap aggregator adapter — keyless (no API key needed), EVM only.
 * Phase 1 implements read-only quoting. Building the swap calldata is also
 * read-only (it does not send anything); actually broadcasting is done by the
 * swap service via the provider, and only when swaps are enabled.
 *
 * Docs: https://docs.kyberswap.com/kyberswap-solutions/kyberswap-aggregator/aggregator-api-specification
 */

const BASE = 'https://aggregator-api.kyberswap.com';

// Our chain key → KyberSwap path slug.
const CHAIN_SLUG = {
  eth: 'ethereum',
  arb: 'arbitrum',
  matic: 'polygon',
  op: 'optimism',
  base: 'base',
  avax: 'avalanche',
};

// Sentinel address aggregators use for the native coin (ETH/MATIC/AVAX).
export const NATIVE_SENTINEL = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export function isSwapSupported(chain) {
  return Boolean(CHAIN_SLUG[String(chain || '').toLowerCase()]);
}

async function fetchJson(url, options, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`KyberSwap HTTP ${res.status}${json.message ? ` - ${json.message}` : ''}`);
    return json;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Read-only price route. Returns the raw routeSummary (opaque, fed back into
 * buildSwapTx) plus the output amount in base units.
 * @returns {Promise<{ amountOut: string, routeSummary: object, routerAddress: string }>}
 */
export async function getQuote({ chain, tokenIn, tokenOut, amountInWei }) {
  const slug = CHAIN_SLUG[chain];
  if (!slug) throw new Error(`Swaps non supportés sur ${chain}`);

  const params = new URLSearchParams({
    tokenIn,
    tokenOut,
    amountIn: String(amountInWei),
  });
  const json = await fetchJson(`${BASE}/${slug}/api/v1/routes?${params}`, {
    headers: { 'x-client-id': 'tele-crypto-bot' },
  });

  const routeSummary = json?.data?.routeSummary;
  if (json.code !== 0 || !routeSummary?.amountOut) {
    throw new Error(json.message || 'Aucune route de swap disponible');
  }
  return {
    amountOut: routeSummary.amountOut,
    routeSummary,
    routerAddress: json.data.routerAddress,
  };
}

/**
 * Build the swap calldata (read-only). The returned { to, data, value } is what
 * the swap service signs via provider.sendRaw — only when swaps are enabled.
 * @returns {Promise<{ to: string, data: string, value: string, amountOut: string }>}
 */
export async function buildSwapTx({ chain, routeSummary, sender, recipient, slippageBps = 50 }) {
  const slug = CHAIN_SLUG[chain];
  if (!slug) throw new Error(`Swaps non supportés sur ${chain}`);

  const json = await fetchJson(`${BASE}/${slug}/api/v1/route/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-id': 'tele-crypto-bot' },
    body: JSON.stringify({
      routeSummary,
      sender,
      recipient,
      slippageTolerance: slippageBps,
    }),
  });

  const data = json?.data;
  if (json.code !== 0 || !data?.data || !data?.routerAddress) {
    throw new Error(json.message || 'Échec de construction du swap');
  }
  return {
    to: data.routerAddress,
    data: data.data,
    value: data.transactionValue || '0',
    amountOut: data.amountOut,
  };
}
