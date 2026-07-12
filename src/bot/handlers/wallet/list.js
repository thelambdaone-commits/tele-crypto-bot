import { mainMenuKeyboard, walletActionsKeyboard } from '../../keyboards/index.js';
import { CALLBACKS } from '../../constants/callbacks.js';
import { safeAnswerCbQuery, escapeHtml } from '../../utils.js';
import { MESSAGES, EMOJIS, t } from '../../messages/index.js';
import { convertToEUR, formatEUR } from '../../../shared/price.js';
import { CHAIN_EMOJIS } from '../../ui/formatters.js';
import { getAddressExplorerUrl } from '../../../shared/explorer.js';
import { Markup } from 'telegraf';

const WALLET_LIST_PAGE_SIZE = 10;

export function setupWalletList(bot, storage, walletService) {
  // List wallets
  bot.action(CALLBACKS.LIST_WALLETS, async (ctx) => {
    const chatId = ctx.chat.id;
    await safeAnswerCbQuery(ctx);

    const wallets = await storage.getWallets(chatId);

    if (wallets.length === 0) {
      return ctx.editMessageText(
        `🔍 <b>${escapeHtml(MESSAGES.noWallets)}</b>\n\nCrée ton premier wallet pour commencer !`,
        {
          parse_mode: 'HTML',
          ...mainMenuKeyboard(),
        }
      );
    }

    renderWalletListPage(ctx, chatId, wallets, 0);
  });

  // Paginate wallet list
  bot.action(/^wlp:([a-z]+):(\d+)$/, async (ctx) => {
    const chatId = ctx.chat.id;
    const page = Number(ctx.match[2]);
    await safeAnswerCbQuery(ctx);

    const wallets = await storage.getWallets(chatId);
    renderWalletListPage(ctx, chatId, wallets, page);
  });

  // Click on specific wallet -> show details with balance
  // Wallet ids are `<chain>-<timestamp>-<uuid8>` (storage), so match the chain
  // prefix + hyphen + digit (timestamp) to avoid matching wallet_history_… callbacks.
  bot.action(/^wallet_([a-z]+-\d.+)$/, async (ctx) => {
    const walletId = ctx.match[1];
    const chatId = ctx.chat.id;
    await safeAnswerCbQuery(ctx);

    const wallets = await storage.getWallets(chatId);
    const wallet = wallets.find((w) => w.id === walletId);

    if (!wallet) {
      return ctx.editMessageText(t(ctx.state?.lang || 'fr', 'wallet.notFound'), mainMenuKeyboard());
    }

    const chainEmoji = CHAIN_EMOJIS[wallet.chain] || '💎';

    // Show loading first
    await ctx.editMessageText(
      `${chainEmoji} <b>${escapeHtml(wallet.label)}</b>\n\n⏳ Chargement du solde...`,
      { parse_mode: 'HTML' }
    );

    // Fetch balance
    let balanceText = '<i>Erreur de récupération</i>';
    let balanceEUR = '';
    let pendingText = '';
    try {
      const balance = await walletService.getBalance(chatId, walletId);
      const confirmed = Number.parseFloat(balance.balance) || 0;
      const pending = Number.parseFloat(balance.pendingBalance) || 0;
      const symbol = escapeHtml(balance.symbol || wallet.chain.toUpperCase());

      balanceText = `<b>${escapeHtml(balance.balance)} ${symbol}</b>`;
      const conversion = await convertToEUR(wallet.chain, confirmed);
      balanceEUR = ` (${formatEUR(conversion.valueEUR)})`;

      if (pending > 0) {
        const pendingConversion = await convertToEUR(wallet.chain, pending);
        let eurText = '';
        if (pendingConversion.valueEUR > 0) {
          eurText = ` (${formatEUR(pendingConversion.valueEUR)})`;
        }
        pendingText = `\n⏳ Reçu: <b>+${escapeHtml(balance.pendingBalance)} ${symbol}</b>${eurText}`;
      } else if (pending < 0) {
        const pendingConversion = await convertToEUR(wallet.chain, Math.abs(pending));
        let eurText = '';
        if (pendingConversion.valueEUR > 0) {
          eurText = ` (${formatEUR(pendingConversion.valueEUR)})`;
        }
        pendingText = `\n⏳ Envoyé: <b>${escapeHtml(Number(pending).toFixed(8))} ${symbol}</b>${eurText}`;
      }

      if (pending !== 0) {
        const effective = confirmed + pending;
        const effConversion = await convertToEUR(wallet.chain, effective);
        pendingText += `\n💰 Après confirmation: <b>${escapeHtml(effective.toFixed(8))} ${symbol}</b>`;
        if (effConversion.valueEUR > 0) {
          pendingText += ` (${formatEUR(effConversion.valueEUR)})`;
        }
      }
    } catch (e) {}

    ctx.editMessageText(
      `${chainEmoji} <b>${escapeHtml(wallet.label)}</b>\n\n` +
        `⛓ Réseau: ${wallet.chain.toUpperCase()}\n` +
        `📬 Adresse:\n<code>${wallet.address}</code>\n` +
        `💰 Solde: ${balanceText}${balanceEUR}${pendingText}\n\n` +
        'Que veux-tu faire ?',
      {
        parse_mode: 'HTML',
        ...walletActionsKeyboard(walletId, getAddressExplorerUrl(wallet.chain, wallet.address)),
      }
    ).catch(() => {});
  });
}

function renderWalletListPage(ctx, chatId, wallets, page) {
  const needsPagination = wallets.length >= 100;
  const totalPages = needsPagination ? Math.ceil(wallets.length / WALLET_LIST_PAGE_SIZE) : 1;
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * WALLET_LIST_PAGE_SIZE;
  const pageWallets = needsPagination
    ? wallets.slice(start, start + WALLET_LIST_PAGE_SIZE)
    : wallets;

  let text = `${EMOJIS.wallet} <b>Tes Portefeuilles</b>`;

  const buttons = pageWallets.map((w) => {
    const emoji = CHAIN_EMOJIS[w.chain] || '●';
    return [Markup.button.callback(`${emoji} ${w.label}`, `wallet_${w.id}`)];
  });

  if (needsPagination && totalPages > 1) {
    const navRow = [];
    if (safePage > 0) navRow.push(Markup.button.callback('◀️', `wlp:fr:${safePage - 1}`));
    navRow.push(Markup.button.callback(`${safePage + 1}/${totalPages}`, 'noop'));
    if (safePage < totalPages - 1) navRow.push(Markup.button.callback('▶️', `wlp:fr:${safePage + 1}`));
    buttons.push(navRow);
  }
  buttons.push([Markup.button.callback('🎮 Menu', CALLBACKS.BACK_TO_MENU)]);

  ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(buttons),
  }).catch(() => {});
}
