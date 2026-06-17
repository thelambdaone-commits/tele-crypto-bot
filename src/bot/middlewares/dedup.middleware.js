/**
 * Update de-duplication / debounce middleware (anti-flood, defensive).
 *
 * Two distinct protections:
 *  1. update_id dedup — Telegram may redeliver the same update if our
 *     confirmation is lost (and a replay flood would resend old updates).
 *     The same update_id is processed at most once.
 *  2. callback debounce — a user double-tapping an inline button (or a
 *     malicious rapid-fire) produces several *distinct* updates with the
 *     same callback data. We drop repeats of the same (chatId, data) within
 *     a short window so a single intent can't trigger an action twice.
 *
 * State is in-memory and self-pruning; entries expire on their own TTL.
 */

const UPDATE_TTL_MS = 60_000;
const CALLBACK_DEBOUNCE_MS = 1_000;
const MAX_ENTRIES = 20_000;

const seenUpdates = new Map(); // update_id -> firstSeen ts
const recentCallbacks = new Map(); // `${chatId}:${data}` -> last ts

function prune(map, ttl, now) {
  for (const [key, ts] of map) {
    if (now - ts >= ttl) map.delete(key);
  }
}

export function dedupUpdates(ctx, next) {
  const now = Date.now();

  // 1. Drop exact redeliveries of the same update.
  const updateId = ctx.update?.update_id;
  if (updateId != null) {
    if (seenUpdates.has(updateId)) return;
    seenUpdates.set(updateId, now);
  }

  // 2. Debounce rapid identical button taps.
  if (ctx.updateType === 'callback_query') {
    const data = ctx.callbackQuery?.data;
    const chatId = ctx.chat?.id;
    if (data && chatId != null) {
      const key = `${chatId}:${data}`;
      const last = recentCallbacks.get(key);
      if (last != null && now - last < CALLBACK_DEBOUNCE_MS) {
        // Clear the client-side spinner, then swallow the duplicate.
        if (typeof ctx.answerCbQuery === 'function') {
          ctx.answerCbQuery().catch(() => {});
        }
        return;
      }
      recentCallbacks.set(key, now);
    }
  }

  // Opportunistic pruning so the maps can't grow unbounded under flood.
  if (seenUpdates.size > MAX_ENTRIES) prune(seenUpdates, UPDATE_TTL_MS, now);
  if (recentCallbacks.size > MAX_ENTRIES) prune(recentCallbacks, CALLBACK_DEBOUNCE_MS, now);

  return next();
}

/** Periodic cleanup (wired alongside the rate-limiter cleanup). */
export function cleanupDedup() {
  const now = Date.now();
  prune(seenUpdates, UPDATE_TTL_MS, now);
  prune(recentCallbacks, CALLBACK_DEBOUNCE_MS, now);
}

/** Test/inspection helper. */
export function _dedupSizes() {
  return { updates: seenUpdates.size, callbacks: recentCallbacks.size };
}
