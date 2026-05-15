import { EvmBaseProvider } from './evm-base.js';

export class OptimismChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Optimism',
      symbol: 'OP',
      nativeSymbol: 'ETH',
      rpcUrl,
      tokenConfigKey: 'op',
      explorer: 'https://optimism.io',
    });
  }
}

export default OptimismChain;
