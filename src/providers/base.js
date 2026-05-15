import { EvmBaseProvider } from './evm-base.js';

export class BaseChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Base',
      symbol: 'BASE',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://mainnet.base.org',
      fallbackRpcUrls: [
        'https://mainnet.base.org',
        'https://base.llamarpc.com',
        'https://base-rpc.publicnode.com',
      ],
      tokenConfigKey: 'base',
      explorer: 'https://basescan.org',
    });
  }
}

export default BaseChain;
