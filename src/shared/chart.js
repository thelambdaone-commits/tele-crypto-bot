/**
 * Chart Generation Service - Creates price charts for cryptocurrencies
 */
import { formatPriceUpdateDate } from './price.js';
import { formatPriceEUR } from './formatters.js';
import { COINGECKO_API, COIN_IDS, fetchWithFallback, COINGECKO_API_KEY } from './coingecko.js';

const width = 800;
const height = 400;
const GRAPH_USAGE = 'Usage : /graph <token> [7|30|90|365] (défaut : 365)';
const SUPPORTED_PERIODS = new Set(['7', '30', '90', '365']);
const DEFAULT_PERIOD = 365;
const PRICE_HISTORY_CACHE_TTL = 5 * 60 * 1000;
const PRICE_HISTORY_STALE_TTL = 60 * 60 * 1000;

let chartJSNodeCanvas = null;

async function getCanvas() {
  if (!chartJSNodeCanvas) {
    const { ChartJSNodeCanvas } = await import('chartjs-node-canvas');
    chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: '#1a1a2e',
    });
  }
  return chartJSNodeCanvas;
}

const priceHistoryCache = new Map();
const priceHistoryInflight = new Map();

const COINGECKO_IDS = COIN_IDS;

// One entry per token id in COIN_IDS. Keep these in sync — a missing entry no
// longer crashes (see DEFAULT_COLOR below), it just falls back to a neutral hue.
const CHAIN_COLORS = {
  btc: { line: '#f7931a' },
  eth: { line: '#627eea' },
  sol: { line: '#9945ff' },
  base: { line: '#0052ff' },
  op: { line: '#ff0420' },
  matic: { line: '#8247e5' },
  pol: { line: '#8247e5' },
  avax: { line: '#e84142' },
  usdc: { line: '#2775ca' },
  usdt: { line: '#26a17b' },
  dai: { line: '#f5ac37' },
  wbtc: { line: '#f09242' },
  ltc: { line: '#bfbbbb' },
  bch: { line: '#8bc34a' },
  xmr: { line: '#ff6600' },
  zec: { line: '#f4b728' },
  trx: { line: '#eb0029' },
  ton: { line: '#0098ea' },
  arb: { line: '#28a0f0' },
  bsc: { line: '#f3ba2f' },
  bnb: { line: '#f3ba2f' },
  weth: { line: '#627eea' },
  steth: { line: '#00a3ff' },
  link: { line: '#2a5ada' },
  uni: { line: '#ff007a' },
  shib: { line: '#ffa409' },
  pepe: { line: '#3ab641' },
  msol: { line: '#9945ff' },
  jitosol: { line: '#9945ff' },
  cbbtc: { line: '#0052ff' },
  cake: { line: '#d1884f' },
  jup: { line: '#19fbff' },
  bonk: { line: '#fbbf24' },
  pyth: { line: '#4d7c7e' },
  ray: { line: '#2997ff' },
  wif: { line: '#c3845e' },
  trump: { line: '#e31937' },
};

const DEFAULT_COLOR = { line: '#22d3ee' };

const CHAIN_NAMES = {
  btc: 'Bitcoin',
  eth: 'Ethereum',
  sol: 'Solana',
  base: 'Base (ETH)',
  op: 'Optimism',
  matic: 'Polygon',
  pol: 'Polygon',
  avax: 'Avalanche',
  usdc: 'USD Coin',
  usdt: 'Tether',
  dai: 'Dai',
  wbtc: 'Wrapped BTC',
  ltc: 'Litecoin',
  bch: 'Bitcoin Cash',
  xmr: 'Monero',
  zec: 'Zcash',
  trx: 'Tron',
  ton: 'Toncoin',
  arb: 'Arbitrum',
  bsc: 'BNB Chain',
  bnb: 'BNB',
  weth: 'Wrapped ETH',
  steth: 'Lido stETH',
  link: 'Chainlink',
  uni: 'Uniswap',
  shib: 'Shiba Inu',
  pepe: 'Pepe',
  msol: 'Marinade SOL',
  jitosol: 'Jito SOL',
  cbbtc: 'Coinbase BTC',
  cake: 'PancakeSwap',
  jup: 'Jupiter',
  bonk: 'Bonk',
  pyth: 'Pyth Network',
  ray: 'Raydium',
  wif: 'dogwifhat',
  trump: 'Trump',
};

