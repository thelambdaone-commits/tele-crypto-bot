/**
 * TronChain rate-limit handling (429 retry + serialized throttle). Pure logic,
 * no network — guards the fix for the "Erreur de récupération" on parallel TRX
 * balance fetches against the public TronGrid endpoint.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TronChain } from '../src/providers/tron.js';

const mk429 = () => Object.assign(new Error('Request failed with status code 429'), {
  response: { status: 429 },
});

test('_retry retries a 429 then succeeds', async () => {
  const t = new TronChain('https://x', '');
  let calls = 0;
  const out = await t._retry(async () => {
    if (++calls < 3) throw mk429();
    return 'ok';
  }, 4, 1);
  assert.equal(out, 'ok');
  assert.equal(calls, 3);
});

test('_retry does NOT retry a non-429 error (fails fast)', async () => {
  const t = new TronChain('https://x', '');
  let calls = 0;
  await assert.rejects(
    () => t._retry(async () => { calls += 1; throw new Error('boom'); }, 4, 1),
    /boom/
  );
  assert.equal(calls, 1);
});

test('_retry gives up after max attempts on persistent 429', async () => {
  const t = new TronChain('https://x', '');
  let calls = 0;
  await assert.rejects(
    () => t._retry(async () => { calls += 1; throw mk429(); }, 3, 1),
    /429/
  );
  assert.equal(calls, 3);
});

test('throttle is on without an API key, off with one', () => {
  assert.ok(new TronChain('https://x', '')._minGapMs > 0, 'keyless → serialize with a gap');
  assert.equal(new TronChain('https://x', 'KEY')._minGapMs, 0, 'with a key → no throttle');
});

test('_schedule serializes calls and still returns each result', async () => {
  const t = new TronChain('https://x', 'KEY'); // gap 0 → fast
  const order = [];
  const results = await Promise.all([1, 2, 3].map((n) =>
    t._schedule(async () => { order.push(n); return n * 10; })
  ));
  assert.deepEqual(results, [10, 20, 30]);
  assert.deepEqual(order, [1, 2, 3], 'queue preserves submission order');
});
