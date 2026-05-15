import { EvmBaseProvider } from './evm-base.js';

export class EthereumChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Ethereum',
      symbol: 'ETH',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://eth.llamarpc.com',
      fallbackRpcUrls: [
        'https://eth.llamarpc.com',
        'https://ethereum.publicnode.com',
        'https://rpc.ankr.com/eth',
      ],
      tokenConfigKey: 'eth',
    });
  }
}
