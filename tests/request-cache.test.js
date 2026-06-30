import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RequestCache } from '../src/shared/rpc/request-cache.js';

test('RequestCache serves a fresh value within TTL without re-fetching', async () => {
  const cache = new RequestCache({ ttlMs: 1000 });
  let calls = 0;
  const fetcher = async () => {
    calls++;
    return { n: calls };
  };

  const a = await cache.get('rpc', { address: '0xabc' }, fetcher);
  const b = await cache.get('rpc', { address: '0xabc' }, fetcher);

  assert.deepEqual(a, { n: 1 });
  assert.deepEqual(b, { n: 1 });
  assert.equal(calls, 1, 'second call must hit the cache, not the fetcher');
});

test('RequestCache distinguishes entries by method + args', async () => {
  const cache = new RequestCache({ ttlMs: 1000 });
  let calls = 0;
  const fetcher = async () => ({ n: ++calls });

  await cache.get('rpc', { address: '0xa' }, fetcher);
  await cache.get('rpc', { address: '0xb' }, fetcher);

  assert.equal(calls, 2, 'different args are independent cache keys');
});

test('RequestCache.invalidate forces a re-fetch on the next get', async () => {
  const cache = new RequestCache({ ttlMs: 10000 });
  let calls = 0;
  const fetcher = async () => ({ n: ++calls });

  await cache.get('rpc', { address: '0xabc' }, fetcher);
  cache.invalidate('rpc', { address: '0xabc' });
  const after = await cache.get('rpc', { address: '0xabc' }, fetcher);

  assert.deepEqual(after, { n: 2 });
  assert.equal(calls, 2);
});

test('RequestCache.invalidate only clears the matching key (args must match)', async () => {
  const cache = new RequestCache({ ttlMs: 10000 });
  let calls = 0;
  const fetcher = async () => ({ n: ++calls });

  await cache.get('rpc', { address: '0xabc' }, fetcher);
  // Mismatched args (the bug that prompted this): must NOT clear the real entry.
  cache.invalidate('rpc', {});
  const again = await cache.get('rpc', { address: '0xabc' }, fetcher);

  assert.deepEqual(again, { n: 1 }, 'mismatched invalidate leaves the entry cached');
  assert.equal(calls, 1);
});

test('RequestCache.dedup collapses concurrent identical in-flight requests', async () => {
  const cache = new RequestCache({ ttlMs: 0 });
  let calls = 0;
  let resolveFetch;
  const fetcher = () =>
    new Promise((resolve) => {
      calls++;
      resolveFetch = () => resolve({ n: calls });
    });

  const p1 = cache.dedup('rpc', { address: '0xabc' }, fetcher);
  const p2 = cache.dedup('rpc', { address: '0xabc' }, fetcher);
  resolveFetch();
  const [r1, r2] = await Promise.all([p1, p2]);

  assert.equal(calls, 1, 'overlapping identical requests share one fetch');
  assert.deepEqual(r1, r2);
});

test('RequestCache re-fetches after a failed dedup (in-flight entry is cleared)', async () => {
  const cache = new RequestCache({ ttlMs: 0 });
  let calls = 0;
  const fetcher = async () => {
    calls++;
    if (calls === 1) throw new Error('boom');
    return { ok: true };
  };

  await assert.rejects(() => cache.dedup('rpc', { a: 1 }, fetcher));
  const ok = await cache.dedup('rpc', { a: 1 }, fetcher);

  assert.deepEqual(ok, { ok: true });
  assert.equal(calls, 2, 'a rejected fetch must not poison the in-flight slot');
});
