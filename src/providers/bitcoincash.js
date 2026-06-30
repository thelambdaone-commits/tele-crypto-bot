import { ECPairFactory } from 'ecpair';
import * as tinysecp from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';

import { BaseProvider } from './base.provider.js';
import { TransactionError, ERROR_CODES } from '../shared/errors.js';
import { RpcManager } from '../shared/rpc/RpcManager.js';

const ECPair = ECPairFactory(tinysecp);
const bip32 = BIP32Factory(tinysecp);
const CASHADDR_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

const BCH_NETWORK = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bitcoincash',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
  coinType: 145,
};

export class BitcoinCashChain extends BaseProvider {
  constructor(apiUrl = null) {
    super('Bitcoin Cash', 'BCH');
    this.apiUrl = apiUrl || 'https://api.blockchain.info/bch/stats';
    this.network = BCH_NETWORK;
    this.explorerApi = 'https://blockchain.info';

    // Wallets are legacy (1…) p2pkh. Haskoin resolves legacy addresses directly
    // and is primary; Bitcore only indexes cashaddr, so a legacy lookup there
    // SILENTLY returns 0 (HTTP 200) — it sits last as a degraded fallback only.
    // api.blockchain.info/bch was removed: its /bch routes now serve an HTML SPA
    // (404 for the API), so it never returned a balance. Both kept endpoints
    // answer GET /address/{addr}/balance with a `confirmed` field (sats).
    this.balanceRpc = new RpcManager(
      ['https://api.haskoin.com/bch', 'https://api.bitcore.io/api/BCH/mainnet'],
      async (endpoint, { address }) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(`${endpoint}/address/${address}/balance`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();
          const balanceSats = data.confirmed ?? data.balance ?? 0;

          return {
            balance: (balanceSats / 100000000).toString(),
            balanceSats: balanceSats.toString(),
            symbol: this.symbol,
          };
        } finally {
          clearTimeout(timeout);
        }
      },
      { requestTimeoutMs: 10000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 5000, rps: 10 }
    );

