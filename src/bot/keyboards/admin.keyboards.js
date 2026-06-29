import { Markup } from 'telegraf';
import { CALLBACKS, dynamicCallback } from '../constants/callbacks.js';

export function adminExtendedKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📊 Statistiques', CALLBACKS.ADMIN_STATS),
      Markup.button.callback('🔒 Sécurité', CALLBACKS.ADMIN_SECURITY),
    ],
    [
      Markup.button.callback('👥 Liste Users', CALLBACKS.ADMIN_LIST_USERS),
      Markup.button.callback('🔍 Voir User', CALLBACKS.ADMIN_VIEW_USER),
    ],
    [Markup.button.callback('📜 Logs Audit', CALLBACKS.ADMIN_LOGS)],
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

// Users-list navigation: ⬅️/➡️ shown only when there's an adjacent page, plus
// a back-to-panel row. `page`/`totalPages` are 0-indexed / count.
export function adminUsersListKeyboard(page, totalPages) {
  const nav = [];
  if (page > 0) {
    nav.push(Markup.button.callback('⬅️ Précédent', dynamicCallback.adminUsersPage(page - 1)));
  }
  if (page < totalPages - 1) {
    nav.push(Markup.button.callback('Suivant ➡️', dynamicCallback.adminUsersPage(page + 1)));
  }
  const rows = [];
  if (nav.length) rows.push(nav);
  rows.push([Markup.button.callback('↩️ Retour Panel Admin', CALLBACKS.ADMIN_PANEL)]);
  return Markup.inlineKeyboard(rows);
}

export function adminSecurityKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🧪 Audit complet', CALLBACKS.ADMIN_AUDIT)],
    [Markup.button.callback('↩️ Retour Panel Admin', CALLBACKS.ADMIN_PANEL)],
  ]);
}

export function adminUserKeyboard(targetUserId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔑 Voir Clés', dynamicCallback.adminUserKeys(targetUserId))],
    [Markup.button.callback('↩️ Retour Panel Admin', CALLBACKS.ADMIN_PANEL)],
  ]);
}

export function adminCancelKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('❌ Annuler', CALLBACKS.ADMIN_PANEL)]]);
}
