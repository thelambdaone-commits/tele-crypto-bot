import { EvmBaseProvider } from './evm-base.js';

export class AvalancheChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Avalanche',
      symbol: 'AVAX',
      nativeSymbol: 'AVAX',
      rpcUrl: rpcUrl || 'https://api.avax.network/ext/bc/C/rpc',
      fallbackRpcUrls: [
        'https://api.avax.network/ext/bc/C/rpc',
        'https://avalanche-c-chain-rpc.publicnode.com',
        'https://1rpc.io/avax/c',
      ],
      tokenConfigKey: 'avax',
      explorer: 'https://snowtrace.io',
    });
  }
}

export default AvalancheChain;
