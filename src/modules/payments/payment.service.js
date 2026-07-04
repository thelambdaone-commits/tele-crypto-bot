/**
 * Payment gateway — application service (Phase 1).
 *
 * Wires the pure invoice domain (invoice.service.js) to the bot: resolves the
 * merchant's own receiving wallet (NON-CUSTODIAL — funds go straight to the
 * merchant), persists invoices, and watches for payment by balance delta (same
 * mechanism the DepositMonitor already uses). On settlement it notifies the
 * merchant and records a balanced ledger pair.
 *
 * v1 limitation: matching is by balance increase on the merchant's wallet, so we
 * allow only ONE open invoice per (merchant, chain, asset) at a time. Per-invoice
 * HD-derived addresses (BTCPay-style) would lift that — a later phase.
 */
import crypto from 'node:crypto';
import { createInvoice, applyPayment, INVOICE_STATES } from './invoice.service.js';
import { settlementEntries } from './ledger.js';
import { LightningService } from './lightning.service.js';
import { CHAIN_REGISTRY } from '../../shared/chains.js';
import { formatEUR } from '../../shared/price.js';
import { config } from '../../core/config.js';
import { logger } from '../../shared/logger.js';
// i18n bundles are pure data — the service already talks to Telegram for its
// watcher notifications, so localizing them here keeps the merchant's language
// consistent outside a ctx.
import { t, resolveLang } from '../../bot/messages/index.js';

const OPEN = [INVOICE_STATES.NEW, INVOICE_STATES.PROCESSING];
const LN = 'lightning';
const SATS_PER_BTC = 100_000_000;

// Errors carry a stable `code` (+ `meta` args) so the Telegram layer can render
// them in the user's language (`payments.errors.<code>`); the French `message`
// stays as the untranslated fallback.
const err = (message, code, ...meta) => Object.assign(new Error(message), { code, meta });

export class PaymentService {
  constructor(storage, walletService, bot, { intervalMs = 30_000, lightning, sweep, adminId } = {}) {
    this.storage = storage;
    this.walletService = walletService;
    this.bot = bot;
    this.intervalMs = intervalMs;
    this.lightning = lightning || new LightningService();
    this.sweep = sweep || {
      address: config.lightning?.sweepAddress || '',
      thresholdSat: config.lightning?.sweepThresholdSat || 500_000,
      intervalMs: config.lightning?.sweepIntervalMs || 6 * 3600 * 1000,
    };
    this.adminId = adminId ?? config.adminUserId;
    this.timer = null;
    this.sweepTimer = null;
    this._polling = false; // re-entrancy guards: never process an invoice / sweep twice
    this._sweeping = false;
    this.ledger = []; // in-memory reconciliation log (persisted in a later phase)
  }

  lightningEnabled() {
    return this.lightning.isConfigured();
  }

  /** Treasury snapshot for the admin UI — keeps node/sweep internals encapsulated. */
  async treasuryStatus(limit = 5) {
    if (!this.lightningEnabled()) return { enabled: false };
    const balance = await this.lightning.getBalance(); // may throw → caller handles
    const payouts = (await this.storage.getPayouts()).slice(-limit).reverse();
    const dest = await this.sweepDestination();
    return {
      enabled: true,
      balanceSat: balance.balanceSat,
      thresholdSat: this.sweep.thresholdSat,
      address: dest?.address || '',
      addressLabel: dest?.label || '',
      coldForced: Boolean(this.sweep.address),
      payouts,
    };
  }

  /**
   * The resolved sweep destination as { address, label } — i.e. WHICH wallet
   * eventually receives Lightning funds. Used by /treasury and shown on each
   * Lightning invoice. Returns null when no destination exists yet.
   */
  async sweepDestination() {
    const address = await this._resolveSweepAddress();
    if (!address) return null;
    // `cold: true` → the caller renders a localized "external address" label.
    if (this.sweep.address) return { address, label: 'Adresse externe (cold)', cold: true };
    const adminId = this._adminId();
    const wallets = adminId ? await this.storage.getWallets(adminId).catch(() => []) : [];
    return { address, label: wallets.find((w) => w.address === address)?.label || '', cold: false };
  }

