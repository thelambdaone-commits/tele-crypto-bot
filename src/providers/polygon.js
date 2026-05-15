import { EvmBaseProvider } from './evm-base.js';

export class PolygonChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Polygon',
      symbol: 'MATIC',
      nativeSymbol: 'MATIC',
      rpcUrl: rpcUrl || 'https://polygon-rpc.com',
      tokenConfigKey: 'matic',
      explorer: 'https://polygonscan.com',
    });
  }
}

export default PolygonChain;
