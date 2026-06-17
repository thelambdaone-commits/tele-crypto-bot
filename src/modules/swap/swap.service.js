/**
 * SwapService — Phase 1: EVM token/native quoting via a keyless aggregator
 * (KyberSwap). Token addresses/decimals come from the single TOKEN_CONFIGS
 * registry; native coins use the aggregator's native sentinel.
 *
 * SAFETY: getQuote is read-only. executeSwap is gated behind config.swapEnabled
 * and is NOT wired to any Telegram handler yet (Phase 2 adds the confirmation
 * UI, allowance/approve flow, slippage display and rate/volume guards before it
 * can ever sign a transaction).
 */
import { parseUnits, formatUnits } from 'ethers';
import { config } from '../../core/config.js';
import { getTokenConfig, getNativeSymbol } from '../../core/tokens.config.js';
import { CHAIN_REGISTRY } from '../../shared/chains.js';
import * as kyber from './aggregators/kyber.aggregator.js';

const NATIVE_DECIMALS = 18; // all supported EVM native coins use 18 decimals

export class SwapService {
  constructor(walletService, aggregator = kyber) {
    this.walletService = walletService;
    this.aggregator = aggregator;
  }

  isSupported(chain) {
    return this.aggregator.isSwapSupported(chain);
  }

  /**
   * Resolve a chain + asset symbol to an on-chain address + decimals.
   * Native coin → aggregator sentinel; token → TOKEN_CONFIGS entry.
   */
  _resolveAsset(chain, symbol) {
    const sym = String(symbol || '').toUpperCase();
    if (sym === getNativeSymbol(chain).toUpperCase()) {
      return { address: kyber.NATIVE_SENTINEL, decimals: NATIVE_DECIMALS, native: true };
    }
    const token = getTokenConfig(chain, sym);
    if (!token?.address) {
      throw new Error(`Token ${sym} introuvable sur ${chain.toUpperCase()}`);
    }
    return { address: token.address, decimals: token.decimals, native: false };
  }

  /**
   * Read-only quote. Returns the input/output amounts (human-readable) plus the
   * opaque routeSummary needed to build the swap later.
   */
  async getQuote(chain, fromSymbol, toSymbol, amountHuman) {
    if (!CHAIN_REGISTRY[chain]?.evm) throw new Error(`Swaps EVM uniquement (pas ${chain})`);
    if (!this.isSupported(chain)) throw new Error(`Swaps non supportés sur ${chain.toUpperCase()}`);

    const from = this._resolveAsset(chain, fromSymbol);
    const to = this._resolveAsset(chain, toSymbol);
    if (from.address.toLowerCase() === to.address.toLowerCase()) {
      throw new Error('Les deux actifs sont identiques');
    }

    const amount = Number.parseFloat(String(amountHuman).replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Montant invalide');

    const amountInWei = parseUnits(amount.toString(), from.decimals).toString();
    const quote = await this.aggregator.getQuote({
      chain,
      tokenIn: from.address,
      tokenOut: to.address,
      amountInWei,
    });

    return {
      chain,
      fromSymbol: fromSymbol.toUpperCase(),
      toSymbol: toSymbol.toUpperCase(),
      amountIn: amount,
      amountOut: Number(formatUnits(quote.amountOut, to.decimals)),
      amountOutRaw: quote.amountOut,
      routeSummary: quote.routeSummary,
      routerAddress: quote.routerAddress,
      from,
      to,
    };
  }

  /**
   * Execute a swap. HARD-GATED: throws unless swaps are explicitly enabled.
   * Not yet wired to any handler — Phase 2 adds approval/slippage/confirmation
   * before this can run.
   */
  async executeSwap() {
    if (!config.swapEnabled) {
      throw new Error('Les swaps sont désactivés (SWAP_ENABLED=false).');
    }
    throw new Error('executeSwap: exécution non implémentée (Phase 2).');
  }
}
