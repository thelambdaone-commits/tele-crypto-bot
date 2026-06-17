import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dedupUpdates } from '../src/bot/middlewares/dedup.middleware.js';

function makeCtx({ updateId, type, data, chatId = 1 }) {
  return {
    update: updateId != null ? { update_id: updateId } : {},
    updateType: type,
    callbackQuery: data != null ? { data } : undefined,
    chat: { id: chatId },
    answerCbQuery: async () => {},
  };
}

test('processes a fresh update exactly once', async () => {
  let calls = 0;
  const ctx = makeCtx({ updateId: 1001, type: 'message' });
  await dedupUpdates(ctx, async () => {
    calls++;
  });
  assert.equal(calls, 1);
});

test('drops a redelivered update with the same update_id', async () => {
  let calls = 0;
  const next = async () => {
    calls++;
  };
  await dedupUpdates(makeCtx({ updateId: 2002, type: 'message' }), next);
  await dedupUpdates(makeCtx({ updateId: 2002, type: 'message' }), next);
  assert.equal(calls, 1, 'second delivery of same update_id must be dropped');
});

test('debounces rapid identical callback taps from the same chat', async () => {
  let calls = 0;
  const next = async () => {
    calls++;
  };
  // Distinct update_ids (two genuine taps) but same chat + same callback data.
  await dedupUpdates(
    makeCtx({ updateId: 3001, type: 'callback_query', data: 'generate_eth', chatId: 42 }),
    next
  );
  await dedupUpdates(
    makeCtx({ updateId: 3002, type: 'callback_query', data: 'generate_eth', chatId: 42 }),
    next
  );
  assert.equal(calls, 1, 'second rapid identical tap must be debounced');
});

test('does not debounce identical callbacks from different chats', async () => {
  let calls = 0;
  const next = async () => {
    calls++;
  };
  await dedupUpdates(
    makeCtx({ updateId: 4001, type: 'callback_query', data: 'view_keys', chatId: 100 }),
    next
  );
  await dedupUpdates(
    makeCtx({ updateId: 4002, type: 'callback_query', data: 'view_keys', chatId: 200 }),
    next
  );
  assert.equal(calls, 2, 'different users pressing the same button must both pass');
});
