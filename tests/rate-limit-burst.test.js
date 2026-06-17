import { test } from 'node:test';
import assert from 'node:assert/strict';
import { globalRateLimit } from '../src/bot/middlewares/security.middleware.js';
import { config } from '../src/core/config.js';

function makeCtx({ chatId, alerts }) {
  return {
    chat: { id: chatId },
    from: { id: chatId },
    reply: async () => {},
    telegram: {
      sendMessage: async () => {
        alerts.count++;
      },
    },
  };
}

test('burst guard blocks rapid-fire messages past 10 in the short window', async () => {
  const alerts = { count: 0 };
  const ctx = makeCtx({ chatId: 700001, alerts });

  let passed = 0;
  // 11 messages well under the per-minute cap but exceeding the 10/10s burst.
  for (let i = 0; i < 11; i++) {
    await globalRateLimit(ctx, async () => {
      passed++;
    });
  }

  assert.equal(passed, 10, 'exactly the first 10 should reach the handler');
});

test('admin is alerted once when a flooder is auto-blacklisted', async () => {
  const originalAdmins = config.adminChatId;
  config.adminChatId = [999000111];
  const alerts = { count: 0 };
  const ctx = makeCtx({ chatId: 700002, alerts });

  try {
    // Drive the global limiter (30/min) past its 5-warning auto-blacklist
    // threshold within one window. No time advance needed (60s window).
    for (let i = 0; i < 40; i++) {
      await globalRateLimit(ctx, async () => {});
    }
    assert.equal(alerts.count, 1, 'admin alert must fire exactly once on the auto-blacklist transition');
  } finally {
    config.adminChatId = originalAdmins;
  }
});

test('admins themselves bypass the rate limiter entirely', async () => {
  const originalAdmins = config.adminChatId;
  config.adminChatId = [700003];
  const alerts = { count: 0 };
  const ctx = makeCtx({ chatId: 700003, alerts });

  try {
    let passed = 0;
    for (let i = 0; i < 50; i++) {
      await globalRateLimit(ctx, async () => {
        passed++;
      });
    }
    assert.equal(passed, 50, 'admin messages are never throttled');
    assert.equal(alerts.count, 0, 'no auto-blacklist alert for an admin');
  } finally {
    config.adminChatId = originalAdmins;
  }
});
