/**
 * Navigation & Shared Handlers
 */
import {
  mainMenuKeyboard,
  moreMenuKeyboard,
  settingsMenuKeyboard,
  languageMenuKeyboard,
  mainReplyKeyboard,
  walletListKeyboard,
  cancelKeyboard,
  chainSelectionKeyboard,
} from '../keyboards/index.js';
import { CALLBACKS, CALLBACK_REGEX } from '../constants/callbacks.js';
import { t, resolveLang } from '../messages/index.js';
import { safeEditMessage } from '../utils.js';
import { logger } from '../../shared/logger.js';
import { getFullHelpText, chainSelectionPrompt } from '../ui/index.js';
import { buildWalletKeysText } from './wallet/key-file.js';
import { auditLogger, AUDIT_ACTIONS } from '../../shared/security/audit-logger.js';
import { Markup } from 'telegraf';

export function setupNavigationHandlers(bot, storage, walletService, sessions) {
  const langOf = (ctx) => ctx.state?.lang || 'fr';

  // Action: back_to_menu
  bot.action(CALLBACKS.BACK_TO_MENU, async (ctx) => {
    const lang = langOf(ctx);
    await ctx.answerCbQuery().catch((err) => logger.debug('back_to_menu answerCbQuery failed', { error: err.message }));
    const opts = { parse_mode: 'HTML', ...mainMenuKeyboard(lang) };
    try {
      await ctx.editMessageText(t(lang, 'menu.principal'), opts);
    } catch (e) {
      // The current message may be a photo (e.g. a QR) — its text can't be
      // edited, so replace it with a fresh menu message.
      try {
        await ctx.deleteMessage();
      } catch (_) {
        // already gone
      }
      await ctx.reply(t(lang, 'menu.principal'), opts);
    }
  });

  // Action: more_menu — secondary actions behind "☰ Plus"
  bot.action(CALLBACKS.MORE_MENU, async (ctx) => {
    const lang = langOf(ctx);
    await ctx.answerCbQuery().catch((err) => logger.debug('more_menu answerCbQuery failed', { error: err.message }));
    await safeEditMessage(ctx, t(lang, 'menu.more'), {
      parse_mode: 'HTML',
      ...moreMenuKeyboard(lang),
    });
  });

  // Action: settings_menu — ⚙️ Paramètres (Langue, Mes Clés, Aide)
  bot.action(CALLBACKS.SETTINGS_MENU, async (ctx) => {
    const lang = langOf(ctx);
    await ctx.answerCbQuery().catch((err) => logger.debug('settings_menu answerCbQuery failed', { error: err.message }));
    await safeEditMessage(ctx, t(lang, 'settings.title'), {
      parse_mode: 'HTML',
      ...settingsMenuKeyboard(lang),
    });
  });

  // Action: language_menu — language picker
  bot.action(CALLBACKS.LANGUAGE_MENU, async (ctx) => {
    const lang = langOf(ctx);
    await ctx.answerCbQuery().catch((err) => logger.debug('language_menu answerCbQuery failed', { error: err.message }));
    await safeEditMessage(ctx, t(lang, 'settings.chooseLanguage'), {
      parse_mode: 'HTML',
      ...languageMenuKeyboard(lang),
    });
  });

  // Action: set_lang_<fr|en> — persist the choice and re-render in the new language
  bot.action(CALLBACK_REGEX.SET_LANG, async (ctx) => {
    const newLang = resolveLang(ctx.match[1]);
    const chatId = ctx.chat.id;
    try {
      await storage.updateSettings(chatId, { language: newLang });
      ctx.state.lang = newLang;
    } catch (e) {
      logger.warn('[i18n] Failed to persist language', { chatId, error: e.message });
    }
    await ctx.answerCbQuery(t(newLang, 'settings.changed')).catch(() => {});
    // Re-render the language menu (✓ moves) in the new language…
    await safeEditMessage(ctx, t(newLang, 'settings.chooseLanguage'), {
      parse_mode: 'HTML',
      ...languageMenuKeyboard(newLang),
    });
    // …and refresh the persistent reply keyboard so its labels match.
    await ctx
      .reply(t(newLang, 'settings.changed'), mainReplyKeyboard(newLang))
      .catch((err) => logger.debug('set_lang reply keyboard refresh failed', { error: err.message }));
  });

  // Action: cancel
  bot.action(CALLBACKS.CANCEL, async (ctx) => {
    const lang = langOf(ctx);
    const chatId = ctx.chat.id;
    sessions.clearState(chatId);
    await ctx.answerCbQuery().catch((err) => logger.debug('cancel answerCbQuery failed', { error: err.message }));
    await safeEditMessage(ctx, t(lang, 'menu.cancelled'), {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(lang),
    });
  });

  // Action: close_menu
  bot.action(CALLBACKS.CLOSE_MENU, async (ctx) => {
    await ctx.answerCbQuery().catch((err) => logger.debug('close_menu answerCbQuery failed', { error: err.message }));
    try {
      await ctx.deleteMessage();
    } catch (e) {
      logger.debug('close_menu deleteMessage failed', { error: e.message });
    }
  });

  // Action: help_menu
  bot.action(CALLBACKS.HELP_MENU, async (ctx) => {
    const lang = langOf(ctx);
    await ctx.answerCbQuery().catch((err) => logger.debug('help_menu answerCbQuery failed', { error: err.message }));
    await safeEditMessage(ctx, getFullHelpText(lang), {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(lang),
    });
  });

  // Action: export_all_keys — show confirmation screen
  bot.action(CALLBACKS.EXPORT_ALL_KEYS, async (ctx) => {
    const lang = langOf(ctx);
    const chatId = ctx.chat.id;
    await ctx.answerCbQuery().catch(() => {});

    if (ctx.chat.type !== 'private') {
      return ctx.reply(t(lang, 'errors.privateOnly')).catch(() => {});
    }

    const wallets = await storage.getWallets(chatId);
    if (wallets.length === 0) {
      return safeEditMessage(ctx, t(lang, 'exportKeys.noWallets'), mainMenuKeyboard(lang));
    }

    await safeEditMessage(ctx, t(lang, 'exportKeys.title') + '\n\n' + t(lang, 'exportKeys.confirm'), {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t(lang, 'exportKeys.confirmBtn'), CALLBACKS.CONFIRM_EXPORT_KEYS)],
        [Markup.button.callback(t(lang, 'exportKeys.cancelBtn'), CALLBACKS.SETTINGS_MENU)],
      ]),
    });
  });

  // Action: confirm_export_keys — build file and send
  bot.action(CALLBACKS.CONFIRM_EXPORT_KEYS, async (ctx) => {
    const lang = langOf(ctx);
    const chatId = ctx.chat.id;
    await ctx.answerCbQuery().catch(() => {});

    if (ctx.chat.type !== 'private') {
      return ctx.reply(t(lang, 'errors.privateOnly')).catch(() => {});
    }

    try {
      const wallets = await storage.getWallets(chatId);
      if (wallets.length === 0) {
        return safeEditMessage(ctx, t(lang, 'exportKeys.noWallets'), mainMenuKeyboard(lang));
      }

      const walletsWithKeys = [];
      for (const w of wallets) {
        const full = await storage.getWalletWithKey(chatId, w.id);
        if (full && !full.isCorrupted) {
          walletsWithKeys.push(full);
        }
      }

      if (walletsWithKeys.length === 0) {
        return safeEditMessage(
          ctx,
          '⚠️ Aucune clé récupérable (wallets corrompus ou vides).',
          mainMenuKeyboard(lang)
        );
      }

      const content = buildWalletKeysText(walletsWithKeys);
      const filename = 'all-keys-seeds.txt';

      await ctx.replyWithDocument(
        { source: Buffer.from(content, 'utf8'), filename },
        { protect_content: true }
      );

      auditLogger.log(AUDIT_ACTIONS.EXPORT_CREDENTIALS, chatId, {
        walletCount: walletsWithKeys.length,
        chains: walletsWithKeys.map((w) => w.chain),
      });

      await safeEditMessage(ctx, t(lang, 'exportKeys.success'), mainMenuKeyboard(lang));
    } catch (error) {
      logger.logError(error, { context: 'export_all_keys', chatId });
      await safeEditMessage(ctx, `❌ Erreur lors de l'export : ${error.message}`, mainMenuKeyboard(lang));
    }
  });

  // Hears: Envoyer / Send
  bot.hears(['💸 Envoyer', '📡 Envoyer', '📤 Envoyer', '📤 Send'], async (ctx) => {
    const lang = langOf(ctx);
    const wallets = await storage.getWallets(ctx.chat.id);
    if (wallets.length === 0) return ctx.reply(t(lang, 'errors.noWallets'));
    ctx.reply(`📡 <b>${t(lang, 'menu.send')}</b>`, {
      parse_mode: 'HTML',
      ...walletListKeyboard(wallets, 'send_from_'),
    });
  });

  // Hears: Analyser / Analyze
  bot.hears(['🔍 Analyser', '🔎 Analyser', '🔎 Analyze'], async (ctx) => {
    const lang = langOf(ctx);
    sessions.setState(ctx.chat.id, 'ENTER_ADDRESS_ANALYZE');
    ctx.reply(
      lang === 'en'
        ? '🔎 <b>Address analysis</b>\n\nEnter a public address (ETH, BTC, LTC, BCH, SOL, ARB, MATIC, OP, BASE, AVAX, XMR, ZEC, TON, TRX) to see its balance and all its tokens.'
        : "🔎 <b>Analyse d'adresse</b>\n\nEntre une adresse publique (ETH, BTC, LTC, BCH, SOL, ARB, MATIC, OP, BASE, AVAX, XMR, ZEC, TON, TRX) pour voir son solde et tous ses tokens.",
      {
        parse_mode: 'HTML',
        ...cancelKeyboard(lang),
      }
    );
  });

  // Hears: ➕ Nouveau / New (anciens libellés conservés pour compat)
  bot.hears(['➕ Nouveau', '➕ Nouveau Wallet', '🆕 Nouveau Wallet', '➕ New'], async (ctx) => {
    ctx.reply(chainSelectionPrompt(), {
      parse_mode: 'HTML',
      ...chainSelectionKeyboard('chain_'),
    });
  });

  // Hears: help buttons
  bot.hears(['❓ Aide', '🆘 Help', '🆘 Aide', '❓ Help'], async (ctx) => {
    const lang = langOf(ctx);
    await ctx.reply(getFullHelpText(lang), {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(lang),
    });
  });

  // Hears: ❌ Fermer / Close
  bot.hears(['❌ Fermer', '❌ Close'], async (ctx) => {
    const lang = langOf(ctx);
    sessions.clearState(ctx.chat.id);
    await ctx.reply(t(lang, 'menu.closed'), { reply_markup: { remove_keyboard: true } });
  });
}
