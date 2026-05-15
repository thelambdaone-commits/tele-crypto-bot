import { EvmBaseProvider } from './evm-base.js';

export class OptimismChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Optimism',
      symbol: 'OP',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://mainnet.optimism.io',
      fallbackRpcUrls: [
        'https://mainnet.optimism.io',
        'https://optimism.llamarpc.com',
        'https://optimism-rpc.publicnode.com',
      ],
      tokenConfigKey: 'op',
      explorer: 'https://optimism.io',
    });
  }
}

export default OptimismChain;