/** Parse a `#rrggbb` string into [r, g, b]. */
function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return [247, 147, 26];
  const int = parseInt(m[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function generateCustomTicks(minPrice, maxPrice) {
  const exp = Math.floor(Math.log10(Math.abs(maxPrice)));
  const base = Math.pow(10, exp);
  const range = maxPrice - minPrice;
  const steps = [1, 2, 2.5, 5, 10];
  let step = base;
  for (let i = 0; i < steps.length - 1; i++) {
    const candidate = base * steps[i];
    if (range / candidate <= 6.5) {
      step = candidate;
      break;
    }
  }

  // Base du step adaptée
  let st = step;
  if (exp < -2) {
    st = base * 2.5;
    if (range / st < 2) st = base * 2;
    if (range / st < 1) st = base * 1;
    if (range / st < 0.5) st = base / 2;
  }
  if (exp <= -5) {
    st = base * 2.5;
    if (range / st <= 3) st = base * 2;
    if (range / st <= 2) st = base * 1;
    if (range / st <= 1.2) st = base / 2;
    if (range / st <= 0.7) st = base / 4;
  }

  // Premier tick >= minPrice
  let firstTick = Math.ceil(minPrice / st) * st;
  // Dernier tick <= maxPrice
  let lastTick = Math.floor(maxPrice / st) * st;

  // Assurer au moins 2 ticks
  if (lastTick < firstTick) {
    lastTick = firstTick + st;
  }
  if (lastTick === firstTick) {
    firstTick = firstTick - st;
  }
  if (lastTick - firstTick > 6 * st) {
    lastTick = firstTick + 5 * st;
  }

  const ticks = [];
  for (let v = firstTick; v <= lastTick + st / 2; v += st) {
    ticks.push({ value: Math.round(v * 1e12) / 1e12 });
  }
  return ticks;
}

const SUPPORTED_TOKENS_LABEL = Object.keys(COINGECKO_IDS).join(', ');

function formatChartDate(timestamp, includeYear = false) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  }).format(new Date(timestamp));
}

function buildTickIndexSet(length, maxTicks = 5) {
  if (length <= maxTicks) {
    return new Set(Array.from({ length }, (_, index) => index));
  }

  const indexes = new Set();
  for (let tick = 0; tick < maxTicks; tick += 1) {
    indexes.add(Math.round((tick * (length - 1)) / (maxTicks - 1)));
  }

  indexes.add(0);
  indexes.add(length - 1);
  return indexes;
}

function formatPeriodLabel(days) {
  return days === 'max' ? 'historique complet' : `${days} jours`;
}

function formatEffectivePeriodLabel(days, isLimitedByPublicApi) {
  if (isLimitedByPublicApi) return '365 jours (limite API publique)';
  return formatPeriodLabel(days);
}

function getCacheKey(coinId, days) {
  return `${coinId}:${days}`;
}

function getCachedPriceHistory(coinId, days, allowStale = false) {
  const cached = priceHistoryCache.get(getCacheKey(coinId, days));
  if (!cached) return null;

  const age = Date.now() - cached.fetchedAt;
  const ttl = allowStale ? PRICE_HISTORY_STALE_TTL : PRICE_HISTORY_CACHE_TTL;
  return age <= ttl ? cached.prices : null;
}

function setCachedPriceHistory(coinId, days, prices) {
  priceHistoryCache.set(getCacheKey(coinId, days), {
    prices,
    fetchedAt: Date.now(),
  });
}

