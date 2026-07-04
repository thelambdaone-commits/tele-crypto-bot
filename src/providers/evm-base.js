import { ethers } from 'ethers';
import { BaseProvider } from './base.provider.js';
import { TOKEN_CONFIGS, ERC20_ABI } from '../core/tokens.config.js';
import { withTimeout } from '../shared/rpc-timeout.js';
import { RpcManager } from '../shared/rpc/RpcManager.js';
import { TransactionError, ERROR_CODES } from '../shared/errors.js';

// Multicall3 — same address on every chain this bot supports (eth, arb, op,
// base, matic, avax, bsc). Lets getAllTokens read every configured token
// balance in ONE eth_call instead of one per token: a multi-wallet balance
// sweep used to fire wallets × tokens concurrent balanceOf calls, which
// throttled the public endpoints until most scans died on the 10s timeout.
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
const MULTICALL3_ABI = [
  'function tryAggregate(bool requireSuccess, (address target, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)',
];

export class EvmBaseProvider extends BaseProvider {
  constructor(config) {
    super(config.name, config.symbol);
    this.nativeSymbol = config.nativeSymbol || config.symbol;
    this.rpcUrl = config.rpcUrl;
    this.rpcUrls = [...new Set([config.rpcUrl, ...(config.fallbackRpcUrls || [])].filter(Boolean))];
    this.tokenConfigKey = config.tokenConfigKey;
    this.explorer = config.explorer || null;
    this._provider = null;
    this._fallbackProvider = null;
    // A send flow calls estimateFees up to 3× (validation → confirm →
    // broadcast) within seconds; fee data is address-independent so a short
    // cache collapses those into one getFeeData round-trip.
    this._feeCache = { data: null, ts: 0 };
    this._feeCacheTtlMs = 15000;
    this.tokenAddresses = TOKEN_CONFIGS[this.tokenConfigKey]?.tokens || {};

    // Read path: native-balance reads are cached (5s) and rate-limited; sends go
    // through ethers' FallbackProvider (getFallbackProvider) which already does
    // multi-endpoint broadcast/quorum, so there is no separate write RpcManager.
    this.balanceRpc = new RpcManager(
      this.rpcUrls,
      async (endpoint, { address }) => this._getNativeBalanceFromEndpoint(endpoint, address),
      { requestTimeoutMs: 8000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 5000, rps: 20 }
    );
  }

  // Single multi-endpoint provider for all ethers contract/signer work. quorum:1
  // returns on the first healthy endpoint and transparently falls over on
  // failure, so callers never pin a single RPC.
  getFallbackProvider() {
    if (!this._fallbackProvider) {
      const providers = this.rpcUrls.map((url) => {
        return new ethers.JsonRpcProvider(url, undefined, { staticNetwork: true });
      });
      this._fallbackProvider = new ethers.FallbackProvider(
        providers.map((p) => ({ provider: p, priority: 1, stallTimeout: 2000 })),
        undefined,
        { quorum: 1 }
      );
    }
    return this._fallbackProvider;
  }

