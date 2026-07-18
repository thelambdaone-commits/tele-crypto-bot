import { EvmBaseProvider } from './evm-base.js';

export class BaseChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Base',
      symbol: 'BASE',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://mainnet.base.org',
      // Keyless, load-tested 30 juin 2026 (concurrent burst of 12 → 12/12).
      // Dropped: llamarpc (dead), meowrpc (collapses under burst). Tenderly held up.
      fallbackRpcUrls: [
        'https://mainnet.base.org',
        'https://base-rpc.publicnode.com',
        'https://rpc.ankr.com/base',
        'https://base.drpc.org',
        'https://base.gateway.tenderly.co',
      ],
      tokenConfigKey: 'base',
      explorer: 'https://basescan.org',
    });
  }
}

export default BaseChain;