function resolveCoinInfo(symbol) {
  const normalizedSymbol = symbol.toLowerCase();

  if (!COINGECKO_IDS[normalizedSymbol]) {
    throw new Error(
      `Token invalide: ${symbol.toUpperCase()}. Tokens supportés: ${Object.keys(COINGECKO_IDS).join(', ')}`
    );
  }

  return {
    id: COINGECKO_IDS[normalizedSymbol],
    name: CHAIN_NAMES[normalizedSymbol] || normalizedSymbol.toUpperCase(),
    symbol: normalizedSymbol,
    color: CHAIN_COLORS[normalizedSymbol] || DEFAULT_COLOR,
  };
}

/**
 * Fetch historical price data from CoinGecko
 */
async function fetchCoinGeckoMarketChart(coinId, days) {
  const cachedPrices = getCachedPriceHistory(coinId, days);
  if (cachedPrices) return cachedPrices;

  const cacheKey = getCacheKey(coinId, days);
  if (priceHistoryInflight.has(cacheKey)) {
    return priceHistoryInflight.get(cacheKey);
  }

  const url = `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=eur&days=${days}`;

  const request = (async () => {
    const response = await fetchWithFallback(url);
    if (response.ok) {
      const data = await response.json();
      setCachedPriceHistory(coinId, days, data.prices);
      return data.prices;
    }

    let details = '';
    let errorCode = null;
    try {
      const errorBody = await response.json();
      errorCode = errorBody?.error?.status?.error_code || errorBody?.status?.error_code || null;
      details =
        errorBody?.error?.status?.error_message ||
        errorBody?.status?.error_message ||
        errorBody?.error ||
        errorBody?.message ||
        '';
    } catch {
      details = await response.text().catch(() => '');
    }

    const stalePrices = response.status === 429 ? getCachedPriceHistory(coinId, days, true) : null;
    if (stalePrices) {
      return stalePrices;
    }

    const error = new Error(
      `Erreur API CoinGecko: ${response.status}${details ? ` - ${details}` : ''}`
    );
    error.status = response.status;
    error.code = errorCode;
    error.details = details;
    throw error;
  })();

  priceHistoryInflight.set(cacheKey, request);

  try {
    return await request;
  } finally {
    priceHistoryInflight.delete(cacheKey);
  }
}

async function fetchPriceHistory(coinId, days) {
  if (days === 'max' && !COINGECKO_API_KEY) {
    const prices = await fetchCoinGeckoMarketChart(coinId, 365);
    return { prices, effectiveDays: 365, isLimitedByPublicApi: true };
  }

  try {
    const prices = await fetchCoinGeckoMarketChart(coinId, days);
    return { prices, effectiveDays: days, isLimitedByPublicApi: false };
  } catch (error) {
    const isPublicApiMaxRangeLimit =
      days === 'max' &&
      error.status === 401 &&
      (error.code === 10012 || error.details?.toLowerCase().includes('past 365 days'));

    if (!isPublicApiMaxRangeLimit) {
      if (error.status === 401) {
        throw new Error(
          'CoinGecko refuse la requête (401). Configure COINGECKO_API_KEY dans .env ' +
            'ou vérifie que COINGECKO_API_KEY_HEADER vaut x-cg-demo-api-key pour une clé demo.'
        );
      }
      if (error.status === 429) {
        throw new Error('CoinGecko limite temporairement les requêtes. Réessaie dans une minute.');
      }
      throw error;
    }

    const prices = await fetchCoinGeckoMarketChart(coinId, 365);
    return { prices, effectiveDays: 365, isLimitedByPublicApi: true };
  }
}

/**
 * Generate a price chart image
 */
