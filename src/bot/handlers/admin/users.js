import {
  adminExtendedKeyboard,
  adminUserKeyboard,
  adminUsersListKeyboard,
} from '../../keyboards/index.js';
import { CALLBACKS, CALLBACK_REGEX } from '../../constants/callbacks.js';
import { safeAnswerCbQuery, escapeHtml } from '../../../shared/utils/telegram.js';
import { isAdmin } from '../../middlewares/auth.middleware.js';
import { auditLogger, AUDIT_ACTIONS } from '../../../shared/security/audit-logger.js';

// Entities per page in the admin users list. Kept small so the full message
// (header + summary + entries) stays well under Telegram's 4096-char limit.
const USERS_PAGE_SIZE = 10;

// Render one entity (user or group) as an HTML block. Negative chatId = group.
function renderEntity(entity) {
  const isGroup = entity.chatId < 0;
  const icon = isGroup ? '💬' : '👤';
  const displayName = entity.username
    ? `@${escapeHtml(entity.username)}`
    : escapeHtml(entity.firstName || (isGroup ? 'Groupe sans nom' : 'Sans nom'));
  const walletEmoji = entity.walletCount > 0 ? '💰' : '📭';
  const date = new Date(entity.createdAt).toLocaleDateString('fr-FR');
  return (
    `\n${icon} <b>${displayName}</b>\n` +
    `   🆔 <code>${entity.chatId}</code>\n` +
    `   ${walletEmoji} ${entity.walletCount} wallet${entity.walletCount > 1 ? 's' : ''} • 📅 ${date}\n`
  );
}

// Build the text + keyboard for a given page of the combined entity list
// (users first, then groups). `page` is 0-indexed and clamped to a valid range.
function buildUsersPage(allEntities, page) {
  const users = allEntities.filter((u) => u.chatId > 0);
  const groups = allEntities.filter((u) => u.chatId < 0);
  const ordered = [...users, ...groups];

  const totalPages = Math.max(1, Math.ceil(ordered.length / USERS_PAGE_SIZE));
  const current = Math.min(Math.max(page, 0), totalPages - 1);
  const start = current * USERS_PAGE_SIZE;
  const slice = ordered.slice(start, start + USERS_PAGE_SIZE);
  const totalWallets = allEntities.reduce((sum, e) => sum + e.walletCount, 0);

  const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
  let text = '📊 <b>Tableau de Bord</b>\n\n';
  text += `👥 ${plural(users.length, 'user')} • 🏢 ${plural(groups.length, 'groupe')} • 💰 ${plural(totalWallets, 'wallet')}\n`;
  text += `📄 Page ${current + 1}/${totalPages} — ${start + 1}-${start + slice.length} sur ${ordered.length}\n`;
  text += '───────────\n';
  for (const entity of slice) {
    text += renderEntity(entity);
  }

  return { text, keyboard: adminUsersListKeyboard(current, totalPages) };
}

export function setupAdminUsers(bot, storage) {
  // List all users (entry point → page 0) and pagination (⬅️/➡️) share one
  // renderer; both edit the current message in place.
  async function showUsersPage(ctx, page) {
    const chatId = ctx.chat.id;
    await safeAnswerCbQuery(ctx);

    if (!isAdmin(chatId)) return;

    const allEntities = await storage.getAllUsers();

    if (allEntities.length === 0) {
      return ctx.editMessageText('<b>Aucun utilisateur</b>', {
        parse_mode: 'HTML',
        ...adminExtendedKeyboard(),
      });
    }

    const { text, keyboard } = buildUsersPage(allEntities, page);

    try {
      await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    } catch (e) {
      // Ignore "message is not modified" error
      if (!e.message?.includes('message is not modified')) {
        throw e;
      }
    }
  }

  bot.action(CALLBACKS.ADMIN_LIST_USERS, (ctx) => showUsersPage(ctx, 0));

  bot.action(CALLBACK_REGEX.ADMIN_USERS_PAGE, (ctx) =>
    showUsersPage(ctx, Number(ctx.match[1]))
  );

  // View user details
  bot.action(/^admin_view_user_quick_(\d+)$/, async (ctx) => {
    const targetUserId = Number(ctx.match[1]);
    const chatId = ctx.chat.id;
    await safeAnswerCbQuery(ctx);

    if (!isAdmin(chatId)) return;

    try {
      const userData = await storage.loadUserData(targetUserId);
      const wallets = userData.wallets || [];

      auditLogger.log(
        AUDIT_ACTIONS.ADMIN_VIEW_USER,
        chatId,
        { targetUserId, source: 'quick_view' },
        true
      );

      const displayName = escapeHtml(userData.firstName);
      const usernameText = userData.username ? `@${escapeHtml(userData.username)}` : 'N/A';

      let message = `👤 <b>Utilisateur ${targetUserId}</b>\n\n`;
      message += `🔹 Nom : ${displayName}\n`;
      message += `🔹 Username : ${usernameText}\n`;
      message += `🔹 Wallets : ${wallets.length}\n\n`;

      for (const wallet of wallets) {
        message += `🔸 <b>${escapeHtml(wallet.label)}</b>\n`;
        message += `<code>${escapeHtml(wallet.address)}</code>\n\n`;
      }

      await ctx.reply(message, {
        parse_mode: 'HTML',
        ...adminUserKeyboard(targetUserId),
      });
    } catch (error) {
      await ctx.reply(`❌ Erreur : ${escapeHtml(error.message)}`, adminExtendedKeyboard());
    }
  });
}
