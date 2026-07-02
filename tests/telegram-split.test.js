import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  splitTelegramMessage,
  sendChunked,
  TELEGRAM_MESSAGE_LIMIT,
} from '../src/shared/utils/telegram.js';

const LIMIT = TELEGRAM_MESSAGE_LIMIT;

test('text within the limit is returned as a single part', () => {
  assert.deepEqual(splitTelegramMessage(''), ['']);
  assert.deepEqual(splitTelegramMessage('bonjour'), ['bonjour']);
  const exact = 'x'.repeat(LIMIT);
  assert.deepEqual(splitTelegramMessage(exact), [exact]);
});

test('multi-line text splits at line boundaries, lossless, all parts fit', () => {
  const lines = Array.from({ length: 300 }, (_, i) => `<b>wallet ${i}</b> <code>0xabc${i}</code>`);
  const text = lines.join('\n');
  const parts = splitTelegramMessage(text);

  assert.ok(parts.length > 1);
  for (const p of parts) {
    assert.ok(p.length <= LIMIT, `part exceeds limit: ${p.length}`);
    assert.ok(p.length > 0, 'no empty parts');
    // Line-boundary splitting keeps each HTML span intact within one part.
    assert.equal((p.match(/<b>/g) || []).length, (p.match(/<\/b>/g) || []).length);
  }
  assert.equal(parts.join('\n'), text);
});

test('a single over-long line is hard-cut at spaces, lossless', () => {
  // Mimics the /audit blacklist: many <code>id</code> spans on ONE line.
  const text = Array.from({ length: 400 }, (_, i) => `<code>${1000000 + i}</code>`).join(' ');
  assert.ok(text.length > LIMIT);
  const parts = splitTelegramMessage(text);

  assert.ok(parts.length > 1);
  for (const p of parts) {
    assert.ok(p.length <= LIMIT, `part exceeds limit: ${p.length}`);
    // Space-preferring cuts must not sever a <code> tag.
    assert.equal((p.match(/<code>/g) || []).length, (p.match(/<\/code>/g) || []).length);
  }
  assert.equal(parts.join(''), text);
});

test('a spaceless over-long line still splits into fitting parts, lossless', () => {
  const text = 'y'.repeat(LIMIT * 2 + 123);
  const parts = splitTelegramMessage(text);
  assert.ok(parts.length >= 3);
  for (const p of parts) assert.ok(p.length <= LIMIT && p.length > 0);
  assert.equal(parts.join(''), text);
});

test('sendChunked puts the keyboard on the last part only', async () => {
  const sent = [];
  const ctx = {
    chat: { id: 42 },
    reply: async (text, opts) => {
      sent.push({ kind: 'reply', text, opts });
      return { message_id: sent.length };
    },
    editMessageText: async (text, opts) => {
      sent.push({ kind: 'edit', text, opts });
      return { message_id: 0 };
    },
    telegram: {
      editMessageText: async (chatId, messageId, _inline, text, opts) => {
        sent.push({ kind: 'editById', chatId, messageId, text, opts });
        return { message_id: messageId };
      },
    },
  };
  const keyboard = { reply_markup: { inline_keyboard: [[{ text: 'ok' }]] } };
  const longText = Array.from({ length: 250 }, (_, i) => `ligne ${i} ${'x'.repeat(30)}`).join('\n');

  await sendChunked(ctx, longText, { parse_mode: 'HTML', ...keyboard }, { edit: true });

  assert.ok(sent.length > 1);
  assert.equal(sent[0].kind, 'edit');
  for (const [i, msg] of sent.entries()) {
    const isLast = i === sent.length - 1;
    assert.equal(Boolean(msg.opts.reply_markup), isLast, `keyboard on part ${i}`);
    assert.equal(msg.opts.parse_mode, 'HTML');
  }
});

test('sendChunked with messageId edits that message first', async () => {
  const sent = [];
  const ctx = {
    chat: { id: 7 },
    reply: async (text, opts) => {
      sent.push({ kind: 'reply', text, opts });
      return { message_id: 99 };
    },
    telegram: {
      editMessageText: async (chatId, messageId, _inline, text, opts) => {
        sent.push({ kind: 'editById', chatId, messageId, text, opts });
        return { message_id: messageId };
      },
    },
  };

  await sendChunked(ctx, 'court', { parse_mode: 'HTML' }, { messageId: 1234 });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].kind, 'editById');
  assert.equal(sent[0].messageId, 1234);
  assert.equal(sent[0].chatId, 7);
});