export async function generatePriceChart(chain, days) {
  const chainLower = chain.toLowerCase();
  const coinInfo = resolveCoinInfo(chainLower);

  // Fetch price data
  const {
    prices: priceData,
    effectiveDays,
    isLimitedByPublicApi,
  } = await fetchPriceHistory(coinInfo.id, days);
  if (!Array.isArray(priceData) || priceData.length < 2) {
    throw new Error(`Données insuffisantes pour ${chain.toUpperCase()}`);
  }

  // Prepare data for chart
  const includeYearInLabels = effectiveDays === 'max' || Number(effectiveDays) >= 365;
  const generatedAt = new Date();
  const labels = priceData.map(([timestamp]) => formatChartDate(timestamp, includeYearInLabels));
  const prices = priceData.map(([, price]) => price);
  const tickLabelIndexes = buildTickIndexSet(labels.length);

  // Calculate min/max for better visualization
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceChange = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
  const isPositive = priceChange >= 0;
  const periodLabel = formatEffectivePeriodLabel(effectiveDays, isLimitedByPublicApi);

  const configuration = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `${coinInfo.name} (EUR)`,
          data: prices,
          borderColor: coinInfo.color.line,
          backgroundColor: (context) => {
            const [r, g, b] = hexToRgb(coinInfo.color.line);
            const { chart } = context;
            const { ctx, chartArea } = chart;
            if (!chartArea) return `rgba(${r}, ${g}, ${b}, 0.22)`;

            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.42)`);
            gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.12)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            return gradient;
          },
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#f8fafc',
            font: { size: 14, weight: 'bold' },
          },
        },
        title: {
          display: true,
          text: `${coinInfo.name} - ${periodLabel} (${isPositive ? '+' : ''}${priceChange.toFixed(2)}%)`,
          color: isPositive ? '#00ff88' : '#ff4444',
          font: { size: 18, weight: 'bold' },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            color: '#cbd5e1',
            maxRotation: 0,
            padding: 8,
            callback: (_value, index) => (tickLabelIndexes.has(index) ? labels[index] : ''),
          },
          grid: { color: 'rgba(255,255,255,0.08)' },
        },
        y: {
          ticks: {
            color: '#cbd5e1',
            padding: 8,
            callback: (value) => `€${formatPriceEUR(value)}`,
          },
          grid: { color: 'rgba(255,255,255,0.08)' },
          afterDataLimits: (axis) => {
            if (maxPrice > 0.01) return;
            const pad = (axis.max - axis.min) * 0.03;
            axis.min = axis.min - pad;
            axis.max = axis.max + pad;
          },
          afterBuildTicks: (axis) => {
            if (maxPrice > 0.01) return;
            axis.ticks = generateCustomTicks(axis.min, axis.max);
          },
        },
      },
    },
  };

  // Generate chart as PNG buffer
  const canvas = await getCanvas();
  const imageBuffer = await canvas.renderToBuffer(configuration);

  return {
    buffer: imageBuffer,
    stats: {
      chain: chainLower,
      days,
      effectiveDays,
      isLimitedByPublicApi,
      periodLabel,
      generatedAt,
      generatedAtLabel: formatPriceUpdateDate(generatedAt),
      currentPrice: prices[prices.length - 1],
      minPrice,
      maxPrice,
      priceChange,
      isPositive,
    },
  };
}

/**
 * Parse period string to days
 */
export function parsePeriod(period) {
  const normalizedPeriod = period?.toLowerCase();
  if (!SUPPORTED_PERIODS.has(normalizedPeriod)) return null;
  return Number(normalizedPeriod);
}

export function parseGraphCommand(text) {
  const args = text.trim().split(/\s+/).slice(1);
  if (args.length < 1 || args.length > 2) {
    return { ok: false, error: GRAPH_USAGE };
  }

  const [symbol, period] = args;
  const normalizedSymbol = symbol.toLowerCase();
  if (!COINGECKO_IDS[normalizedSymbol]) {
    return {
      ok: false,
      error: `Token invalide: ${symbol.toUpperCase()}. Tokens supportés: ${SUPPORTED_TOKENS_LABEL}\n${GRAPH_USAGE}`,
    };
  }

  // `/graph eth` (no period) defaults to one year.
  const days = period === undefined ? DEFAULT_PERIOD : parsePeriod(period);
  if (!days) {
    return { ok: false, error: GRAPH_USAGE };
  }

  return { ok: true, symbol: normalizedSymbol, days };
}