  async _rpcCall(endpoint, method, params) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`RPC HTTP ${response.status}`);
      }

      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error.message || 'RPC error');
      }

      return payload.result;
    } finally {
      clearTimeout(timeout);
    }
  }

  async _getNativeBalanceFromEndpoint(endpoint, address) {
    const rawBalance = await this._rpcCall(endpoint, 'eth_getBalance', [address, 'latest']);
    const balance = BigInt(rawBalance || '0x0');

    return {
      balance: ethers.formatEther(balance),
      balanceWei: balance.toString(),
      symbol: this.nativeSymbol,
      isToken: false,
      rpcEndpoint: endpoint,
    };
  }

  async createWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
    };
  }

  async importFromSeed(seedPhrase) {
    const wallet = ethers.Wallet.fromPhrase(seedPhrase);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: seedPhrase,
    };
  }

  async importFromKey(privateKey) {
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const wallet = new ethers.Wallet(formattedKey);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: null,
    };
  }

  async getBalance(address, tokenSymbol = null) {
    if (tokenSymbol && this.tokenAddresses[tokenSymbol]) {
      const token = this.tokenAddresses[tokenSymbol];
      const provider = this.getFallbackProvider();
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const balance = await withTimeout(tokenContract.balanceOf(address), 10000);

      // decimals/symbol are static config (tokens.config.js, locked by tests) —
      // fetching them on-chain tripled the round-trips per token for nothing.
      return {
        balance: ethers.formatUnits(balance, token.decimals),
        balanceWei: balance.toString(),
        symbol: tokenSymbol,
        isToken: true,
        tokenAddress: token.address,
      };
    }

    try {
      return await this.balanceRpc.execute({ address });
    } catch (error) {
      throw new TransactionError('Unable to fetch balance - EVM RPC issue', {
        code: ERROR_CODES.RPC_ERROR,
        chain: this.symbol,
        details: error.message,
      });
    }
  }

  async getAllTokens(address) {
    const entries = Object.entries(this.tokenAddresses);
    if (entries.length === 0) return [];

    try {
      return await this._getAllTokensMulticall(address, entries);
    } catch {
      // Multicall unavailable/hiccuping — fall back to per-token reads.
      return await this._getAllTokensPerToken(address, entries);
    }
  }

  async _getAllTokensMulticall(address, entries) {
    const provider = this.getFallbackProvider();
    const erc20 = new ethers.Interface(ERC20_ABI);
    const calls = entries.map(([, token]) => ({
      target: token.address,
      callData: erc20.encodeFunctionData('balanceOf', [address]),
    }));
    const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
    const results = await withTimeout(multicall.tryAggregate(false, calls), 10000);

    const tokens = [];
    for (let i = 0; i < entries.length; i++) {
      const [symbol, token] = entries[i];
      const { success, returnData } = results[i];
      if (!success || returnData === '0x') continue;
      const balance = erc20.decodeFunctionResult('balanceOf', returnData)[0];
      if (balance > 0n) {
        tokens.push({
          symbol,
          address: token.address,
          amount: Number(ethers.formatUnits(balance, token.decimals)),
          decimals: token.decimals,
          icon: token.icon || '💵',
          isKnown: true,
        });
      }
    }
    return tokens;
  }

  async _getAllTokensPerToken(address, entries) {
    const provider = this.getFallbackProvider();

    const results = await Promise.all(
      entries.map(async ([symbol, token]) => {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
          // decimals comes from config, not on-chain — halves the concurrent
          // burst against public endpoints (they were load-tested at the old
          // per-analysis call count).
          const balance = await withTimeout(contract.balanceOf(address), 10000);

          if (balance > 0n) {
            return {
              symbol,
              address: token.address,
              // formatUnits divides at full bigint precision; Number(balance)
              // would lose digits above 2^53 (e.g. any 18-decimals balance ≥ ~9).
              amount: Number(ethers.formatUnits(balance, token.decimals)),
              decimals: token.decimals,
              icon: token.icon || '💵',
              isKnown: true,
            };
          }
        } catch {
          // skip tokens that fail
        }
        return null;
      })
    );

    return results.filter(Boolean);
  }

  async _getFeeData() {
    const now = Date.now();
    if (this._feeCache.data && now - this._feeCache.ts < this._feeCacheTtlMs) {
      return this._feeCache.data;
    }
    const provider = this.getFallbackProvider();
    const feeData = await withTimeout(provider.getFeeData(), 15000);
    // Only cache usable data — never pin an RPC hiccup for the TTL window.
    if (feeData && (feeData.maxFeePerGas != null || feeData.gasPrice != null)) {
      this._feeCache = { data: feeData, ts: now };
    }
    return feeData;
  }

  async estimateFees(fromAddress, toAddress, amount, tokenSymbol = null) {
    const feeData = await this._getFeeData();

    const isToken = tokenSymbol && this.tokenAddresses[tokenSymbol];
    const gasLimit = isToken ? 65000n : 21000n;

    // EIP-1559 chains expose maxFeePerGas/maxPriorityFeePerGas; legacy chains
    // (e.g. BNB Chain) leave both null and only provide gasPrice. Without this
    // fallback the multipliers below would do `null * 80n` and throw, breaking
    // every native/token send on legacy-gas chains.
    const legacy = feeData.maxFeePerGas == null || feeData.maxPriorityFeePerGas == null;
    const baseFee = legacy ? feeData.gasPrice : feeData.maxFeePerGas;
    const basePriority = legacy ? 0n : feeData.maxPriorityFeePerGas;

    if (baseFee == null || baseFee === 0n) {
      throw new TransactionError('Estimation des frais indisponible (RPC)', {
        code: ERROR_CODES.RPC_ERROR,
        chain: this.symbol,
      });
    }

    // Per-tier multipliers (%): max fee and priority fee scale independently so
    // a "fast" tx bumps the tip harder than the cap (legacy keeps priority = 0).
    const feeMult = { slow: 80n, average: 100n, fast: 120n };
    const priorityMult = { slow: 80n, average: 100n, fast: 150n };

    const fees = {};
    for (const level of ['slow', 'average', 'fast']) {
      const maxFeePerGas = (baseFee * feeMult[level]) / 100n;
      const maxPriorityFeePerGas = (basePriority * priorityMult[level]) / 100n;
      const estimatedFee = gasLimit * maxFeePerGas;
      fees[level] = {
        gasLimit: gasLimit.toString(),
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        legacy,
        estimatedFee: ethers.formatEther(estimatedFee),
        estimatedFeeWei: estimatedFee.toString(),
        gasPriceGwei: Number(maxFeePerGas) / 1e9,
      };
    }

    return fees;
  }

  async sendTransaction(privateKey, toAddress, amount, feeLevel = 'average', tokenSymbol = null) {
    const provider = this.getFallbackProvider();
    const wallet = new ethers.Wallet(privateKey, provider);

    if (tokenSymbol && this.tokenAddresses[tokenSymbol]) {
      return await this.sendToken(wallet, toAddress, amount, feeLevel, tokenSymbol);
    }

    return await this.sendNative(wallet, toAddress, amount, feeLevel);
  }

  /**
   * Sign and broadcast a raw transaction (arbitrary to/data/value). Used by the
   * swap module to send aggregator router calldata and ERC-20 approvals — the
   * caller owns the calldata's correctness. Not used by the transfer flow.
   */
  async sendRaw(privateKey, { to, data = '0x', value = 0n, gasLimit } = {}) {
    if (!to) throw new Error('sendRaw: missing "to"');
    const provider = this.getFallbackProvider();
    const wallet = new ethers.Wallet(privateKey, provider);
    const txRequest = { to, data, value: BigInt(value || 0) };
    if (gasLimit) txRequest.gasLimit = BigInt(gasLimit);

    const tx = await withTimeout(wallet.sendTransaction(txRequest), 30000);
    const txHash = tx.hash;
    const receipt = await withTimeout(tx.wait(), 120000);
    return {
      hash: txHash,
      from: wallet.address,
      to,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
    };
  }

  /** ERC-20 allowance (bigint) of `owner` toward `spender` for `tokenAddress`. */
  async getTokenAllowance(owner, spender, tokenAddress) {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.getFallbackProvider());
    return await withTimeout(contract.allowance(owner, spender), 10000);
  }

  /** Approve `spender` to move `amount` (bigint) of `tokenAddress`. For swaps. */
  async approveSpender(privateKey, tokenAddress, spender, amount) {
    const wallet = new ethers.Wallet(privateKey, this.getFallbackProvider());
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const tx = await withTimeout(contract.approve(spender, amount), 30000);
    const receipt = await withTimeout(tx.wait(), 120000);
    return { hash: tx.hash, status: receipt.status === 1 ? 'success' : 'failed' };
  }

  /**
   * Turn an estimateFees tier into ethers tx overrides. Legacy-gas chains
   * (BNB Chain) must send a type-0 tx with `gasPrice`; EIP-1559 chains use the
   * max/priority pair. Sending the 1559 pair on a legacy chain produces an
   * invalid tx, hence the split.
   */
  _gasOverrides(feeData) {
    if (feeData.legacy) {
      return { gasPrice: BigInt(feeData.maxFeePerGas) };
    }
    return {
      maxFeePerGas: BigInt(feeData.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(feeData.maxPriorityFeePerGas),
    };
  }

  async sendNative(wallet, toAddress, amount, feeLevel = 'average') {
    const fees = await this.estimateFees(wallet.address, toAddress, amount);
    const feeData = fees[feeLevel];

    const txReq = {
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
      gasLimit: BigInt(feeData.gasLimit),
      ...this._gasOverrides(feeData),
    };

    try {
      const tx = await withTimeout(wallet.sendTransaction(txReq), 30000);
      const txHash = tx.hash;

      // Funds just left this address — drop its cached balance so the next read
      // reflects the spend instead of serving a stale (pre-send) value.
      this.balanceRpc.invalidateCache('rpc', { address: wallet.address });

      const receipt = await withTimeout(tx.wait(), 60000);

      return {
        hash: txHash,
        from: wallet.address,
        to: toAddress,
        amount: amount.toString(),
        symbol: this.nativeSymbol,
        fee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'success' : 'failed',
      };
    } catch (error) {
      if (error.message && error.message.includes('nonce too low')) {
        throw new TransactionError('Transaction déjà envoyée (nonce trop bas)', {
          code: ERROR_CODES.DUPLICATE_TX,
          chain: this.symbol,
        });
      }
      throw error;
    }
  }

  async sendToken(wallet, toAddress, amount, feeLevel, tokenSymbol) {
    const token = this.tokenAddresses[tokenSymbol];
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, wallet);

    const decimals = await tokenContract.decimals();
    const amountWei = ethers.parseUnits(amount.toString(), decimals);

    const fees = await this.estimateFees(wallet.address, toAddress, amount, tokenSymbol);
    const feeData = fees[feeLevel];

    const tx = await withTimeout(
      tokenContract.transfer(toAddress, amountWei, {
        gasLimit: BigInt(feeData.gasLimit),
        ...this._gasOverrides(feeData),
      }),
      30000
    );

    this.balanceRpc.invalidateCache('rpc', { address: wallet.address });

    const receipt = await withTimeout(tx.wait(), 60000);

    return {
      hash: tx.hash,
      from: wallet.address,
      to: toAddress,
      amount: amount.toString(),
      symbol: tokenSymbol,
      tokenAddress: token.address,
      fee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
    };
  }

  async getGasPrice() {
    const provider = this.getFallbackProvider();
    const feeData = await provider.getFeeData();
    return {
      gasPrice: feeData.gasPrice ? Number(feeData.gasPrice) / 1e9 : 0,
      maxFeePerGas: feeData.maxFeePerGas ? Number(feeData.maxFeePerGas) / 1e9 : 0,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        ? Number(feeData.maxPriorityFeePerGas) / 1e9
        : 0,
    };
  }

  async getTransactionHistory(address, limit = 5) {
    try {
      const explorerApiUrl = this.getExplorerApiUrl();
      if (!explorerApiUrl) return [];

      const response = await fetch(
        `${explorerApiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc`
      );
      const data = await response.json();
      if (data.status !== '1' || !data.result?.length) {
        return [];
      }
      return data.result.map((tx) => ({
        hash: tx.hash,
        type: tx.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in',
        amount: (Number(tx.value) / 1e18).toFixed(6),
        timestamp: Number(tx.timeStamp) * 1000,
      }));
    } catch (error) {
      return [];
    }
  }

  getExplorerApiUrl() {
    const explorers = {
      eth: 'https://api.etherscan.io/api',
      arb: 'https://api.arbiscan.io/api',
      matic: 'https://api.polygonscan.com/api',
      op: 'https://api-optimistic.etherscan.io/api',
      base: 'https://api.basescan.org/api',
      avax: 'https://api.snowtrace.io/api',
      bsc: 'https://api.bscscan.com/api',
    };
    return explorers[this.tokenConfigKey] || null;
  }

  validateAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  getTokenAddresses() {
    return this.tokenAddresses;
  }
}

export default EvmBaseProvider;
