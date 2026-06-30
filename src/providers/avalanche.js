import { EvmBaseProvider } from './evm-base.js';

export class AvalancheChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Avalanche',
      symbol: 'AVAX',
      nativeSymbol: 'AVAX',
      rpcUrl: rpcUrl || 'https://api.avax.network/ext/bc/C/rpc',
      // Keyless, verified live 30 juin 2026 (1rpc.io/avax/c dropped — shared quota
      // exhausted; no other keyless C-Chain RPC answered, so PublicNode + dRPC).
      fallbackRpcUrls: [
        'https://api.avax.network/ext/bc/C/rpc',
        'https://avalanche-c-chain-rpc.publicnode.com',
        'https://avalanche.drpc.org',
      ],
      tokenConfigKey: 'avax',
      explorer: 'https://snowtrace.io',
    });
  }
}

export default AvalancheChain;