  /**
   * Where the treasury sweep sends funds. An explicit cold address
   * (LN_SWEEP_BTC_ADDRESS / SecretVault) always wins — keeps real cold storage
   * possible. Otherwise we fall back to the operator's OWN BTC wallet (the one
   * `/gen btc` created), resolved the same way on-chain invoicing resolves a
   * merchant wallet. Returns '' when neither exists → sweep stays disabled.
   */
  async _resolveSweepAddress() {
    if (this.sweep.address) return this.sweep.address; // forced cold address (env/vault) always wins
    const btc = await this._btcWallets();
    if (btc.length === 0) return '';
    const chosenId = await this._chosenSweepWalletId();
    const chosen = chosenId ? btc.find((w) => w.id === chosenId) : null;
    return (chosen || btc[0]).address; // admin's UI choice, else the first BTC wallet
  }

  _adminId() {
    return Array.isArray(this.adminId) ? this.adminId[0] : this.adminId;
  }

  /** The operator's usable BTC wallets — the candidate sweep destinations. */
  async _btcWallets() {
    const adminId = this._adminId();
    if (!adminId) return [];
    try {
      const wallets = await this.storage.getWallets(adminId);
      return (wallets || []).filter((w) => w.chain === 'btc' && !w.isCorrupted && w.address);
    } catch {
      return [];
    }
  }

  /** The wallet id the admin explicitly picked in /treasury (or null). */
  async _chosenSweepWalletId() {
    const adminId = this._adminId();
    if (!adminId) return null;
    try {
      const data = await this.storage.loadUserData(adminId);
      return data?.settings?.lnSweepWalletId || null;
    } catch {
      return null;
    }
  }

  /** BTC wallets the admin can pick as the sweep destination, active one flagged. */
  async sweepWalletOptions() {
    const btc = await this._btcWallets();
    const chosenId = await this._chosenSweepWalletId();
    const activeId = btc.find((w) => w.id === chosenId)?.id || btc[0]?.id || null;
    return {
      coldForced: Boolean(this.sweep.address),
      wallets: btc.map((w) => ({ id: w.id, label: w.label || w.address, address: w.address, active: w.id === activeId })),
    };
  }

  /** Persist the admin's chosen sweep wallet (must be one of their BTC wallets). */
  async setSweepWallet(walletId) {
    if (this.sweep.address) throw err('Destination forcée par la config (LN_SWEEP_BTC_ADDRESS).', 'SWEEP_FORCED');
    const w = (await this._btcWallets()).find((x) => x.id === walletId);
    if (!w) throw err('Wallet BTC introuvable.', 'WALLET_NOT_FOUND');
    await this.storage.updateSettings(this._adminId(), { lnSweepWalletId: walletId });
    return { id: w.id, label: w.label || w.address, address: w.address };
  }

  /**
   * Create an instant-settling Lightning (BTC) invoice via the LN backend.
   * Stores the BOLT11 + payment hash; no on-chain wallet/address.
   */
  async createLightningInvoice(merchantId, { amountFiat, amountCrypto, memo = '', expirySec = 900 } = {}) {
    if (!this.lightningEnabled()) throw err('Lightning non configuré sur ce bot.', 'LN_NOT_CONFIGURED');

    const invoice = await createInvoice({ merchantId, chain: LN, symbol: 'BTC', amountFiat, amountCrypto, memo, expirySec });
    const amountSat = Math.max(1, Math.round(invoice.amountCrypto * SATS_PER_BTC));
    const ln = await this.lightning.createInvoice({ amountSat, description: memo || `Facture ${invoice.id}`, externalId: invoice.id, expirySec });
    invoice.method = LN;
    invoice.bolt11 = ln.bolt11;
    invoice.paymentHash = ln.paymentHash;
    invoice.amountSat = amountSat;
    invoice.address = ln.bolt11; // the BOLT11 is what the payer scans
    const added = await this.storage.addInvoiceExclusive(merchantId, invoice, { chain: LN, symbol: 'BTC', openStatuses: OPEN });
    if (!added) throw err('Une facture Lightning est déjà ouverte.', 'LN_ALREADY_OPEN');
    logger.info('[Payments] lightning invoice created', { id: invoice.id, amountSat });
    return invoice;
  }

