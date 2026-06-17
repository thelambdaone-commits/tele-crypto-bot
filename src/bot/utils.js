/**
 * Utility functions for bot handlers
 * Re-exporting from centralized telegram utils
 */

export {
  safeAnswerCbQuery,
  safeEditMessage,
  sendLoadingMessage,
  deleteLoadingMessage,
  scheduleSecureDelete,
  escapeMarkdown,
  escapeHtml
} from '../shared/utils/telegram.js';
