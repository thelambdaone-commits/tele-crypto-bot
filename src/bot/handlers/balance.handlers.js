import { Markup } from 'telegraf';
import { mainMenuKeyboard, walletListKeyboard } from '../keyboards/index.js';
import { getPricesEUR, formatCryptoPricesEUR, clearPriceCache } from '../../shared/price.js';
import { buildBalancesText } from '../ui/wallet-display.js';
import { CALLBACKS } from '../constants/callbacks.js';
import { logger } from '../../shared/logger.js';
import {
  sendChunked,
  safeAnswerCbQuery,
  safeEditMessage,
  sendLoadingMessage,
} from '../utils.js';

// Keyboard under the EUR price list: refresh, open the 📈 graph picker, menu/close.
function pricesKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔄 Recharger', CALLBACKS.REFRESH_PRICES)],
    [Markup.button.callback('📈 Graphique', CALLBACKS.GRAPH_PICK)],
    [
      Markup.button.callback('🎮 Menu', CALLBACKS.BACK_TO_MENU),
      Markup.button.callback('❌ Fermer', CALLBACKS.CLOSE_MESSAGE),
    ],
  ]);
}

export function setupBalanceHandlers(bot, storage, walletService) {
  bot.action(CALLBACKS.VIEW_BALANCES, async (ctx) => {
    const chatId = ctx.chat.id;
    await ctx.answerCbQuery().catch(() => {});

    const wallets = await storage.getWallets(chatId);
    if (wallets.length === 0) {
      return ctx
        .editMessageText("❌ Tu n'as pas encore de wallet.", mainMenuKeyboard())
        .catch((e) => logger.warn('balance.editMessageText failed', { chatId, error: e.message }));
    }

    // Instant feedback: the multi-chain sweep takes a few seconds.
    await safeEditMessage(ctx, '⌛ Calcul des soldes...').catch(() => {});

    const text = '💰 <b>Soldes de tes Wallets</b>' + await buildBalancesText(walletService, storage, chatId);

    // Chunked: the balance report grows with wallets × tokens and can exceed
    // Telegram's 4096-char limit (the historical MESSAGE_TOO_LONG source).
    await sendChunked(ctx, text, { parse_mode: 'HTML', ...mainMenuKeyboard() }, { edit: true }).catch(
      (e) => logger.warn('balance.editMessageText failed', { chatId, error: e.message })
    );
  });

  bot.action(CALLBACKS.PRICES_EUR, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    try {
      clearPriceCache();
      const prices = await getPricesEUR(true);
      const text = formatCryptoPricesEUR(prices);

      ctx.editMessageText(text, {
        parse_mode: 'HTML',
        ...pricesKeyboard(),
      });
    } catch (error) {
      ctx.editMessageText('❌ Erreur lors de la récupération des prix.', mainMenuKeyboard());
    }
  });

  bot.hears(['💰 Wallets', '💰 Mes Wallets'], async (ctx) => {
    const wallets = await storage.getWallets(ctx.chat.id);
    ctx.reply('💰 <b>Tes Wallets</b>', {
      parse_mode: 'HTML',
      ...walletListKeyboard(wallets, 'wallet_'),
    });
  });

  bot.hears(['📊 Cours', '📊 Cours EUR', '📊 Prix', '📊 Prices'], async (ctx) => {
    try {
      clearPriceCache();
      const prices = await getPricesEUR(true);
      const text = formatCryptoPricesEUR(prices);

      await ctx.reply(text, { parse_mode: 'HTML', ...pricesKeyboard() });
    } catch (error) {
      ctx.reply('❌ Erreur lors de la recuperation des prix.').catch(() => {});
    }
  });

  bot.hears(['💵 Soldes', '💵 Balances'], async (ctx) => {
    const chatId = ctx.chat.id;
    const wallets = await storage.getWallets(chatId);
    if (wallets.length === 0) {
      return ctx.reply("❌ Tu n'as pas encore de wallet.");
    }

    // Instant feedback, then replace the placeholder with the report.
    const loading = await sendLoadingMessage(ctx, '⌛ Calcul des soldes...');

    const text = '💰 <b>Soldes de tes Wallets</b>' + await buildBalancesText(walletService, storage, chatId);
    await sendChunked(
      ctx,
      text,
      { parse_mode: 'HTML', ...mainMenuKeyboard() },
      { messageId: loading?.message_id ?? null }
    );
  });

  bot.action(CALLBACKS.REFRESH_PRICES, async (ctx) => {
    try {
      await safeAnswerCbQuery(ctx);
      clearPriceCache();
      const prices = await getPricesEUR(true);
      const text = formatCryptoPricesEUR(prices);

      await ctx.editMessageText(text, { parse_mode: 'HTML', ...pricesKeyboard() });
    } catch (error) {
      if (error.message && error.message.includes('message is not modified')) {
        return;
      }
      logger.logError(error, { context: 'balance.refreshPrices' });
      ctx.answerCbQuery('Erreur: ' + error.message, true);
    }
  });

  bot.action(CALLBACKS.CLOSE_MESSAGE, async (ctx) => {
    await safeAnswerCbQuery(ctx);
    try {
      await ctx.deleteMessage();
    } catch (e) {
      // Bots can't delete messages older than 48h — collapse the message instead.
      logger.debug('close_message delete failed, editing instead', { error: e.message });
      await ctx.editMessageText('✖️').catch(() => {});
    }
  });
}