  // The token symbol to read, or null when the asset IS the chain's native coin.
  _tokenSymbol(chain, symbol) {
    const native = CHAIN_REGISTRY[chain]?.native;
    return symbol && native && symbol.toUpperCase() === native.toUpperCase() ? null : symbol;
  }

  async _balance(merchantId, walletId, chain, symbol) {
    const b = await this.walletService.getBalance(merchantId, walletId, this._tokenSymbol(chain, symbol));
    return Number.parseFloat(b.balance) || 0;
  }

  /** Create + persist an invoice; returns it with the receiving address attached. */
  async createInvoice(merchantId, chain, symbol, { amountFiat, amountCrypto, memo = '', expirySec } = {}) {
    const wallets = await this.storage.getWallets(merchantId);
    const wallet = wallets.find((w) => w.chain === chain && !w.isCorrupted);
    if (!wallet?.address) throw err(`Aucun wallet ${chain.toUpperCase()} pour recevoir.`, 'NO_WALLET_FOR_CHAIN', chain.toUpperCase());

    const invoice = await createInvoice({ merchantId, chain, symbol, amountFiat, amountCrypto, memo, expirySec });
    invoice.walletId = wallet.id;
    invoice.address = wallet.address;
    invoice.baseline = await this._balance(merchantId, wallet.id, chain, symbol);
    const added = await this.storage.addInvoiceExclusive(merchantId, invoice, { chain, symbol: invoice.symbol, openStatuses: OPEN });
    if (!added) throw err(`Une facture ${symbol} sur ${chain.toUpperCase()} est déjà ouverte.`, 'ALREADY_OPEN', symbol, chain.toUpperCase());
    logger.info('[Payments] invoice created', { id: invoice.id, chain, symbol });
    return invoice;
  }

  /** Still-open (payable) invoices for a merchant — status new/processing. */
  async getOpenInvoices(merchantId) {
    return (await this.storage.getInvoices(merchantId)).filter((i) => OPEN.includes(i.status));
  }

  /**
   * Cancel a still-open invoice (→ invalid) so the merchant can create a fresh
   * one (the per-asset "already open" lock then clears). No-op-safe: refuses if
   * the invoice is missing or already closed.
   */
  async cancelInvoice(merchantId, invoiceId) {
    // Atomic open-check + write under the storage lock — a concurrent settle can't
    // be clobbered by a stale snapshot.
    const res = await this.storage.updateInvoiceIfStatus(merchantId, invoiceId, OPEN, {
      status: INVOICE_STATES.INVALID,
      canceledAt: new Date().toISOString(),
    });
    if (!res.ok) {
      throw res.reason === 'not-found'
        ? err('Facture introuvable.', 'INVOICE_NOT_FOUND')
        : err('Cette facture n’est plus ouverte.', 'INVOICE_NOT_OPEN');
    }
    logger.info('[Payments] invoice canceled', { id: invoiceId, chain: res.invoice.chain });
    return res.invoice;
  }

