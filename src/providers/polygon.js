import { EvmBaseProvider } from './evm-base.js';

export class PolygonChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Polygon',
      symbol: 'MATIC',
      nativeSymbol: 'MATIC',
      rpcUrl: rpcUrl || 'https://polygon-bor-rpc.publicnode.com',
      // Keyless, verified live 30 juin 2026 (1rpc.io/matic dropped — shared quota
      // exhausted; polygon-rpc.com dropped — its public key is disabled).
      fallbackRpcUrls: [
        'https://polygon-bor-rpc.publicnode.com',
        'https://rpc.ankr.com/polygon',
        'https://polygon.drpc.org',
        'https://polygon.api.onfinality.io/public',
        'https://polygon.gateway.tenderly.co',
      ],
      tokenConfigKey: 'matic',
      explorer: 'https://polygonscan.com',
    });
  }
}

export default PolygonChain;
