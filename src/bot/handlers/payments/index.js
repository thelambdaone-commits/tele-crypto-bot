import { Markup } from 'telegraf';
import { mainMenuKeyboard } from '../../keyboards/index.js';
import { CALLBACKS, CALLBACK_REGEX, dynamicCallback } from '../../constants/callbacks.js';
import { adminGuard, isAdmin } from '../../middlewares/auth.middleware.js';
import { safeAnswerCbQuery, safeEditMessage, escapeHtml } from '../../../shared/utils/telegram.js';
import { generateAddressQR } from '../../../shared/qr.js';
import { CHAIN_REGISTRY, CHAIN_EMOJIS } from '../../../shared/chains.js';
import { getAllTokensForChain, getNativeSymbol } from '../../../core/tokens.config.js';
import { formatEUR } from '../../../shared/price.js';
import { t } from '../../messages/index.js';
import { logger } from '../../../shared/logger.js';

const STATE = 'ENTER_INVOICE_AMOUNT';
const STATUS_EMOJI = { new: '⏳', processing: '🟡', settled: '✅', complete: '✅', expired: '⌛', invalid: '❌' };
const OPEN_STATUS = ['new', 'processing']; // payable → can be viewed / canceled
const fmt = (n) => String(Number(Number(n).toPrecision(8)));
const langOf = (ctx) => ctx.state?.lang || 'fr';

// PaymentService errors carry a stable `code` (+ `meta` args) — render those in
// the user's language; anything else falls back to the raw (French) message.
function payErr(lang, e) {
  if (e?.code) return t(lang, `payments.errors.${e.code}`, ...(e.meta || []));
  return escapeHtml(e.message);
}

// Receiving-method picker: a ⚡ Lightning entry (when the node is up) above the
// merchant's on-chain wallets.
function methodKeyboard(lang, wallets, lnEnabled) {
  const rows = [];
  if (lnEnabled) rows.push([Markup.button.callback(t(lang, 'payments.lnMethodBtn'), CALLBACKS.INVOICE_LN)]);
  for (const w of wallets) {
    rows.push([Markup.button.callback(`${CHAIN_EMOJIS[w.chain] || '●'} ${w.label}`, dynamicCallback.invoiceWallet(w.id))]);
  }
  rows.push([Markup.button.callback(t(lang, 'menu.back'), CALLBACKS.BACK_TO_MENU)]);
  return Markup.inlineKeyboard(rows);
}

// /treasury actions: manual sweep, and (unless a cold address is forced by env)
// a button to choose which BTC wallet receives swept Lightning funds.
function treasuryKeyboard(lang, coldForced) {
  const rows = [[Markup.button.callback(t(lang, 'payments.sweepNowBtn'), CALLBACKS.TREASURY_SWEEP)]];
  if (!coldForced) rows.push([Markup.button.callback(t(lang, 'payments.changeWalletBtn'), CALLBACKS.TREASURY_PICK)]);
  rows.push([Markup.button.callback(t(lang, 'payments.menuBtn'), CALLBACKS.BACK_TO_MENU)]);
  return Markup.inlineKeyboard(rows);
}

// BTC-wallet picker shared by /treasury and the Lightning-invoice flow. `prefix`
// is the per-wallet callback prefix (treasury_w_ / pinv_lnw_); `back` is the
// trailing Retour button (its target differs per flow).
function sweepWalletPickKeyboard(wallets, prefix, back) {
  const rows = wallets.map((w) => [
    Markup.button.callback(`${w.active ? '✅ ' : ''}💰 ${w.label}`, `${prefix}${w.id}`),
  ]);
  rows.push([back]);
  return Markup.inlineKeyboard(rows);
}

// Edit the current message in place when handling a button tap, else send a fresh
// one (delete+reply fallback when the message can't be edited, e.g. a photo). Keeps
// button taps from stacking new messages under the previous screen.
async function sendOrEdit(ctx, text, extra) {
  if (ctx.callbackQuery) {
    try {
      return await ctx.editMessageText(text, extra);
    } catch {
      try {
        await ctx.deleteMessage();
      } catch {
        /* already gone */
      }
    }
  }
  return ctx.reply(text, extra);
}

/**
 * Payment gateway — merchant UI (Phase 1). Create a crypto invoice on one of your
 * own wallets, get a QR + address; the PaymentService watches for payment and
 * notifies you. Non-custodial: funds land directly in your wallet.
 */
