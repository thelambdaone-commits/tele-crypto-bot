/**
 * SwapService Phase 1 — read-only quoting + gated executor. Aggregator is
 * mocked; no network, no funds.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseUnits } from 'ethers';
import { SwapService } from '../src/modules/swap/swap.service.js';

const USDC_ETH = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const DAI_ETH = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

function mockAggregator(captured) {
  return {
    isSwapSupported: () => true,
    getQuote: async (args) => {
      captured.args = args;
      // 100 USDC → 99.5 DAI (18 decimals)
      return { amountOut: parseUnits('99.5', 18).toString(), routeSummary: { r: 1 }, routerAddress: '0xRouter' };
    },
  };
}

test('getQuote resolves token addresses/decimals and parses amountOut', async () => {
  const captured = {};
  const svc = new SwapService(null, mockAggregator(captured));
  const q = await svc.getQuote('eth', 'USDC', 'DAI', 100);

  assert.equal(captured.args.tokenIn, USDC_ETH);
  assert.equal(captured.args.tokenOut, DAI_ETH);
  assert.equal(captured.args.amountInWei, '100000000'); // 100 * 10^6
  assert.equal(q.amountIn, 100);
  assert.equal(q.amountOut, 99.5);
  assert.equal(q.fromSymbol, 'USDC');
  assert.equal(q.toSymbol, 'DAI');
});

test('getQuote rejects non-EVM chains', async () => {
  const svc = new SwapService(null, mockAggregator({}));
  await assert.rejects(() => svc.getQuote('btc', 'BTC', 'USDC', 1), /EVM/i);
});

test('getQuote rejects identical assets', async () => {
  const svc = new SwapService(null, mockAggregator({}));
  await assert.rejects(() => svc.getQuote('eth', 'USDC', 'USDC', 100), /identiques/i);
});

test('getQuote rejects an invalid amount', async () => {
  const svc = new SwapService(null, mockAggregator({}));
  await assert.rejects(() => svc.getQuote('eth', 'USDC', 'DAI', 0), /Montant invalide/i);
});

test('executeSwap is hard-gated off by default', async () => {
  const svc = new SwapService(null, mockAggregator({}));
  await assert.rejects(() => svc.executeSwap(), /désactivés|SWAP_ENABLED/i);
});