  /** Re-check one invoice against the chain; persist + notify on a state change. */
  async checkInvoice(invoice, now = Date.now()) {
    if (!OPEN.includes(invoice.status)) return invoice;

    let next = invoice;
    try {
      let received;
      let confirmed;
      if (invoice.chain === LN) {
        // Lightning: ask the node; payment is instant and final.
        const r = await this.lightning.lookupIncoming(invoice.paymentHash);
        received = (r.receivedSat || 0) / SATS_PER_BTC;
        confirmed = r.isPaid;
      } else {
        // On-chain: balance increase on the merchant's own wallet. Require the
        // credited delta to PERSIST across two poll cycles before settling: the
        // first sighting only moves the invoice to `processing`, and we settle
        // once a later poll still sees enough. This is a soft 1-confirmation
        // that guards against 0-conf reorgs and transient balance blips
        // (settlement is irreversible, so we trade ~one cycle of latency).
        const current = await this._balance(invoice.merchantId, invoice.walletId, invoice.chain, invoice.symbol);
        received = Math.max(0, current - (invoice.baseline || 0));
        const required = invoice.amountCrypto * (1 - invoice.underpayTolerance);
        confirmed =
          invoice.status === INVOICE_STATES.PROCESSING && (invoice.receivedCrypto || 0) >= required;
      }
      next = applyPayment(invoice, received, { confirmed, now });
    } catch (e) {
      // A failed read tells us NOTHING — do not expire/settle on stale data
      // (would wrongly expire an invoice that was actually paid). Retry next cycle.
      logger.debug('[Payments] balance check failed; retry next cycle', { id: invoice.id, error: e.message });
      return invoice;
    }

    if (next.status !== invoice.status || next.receivedCrypto !== invoice.receivedCrypto) {
      // For Lightning, credit the merchant's INTERNAL balance BEFORE persisting
      // SETTLED. The credit is idempotent per invoice id, so a crash between the
      // credit and the status write just re-settles next cycle and re-credits as
      // a no-op — eliminating the under-credit window without risking a double.
      if (next.status === INVOICE_STATES.SETTLED) await this._creditLightning(next);
      await this.storage.updateInvoice(invoice.merchantId, next);
      if (next.status === INVOICE_STATES.SETTLED) await this._onSettled(next);
      else if (next.status === INVOICE_STATES.EXPIRED) {
        await this._notify(next, t(await this._langOf(next.merchantId), 'payments.notifExpired', next.symbol));
      }
    }
    return next;
  }

  // Lightning: funds pool in the node — credit the merchant's INTERNAL balance
  // (accounting), decoupled from the physical treasury sweep. Idempotent per id.
  async _creditLightning(invoice) {
    if (invoice.chain !== LN) return;
    const sat = Math.round((invoice.receivedCrypto || 0) * SATS_PER_BTC);
    try {
      await this.storage.creditLnBalance(invoice.merchantId, sat, invoice.id);
    } catch (e) {
      logger.warn('[Payments] creditLnBalance failed', { id: invoice.id, error: e.message });
    }
  }

  async _onSettled(invoice) {
    this.ledger.push(...settlementEntries(invoice));
    const lang = await this._langOf(invoice.merchantId);
    // The LN balance was already credited (idempotently) before the status write;
    // read it back for the notification line.
    let lnLine = '';
    if (invoice.chain === LN) {
      try {
        const bal = await this.storage.getLnBalance(invoice.merchantId);
        lnLine = t(lang, 'payments.lnBalanceLine', bal);
      } catch (e) {
        logger.warn('[Payments] getLnBalance failed', { id: invoice.id, error: e.message });
      }
    }
    const fiat = invoice.amountFiat != null ? ` (${formatEUR(invoice.amountFiat)})` : '';
    const over = invoice.overpaid ? t(lang, 'payments.overpaid') : '';
    await this._notify(
      invoice,
      t(lang, 'payments.notifPaid', { amount: invoice.receivedCrypto, symbol: invoice.symbol, fiat, over, id: invoice.id, lnLine })
    );
  }