export function setupPaymentHandlers(bot, storage, walletService, sessions, payments) {
  // Render an invoice's QR card (used on creation AND when re-viewing one). Open
  // invoices also get a 🗑 Annuler button so the merchant can free the slot.
  const sendInvoiceCard = async (ctx, inv) => {
    const lang = langOf(ctx);
    const mins = Math.max(0, Math.round((inv.expiresAt - Date.now()) / 60000));
    const expLine = mins > 0 ? t(lang, 'payments.expireIn', mins) : t(lang, 'payments.expired');
    const open = OPEN_STATUS.includes(inv.status);
    let caption;
    let qr;
    if (inv.chain === 'lightning') {
      const dest = await payments.sweepDestination();
      const destLabel = dest?.cold ? t(lang, 'payments.coldLabel') : dest?.label || '';
      const destLine = dest
        ? t(lang, 'payments.collectedOn', escapeHtml(destLabel), escapeHtml(dest.address))
        : '';
      caption = t(lang, 'payments.lnCard', {
        fiat: formatEUR(inv.amountFiat),
        sats: inv.amountSat,
        btc: fmt(inv.amountCrypto),
        bolt11: escapeHtml(inv.bolt11),
        expLine,
        id: escapeHtml(inv.id),
        destLine,
      });
      qr = await generateAddressQR(inv.bolt11, 'btc', { logoSymbol: 'btc', label: 'Lightning' });
    } else {
      caption = t(lang, 'payments.card', {
        fiat: formatEUR(inv.amountFiat),
        amount: fmt(inv.amountCrypto),
        symbol: inv.symbol,
        chainName: escapeHtml(CHAIN_REGISTRY[inv.chain]?.name || inv.chain),
        address: inv.address,
        expLine,
        id: escapeHtml(inv.id),
      });
      qr = await generateAddressQR(inv.address, inv.chain);
    }
    const rows = [];
    if (open) rows.push([Markup.button.callback(t(lang, 'payments.cancelInvoiceBtn'), dynamicCallback.invoiceCancel(inv.id))]);
    rows.push([Markup.button.callback(t(lang, 'payments.menuBtn'), CALLBACKS.BACK_TO_MENU)]);
    await ctx.replyWithPhoto({ source: qr }, { caption, parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) });
  };

  // /invoice — choose which wallet receives.
  bot.command(['invoice', 'facture'], async (ctx) => {
    const lang = langOf(ctx);
    const wallets = await storage.getWallets(ctx.chat.id);
    if (!wallets.length) {
      return ctx.reply(t(lang, 'payments.noWallet'));
    }
    sessions.clearState(ctx.chat.id);
    await ctx.reply(t(lang, 'payments.createTitle'), {
      parse_mode: 'HTML',
      ...methodKeyboard(lang, wallets, payments.lightningEnabled()),
    });
  });

  // "💳 Facture" button (from ☰ Plus) — same flow as /invoice, but edits in place.
  bot.action(CALLBACKS.INVOICE_START, async (ctx) => {
    const lang = langOf(ctx);
    await safeAnswerCbQuery(ctx);
    const wallets = await storage.getWallets(ctx.chat.id);
    if (!wallets.length) {
      return safeEditMessage(ctx, t(lang, 'payments.noWallet'), {
        parse_mode: 'HTML',
        ...mainMenuKeyboard(lang),
      });
    }
    sessions.clearState(ctx.chat.id);
    await safeEditMessage(ctx, t(lang, 'payments.createTitle'), {
      parse_mode: 'HTML',
      ...methodKeyboard(lang, wallets, payments.lightningEnabled()),
    });
  });

  // Lightning: set the amount-entry state and prompt for the EUR amount.
  const askLightningAmount = (ctx) => {
    sessions.setData(ctx.chat.id, { invoiceMethod: 'lightning', invoiceSymbol: 'BTC' });
    sessions.setState(ctx.chat.id, STATE);
    return safeEditMessage(ctx, t(langOf(ctx), 'payments.lnAskAmount'), { parse_mode: 'HTML' });
  };

  // ⚡ Lightning chosen → (admin) pick the receiving BTC wallet, then the amount.
  bot.action(CALLBACKS.INVOICE_LN, async (ctx) => {
    const lang = langOf(ctx);
    await safeAnswerCbQuery(ctx);
    if (!payments.lightningEnabled()) {
      return safeEditMessage(ctx, t(lang, 'payments.lnUnavailable'), {
        parse_mode: 'HTML',
        ...mainMenuKeyboard(lang),
      });
    }
    // Lightning funds pool in the node and are swept to ONE on-chain destination.
    // Choosing the BTC wallet here = setting that (global) sweep destination, so
    // it's admin-only and skipped when forced to a cold address or only one wallet.
    const { coldForced, wallets } = await payments.sweepWalletOptions();
    if (isAdmin(ctx) && !coldForced && wallets.length > 1) {
      return safeEditMessage(ctx, t(lang, 'payments.lnPickWallet'), {
        parse_mode: 'HTML',
        ...sweepWalletPickKeyboard(wallets, dynamicCallback.invoiceLnWalletPrefix, Markup.button.callback(t(lang, 'menu.back'), CALLBACKS.BACK_TO_MENU)),
      });
    }
    await askLightningAmount(ctx);
  });

  // A receiving BTC wallet was chosen for the Lightning invoice → set it, then ask amount.
  bot.action(CALLBACK_REGEX.INVOICE_LN_WALLET, async (ctx) => {
    if (!adminGuard(ctx)) return;
    const lang = langOf(ctx);
    await safeAnswerCbQuery(ctx);
    try {
      await payments.setSweepWallet(ctx.match[1]);
    } catch (e) {
      return safeEditMessage(ctx, `❌ ${payErr(lang, e)}`, { parse_mode: 'HTML', ...mainMenuKeyboard(lang) });
    }
    await askLightningAmount(ctx);
  });

  // Ask the EUR amount for a chosen (chain, asset).
  const askAmount = (ctx, chain, symbol) => {
    sessions.setData(ctx.chat.id, { invoiceChain: chain, invoiceSymbol: symbol });
    sessions.setState(ctx.chat.id, STATE);
    return safeEditMessage(
      ctx,
      t(langOf(ctx), 'payments.askAmount', symbol, CHAIN_REGISTRY[chain]?.name || chain),
      { parse_mode: 'HTML' }
    );
  };

  // Wallet chosen → pick the asset (native + tokens) when the chain has tokens,
  // else go straight to the amount.
  bot.action(CALLBACK_REGEX.INVOICE_WALLET, async (ctx) => {
    const lang = langOf(ctx);
    const walletId = ctx.match[1];
    await safeAnswerCbQuery(ctx);
    const wallet = (await storage.getWallets(ctx.chat.id)).find((w) => w.id === walletId);
    if (!wallet) return;
    const native = getNativeSymbol(wallet.chain);
    const tokens = Object.keys(getAllTokensForChain(wallet.chain) || {});
    sessions.setData(ctx.chat.id, { invoiceChain: wallet.chain });
    if (!tokens.length) return askAmount(ctx, wallet.chain, native);

    const btns = [native, ...tokens].map((s) => Markup.button.callback(s, dynamicCallback.invoiceAsset(s)));
    const rows = [];
    for (let i = 0; i < btns.length; i += 3) rows.push(btns.slice(i, i + 3));
    rows.push([Markup.button.callback(t(lang, 'menu.back'), CALLBACKS.INVOICE_START)]);
    await safeEditMessage(
      ctx,
      t(lang, 'payments.pickAsset', CHAIN_REGISTRY[wallet.chain]?.name || wallet.chain),
      { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) }
    );
  });

  // Asset chosen → ask the amount. The chain is already in session.
  bot.action(CALLBACK_REGEX.INVOICE_ASSET, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const chain = sessions.getData(ctx.chat.id)?.invoiceChain;
    if (!chain) return;
    await askAmount(ctx, chain, ctx.match[1]);
  });

  // Amount entered → create the invoice + show address/QR. Falls through for other states.
  bot.on('text', async (ctx, next) => {
    if (sessions.getState(ctx.chat.id) !== STATE) return next();
    const lang = langOf(ctx);
    const data = sessions.getData(ctx.chat.id);
    sessions.clearState(ctx.chat.id);
    const amount = Number.parseFloat(ctx.message.text.trim().replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) return ctx.reply(t(lang, 'payments.invalidAmount'));

    try {
      const lightning = data.invoiceMethod === 'lightning';
      const inv = lightning
        ? await payments.createLightningInvoice(ctx.chat.id, { amountFiat: amount })
        : await payments.createInvoice(ctx.chat.id, data.invoiceChain, data.invoiceSymbol, { amountFiat: amount });
      await sendInvoiceCard(ctx, inv);
    } catch (e) {
      // "Already open" → show the existing one with Voir / Annuler instead of a dead end.
      if (e.code === 'ALREADY_OPEN' || e.code === 'LN_ALREADY_OPEN') {
        const open = (await payments.getOpenInvoices(ctx.chat.id)).filter((i) =>
          data.invoiceMethod === 'lightning'
            ? i.chain === 'lightning'
            : i.chain === data.invoiceChain && i.symbol === data.invoiceSymbol
        );
        const existing = open[0];
        if (existing) {
          return ctx.reply(t(lang, 'payments.alreadyOpenCard'), {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
              [
                Markup.button.callback(t(lang, 'payments.viewBtn'), dynamicCallback.invoiceView(existing.id)),
                Markup.button.callback(t(lang, 'payments.cancelBtn'), dynamicCallback.invoiceCancel(existing.id)),
              ],
              [Markup.button.callback(t(lang, 'payments.menuBtn'), CALLBACKS.BACK_TO_MENU)],
            ]),
          });
        }
      }
      logger.warn('[Payments] createInvoice failed', { error: e.message });
      await ctx.reply(`❌ ${payErr(lang, e)}`);
    }
  });

  // Re-display an existing invoice (its BOLT11/address + QR).
  bot.action(CALLBACK_REGEX.INVOICE_VIEW, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    const inv = (await storage.getInvoices(ctx.chat.id)).find((i) => i.id === ctx.match[1]);
    if (!inv) return ctx.reply(t(langOf(ctx), 'payments.notFound'));
    await sendInvoiceCard(ctx, inv);
  });

  // Cancel an open invoice → frees the slot; offer to create a fresh one.
  bot.action(CALLBACK_REGEX.INVOICE_CANCEL, async (ctx) => {
    const lang = langOf(ctx);
    await safeAnswerCbQuery(ctx);
    let canceled;
    try {
      canceled = await payments.cancelInvoice(ctx.chat.id, ctx.match[1]);
    } catch (e) {
      return sendOrEdit(ctx, `❌ ${payErr(lang, e)}`, { parse_mode: 'HTML' });
    }
    const recreate =
      canceled.chain === 'lightning'
        ? Markup.button.callback(t(lang, 'payments.newLnBtn'), CALLBACKS.INVOICE_LN)
        : Markup.button.callback(t(lang, 'payments.newBtn'), CALLBACKS.INVOICE_START);
    // Replaces the source message (the /invoices list or the invoice card) in place.
    await sendOrEdit(ctx, t(lang, 'payments.canceled'), {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[recreate], [Markup.button.callback(t(lang, 'payments.menuBtn'), CALLBACKS.BACK_TO_MENU)]]),
    });
  });

  // /invoices — my recent invoices + their status (+ Lightning balance if any).
  bot.command(['invoices', 'factures'], async (ctx) => {
    const lang = langOf(ctx);
    const list = (await storage.getInvoices(ctx.chat.id)).slice(-10).reverse();
    const lnBal = await storage.getLnBalance(ctx.chat.id).catch(() => 0);
    const head = lnBal > 0 ? t(lang, 'payments.lnBalanceHead', lnBal) : '';
    if (!list.length) {
      return ctx.reply(head + t(lang, 'payments.listEmpty'), { parse_mode: 'HTML' });
    }
    const lines = list.map(
      (i) => `${STATUS_EMOJI[i.status] || '•'} ${fmt(i.amountCrypto)} ${i.symbol} · ${i.status} · <code>${escapeHtml(i.id.slice(4, 20))}</code>`
    );
    const openInvoices = list.filter((i) => OPEN_STATUS.includes(i.status));
    const rows = openInvoices.map((i) => [
      Markup.button.callback(`👁 ${i.chain === 'lightning' ? '⚡' : i.symbol} ${fmt(i.amountCrypto)}`, dynamicCallback.invoiceView(i.id)),
      Markup.button.callback(t(lang, 'payments.cancelBtn'), dynamicCallback.invoiceCancel(i.id)),
    ]);
    rows.push([Markup.button.callback(t(lang, 'payments.menuBtn'), CALLBACKS.BACK_TO_MENU)]);
    await ctx.reply(
      head + t(lang, 'payments.listTitle') + '\n\n' + lines.join('\n') + (openInvoices.length ? '\n\n' + t(lang, 'payments.openBelow') : ''),
      { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) }
    );
  });

  // /treasury (admin) — node balance, recent payouts, manual sweep.
  const renderTreasury = async (ctx) => {
    const lang = langOf(ctx);
    let st;
    try {
      st = await payments.treasuryStatus();
    } catch (e) {
      return sendOrEdit(ctx, t(lang, 'payments.treasuryUnreachable', escapeHtml(e.message)), { parse_mode: 'HTML' });
    }
    if (!st.enabled) return sendOrEdit(ctx, t(lang, 'payments.treasuryOff'), {});
    const pe = { withdrawn: '✅', failed: '❌', pending: '⏳' };
    const lines = st.payouts.map((p) => `${pe[p.status] || '•'} ${p.amountSat} sats · ${p.status}${p.txid ? ` · <code>${escapeHtml(p.txid.slice(0, 14))}</code>` : ''}`);
    const destBlock = st.addressLabel
      ? `💰 <b>${escapeHtml(st.coldForced ? t(lang, 'payments.coldLabel') : st.addressLabel)}</b>\n<code>${escapeHtml(st.address)}</code>`
      : `<code>${escapeHtml(st.address || t(lang, 'payments.noDest'))}</code>`;
    const payoutsBlock = lines.length
      ? t(lang, 'payments.payoutsTitle') + '\n' + lines.join('\n')
      : t(lang, 'payments.noPayouts');
    await sendOrEdit(ctx, t(lang, 'payments.treasury', { balanceSat: st.balanceSat, thresholdSat: st.thresholdSat, destBlock, payoutsBlock }), {
      parse_mode: 'HTML',
      ...treasuryKeyboard(lang, st.coldForced),
    });
  };

  bot.command(['treasury', 'tresorerie'], async (ctx) => {
    if (!adminGuard(ctx)) return;
    await renderTreasury(ctx);
  });

  bot.action(CALLBACKS.TREASURY_OPEN, async (ctx) => {
    if (!adminGuard(ctx)) return safeAnswerCbQuery(ctx);
    await safeAnswerCbQuery(ctx);
    await renderTreasury(ctx);
  });

  const treasuryBackKb = (lang) =>
    Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'payments.treasuryBackBtn'), CALLBACKS.TREASURY_OPEN)]]);

  // Picker: choose WHICH BTC wallet receives swept Lightning funds.
  bot.action(CALLBACKS.TREASURY_PICK, async (ctx) => {
    if (!adminGuard(ctx)) return safeAnswerCbQuery(ctx);
    const lang = langOf(ctx);
    await safeAnswerCbQuery(ctx);
    const { coldForced, wallets } = await payments.sweepWalletOptions();
    if (coldForced) return sendOrEdit(ctx, t(lang, 'payments.forcedDest'), { parse_mode: 'HTML', ...treasuryBackKb(lang) });
    if (!wallets.length) return sendOrEdit(ctx, t(lang, 'payments.noBtcWallet'), { ...treasuryBackKb(lang) });
    await sendOrEdit(ctx, t(lang, 'payments.pickSweepWallet'), {
      parse_mode: 'HTML',
      ...sweepWalletPickKeyboard(wallets, dynamicCallback.treasuryWalletPrefix, Markup.button.callback(t(lang, 'payments.treasuryBackBtn'), CALLBACKS.TREASURY_OPEN)),
    });
  });

  bot.action(CALLBACK_REGEX.TREASURY_WALLET, async (ctx) => {
    if (!adminGuard(ctx)) return safeAnswerCbQuery(ctx);
    const lang = langOf(ctx);
    await safeAnswerCbQuery(ctx);
    try {
      const w = await payments.setSweepWallet(ctx.match[1]);
      await safeEditMessage(ctx, t(lang, 'payments.destSet', escapeHtml(w.label), escapeHtml(w.address)), {
        parse_mode: 'HTML',
        ...treasuryBackKb(lang),
      });
    } catch (e) {
      await ctx.reply(`❌ ${payErr(lang, e)}`, treasuryBackKb(lang));
    }
  });

  bot.action(CALLBACKS.TREASURY_SWEEP, async (ctx) => {
    if (!adminGuard(ctx)) return safeAnswerCbQuery(ctx);
    const lang = langOf(ctx);
    await safeAnswerCbQuery(ctx);
    const r = await payments.sweepLightningBalance();
    await sendOrEdit(
      ctx,
      r.swept
        ? t(lang, 'payments.sweptOk', r.payout.amountSat, escapeHtml(r.payout.txid))
        : t(lang, 'payments.nothingToSweep', r.reason, r.balanceSat),
      { parse_mode: 'HTML', ...treasuryBackKb(lang) }
    );
  });
}
