/**
 * Payment gateway — Lightning backend client (Step 1).
 *
 * Thin HTTP wrapper over a Lightning node's API (phoenixd by default — ACINQ's
 * headless daemon with auto-liquidity). The node runs as a SEPARATE process; the
 * bot only speaks to its HTTP API. Lightning is OFF unless LN_BACKEND_URL +
 * LN_PASSWORD are configured (on-chain invoicing keeps working regardless).
 *
 * phoenixd API used:
 *   POST /createinvoice           → { paymentHash, serialized (BOLT11), amountSat }
 *   GET  /payments/incoming/{hash}→ { isPaid, receivedSat, preimage }
 * Auth: HTTP Basic with an empty username and the http password.
 *
 * `fetchImpl` is injectable so this is unit-testable without a real node.
 */
import { config } from '../../core/config.js';

export class LightningService {
  constructor({ url, password, fetchImpl } = {}) {
    this.url = String(url ?? config.lightning?.url ?? '').replace(/\/+$/, '');
    this.password = password ?? config.lightning?.password ?? '';
    this._fetch = fetchImpl || globalThis.fetch;
  }

  isConfigured() {
    return Boolean(this.url && this.password);
  }

  _authHeader() {
    return 'Basic ' + Buffer.from(`:${this.password}`).toString('base64');
  }

  async _call(path, { method = 'GET', form = null } = {}) {
    if (!this.isConfigured()) {
      throw new Error('Lightning non configuré (LN_BACKEND_URL / LN_PASSWORD).');
    }
    const opts = { method, headers: { Authorization: this._authHeader(), Accept: 'application/json' } };
    if (form) {
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      opts.body = new URLSearchParams(form).toString();
    }
    let res;
    try {
      res = await this._fetch(`${this.url}${path}`, opts);
    } catch (e) {
      const code = e?.cause?.code || e?.code || '';
      if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ECONNRESET' || code === 'ETIMEDOUT') {
        throw new Error(
          `Lightning node injoignable (${code}) sur ${this.url}. Vérifiez que phoenixd est lancé.`
        );
      }
      throw new Error(`Erreur réseau Lightning : ${e.message || code}`);
    }
    // phoenixd returns JSON for most calls but a bare txid string for
    // /sendtoaddress — read text first, then try to parse.
    const text = typeof res.text === 'function' ? await res.text() : '';
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { _raw: text };
    }
    if (!res.ok) throw new Error(json?.message || `Lightning HTTP ${res.status}`);
    return json;
  }

  /** Create a BOLT11 invoice for `amountSat` sats. */
  async createInvoice({ amountSat, description = '', externalId = '', expirySec = 900 }) {
    const sat = Math.round(Number(amountSat));
    if (!Number.isFinite(sat) || sat <= 0) throw new Error('Montant sats invalide');
    const j = await this._call('/createinvoice', {
      method: 'POST',
      form: { amountSat: sat, description, externalId, expirySeconds: expirySec },
    });
    if (!j.serialized) throw new Error('Réponse Lightning invalide (pas de BOLT11)');
    return { paymentHash: j.paymentHash, bolt11: j.serialized, amountSat: Number(j.amountSat ?? sat) };
  }

  /** Has this invoice (by payment hash) been paid? + amount received (sats). */
  async lookupIncoming(paymentHash) {
    const j = await this._call(`/payments/incoming/${encodeURIComponent(paymentHash)}`);
    return { isPaid: Boolean(j.isPaid), receivedSat: Number(j.receivedSat || 0), preimage: j.preimage || null };
  }

  /** Node's spendable balance (sats) — used by the treasury sweep. */
  async getBalance() {
    const j = await this._call('/getbalance');
    return { balanceSat: Number(j.balanceSat || 0), feeCreditSat: Number(j.feeCreditSat || 0) };
  }

  /**
   * Pay a BOLT11 Lightning invoice from the node's balance.
   * Returns { paymentId, amountSat, feesSat, preimage }.
   */
  async payInvoice({ invoice, amountSat = null }) {
    if (!invoice) throw new Error('Invoice BOLT11 manquante');
    const form = { invoice };
    if (amountSat != null) {
      const sat = Math.round(Number(amountSat));
      if (!Number.isFinite(sat) || sat <= 0) throw new Error('Montant sats invalide');
      form.amountSat = sat;
    }
    const j = await this._call('/payinvoice', { method: 'POST', form });
    return {
      paymentId: j.paymentId || null,
      amountSat: Number(j.amountSat ?? amountSat ?? 0),
      feesSat: Number(j.feesSat ?? 0),
      preimage: j.preimage || null,
    };
  }

  /** On-chain payout from the node to `address` (treasury sweep). Returns the txid. */
  async sendToAddress({ address, amountSat, feerateSatByte = 1 }) {
    const sat = Math.round(Number(amountSat));
    if (!address) throw new Error('Adresse de retrait manquante');
    if (!Number.isFinite(sat) || sat <= 0) throw new Error('Montant retrait invalide');
    const j = await this._call('/sendtoaddress', {
      method: 'POST',
      form: { address, amountSat: sat, feerateSatByte },
    });
    const txid = typeof j === 'string' ? j : j.txid || j._raw || '';
    return { txid: String(txid).trim() };
  }
}