  /**
   * Treasury sweep: move pooled node funds to the sweep address (an explicit cold
   * address if set, otherwise the operator's own BTC wallet — see
   * _resolveSweepAddress) once the node balance crosses the threshold.
   * Threshold-based (not per-payment) to save fees
   * and failure points. The node balance is the source of truth, so a failed
   * payout just retries from the real balance next cycle — funds are never lost.
   */
  async sweepLightningBalance() {
    if (!this.lightningEnabled()) return { swept: false, reason: 'disabled' };
    const sweepAddress = await this._resolveSweepAddress();
    if (!sweepAddress) return { swept: false, reason: 'disabled' };
    // Guard against concurrent sweeps (scheduled + manual) → would double-spend.
    if (this._sweeping) return { swept: false, reason: 'busy' };
    this._sweeping = true;
    try {
      let bal;
      try {
        bal = await this.lightning.getBalance();
      } catch (e) {
        logger.warn('[Payments] sweep getBalance failed', { error: e.message });
        return { swept: false, reason: 'balance-error' };
      }
      if (bal.balanceSat < this.sweep.thresholdSat) {
        return { swept: false, reason: 'below-threshold', balanceSat: bal.balanceSat };
      }

      const payout = {
        id: `payout-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
        amountSat: bal.balanceSat,
        address: sweepAddress,
        status: 'pending',
        txid: null,
        createdAt: new Date().toISOString(),
      };
      await this.storage.addPayout(payout);
      try {
        const { txid } = await this.lightning.sendToAddress({ address: sweepAddress, amountSat: bal.balanceSat });
        payout.status = 'withdrawn';
        payout.txid = txid;
        await this.storage.updatePayout(payout);
        logger.info('[Payments] treasury swept', { amountSat: payout.amountSat, txid });
        if (this.adminId) {
          const lang = await this._langOf(this._adminId());
          await this.bot.telegram
            .sendMessage(this.adminId, t(lang, 'payments.treasurySwept', { amountSat: payout.amountSat, address: payout.address, txid }), { parse_mode: 'HTML' })
            .catch(() => {});
        }
        return { swept: true, payout };
      } catch (e) {
        payout.status = 'failed';
        payout.error = e.message;
        await this.storage.updatePayout(payout);
        logger.warn('[Payments] sweep payout failed (funds remain in node)', { error: e.message });
        return { swept: false, reason: 'payout-failed', error: e.message };
      }
    } finally {
      this._sweeping = false;
    }
  }

  /** The merchant's stored language ('fr'/'en'), French fallback — for watcher notifications. */
  async _langOf(chatId) {
    try {
      const data = await this.storage.loadUserData(chatId);
      return resolveLang(data?.settings?.language);
    } catch {
      return 'fr';
    }
  }

  async _notify(invoice, text) {
    try {
      await this.bot.telegram.sendMessage(invoice.merchantId, text, { parse_mode: 'HTML' });
    } catch (e) {
      logger.debug('[Payments] notify failed', { id: invoice.id, error: e.message });
    }
  }

  /** One poll pass over every merchant's open invoices. */
  async pollOnce(now = Date.now()) {
    // Guard against overlapping polls (a slow pass + the next tick) → a second
    // pass could re-settle an invoice and double-credit before the first persists.
    if (this._polling) return;
    this._polling = true;
    try {
      const users = await this.storage.getAllUsers();
      // Merchants are independent (one encrypted file each) so they are polled
      // in parallel; within a merchant, invoices stay sequential — their checks
      // read-modify-write the same user file (settle, LN credit).
      await Promise.all(
        users.map(async (user) => {
          try {
            const invoices = await this.storage.getInvoices(user.chatId);
            for (const inv of invoices.filter((i) => OPEN.includes(i.status))) {
              await this.checkInvoice(inv, now);
            }
          } catch (e) {
            // Contain per-merchant failures: a rejection must not release the
            // _polling guard while other merchants are still being checked.
            logger.warn('[Payments] merchant poll failed', {
              chatId: user.chatId,
              error: e.message,
            });
          }
        })
      );
    } finally {
      this._polling = false;
    }
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.pollOnce().catch((e) => logger.warn('[Payments] poll error', { error: e.message })), this.intervalMs);
    logger.info('[Payments] watcher started', { intervalMs: this.intervalMs });

    // Treasury sweep loop — runs whenever Lightning is on. The destination is
    // resolved per-cycle (cold address, admin-chosen wallet, or first BTC
    // wallet); sweepLightningBalance() no-ops safely when none exists yet, so the
    // operator can pick a wallet later without a restart.
    if (this.lightningEnabled() && !this.sweepTimer) {
      this.sweepTimer = setInterval(
        () => this.sweepLightningBalance().catch((e) => logger.warn('[Payments] sweep error', { error: e.message })),
        this.sweep.intervalMs
      );
      logger.info('[Payments] treasury sweep started', { intervalMs: this.sweep.intervalMs, thresholdSat: this.sweep.thresholdSat });
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    if (this.sweepTimer) clearInterval(this.sweepTimer);
    this.timer = null;
    this.sweepTimer = null;
  }
}
