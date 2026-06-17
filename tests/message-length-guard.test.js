import { test } from 'node:test';
import assert from 'node:assert/strict';
import { messageLengthGuard } from '../src/bot/middlewares/security.middleware.js';
import { config } from '../src/core/config.js';

function makeCtx({ text, chatId = 555, userId = 555 }) {
  return {
    message: text != null ? { text } : undefined,
    chat: { id: chatId },
    from: { id: userId },
  };
}

test('passes a normal-length message through', async () => {
  let called = 0;
  await messageLengthGuard(makeCtx({ text: 'hello' }), async () => {
    called++;
  });
  assert.equal(called, 1);
});

test('drops a message over the configured max length', async () => {
  const original = config.maxMessageLength;
  config.maxMessageLength = 50;
  try {
    let called = 0;
    await messageLengthGuard(makeCtx({ text: 'x'.repeat(51) }), async () => {
      called++;
    });
    assert.equal(called, 0, 'oversized message must be dropped (next not called)');
  } finally {
    config.maxMessageLength = original;
  }
});

test('admins bypass the length cap', async () => {
  const originalMax = config.maxMessageLength;
  const originalAdmins = config.adminUserId;
  config.maxMessageLength = 50;
  config.adminUserId = [777];
  try {
    let called = 0;
    await messageLengthGuard(makeCtx({ text: 'x'.repeat(200), userId: 777 }), async () => {
      called++;
    });
    assert.equal(called, 1, 'admin oversized message must still pass');
  } finally {
    config.maxMessageLength = originalMax;
    config.adminUserId = originalAdmins;
  }
});

test('ignores non-text updates', async () => {
  let called = 0;
  await messageLengthGuard(makeCtx({ text: undefined }), async () => {
    called++;
  });
  assert.equal(called, 1, 'callback/photo updates must pass untouched');
});
