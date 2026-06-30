import { EvmBaseProvider } from './evm-base.js';

export class BscChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'BNB Chain',
      symbol: 'BSC',
      nativeSymbol: 'BNB',
      rpcUrl: rpcUrl || 'https://bsc-dataseed.binance.org',
      // Keyless, load-tested 30 juin 2026 (concurrent burst of 12 → 12/12).
      // Dropped: llamarpc (dead), meowrpc (collapses under burst), bsc.drpc.org
      // (6/12). Binance dataseeds + PublicNode are rock-solid.
      fallbackRpcUrls: [
        'https://bsc-dataseed.binance.org',
        'https://bsc-rpc.publicnode.com',
        'https://bsc-dataseed1.defibit.io',
        'https://bsc-dataseed2.defibit.io',
      ],
      tokenConfigKey: 'bsc',
      explorer: 'https://bscscan.com',
    });
  }
}

export default BscChain;
