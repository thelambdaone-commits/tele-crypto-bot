import { ECPairFactory } from 'ecpair';
import * as tinysecp from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';

import { BaseProvider } from './base.provider.js';
import { RpcManager } from '../shared/rpc/RpcManager.js';

const ECPair = ECPairFactory(tinysecp);
const bip32 = BIP32Factory(tinysecp);

const LTC_NETWORK = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019d9cfe,
    private: 0x019d9c6e,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
  coinType: 2,
};

function buildApis(apiUrl) {
  return [...new Set([
    apiUrl || 'https://litecoinspace.org/api',
    'https://litecoinspace.org/api',
    'https://api.blockcypher.com/v1/ltc/main',
  ].filter(Boolean))];
}

export class LitecoinChain extends BaseProvider {
  constructor(apiUrl = null) {
    super('Litecoin', 'LTC');
    this.apiUrl = apiUrl || 'https://litecoinspace.org/api';
    this.network = LTC_NETWORK;
    this.apis = buildApis(apiUrl);

    this.balanceRpc = new RpcManager(this.apis, async (endpoint, { address }) => {
      const isBlockcypher = endpoint.includes('blockcypher');
      const url = isBlockcypher
        ? `${endpoint}/addrs/${address}/balance`
        : `${endpoint}/address/${address}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        let balanceSats;
        if (isBlockcypher) {
          balanceSats = data.final_balance ?? data.balance ?? 0;
        } else {
          const chainStats = data.chain_stats || data;
          balanceSats = chainStats.funded_txo_sum - chainStats.spent_txo_sum;
        }

        return {
          balance: (balanceSats / 100000000),
          balanceSats: balanceSats.toString(),
          symbol: this.symbol,
        };
      } finally {
        clearTimeout(timeout);
      }
    }, { requestTimeoutMs: 10000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 5000, rps: 10 });

    this.utxoRpc = new RpcManager(this.apis, async (endpoint, { address }) => {
      const isBlockcypher = endpoint.includes('blockcypher');
      const url = isBlockcypher
        ? `${endpoint}/addrs/${address}?unspentOnly=true`
        : `${endpoint}/address/${address}/utxo`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        if (isBlockcypher) {
          const data = await response.json();
          return (data.txrefs || []).filter((t) => !t.spent).map((t) => ({
            txid: t.tx_hash,
            vout: t.tx_output_n,
            value: t.value,
          }));
        }
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    }, { requestTimeoutMs: 10000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 2000, rps: 10 });

    this.feeRpc = new RpcManager(this.apis, async (endpoint) => {
      const isBlockcypher = endpoint.includes('blockcypher');
      // litecoinspace is a mempool.space fork: it serves recommended fees (sat/vB)
      // at /api/v1/fees/recommended and has NO esplora /fee-estimates route (that
      // path 404s, which previously made every LTC send fall back to a hardcoded
      // 0.5 sat/vB). estimateFees() consumes {slow,average,fast} as sat/vB.
      const url = isBlockcypher ? endpoint : `${endpoint}/v1/fees/recommended`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (isBlockcypher) {
          // BlockCypher quotes sat/kB; the caller treats the rate as sat/vB → /1000.
          return {
            slow: (data.low_fee_per_kb || 1000) / 1000,
            average: (data.medium_fee_per_kb || 2000) / 1000,
            fast: (data.high_fee_per_kb || 3000) / 1000,
          };
        }
        return {
          slow: data.economyFee ?? data.hourFee ?? data.minimumFee ?? 1,
          average: data.halfHourFee ?? data.hourFee ?? 1,
          fast: data.fastestFee ?? data.halfHourFee ?? 1,
        };
      } finally {
        clearTimeout(timeout);
      }
    }, { requestTimeoutMs: 10000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 30000, rps: 5 });
  }

  async createWallet() {
    const keyPair = ECPair.makeRandom({ network: this.network });
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });

    return {
      address: address,
      privateKey: keyPair.toWIF(),
      publicKey: keyPair.publicKey.toString('hex'),
    };
  }

  async importFromKey(privateKey) {
    const keyPair = ECPair.fromWIF(privateKey, this.network);
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });

    return {
      address: address,
      privateKey: keyPair.toWIF(),
      publicKey: keyPair.publicKey.toString('hex'),
    };
  }

  async importFromSeed(seedPhrase) {
    if (!bip39.validateMnemonic(seedPhrase)) {
      throw new Error('Invalid seed phrase');
    }

    const seed = await bip39.mnemonicToSeed(seedPhrase);
    const root = bip32.fromSeed(seed, this.network);
    // BIP84 native SegWit path for Litecoin (coin type 2).
    const child = root.derivePath("m/84'/2'/0'/0/0");

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: this.network,
    });

    return {
      address,
      privateKey: child.toWIF(),
      publicKey: child.publicKey.toString('hex'),
      mnemonic: seedPhrase,
    };
  }

  async getBalance(address, tokenSymbol = null) {
    if (tokenSymbol && tokenSymbol.toUpperCase() !== 'LTC')
      return { balance: '0', symbol: tokenSymbol };

    try {
      return await this.balanceRpc.execute({ address });
    } catch {
      return {
        balance: '0',
        balanceSats: '0',
        symbol: this.symbol,
        error: 'Unable to fetch balance',
      };
    }
  }

  async getTransactionHistory(address, limit = 5) {
    // litecoinspace.org is a mempool.space-compatible API — same schema as the
    // Bitcoin provider (vin/vout/scriptpubkey_address/value/status.block_time).
    const apis = [...new Set([this.apiUrl, 'https://litecoinspace.org/api'])];

    for (const api of apis) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`${api}/address/${address}/txs`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) throw new Error(`API responded with status ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.slice(0, limit).map((tx) => {
          const isOut = tx.vin?.some((vin) => vin.prevout?.scriptpubkey_address === address);
          let amount = 0;
          for (const vout of tx.vout || []) {
            if (isOut && vout.scriptpubkey_address !== address) amount += vout.value;
            else if (!isOut && vout.scriptpubkey_address === address) amount += vout.value;
          }
          return {
            hash: tx.txid,
            type: isOut ? 'out' : 'in',
            amount: (amount / 1e8).toFixed(8),
            timestamp: (tx.status?.block_time || Date.now() / 1000) * 1000,
          };
        });
      } catch {
        continue;
      }
    }
    return [];
  }

