import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fr } from '../src/bot/messages/fr.js';
import { en } from '../src/bot/messages/en.js';
import { t } from '../src/bot/messages/index.js';

// CLAUDE.md convention: fr.js and en.js must stay in strict key parity — every
// key exists in both bundles, with the same shape (string vs function vs object).

function walk(obj, prefix = '') {
  const out = new Map();
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      out.set(path, 'object');
      for (const [p, kind] of walk(value, path)) out.set(p, kind);
    } else {
      out.set(path, typeof value);
    }
  }
  return out;
}

test('fr and en bundles have identical key sets', () => {
  const frKeys = walk(fr);
  const enKeys = walk(en);
  const missingInEn = [...frKeys.keys()].filter((k) => !enKeys.has(k));
  const missingInFr = [...enKeys.keys()].filter((k) => !frKeys.has(k));
  assert.deepEqual(missingInEn, [], `keys missing in en.js: ${missingInEn.join(', ')}`);
  assert.deepEqual(missingInFr, [], `keys missing in fr.js: ${missingInFr.join(', ')}`);
});

test('matching keys have the same shape in both bundles', () => {
  const frKeys = walk(fr);
  const enKeys = walk(en);
  const mismatched = [...frKeys.entries()]
    .filter(([k, kind]) => enKeys.has(k) && enKeys.get(k) !== kind)
    .map(([k, kind]) => `${k} (fr: ${kind}, en: ${enKeys.get(k)})`);
  assert.deepEqual(mismatched, [], `shape mismatches: ${mismatched.join(', ')}`);
});

test('string leaves are non-empty in both bundles', () => {
  for (const [bundle, name] of [[fr, 'fr'], [en, 'en']]) {
    const empty = [...walk(bundle).entries()]
      .filter(([, kind]) => kind === 'string')
      .map(([k]) => k)
      .filter((k) => t(name, k) === '');
    assert.deepEqual(empty, [], `empty strings in ${name}.js: ${empty.join(', ')}`);
  }
});

// Spot-check the payments section renders in both languages (function keys take
// their documented args and must not throw or leak [missing-key] markers).
test('payments keys render in fr and en', () => {
  for (const lang of ['fr', 'en']) {
    assert.ok(t(lang, 'payments.createTitle').length > 0);
    assert.ok(t(lang, 'payments.askAmount', 'ETH', 'Ethereum').includes('ETH'));
    assert.ok(t(lang, 'payments.errors.ALREADY_OPEN', 'USDT', 'TRX').includes('USDT'));
    assert.ok(!t(lang, 'payments.notifPaid', { amount: 1, symbol: 'BTC', fiat: '', over: '', id: 'inv-1', lnLine: '' }).includes('undefined'));
    assert.ok(t(lang, 'payments.treasury', { balanceSat: 1, thresholdSat: 2, destBlock: 'x', payoutsBlock: 'y' }).includes('x'));
  }
});
