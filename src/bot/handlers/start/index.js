import { Markup } from 'telegraf';
import { mainMenuKeyboard, mainReplyKeyboard } from '../../keyboards/index.js';
import { auditLogger, AUDIT_ACTIONS } from '../../../shared/security/audit-logger.js';
import { config } from '../../../core/config.js';
import { logger } from '../../../shared/logger.js';
import { escapeMarkdown, scheduleSecureDelete } from '../../../shared/utils/telegram.js';
import { sendWalletKeysFile } from '../wallet/key-file.js';
import { separator, CHAIN_EMOJIS } from '../../ui/index.js';

/**
 * Notify admin group about new user
 */
async function notifyAdminNewUser(ctx, chatId, userName, username) {
  if (!config.adminChatId || config.adminChatId.length === 0) return;

  try {
    const safeUserName = escapeMarkdown(userName);
    const safeUsername = username ? escapeMarkdown(username) : null;
    const contactUrl = `tg://user?id=${chatId}`;

    const message =
      '✨ *Nouvel utilisateur*\n\n' +
      `👤 Nom: ${safeUserName}\n` +
      `🔹 Username: ${safeUsername ? `@${safeUsername}` : 'N/A'}\n` +
      `🆔 ID: \`${chatId}\``;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.url('💬 Contacter', contactUrl)],
      [Markup.button.callback('👤 Voir Profil', `admin_view_user_quick_${chatId}`)],
    ]);

    for (const adminId of config.adminChatId) {
      await ctx.telegram
        .sendMessage(adminId, message, {
          parse_mode: 'Markdown',
          ...keyboard,
        })
        .catch((e) => logger.error(`Failed to notify admin ${adminId}`, { chatId, error: e.message }));
    }
  } catch (error) {
    logger.logError(error, { context: 'notifyAdminNewUser', chatId });
  }
}

/**
 * Setup start handler - Auto-generates 3 wallets for new users
 */
export function setupStartHandler(bot, storage, walletService) {
  bot.start(async (ctx) => {
    const chatId = ctx.chat.id;
    const userName = ctx.from.first_name || 'ami';
    const username = ctx.from.username || null;

    try {
      // Update user profile info
      await storage.updateUserProfile(chatId, userName, username);

      // Check if user already has wallets
      const existingWallets = await storage.getWallets(chatId);

      if (existingWallets.length === 0) {
        // Log new user
        auditLogger.log(AUDIT_ACTIONS.USER_START, chatId, { isNewUser: true, username });

        // Notify admin group
        await notifyAdminNewUser(ctx, chatId, userName, username);

        // New user - auto-generate 3 wallets
        await ctx.reply(
          `👋 Bienvenue ${userName} !\n\n🔐 Je crée tes 3 wallets sécurisés (Ξ ETH · ₿ BTC · ◎ SOL)…`
        );

        try {
          const chains = ['eth', 'btc', 'sol'];
          const createdWallets = [];

          for (const chain of chains) {
            const wallet = await walletService.createWallet(chatId, chain);
            const fullWallet = await storage.getWalletWithKey(chatId, wallet.id);
            createdWallets.push(fullWallet);

            auditLogger.log(AUDIT_ACTIONS.CREATE_WALLET, chatId, {
              chain,
              walletId: wallet.id,
              address: wallet.address,
            });
          }

          await sendWalletKeysFile(ctx, createdWallets, storage);

          let message = `🎉 *Tes 3 wallets sont prêts !*\n${separator()}\n\n`;

          for (const wallet of createdWallets) {
            const chainName = { eth: 'Ethereum', btc: 'Bitcoin', sol: 'Solana', xmr: 'Monero', zec: 'Zcash' }[wallet.chain];
            const emoji = CHAIN_EMOJIS[wallet.chain] || '🔗';
            const escapedMnemonic = wallet.mnemonic ? escapeMarkdown(wallet.mnemonic) : null;

            message += `${emoji} *${chainName}*\n`;
            message += `📬 \`${wallet.address}\`\n`;
            if (escapedMnemonic) {
              message += `🔐 \`${escapedMnemonic}\`\n`;
            }
            message += '\n';
          }

          message += `${separator()}\n`;
          message +=
            '⚠️ *IMPORTANT :* Sauvegarde ces phrases de récupération. Elles ne seront plus affichées.\n';
          message += '🕐 _Ce message s\'efface dans 60 s pour ta sécurité._';

          const sentMsg = await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...mainReplyKeyboard(),
          });

          // Silent, keyed auto-delete after 60s (no lingering confirmation).
          scheduleSecureDelete(ctx, `start_${chatId}`, sentMsg.message_id, 60000);
        } catch (error) {
          logger.logError(error, { context: 'setupStartHandler.createWallets', chatId });
          return ctx.reply(
            `❌ Erreur lors de la création des wallets: ${error.message}`,
            mainMenuKeyboard()
          );
        }
      } else {
        // Existing user
        auditLogger.log(AUDIT_ACTIONS.USER_START, chatId, { isNewUser: false });
        await ctx.reply(
          [
            `👋 *Content de te revoir, ${escapeMarkdown(userName)} !*`,
            separator(),
            '🔐 Ton coffre multi-chain est prêt.',
            '',
            'Que veux-tu faire ? 👇',
          ].join('\n'),
          {
            parse_mode: 'Markdown',
            ...mainReplyKeyboard(),
          }
        );
      }
    } catch (error) {
      // Handle "bot was blocked by user" error gracefully
      if (error.message?.includes('blocked by the user') || error.response?.error_code === 403) {
        logger.warn('[START] User has blocked the bot', {
          chatId,
          username: username || userName,
        });
        return;
      }

      logger.logError(error, { context: 'setupStartHandler', chatId });
      try {
        return await ctx.reply(
          '👋 Bienvenue. Le profil a été réinitialisé, tu peux utiliser le menu ci-dessous.',
          mainReplyKeyboard()
        );
      } catch (replyError) {
        logger.logError(replyError, { context: 'setupStartHandler.fallbackReply', chatId });
      }
    }
  });
}