    // Haskoin /address/{addr}/unspent works for legacy AND cashaddr inputs and
    // returns {txid,index,value,pkscript}. Normalise to the {txHash,index,value}
    // shape sendTransaction consumes. (Replaces the dead api.blockchain.info/bch.)
    this.utxoRpc = new RpcManager(
      ['https://api.haskoin.com/bch'],
      async (endpoint, { address }) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(`${endpoint}/address/${address}/unspent`, {
            signal: controller.signal,
          });
          if (!response.ok) return [];
          const data = await response.json();
          return (Array.isArray(data) ? data : []).map((u) => ({
            txHash: u.txid,
            index: u.index,
            value: u.value,
            script: u.pkscript,
          }));
        } finally {
          clearTimeout(timeout);
        }
      },
      { requestTimeoutMs: 10000, failureThreshold: 2, baseDelayMs: 200, cacheTtlMs: 2000, rps: 10 }
    );
  }

  toLegacyAddress(cashAddr) {
    try {
      return this.cashAddrToLegacy(cashAddr);
    } catch {
      return null;
    }
  }

  cashAddrPrefixToWords(prefix) {
    return [...prefix].map((char) => char.charCodeAt(0) & 0x1f);
  }

  cashAddrPolymod(values) {
    const generators = [0x98f2bc8e61n, 0x79b76d99e2n, 0xf33e5fb3c4n, 0xae2eabe2a8n, 0x1e4f43e470n];
    let checksum = 1n;

    for (const value of values) {
      const top = checksum >> 35n;
      checksum = ((checksum & 0x07ffffffffn) << 5n) ^ BigInt(value);

      for (let i = 0; i < generators.length; i += 1) {
        if (((top >> BigInt(i)) & 1n) !== 0n) {
          checksum ^= generators[i];
        }
      }
    }

    return checksum;
  }

  convertBits(data, fromBits, toBits, pad = false) {
    let accumulator = 0;
    let bits = 0;
    const result = [];
    const maxValue = (1 << toBits) - 1;
    const maxAccumulator = (1 << (fromBits + toBits - 1)) - 1;

    for (const value of data) {
      if (value < 0 || value >> fromBits !== 0) {
        throw new Error('Invalid cashaddr value');
      }

      accumulator = ((accumulator << fromBits) | value) & maxAccumulator;
      bits += fromBits;

      while (bits >= toBits) {
        bits -= toBits;
        result.push((accumulator >> bits) & maxValue);
      }
    }

    if (pad) {
      if (bits > 0) result.push((accumulator << (toBits - bits)) & maxValue);
    } else if (bits >= fromBits || ((accumulator << (toBits - bits)) & maxValue) !== 0) {
      throw new Error('Invalid cashaddr padding');
    }

    return result;
  }

  cashAddrToLegacy(address) {
    const normalized = address.toLowerCase();
    const [prefix, payload] = normalized.includes(':')
      ? normalized.split(':')
      : ['bitcoincash', normalized];

    if (prefix !== 'bitcoincash' || !/^[qp][ac-hj-np-z02-9]{41}$/.test(payload)) {
      throw new Error('Invalid Bitcoin Cash address');
    }

    const payloadValues = [...payload].map((char) => {
      const value = CASHADDR_CHARSET.indexOf(char);
      if (value === -1) throw new Error('Invalid cashaddr character');
      return value;
    });

    const checksumInput = [...this.cashAddrPrefixToWords(prefix), 0, ...payloadValues];
    if (this.cashAddrPolymod(checksumInput) !== 1n) {
      throw new Error('Invalid cashaddr checksum');
    }

    const decoded = this.convertBits(payloadValues.slice(0, -8), 5, 8, false);
    const version = decoded[0];
    const hash = Buffer.from(decoded.slice(1));
    const type = version >> 3;

    if (hash.length !== 20) {
      throw new Error('Unsupported cashaddr hash size');
    }

    if (type === 0) return bitcoin.address.toBase58Check(hash, 0x00);
    if (type === 1) return bitcoin.address.toBase58Check(hash, 0x05);

    throw new Error('Unsupported cashaddr type');
  }

  async createWallet() {
    const keyPair = ECPair.makeRandom({ network: this.network });
    const { address } = bitcoin.payments.p2pkh({
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
    const { address } = bitcoin.payments.p2pkh({
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
    // BIP44 path for Bitcoin Cash (coin type 145).
    const child = root.derivePath("m/44'/145'/0'/0/0");

    const { address } = bitcoin.payments.p2pkh({
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
    if (tokenSymbol && tokenSymbol.toUpperCase() !== 'BCH')
      return { balance: '0', symbol: tokenSymbol };

    try {
      return await this.balanceRpc.execute({ address });
    } catch (error) {
      throw new TransactionError(error.message, {
        code: ERROR_CODES.RPC_ERROR,
        chain: 'BCH'
      });
    }
  }

  base58ToLegacy(base58) {
    try {
      const decoded = this.base58Decode(base58);
      return '1' + decoded.slice(0, -4);
    } catch {
      return base58;
    }
  }

  base58Decode(address) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = [];
    for (let i = 0; i < address.length; i++) {
      const char = address[address.length - 1 - i];
      const index = alphabet.indexOf(char);
      if (index === -1) throw new Error('Invalid base58');
      let carry = index;
      for (let j = 0; j < num.length; j++) {
        carry += num[j] * 58;
        num[j] = carry % 256;
        carry = Math.floor(carry / 256);
      }
      while (carry > 0) {
        num.push(carry % 256);
        carry = Math.floor(carry / 256);
      }
    }
    const leadingZeros = address.match(/^1+/);
    if (leadingZeros) {
      for (let i = 0; i < leadingZeros[0].length; i++) {
        num.push(0);
      }
    }
    return Buffer.from(num.reverse()).toString('hex');
  }

  async getTransactionHistory(address, limit = 5) {
    // Haskoin returns cashaddr in inputs/outputs while our wallets use legacy
    // addresses — normalise both sides to legacy before comparing.
    const toLegacy = (a) => {
      const s = String(a || '').replace(/^bitcoincash:/i, '');
      if (/^[qp][ac-hj-np-z02-9]{41}$/i.test(s)) {
        try {
          return this.cashAddrToLegacy(s);
        } catch {
          return s;
        }
      }
      return s;
    };

    try {
      const target = toLegacy(address);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(
        `https://api.haskoin.com/bch/address/${address}/transactions/full?limit=${limit}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((tx) => {
        const isOut = (tx.inputs || []).some((input) => toLegacy(input.address) === target);
        let amount = 0;
        for (const output of tx.outputs || []) {
          const to = toLegacy(output.address);
          if (isOut && to !== target) amount += output.value;
          else if (!isOut && to === target) amount += output.value;
        }
        return {
          hash: tx.txid,
          type: isOut ? 'out' : 'in',
          amount: (amount / 1e8).toFixed(8),
          timestamp: (tx.time || Date.now() / 1000) * 1000,
        };
      });
    } catch {
      return [];
    }
  }

  async getUtxos(address) {
    try {
      return await this.utxoRpc.execute({ address });
    } catch {
      return [];
    }
  }

  async estimateFees(_fromAddress, _toAddress, _amount) {
    const feePerByte = 1;
    const estimatedFee = 0.00001;

    return {
      slow: {
        estimatedFee: (estimatedFee * 0.5).toString(),
        feeSats: Math.floor(estimatedFee * 0.5 * 100000000).toString(),
      },
      average: {
        estimatedFee: estimatedFee.toString(),
        feeSats: Math.floor(estimatedFee * 100000000).toString(),
      },
      fast: {
        estimatedFee: (estimatedFee * 2).toString(),
        feeSats: Math.floor(estimatedFee * 2 * 100000000).toString(),
      },
      feeRate: feePerByte,
    };
  }

  async broadcastTransaction(txHex) {
    // Haskoin relays the raw tx to the BCH mempool and returns {txid}; Blockchair
    // is the form-encoded fallback ({data:{transaction_hash}}). Both verified
    // reachable 30 juin 2026. (The old blockchain.info/pushtx routes are dead.)
    const attempts = [
      async (signal) => {
        const r = await fetch('https://api.haskoin.com/bch/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: txHex,
          signal,
        });
        if (!r.ok) throw new Error(`haskoin HTTP ${r.status}`);
        const j = await r.json();
        if (!j.txid) throw new Error('haskoin: no txid in response');
        return j.txid;
      },
      async (signal) => {
        const r = await fetch('https://api.blockchair.com/bitcoin-cash/push/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'data=' + txHex,
          signal,
        });
        if (!r.ok) throw new Error(`blockchair HTTP ${r.status}`);
        const j = await r.json();
        const txid = j?.data?.transaction_hash;
        if (!txid) throw new Error('blockchair: no transaction_hash');
        return txid;
      },
    ];

    let lastError;
    for (const attempt of attempts) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        return await attempt(controller.signal);
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error(`BCH broadcast failed: ${lastError?.message || 'all endpoints unavailable'}`);
  }

  // BCH signs with the BIP143 digest (same as SegWit) but with SIGHASH_FORKID
  // (0x40) set in the hashtype — for BCH the fork id is 0, so the committed
  // nHashType is exactly 0x41 (SIGHASH_ALL | SIGHASH_FORKID). This commits to the
  // input amount, which is why the legacy hashForSignature path can't be used.
  static HASH_TYPE = 0x01 | 0x40; // 0x41

  // Turn a destination (legacy 1…/3… or cashaddr) into a scriptPubKey buffer.
  _toOutputScript(address) {
    let legacy = address;
    if (/^(bitcoincash:)?[qp][ac-hj-np-z02-9]{41}$/i.test(address)) {
      legacy = this.cashAddrToLegacy(address);
    }
    return bitcoin.address.toOutputScript(legacy, this.network);
  }

  async sendTransaction(privateKey, toAddress, amount, feeLevel = 'average') {
    const keyPair = ECPair.fromWIF(privateKey, this.network);
    const pubkey = Buffer.from(keyPair.publicKey);
    // Real P2PKH (legacy base58) address — NOT the hex public key. Used for UTXO
    // lookup, fees and the change output; a wrong change address loses funds.
    const { address: fromAddress } = bitcoin.payments.p2pkh({ pubkey, network: this.network });
    const prevScript = bitcoin.payments.p2pkh({ pubkey, network: this.network }).output;

    const utxos = await this.getUtxos(fromAddress);
    if (!utxos || utxos.length === 0) {
      throw new TransactionError('No UTXOs available', { code: ERROR_CODES.NO_UTXOS, chain: 'BCH' });
    }

    const amountSats = Math.floor(Number(amount) * 100000000);
    let totalInput = 0;
    for (const utxo of utxos) totalInput += utxo.value;

    // Size-based fee at the chosen sat/byte rate: ~148 B/P2PKH-input + 34 B/output
    // + 10 B overhead (recipient + change). BCH fees are ~1 sat/B.
    const fees = await this.estimateFees(fromAddress, toAddress, amount);
    const feeRate = Math.max(1, Math.ceil(Number(fees.feeRate) || 1));
    const feeSats = feeRate * (10 + utxos.length * 148 + 2 * 34);

    if (totalInput < amountSats + feeSats) {
      throw new TransactionError('Solde BCH insuffisant (frais inclus)', {
        code: ERROR_CODES.INSUFFICIENT_FUNDS,
        chain: 'BCH',
      });
    }

    const tx = new bitcoin.Transaction();
    tx.version = 2;
    for (const utxo of utxos) {
      tx.addInput(Buffer.from(utxo.txHash, 'hex').reverse(), utxo.index);
    }
    tx.addOutput(this._toOutputScript(toAddress), BigInt(amountSats));

    const changeAmount = totalInput - amountSats - feeSats;
    if (changeAmount > 546) {
      // above the dust limit — return change to ourselves (else it becomes fee)
      tx.addOutput(this._toOutputScript(fromAddress), BigInt(changeAmount));
    }

    const HT = BitcoinCashChain.HASH_TYPE;
    for (let i = 0; i < utxos.length; i++) {
      const sighash = tx.hashForWitnessV0(i, prevScript, BigInt(utxos[i].value), HT);
      const signature = keyPair.sign(sighash);
      // bitcoinjs refuses to encode the non-standard 0x41 hashtype, so DER-encode
      // with a standard type and overwrite the trailing (appended) hashtype byte.
      const der = bitcoin.script.signature.encode(Buffer.from(signature), 0x01);
      const encoded = Buffer.concat([der.subarray(0, der.length - 1), Buffer.from([HT])]);
      tx.ins[i].script = bitcoin.script.compile([encoded, pubkey]);
    }

    const txHex = tx.toHex();
    const txId = await this.broadcastTransaction(txHex);

    return {
      hash: txId,
      from: fromAddress,
      to: toAddress,
      amount: amount.toString(),
      symbol: 'BCH',
      fee: (feeSats / 100000000).toString(),
      blockNumber: 0,
      status: 'broadcast',
    };
  }

  base58ToBytes(address) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const bytes = [];
    for (let i = 0; i < address.length; i++) {
      const char = address[i];
      const index = alphabet.indexOf(char);
      if (index === -1) throw new Error(`Invalid character: ${char}`);
      let value = index;
      for (let j = 0; j < bytes.length; j++) {
        value = value * 58 + bytes[j];
        bytes[j] = value & 0xff;
        value = Math.floor(value / 256);
      }
      while (value > 0) {
        bytes.push(value & 0xff);
        value = Math.floor(value / 256);
      }
    }
    const leadingOnes = address.match(/^1+/);
    if (leadingOnes) {
      for (let i = 0; i < leadingOnes[0].length; i++) {
        bytes.push(0);
      }
    }
    return Buffer.from(bytes.reverse());
  }

  validateAddress(address) {
    try {
      if (address.startsWith('bitcoincash:')) {
        return (
          /^(bitcoincash:)?[qp][ac-hj-np-z02-9]{41}$/i.test(address) &&
          Boolean(this.cashAddrToLegacy(address))
        );
      }
      if (/^[qp][ac-hj-np-z02-9]{41}$/i.test(address)) {
        return Boolean(this.cashAddrToLegacy(address));
      }
      if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export default BitcoinCashChain;
