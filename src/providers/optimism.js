import { EvmBaseProvider } from './evm-base.js';

export class OptimismChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Optimism',
      symbol: 'OP',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://mainnet.optimism.io',
      // Keyless, verified live 30 juin 2026 (optimism.llamarpc.com dropped — dead).
      fallbackRpcUrls: [
        'https://mainnet.optimism.io',
        'https://optimism-rpc.publicnode.com',
        'https://rpc.ankr.com/optimism',
        'https://optimism.drpc.org',
        'https://optimism.gateway.tenderly.co',
      ],
      tokenConfigKey: 'op',
      explorer: 'https://optimism.io',
    });
  }
}

export default OptimismChain;
