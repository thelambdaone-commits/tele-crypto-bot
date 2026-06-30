import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import ECPairFactoryModule from 'ecpair';

import { BaseProvider } from './base.provider.js';
import { TransactionError, ERROR_CODES } from '../shared/errors.js';
import { RpcManager } from '../shared/rpc/RpcManager.js';

const bip32 = BIP32Factory(ecc);
const ECPairFactory = ECPairFactoryModule.default || ECPairFactoryModule;
const ECPair = ECPairFactory(ecc);

// Keyless block explorers. mempool.space / blockstream.info / mempool.emzy.de
// all speak the Esplora REST API (same /address & /utxo shapes, handled by the
// esplora branch below); blockchain.info has its own shape (handled separately).
// All four verified live 30 juin 2026.
function buildApis(apiUrl) {
  return [...new Set([
    apiUrl,
    'https://mempool.space/api',
    'https://blockstream.info/api',
    'https://mempool.emzy.de/api',
    'https://blockchain.info',
  ].filter(Boolean))];
}

export class BitcoinChain extends BaseProvider {
  constructor(apiUrl) {
    super('Bitcoin', 'BTC');
    this.apiUrl = apiUrl;
    this.network = bitcoin.networks.bitcoin;
    this.apis = buildApis(apiUrl);

    this.balanceRpc = new RpcManager(this.apis, async (endpoint, { address }) => {
      const isBlockchain = endpoint.includes('blockchain.info');
      const url = isBlockchain
        ? `${endpoint}/rawaddr/${address}?limit=0`
        : `${endpoint}/address/${address}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        let balanceSats;
        if (isBlockchain) {
          balanceSats = data.final_balance;
        } else {
          balanceSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
        }

        return {
          balance: (balanceSats / 100000000).toString(),
          balanceSats: balanceSats.toString(),
          symbol: this.symbol,
        };
      } finally {
        clearTimeout(timeout);
      }
    }, { requestTimeoutMs: 10000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 5000, rps: 10 });

    this.utxoRpc = new RpcManager(this.apis, async (endpoint, { address }) => {
      const isBlockchain = endpoint.includes('blockchain.info');
      const url = isBlockchain
        ? `${endpoint}/unspent?format=json&address=${address}`
        : `${endpoint}/address/${address}/utxo`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        if (isBlockchain) {
          const data = await response.json();
          return (data.unspent_outputs || []).map((u) => ({
            txid: u.tx_hash,
            vout: u.tx_output_n,
            value: u.value,
          }));
        }
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    }, { requestTimeoutMs: 10000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 2000, rps: 10 });

    this.feeRpc = new RpcManager(this.apis, async (endpoint) => {
      const isBlockchain = endpoint.includes('blockchain.info');
      const url = isBlockchain
        ? `${endpoint}/blocks?format=json`
        : `${endpoint}/fee-estimates`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    }, { requestTimeoutMs: 10000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 30000, rps: 5 });
  }

  async createWallet() {
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed, this.network);

    const path = "m/84'/0'/0'/0/0";
    const child = root.derivePath(path);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: this.network,
    });

    return {
      address,
      privateKey: child.toWIF(),
      mnemonic,
    };
  }

  async importFromSeed(seedPhrase) {
    if (!bip39.validateMnemonic(seedPhrase)) {
      throw new Error('Invalid seed phrase');
    }

    const seed = await bip39.mnemonicToSeed(seedPhrase);
    const root = bip32.fromSeed(seed, this.network);

    const path = "m/84'/0'/0'/0/0";
    const child = root.derivePath(path);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: this.network,
    });

    return {
      address,
      privateKey: child.toWIF(),
      mnemonic: seedPhrase,
    };
  }

  async importFromKey(privateKeyWif) {
    const keyPair = ECPair.fromWIF(privateKeyWif, this.network);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });

    return {
      address,
      privateKey: privateKeyWif,
      mnemonic: null,
    };
  }

  async getBalance(address, tokenSymbol = null) {
    if (tokenSymbol && tokenSymbol.toUpperCase() !== 'BTC')
      return { balance: '0', symbol: tokenSymbol };

    try {
      return await this.balanceRpc.execute({ address });
    } catch (error) {
      throw new TransactionError('Unable to fetch balance - network issue', {
        code: ERROR_CODES.RPC_ERROR,
        chain: 'BTC',
      });
    }
  }

  async getUtxos(address) {
    try {
      return await this.utxoRpc.execute({ address });
    } catch {
      throw new Error('Unable to fetch UTXOs - all APIs failed');
    }
  }

  async getFeeEstimates() {
    try {
      return await this.feeRpc.execute({});
    } catch {
      return null;
    }
  }

  async estimateFees(fromAddress, _toAddress, _amount) {
    const feeEstimates = await this.getFeeEstimates();

    let fees;
    if (feeEstimates) {
      const isBlockchain = (feeEstimates.blocks != null);
      fees = {
        slow: feeEstimates['144'] || (isBlockchain ? 2 : 1),
        average: feeEstimates['6'] || feeEstimates['3'] || (isBlockchain ? 5 : 5),
        fast: feeEstimates['1'] || feeEstimates['2'] || (isBlockchain ? 10 : 10),
      };
    } else {
      fees = { slow: 2, average: 10, fast: 20 };
    }

    let utxos = [];
    try {
      utxos = await this.getUtxos(fromAddress);
    } catch (error) {
      utxos = [{}];
    }

    const inputCount = Math.max(1, Math.min(utxos.length, 5));
    const outputCount = 2;
    const txSize = inputCount * 68 + outputCount * 31 + 10;

    return {
      slow: {
        satPerVbyte: Math.ceil(fees.slow || 1),
        estimatedFee: (((fees.slow || 1) * txSize) / 100000000).toFixed(8),
        estimatedFeeSats: Math.ceil((fees.slow || 1) * txSize),
        confirmationBlocks: '~144 blocks (~24h)',
      },
      average: {
        satPerVbyte: Math.ceil(fees.average || 5),
        estimatedFee: (((fees.average || 5) * txSize) / 100000000).toFixed(8),
        estimatedFeeSats: Math.ceil((fees.average || 5) * txSize),
        confirmationBlocks: '~6 blocks (~1h)',
      },
      fast: {
        satPerVbyte: Math.ceil(fees.fast || 10),
        estimatedFee: (((fees.fast || 10) * txSize) / 100000000).toFixed(8),
        estimatedFeeSats: Math.ceil((fees.fast || 10) * txSize),
        confirmationBlocks: '~1 block (~10m)',
      },
    };
  }

  async broadcastTx(txHex) {
    const endpoints = [...new Set([
      this.apiUrl,
      'https://mempool.space/api',
      'https://blockstream.info/api',
      'https://mempool.emzy.de/api',
    ])];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${url}/tx`, {
          method: 'POST',
          body: txHex,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          return await response.text();
        }
      } catch {
        continue;
      }
    }

    throw new Error('Broadcast failed - all APIs unavailable');
  }

