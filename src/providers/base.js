import { EvmBaseProvider } from './evm-base.js';

export class BaseChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Base',
      symbol: 'BASE',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://mainnet.base.org',
      tokenConfigKey: 'base',
      explorer: 'https://basescan.org',
    });
  }
}

export default BaseChain;
