import { EvmBaseProvider } from './evm-base.js';

export class ArbitrumChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({ name: 'Arbitrum', symbol: 'ARB', nativeSymbol: 'ETH', rpcUrl, tokenConfigKey: 'arb' });
  }
}

export default ArbitrumChain;
