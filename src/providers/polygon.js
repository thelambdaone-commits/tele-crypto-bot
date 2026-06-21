import { EvmBaseProvider } from './evm-base.js';

export class PolygonChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Polygon',
      symbol: 'MATIC',
      nativeSymbol: 'MATIC',
      rpcUrl: rpcUrl || 'https://polygon-bor-rpc.publicnode.com',
      fallbackRpcUrls: [
        'https://polygon-bor-rpc.publicnode.com',
        'https://polygon.drpc.org',
        'https://1rpc.io/matic',
      ],
      tokenConfigKey: 'matic',
      explorer: 'https://polygonscan.com',
    });
  }
}

export default PolygonChain;
