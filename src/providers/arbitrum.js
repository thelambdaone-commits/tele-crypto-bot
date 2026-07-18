import { EvmBaseProvider } from './evm-base.js';

export class ArbitrumChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Arbitrum',
      symbol: 'ARB',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://arb1.arbitrum.io/rpc',
      // Keyless, load-tested 30 juin 2026 (concurrent burst of 12 → 12/12).
      // Dropped: llamarpc (dead), meowrpc + arbitrum.drpc.org (rate-limited under
      // burst). Tenderly's public gateway held up.
      fallbackRpcUrls: [
        'https://arb1.arbitrum.io/rpc',
        'https://arbitrum-one-rpc.publicnode.com',
        'https://rpc.ankr.com/arbitrum',
        'https://arbitrum-one.public.blastapi.io',
        'https://arbitrum.gateway.tenderly.co',
      ],
      tokenConfigKey: 'arb',
    });
  }
}

export default ArbitrumChain;