  async getUtxos(address) {
    try {
      return await this.utxoRpc.execute({ address });
    } catch {
      return [];
    }
  }

  async estimateFees(fromAddress, _toAddress, _amount) {
    let feeEstimates = null;
    try {
      feeEstimates = await this.feeRpc.execute({});
    } catch {}

    if (!feeEstimates) {
      feeEstimates = { slow: 1, average: 0.5, fast: 0.1 };
    }

    let utxos = [];
    try {
      utxos = await this.getUtxos(fromAddress);
    } catch (error) {
      utxos = [{}];
    }

    const avgFeeRate = feeEstimates.average || feeEstimates['6'] || 1;
    const txVbytes = 140 + utxos.length * 50;
    const feeLitoshis = avgFeeRate * txVbytes;

    // `fee`/`feeSats` are in litoshis (base units); `estimatedFee` is the
    // native-LTC amount the send-confirmation screen (formatTxDetails) reads —
    // without it the displayed fee renders as 0.
    return {
      slow: {
        fee: feeLitoshis.toFixed(0),
        feeSats: Math.floor(feeLitoshis).toString(),
        estimatedFee: (feeLitoshis / 1e8).toFixed(8),
      },
      average: {
        fee: (feeLitoshis * 1.5).toFixed(0),
        feeSats: Math.floor(feeLitoshis * 1.5).toString(),
        estimatedFee: ((feeLitoshis * 1.5) / 1e8).toFixed(8),
      },
      fast: {
        fee: (feeLitoshis * 2).toFixed(0),
        feeSats: Math.floor(feeLitoshis * 2).toString(),
        estimatedFee: ((feeLitoshis * 2) / 1e8).toFixed(8),
      },
      feeRate: avgFeeRate,
    };
  }

  async sendTransaction(privateKey, toAddress, amount, feeLevel = 'average') {
    const keyPair = ECPair.fromWIF(privateKey, this.network);
    // The real P2WPKH (ltc1…) address — NOT the hex public key. Used for UTXO
    // lookup, fee estimation and the change output (a wrong change address loses
    // funds / makes the tx invalid).
    const { address: fromAddress } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });
    const utxos = await this.getUtxos(fromAddress);
    const fees = await this.estimateFees(fromAddress, toAddress, amount);

    const feeRate = fees[feeLevel]?.fee || fees.average.fee;

    const psbt = new bitcoin.Psbt({ network: this.network });

    for (const utxo of utxos) {
      const txHexResponse = await fetch(`${this.apiUrl}/tx/${utxo.txid}/hex`);
      const txHex = await txHexResponse.text();

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      });
    }

    const amountSats = Math.floor(amount * 100000000);
    const feeSats = Math.floor(parseFloat(feeRate));

    psbt.addOutput({
      address: toAddress,
      value: amountSats,
    });

    const totalInput = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    if (totalInput > amountSats + feeSats) {
      psbt.addOutput({
        address: fromAddress,
        value: totalInput - amountSats - feeSats,
      });
    }

    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    const txHex = tx.toHex();

    const response = await fetch(`${this.apiUrl}/tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: txHex,
    });

    if (!response.ok) {
      throw new Error('Failed to broadcast transaction');
    }

    const txId = await response.text();

    return {
      hash: txId,
      from: fromAddress,
      to: toAddress,
      amount: amount.toString(),
      symbol: 'LTC',
      fee: (feeSats / 100000000).toString(),
      blockNumber: 0,
      status: 'success',
    };
  }

  validateAddress(address) {
    try {
      if (address.startsWith('ltc1')) {
        return true;
      }
      if (/^[LM][a-km-zA-HJ-NP-Z1-9]{25,33}$/.test(address)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export default LitecoinChain;
