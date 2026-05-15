import { EvmBaseProvider } from './evm-base.js';

export class EthereumChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({ name: 'Ethereum', symbol: 'ETH', nativeSymbol: 'ETH', rpcUrl, tokenConfigKey: 'eth' });
  }
}
