import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '../shared/solana-token.js';
import { BaseProvider } from './base.provider.js';
import { TransactionError, ERROR_CODES } from '../shared/errors.js';
import { TOKEN_CONFIGS, getTokenConfig } from '../core/tokens.config.js';
import { RpcManager } from '../shared/rpc/RpcManager.js';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
import * as bip39 from 'bip39';
import bs58 from 'bs58';

export class SolanaChain extends BaseProvider {
  constructor(rpcUrl, fallbackRpcUrls = []) {
    super('Solana', 'SOL');
    this.primaryRpcUrl = rpcUrl;

    const configuredFallbacks = Array.isArray(fallbackRpcUrls) ? fallbackRpcUrls : [fallbackRpcUrls];
    // Keyless public RPCs, ordered by load-test results (concurrent getBalance
    // burst — the exact deposit-monitor sweep that caused the 429 storm; a
    // single ping is meaningless). Most "public" Solana RPCs have gone paid or
    // key-gated (drpc/ankr/onfinality/blastapi/rpcpool/blockeden) or 429 on the
    // first burst (1rpc/leorpc), so the keyless survivor set is small:
    //  • Lava — open-source decentralized RPC gateway; 99% over a 200-req burst,
    //    0×429, and (unlike publicnode) it serves getTokenAccountsByOwner, so it
    //    also backs the token-scan path. Rate limit: ~1000 req/min free tier.
    //  • mainnet-beta — official Solana Labs endpoint; 100 req/10s per IP,
    //    40 req/10s per method. 429s under burst; last resort only.
    //
    // Removed (verified dead / broken as of Jul 2026):
    //  • Ankr — now requires API key for Solana (403: "API key is not allowed")
    //  • PublicNode — blocks getTokenAccountsByOwner (403: "blocked parameter
    //    programId"), only useful for getBalance but gets marked unhealthy from
    //    token-scan failures which also removes it from balance queries
    //  • Extrnode — public endpoint unreachable (fetch failed), now requires
    //    free account registration for access
    const staticFallbacks = [
      'https://solana.lava.build',
      'https://api.mainnet-beta.solana.com',
    ];
    const allUrls = [rpcUrl, ...configuredFallbacks, ...staticFallbacks].filter(Boolean);
    this.endpoints = [...new Set(allUrls)];

    this._connections = new Map();
    this._getConnection = (url) => {
      if (!this._connections.has(url)) {
        this._connections.set(url, new Connection(url, {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 30000,
          // web3.js otherwise retries every 429 up to 5× (multiplying load on the
          // already-rate-limited free endpoints) and logs each retry. Disable it:
          // a 429 throws cleanly, RpcManager falls over to the next endpoint, and
          // the per-endpoint token bucket below paces requests under the limit.
          disableRetryOnRateLimit: true,
        }));
      }
      return this._connections.get(url);
    };
    this.connection = this._getConnection(rpcUrl);

    // Conservative rps/burst: the keyless fallbacks (mainnet-beta, publicnode)
    // throttle hard, so pacing here keeps the deposit-monitor sweep under their
    // limits instead of generating a 429 storm.
    this.balanceRpc = new RpcManager(this.endpoints, async (endpoint, { address }) => {
      const conn = this._getConnection(endpoint);
      const balance = await conn.getBalance(new PublicKey(address));
      return {
        balance: (balance / LAMPORTS_PER_SOL).toString(),
        balanceLamports: balance.toString(),
        symbol: this.symbol,
      };
    }, { requestTimeoutMs: 15000, failureThreshold: 3, cacheTtlMs: 5000, rps: 10, rpsBurst: 10 });

    this.tokenRpc = new RpcManager(this.endpoints, async (endpoint, { publicKey }) => {
      const conn = this._getConnection(endpoint);
      return await conn.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
    }, { requestTimeoutMs: 20000, failureThreshold: 3, cacheTtlMs: 10000, rps: 5, rpsBurst: 5 });
  }