  async sendTransaction(privateKeyWif, toAddress, amount, feeLevel = 'average') {
    const keyPair = ECPair.fromWIF(privateKeyWif, this.network);
    const { address: fromAddress } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });

    const utxos = await this.getUtxos(fromAddress);
    const fees = await this.estimateFees(fromAddress, toAddress, amount);
    const feeData = fees[feeLevel];

    const amountSats = Math.floor(Number.parseFloat(amount) * 100000000);
    const feeSats = feeData.estimatedFeeSats;

    let totalInput = 0;
    const selectedUtxos = [];

    for (const utxo of utxos) {
      selectedUtxos.push(utxo);
      totalInput += utxo.value;
      if (totalInput >= amountSats + feeSats) break;
    }

    if (totalInput < amountSats + feeSats) {
      throw new Error('Insufficient balance');
    }

    const psbt = new bitcoin.Psbt({ network: this.network });

    for (const utxo of selectedUtxos) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: this.network })
            .output,
          value: utxo.value,
        },
      });
    }

    psbt.addOutput({
      address: toAddress,
      value: amountSats,
    });

    const change = totalInput - amountSats - feeSats;
    if (change > 546) {
      psbt.addOutput({
        address: fromAddress,
        value: change,
      });
    }

    for (let i = 0; i < selectedUtxos.length; i++) {
      psbt.signInput(i, keyPair);
    }

    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    const txHex = tx.toHex();

    try {
      const txid = await this.broadcastTx(txHex);

      return {
        hash: txid,
        from: fromAddress,
        to: toAddress,
        amount: amount.toString(),
        symbol: 'BTC',
        fee: feeData.estimatedFee,
        status: 'broadcast',
      };
    } catch (error) {
      let code = ERROR_CODES.BROADCAST_FAILED;
      if (error.message.includes('Insufficient balance')) code = ERROR_CODES.INSUFFICIENT_FUNDS;

      throw new TransactionError(error.message, {
        code,
        chain: 'BTC',
        details: error,
      });
    }
  }

  async getTransactionHistory(address, limit = 5) {
    try {
      const response = await fetch(`https://mempool.space/api/address/${address}/txs`);
      const data = await response.json();
      if (!Array.isArray(data)) return [];
      return data.slice(0, limit).map((tx) => {
        const isOut = tx.vin?.some((vin) => vin.prevout?.scriptpubkey_address === address);
        let amount = 0;
        for (const vout of tx.vout || []) {
          if (isOut && vout.scriptpubkey_address !== address) {
            amount += vout.value;
          } else if (!isOut && vout.scriptpubkey_address === address) {
            amount += vout.value;
          }
        }
        return {
          hash: tx.txid,
          type: isOut ? 'out' : 'in',
          amount: (amount / 1e8).toFixed(8),
          timestamp: (tx.status?.block_time || Date.now() / 1000) * 1000,
        };
      });
    } catch (error) {
      return [];
    }
  }

  validateAddress(address) {
    try {
      bitcoin.address.toOutputScript(address, this.network);
      return true;
    } catch {
      return false;
    }
  }
}
