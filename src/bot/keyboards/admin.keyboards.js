import { Markup } from 'telegraf';
import { CALLBACKS, dynamicCallback } from '../constants/callbacks.js';

export function adminKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Statistiques', CALLBACKS.ADMIN_STATS)],
    [Markup.button.callback('🔒 Securite', CALLBACKS.ADMIN_SECURITY)],
    [Markup.button.callback('⚙️ Panel Admin', CALLBACKS.ADMIN_PANEL)],
    [Markup.button.callback('❌ Fermer', CALLBACKS.CLOSE_MENU)],
  ]);
}

export function adminExtendedKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📊 Statistiques', CALLBACKS.ADMIN_STATS),
      Markup.button.callback('🔒 Securite', CALLBACKS.ADMIN_SECURITY),
    ],
    [
      Markup.button.callback('👥 Liste Users', CALLBACKS.ADMIN_LIST_USERS),
      Markup.button.callback('🔍 Voir User', CALLBACKS.ADMIN_VIEW_USER),
    ],
    [
      Markup.button.callback('🧹 Dust Global', CALLBACKS.ADMIN_DUST),
      Markup.button.callback('📜 Logs Audit', CALLBACKS.ADMIN_LOGS),
    ],
    [
      Markup.button.callback('🔐 Secrets', CALLBACKS.ADMIN_SECRETS),
      Markup.button.callback('📢 Broadcast', CALLBACKS.ADMIN_BROADCAST),
    ],
    [
      Markup.button.callback('🚫 Ban User', CALLBACKS.ADMIN_BAN),
      Markup.button.callback('✅ Unban User', CALLBACKS.ADMIN_UNBAN),
    ],
  ]);
}

export function adminUserKeyboard(targetUserId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔑 Voir Cles', dynamicCallback.adminUserKeys(targetUserId))],
    [Markup.button.callback('↩️ Retour Panel Admin', CALLBACKS.ADMIN_PANEL)],
  ]);
}

export function adminCancelKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('❌ Annuler', CALLBACKS.ADMIN_PANEL)]]);
}
