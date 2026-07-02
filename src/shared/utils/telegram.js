/**
 * Telegram Utility Functions
 */
import { logger } from '../logger.js';

/**
 * Escapes characters for Telegram legacy Markdown mode
 * Only escapes: _ * ` [
 * @param {string|number} value
 * @returns {string}
 */
export function escapeMarkdown(value) {
  return String(value ?? '').replace(/([_*`[\]])/g, '\\$1');
}

/**
 * Escapes HTML entities for Telegram HTML parse_mode
 * Handles & < > " '
 * @param {string|number} value
 * @returns {string}
 */
export function escapeHtml(value) {
  const str = String(value ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes characters for Markdown code blocks
 * @param {string|number} value
 * @returns {string}
 */
export function escapeMarkdownCode(value) {
  return String(value ?? '').replace(/[`\\]/g, '\\$&');
}

/**
 * Safely answer callback query - ignores timeout errors
 */
export async function safeAnswerCbQuery(ctx, text) {
  try {
    await ctx.answerCbQuery(text);
  } catch (e) {
    // Ignore "query is too old" errors - they're harmless
    if (!e.message?.includes('query is too old')) {
      // Use console for now, will be replaced by logger in Phase 4
      logger.warn('Error answering callback query', { error: e.message });
    }
  }
}

/**
 * Safely edit message - ignores "message not modified" errors
 */
export async function safeEditMessage(ctx, text, options = {}) {
  try {
    return await ctx.editMessageText(text, options);
  } catch (e) {
    // Ignore "message is not modified" errors - they're harmless
    if (!e.message?.includes('message is not modified')) {
      throw e;
    }
  }
}

// Telegram rejects sendMessage/editMessageText payloads over this many chars
// with "400: Bad Request: MESSAGE_TOO_LONG".
export const TELEGRAM_MESSAGE_LIMIT = 4096;

/**
 * Split a message into parts that each fit Telegram's 4096-char limit.
 * Splits on line boundaries — the HTML used by this bot (<b>, <i>, <code>)
 * never spans a newline, so every part stays valid HTML. A single line longer
 * than the limit (pathological) is hard-cut.
 * @param {string} text
 * @returns {string[]} at least one part
 */
export function splitTelegramMessage(text, limit = TELEGRAM_MESSAGE_LIMIT) {
  const str = String(text ?? '');
  if (str.length <= limit) return [str];
  const parts = [];
  let current = '';
  for (const line of str.split('\n')) {
    let rest = line;
    while (rest.length > limit) {
      if (current) {
        parts.push(current);
        current = '';
      }
      // Hard-cutting an over-long single line: prefer the last space within the
      // window so an HTML tag/entity is not severed mid-token (e.g. the /audit
      // blacklist renders many <code>id</code> spans on one line).
      let cut = rest.lastIndexOf(' ', limit - 1);
      if (cut < limit * 0.8) cut = limit - 1;
      parts.push(rest.slice(0, cut + 1));
      rest = rest.slice(cut + 1);
    }
    const candidate = current ? `${current}\n${rest}` : rest;
    if (candidate.length > limit) {
      parts.push(current);
      current = rest;
    } else {
      current = candidate;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/**
 * Send a possibly-over-limit message safely. The text is split at 4096 chars;
 * the inline keyboard (reply_markup) is attached to the LAST part only, so the
 * buttons stay at the bottom. With `edit: true` the first part replaces the
 * tapped message (editMessageText); with `messageId` it replaces that specific
 * message (e.g. a "loading…" placeholder). Overflow parts are sent as new
 * messages.
 * @returns {Promise<object>} the last sent/edited message
 */
export async function sendChunked(ctx, text, options = {}, { edit = false, messageId = null } = {}) {
  const { reply_markup: replyMarkup, ...base } = options;
  const parts = splitTelegramMessage(text);
  let last;
  for (let i = 0; i < parts.length; i++) {
    const opts = i === parts.length - 1 ? { ...base, reply_markup: replyMarkup } : base;
    if (i > 0) {
      last = await ctx.reply(parts[i], opts);
    } else if (messageId) {
      last = await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, parts[i], opts);
    } else if (edit) {
      last = await safeEditMessage(ctx, parts[i], opts);
    } else {
      last = await ctx.reply(parts[i], opts);
    }
  }
  return last;
}

/**
 * Send a temporary loading message
 */
export async function sendLoadingMessage(ctx, text = '⌛ Chargement...') {
  try {
    return await ctx.reply(text);
  } catch (e) {
    logger.warn('Error sending loading message', { error: e.message });
    return null;
  }
}

/**
 * Safely delete a loading message
 */
export async function deleteLoadingMessage(ctx, message) {
  if (!message) return;
  try {
    await ctx.telegram.deleteMessage(ctx.chat.id, message.message_id);
  } catch (e) {
    // Ignore deletion errors (message already deleted, etc)
  }
}

const pendingSecureDeletes = new Map();

/**
 * Schedule a keyed, silent auto-deletion of a sensitive message.
 *
 * Re-scheduling with the same key cancels the previous timer, so a flow that
 * fires twice (double tap, Telegram callback retry) can never queue two
 * deletions. The deletion is silent on purpose — we do NOT post a follow-up
 * "message supprimé" notice, because that confirmation would itself linger in
 * the chat (and previously appeared duplicated).
 *
 * @param {import('telegraf').Context} ctx
 * @param {string} key   unique per (flow, chatId), e.g. `gen_${chatId}`
 * @param {number} messageId  message to delete
 * @param {number} delayMs
 */
export function scheduleSecureDelete(ctx, key, messageId, delayMs) {
  const existing = pendingSecureDeletes.get(key);
  if (existing) clearTimeout(existing);

  const chatId = ctx.chat.id;
  const timer = setTimeout(async () => {
    pendingSecureDeletes.delete(key);
    try {
      await ctx.telegram.deleteMessage(chatId, messageId);
    } catch (e) {
      // Ignore: message already gone, too old to delete, etc.
    }
  }, delayMs);
  timer.unref?.();

  pendingSecureDeletes.set(key, timer);
}
