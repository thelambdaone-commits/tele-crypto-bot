import { EvmBaseProvider } from './evm-base.js';

export class PolygonChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Polygon',
      symbol: 'MATIC',
      nativeSymbol: 'MATIC',
      rpcUrl: rpcUrl || 'https://polygon-rpc.com',
      fallbackRpcUrls: [
        'https://polygon-rpc.com',
        'https://polygon.llamarpc.com',
        'https://polygon-bor-rpc.publicnode.com',
      ],
      tokenConfigKey: 'matic',
      explorer: 'https://polygonscan.com',
    });
  }
}

export default PolygonChain;
