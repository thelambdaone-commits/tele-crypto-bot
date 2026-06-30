import { EvmBaseProvider } from './evm-base.js';

export class EthereumChain extends EvmBaseProvider {
  constructor(rpcUrl) {
    super({
      name: 'Ethereum',
      symbol: 'ETH',
      nativeSymbol: 'ETH',
      rpcUrl: rpcUrl || 'https://ethereum.publicnode.com',
      // Keyless fallbacks, load-tested 30 juin 2026 against a concurrent burst of
      // 12 calls (the real pattern: getAllTokens fires every balanceOf in
      // parallel). Kept only 12/12 survivors. Dropped: ankr (needs key), llamarpc
      // (dead), cloudflare-eth + meowrpc (collapse under burst — "Internal error"
      // / "Too Many Requests"), 1rpc.io (2/12).
      fallbackRpcUrls: [
        'https://ethereum.publicnode.com',
        'https://eth.drpc.org',
        'https://eth.api.onfinality.io/public',
        'https://eth-mainnet.public.blastapi.io',
      ],
      tokenConfigKey: 'eth',
    });
  }
}