  async createWallet() {
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const keypair = Keypair.fromSeed(seed.slice(0, 32));

    return {
      address: keypair.publicKey.toString(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex'),
      mnemonic,
    };
  }

  async importFromSeed(seedPhrase) {
    if (!bip39.validateMnemonic(seedPhrase)) {
      throw new Error('Invalid seed phrase');
    }

    const seed = await bip39.mnemonicToSeed(seedPhrase);
    const keypair = Keypair.fromSeed(seed.slice(0, 32));

    return {
      address: keypair.publicKey.toString(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex'),
      mnemonic: seedPhrase,
    };
  }

  async importFromKey(privateKey) {
    let secretKey;
    const cleanKey = privateKey.trim();
    let formatTried = [];

    if (cleanKey.startsWith('[') && cleanKey.endsWith(']')) {
      try {
        const arr = JSON.parse(cleanKey);
        if (Array.isArray(arr) && arr.length >= 32) {
          secretKey = Uint8Array.from(arr);
          formatTried.push('JSON');
        }
      } catch (e) {
      }
    }

    if (!secretKey) {
      try {
        const decoded = bs58.decode(cleanKey);
        if (decoded.length === 64 || decoded.length === 32) {
          secretKey = decoded;
          formatTried.push('Base58');
        }
      } catch (e) {
      }
    }

    if (!secretKey) {
      try {
        let hex = cleanKey.startsWith('0x') ? cleanKey.slice(2) : cleanKey;
        if (/^[0-9a-fA-F]+$/.test(hex) && (hex.length === 64 || hex.length === 128)) {
          secretKey = Uint8Array.from(Buffer.from(hex, 'hex'));
          formatTried.push('Hex');
        }
      } catch (e) {
      }
    }

    if (!secretKey) {
      try {
        const decoded = Buffer.from(cleanKey, 'base64');
        if (decoded.length === 64 || decoded.length === 32) {
          secretKey = decoded;
          formatTried.push('Base64');
        }
      } catch (e) {
      }
    }

    if (!secretKey) {
      throw new Error(
        `Format non reconnu. Formats acceptes: Base58 (87-88 car.), Hex (64 car.), ou JSON array []. Length recu: ${cleanKey.length}`
      );
    }

    let keypair;
    if (secretKey.length === 64) {
      keypair = Keypair.fromSecretKey(secretKey);
    } else if (secretKey.length === 32) {
      keypair = Keypair.fromSeed(secretKey);
    } else {
      throw new Error(`Longueur de clé invalide: ${secretKey.length} octets (attendu 32 ou 64)`);
    }

    return {
      address: keypair.publicKey.toString(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex'),
      mnemonic: null,
    };
  }

  async getBalance(address, tokenSymbol = null) {
    if (tokenSymbol && tokenSymbol.toUpperCase() !== 'SOL') {
      const config = getTokenConfig('sol', tokenSymbol);
      if (config) {
        return await this.getTokenBalance(address, config.mint);
      }
    }

    try {
      return await this.balanceRpc.execute({ address });
    } catch (error) {
      throw new TransactionError('Unable to fetch balance - network issue', {
        code: ERROR_CODES.RPC_ERROR,
        chain: 'SOL',
      });
    }
  }

  async estimateFees(_fromAddress, _toAddress, _amount) {
    const baseFee = 5000;

    const fees = {
      slow: {
        fee: baseFee,
        feeSOL: (baseFee / LAMPORTS_PER_SOL).toString(),
        priorityFee: 0,
      },
      average: {
        fee: baseFee + 1000,
        feeSOL: ((baseFee + 1000) / LAMPORTS_PER_SOL).toString(),
        priorityFee: 1000,
      },
      fast: {
        fee: baseFee + 10000,
        feeSOL: ((baseFee + 10000) / LAMPORTS_PER_SOL).toString(),
        priorityFee: 10000,
      },
    };

    return fees;
  }

  _priorityInstructions(feeLevel) {
    const priorityFee = feeLevel === 'fast' ? 10000 : feeLevel === 'average' ? 1000 : 0;
    if (priorityFee <= 0) return [];
    return [
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.floor((priorityFee * 1000) / 200000),
      }),
    ];
  }

  async _estimateNativeFeeLamports(fromPubkey, feeLevel) {
    const tx = new Transaction();
    for (const ix of this._priorityInstructions(feeLevel)) tx.add(ix);
    tx.add(SystemProgram.transfer({ fromPubkey, toPubkey: fromPubkey, lamports: 0 }));
    try {
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = fromPubkey;
      const res = await this.connection.getFeeForMessage(tx.compileMessage());
      if (res && Number.isFinite(res.value)) return res.value;
    } catch {
    }
    return 5000;
  }

  async getMaxSendableLamports(address, feeLevel = 'slow') {
    const fromPubkey = new PublicKey(address);
    const balanceLamports = await this.connection.getBalance(fromPubkey);
    const feeLamports = await this._estimateNativeFeeLamports(fromPubkey, feeLevel);
    return { balanceLamports, feeLamports, lamports: Math.max(0, balanceLamports - feeLamports) };
  }

  async _checkSignature(signature) {
    try {
      const status = await this.connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });
      if (status.value && status.value.confirmationStatus) {
        return status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized';
      }
      return false;
    } catch {
      return false;
    }
  }

  async _getFreshBlockhash() {
    const endpoints = this.endpoints;
    for (const url of endpoints) {
      try {
        const conn = this._getConnection(url);
        const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed');
        return { blockhash, lastValidBlockHeight };
      } catch {
        continue;
      }
    }
    return this.connection.getLatestBlockhash('confirmed');
  }

  async sendTransaction(
    privateKey,
    toAddress,
    amount,
    feeLevel = 'average',
    tokenSymbol = null,
    options = {}
  ) {
    const secretKey = Uint8Array.from(Buffer.from(privateKey, 'hex'));
    const fromKeypair = Keypair.fromSecretKey(secretKey);
    const toPublicKey = new PublicKey(toAddress);

    const sym = tokenSymbol ? String(tokenSymbol).toUpperCase() : null;
    if (sym && sym !== 'SOL') {
      return await this._sendSplToken(fromKeypair, toPublicKey, amount, feeLevel, sym);
    }

    const transaction = new Transaction();

    for (const ix of this._priorityInstructions(feeLevel)) transaction.add(ix);

    let lamports;
    let sentAmount;
    let feeLamports = 5000;
    if (options.sendMax) {
      const balanceLamports = await this.connection.getBalance(fromKeypair.publicKey);
      feeLamports = await this._estimateNativeFeeLamports(fromKeypair.publicKey, feeLevel);
      lamports = balanceLamports - feeLamports;
      if (lamports <= 0) {
        throw new TransactionError('Solde insuffisant pour couvrir les frais de réseau', {
          code: ERROR_CODES.INSUFFICIENT_FUNDS,
          chain: 'SOL',
        });
      }
      sentAmount = lamports / LAMPORTS_PER_SOL;
    } else {
      lamports = Math.round(Number.parseFloat(amount) * LAMPORTS_PER_SOL);
      sentAmount = amount;
    }

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports,
      })
    );

    return await this._sendWithRetry(transaction, fromKeypair, feeLamports, sentAmount, toAddress, sym);
  }

  async _sendWithRetry(transaction, fromKeypair, feeLamports, sentAmount, toAddress, sym) {
    const maxAttempts = this.endpoints.length;
    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const url = this.endpoints[attempt % this.endpoints.length];
      const conn = this._getConnection(url);

      try {
        const { blockhash } = await conn.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromKeypair.publicKey;
        transaction.signatures = [];
        transaction.partialSign(fromKeypair);

        const signature = await sendAndConfirmTransaction(conn, transaction, [fromKeypair], {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          commitment: 'confirmed',
        });

        this.balanceRpc.invalidateCache('rpc', {
          address: fromKeypair.publicKey.toString(),
        });

        return {
          hash: signature,
          from: fromKeypair.publicKey.toString(),
          to: toAddress,
          amount: sentAmount.toString(),
          symbol: sym || 'SOL',
          fee: (feeLamports / LAMPORTS_PER_SOL).toString(),
          status: 'success',
        };
      } catch (error) {
        lastError = error;
        const sigMatch = error.message?.match(/signature: (\w+)/);
        if (sigMatch) {
          const sig = sigMatch[1];
          const landed = await this._checkSignature(sig);
          if (landed) {
            return {
              hash: sig,
              from: fromKeypair.publicKey.toString(),
              to: toAddress,
              amount: sentAmount.toString(),
              symbol: sym || 'SOL',
              fee: (feeLamports / LAMPORTS_PER_SOL).toString(),
              status: 'success',
            };
          }
        }
      }
    }

    let code = ERROR_CODES.BROADCAST_FAILED;
    const msg = (lastError && lastError.message) || 'Unknown error';
    if (msg.includes('insufficient funds')) code = ERROR_CODES.INSUFFICIENT_FUNDS;
    else if (msg.includes('Simulation failed')) code = ERROR_CODES.SIMULATION_ERROR;

    throw new TransactionError(msg, {
      code,
      chain: 'SOL',
      details: lastError,
    });
  }

  async _sendSplToken(fromKeypair, toPublicKey, amount, feeLevel, sym) {
    const cfg = getTokenConfig('sol', sym);
    if (!cfg) {
      throw new TransactionError(`Token SPL non supporté: ${sym}`, {
        code: ERROR_CODES.VALIDATION_ERROR || 'VALIDATION_ERROR',
        chain: 'SOL',
      });
    }

    const mint = new PublicKey(cfg.mint);
    const fromAta = await getAssociatedTokenAddress(mint, fromKeypair.publicKey);
    const toAta = await getAssociatedTokenAddress(mint, toPublicKey);

    // Build base instructions once — ATA creation check is a read, not retried.
    const baseInstructions = [];

    if (feeLevel !== 'slow') {
      const fees = await this.estimateFees('', '', 0);
      const priorityFee = fees[feeLevel]?.priorityFee || 0;
      if (priorityFee > 0) {
        baseInstructions.push(
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: Math.floor((priorityFee * 1000) / 200000),
          })
        );
      }
    }

    try {
      await getAccount(this.connection, toAta);
    } catch {
      baseInstructions.push(
        createAssociatedTokenAccountInstruction(fromKeypair.publicKey, toAta, toPublicKey, mint)
      );
    }

    const rawAmount = BigInt(Math.round(Number(amount) * 10 ** cfg.decimals));
    baseInstructions.push(
      createTransferCheckedInstruction(
        fromAta,
        mint,
        toAta,
        fromKeypair.publicKey,
        rawAmount,
        cfg.decimals
      )
    );

    // Retry across all endpoints — same resilience pattern as SOL sends.
    const maxAttempts = this.endpoints.length;
    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const url = this.endpoints[attempt % this.endpoints.length];
      const conn = this._getConnection(url);

      try {
        const transaction = new Transaction();
        baseInstructions.forEach((ix) => transaction.add(ix));

        const { blockhash } = await conn.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromKeypair.publicKey;
        transaction.signatures = [];
        transaction.partialSign(fromKeypair);

        const signature = await sendAndConfirmTransaction(conn, transaction, [fromKeypair], {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          commitment: 'confirmed',
        });

        this.balanceRpc.invalidateCache('rpc', {
          address: fromKeypair.publicKey.toString(),
        });

        return {
          hash: signature,
          from: fromKeypair.publicKey.toString(),
          to: toPublicKey.toString(),
          amount: amount.toString(),
          symbol: sym,
          status: 'success',
        };
      } catch (error) {
        lastError = error;
        const sigMatch = error.message?.match(/signature: (\w+)/);
        if (sigMatch) {
          const sig = sigMatch[1];
          const landed = await this._checkSignature(sig);
          if (landed) {
            return {
              hash: sig,
              from: fromKeypair.publicKey.toString(),
              to: toPublicKey.toString(),
              amount: amount.toString(),
              symbol: sym,
              status: 'success',
            };
          }
        }
      }
    }

    let code = ERROR_CODES.BROADCAST_FAILED;
    const msg = (lastError && lastError.message) || 'Unknown error';
    if (msg.includes('insufficient funds')) code = ERROR_CODES.INSUFFICIENT_FUNDS;
    else if (msg.includes('Simulation failed')) code = ERROR_CODES.SIMULATION_ERROR;
    throw new TransactionError(msg, { code, chain: 'SOL', details: lastError });
  }

  async getTransactionHistory(address, limit = 5) {
    const rpcUrl = this.primaryRpcUrl || 'https://solana-rpc.publicnode.com';

    try {
      const sigResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit }],
        }),
      });
      const sigData = await sigResponse.json();

      if (!sigData.result?.length) return [];

      const fetchTx = async (sig) => {
        try {
          const txResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getTransaction',
              params: [
                sig.signature,
                { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
              ],
            }),
          });
          const txData = await txResponse.json();

          let amount = 0;
          let type = 'tx';

          if (txData.result?.meta) {
            const meta = txData.result.meta;
            const accountKeys = txData.result.transaction?.message?.accountKeys || [];

            let addressIndex = -1;
            for (let i = 0; i < accountKeys.length; i++) {
              const key = accountKeys[i]?.pubkey || accountKeys[i];
              if (key === address) {
                addressIndex = i;
                break;
              }
            }

            if (addressIndex >= 0 && meta.preBalances && meta.postBalances) {
              const preBalance = meta.preBalances[addressIndex] || 0;
              const postBalance = meta.postBalances[addressIndex] || 0;
              const diff = postBalance - preBalance;

              if (diff > 0) {
                type = 'in';
                amount = diff / 1e9;
              } else if (diff < 0) {
                type = 'out';
                amount = Math.abs(diff) / 1e9;
              }
            }
          }

          return {
            hash: sig.signature,
            type,
            amount: amount > 0 ? amount.toFixed(6) : '—',
            timestamp: (sig.blockTime || Date.now() / 1000) * 1000,
          };
        } catch {
          return {
            hash: sig.signature,
            type: 'tx',
            amount: '—',
            timestamp: (sig.blockTime || Date.now() / 1000) * 1000,
          };
        }
      };

      const transactions = await Promise.all(
        sigData.result.slice(0, limit).map(fetchTx)
      );

      return transactions;
    } catch (error) {
      return [];
    }
  }

  validateAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async getTokens(address) {
    const publicKey = new PublicKey(address);

    try {
      const tokenAccounts = await this.tokenRpc.execute({ publicKey });
      return tokenAccounts.value
        .map((account) => {
          const info = account.account.data.parsed.info;
          const mint = info.mint;
          const amount = info.tokenAmount;

          return {
            mint,
            address: account.pubkey.toString(),
            amount: Number(amount.amount) / Math.pow(10, amount.decimals),
            decimals: amount.decimals,
            uiAmount: amount.uiAmount,
            isNonZero: amount.amount > 0,
            programId: account.account.data.program,
            associated: account.pubkey.toBase58().startsWith(mint.slice(0, 10)),
          };
        })
        .filter((t) => t.isNonZero);
    } catch {
      return [];
    }
  }

  async getAllTokensWithSymbols(address) {
    const allTokens = await this.getTokens(address);
    const knownTokens = TOKEN_CONFIGS.sol.tokens;

    return allTokens.map((token) => {
      const knownToken = Object.entries(knownTokens).find(
        ([, config]) => config.mint.toLowerCase() === token.mint.toLowerCase()
      );

      return {
        ...token,
        symbol: knownToken ? knownToken[0] : `SOL-${token.mint.slice(0, 4)}`,
        isKnown: !!knownToken,
        icon: knownToken ? knownToken[1].icon : '🪙',
      };
    });
  }

  async getTokenBalance(address, mintAddress) {
    const walletPubkey = new PublicKey(address);
    const mintPubkey = new PublicKey(mintAddress);
    const conn = this.connection;

    const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);

    try {
      const accountInfo = await getAccount(conn, ata);
      const decimals = accountInfo.decimals ?? 9;
      return {
        balance: Number(accountInfo.amount) / 10 ** decimals,
        decimals,
        ata: ata.toString(),
        exists: true,
      };
    } catch {
      return {
        balance: 0,
        decimals: 9,
        ata: ata.toString(),
        exists: false,
      };
    }
  }

  async ensureAta(privateKey, mintAddress) {
    const keypair = Keypair.fromSecretKey(Uint8Array.from(Buffer.from(privateKey, 'hex')));
    const mintPubkey = new PublicKey(mintAddress);
    const conn = this.connection;

    const ata = await getAssociatedTokenAddress(mintPubkey, keypair.publicKey);

    try {
      await getAccount(conn, ata);
      return { ata: ata.toString(), created: false };
    } catch {
      const transaction = new Transaction();
      transaction.add(
        createAssociatedTokenAccountInstruction(
          keypair.publicKey,
          ata,
          keypair.publicKey,
          mintPubkey
        )
      );

      const signature = await sendAndConfirmTransaction(conn, transaction, [keypair]);
      return { ata: ata.toString(), created: true, signature };
    }
  }

  async sendRawTransaction(privateKey, transaction, feeLevel = 'average') {
    const keypair = Keypair.fromSecretKey(Uint8Array.from(Buffer.from(privateKey, 'hex')));

    const fees = await this.estimateFees('', '', 0);
    const priorityFee = fees[feeLevel]?.priorityFee || 0;

    if (priorityFee > 0) {
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: Math.floor((priorityFee * 1000) / 200000),
        })
      );
    }

    const signature = await sendAndConfirmTransaction(this.connection, transaction, [keypair]);

    return {
      hash: signature,
      status: 'success',
    };
  }
}
