import { EvmBaseProvider } from './evm-base.js';

export class ArbitrumChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Arbitrum',
      symbol: 'ARB',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://arb1.arbitrum.io/rpc',
      fallbackRpcUrls: [
        'https://arb1.arbitrum.io/rpc',
        'https://arbitrum.llamarpc.com',
        'https://arbitrum-one-rpc.publicnode.com',
      ],
      tokenConfigKey: 'arb',
    });
  }
}

export default ArbitrumChain;
