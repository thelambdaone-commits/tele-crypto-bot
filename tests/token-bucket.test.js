import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TokenBucket, MultiBucket } from '../src/shared/rpc/token-bucket.js';

test('TokenBucket allows immediate consumption up to capacity', async () => {
  const bucket = new TokenBucket({ capacity: 5, refillRate: 1, refillInterval: 1000 });
  for (let i = 0; i < 5; i++) {
    await bucket.consume(1);
  }
  assert.ok(bucket.tokens < 1, 'capacity should be drained after 5 consumes');
});

test('TokenBucket queues and later resolves when tokens refill', async () => {
  // Fast refill so the queued consume resolves quickly.
  const bucket = new TokenBucket({ capacity: 1, refillRate: 100, refillInterval: 10 });
  await bucket.consume(1); // drains the single token
  // This one must wait for a refill rather than resolving instantly.
  await bucket.consume(1, 2000);
  assert.ok(true, 'queued consume eventually resolved');
});

test('TokenBucket rejects when the backlog is full', async () => {
  // refillInterval huge => effectively no refill during the test, so the queue
  // never drains and the backlog cap is enforced.
  const bucket = new TokenBucket({
    capacity: 1,
    refillRate: 1,
    refillInterval: 600000,
    maxBacklog: 2,
  });
  await bucket.consume(1); // drain the single token
  // Two queued requests fill the backlog (they stay parked, never resolved here).
  bucket.consume(1, 500000).catch(() => {});
  bucket.consume(1, 500000).catch(() => {});
  await assert.rejects(() => bucket.consume(1, 500000), /backlog full/);
});

test('TokenBucket.consume rejects after its wait timeout', async () => {
  const bucket = new TokenBucket({
    capacity: 1,
    refillRate: 1,
    refillInterval: 600000,
    maxBacklog: 10,
  });
  await bucket.consume(1); // drain the single token
  await assert.rejects(() => bucket.consume(1, 30), /timeout/i);
});

test('TokenBucket.reset restores full capacity', async () => {
  const bucket = new TokenBucket({ capacity: 3, refillRate: 1, refillInterval: 1000 });
  await bucket.consume(3);
  bucket.reset();
  assert.equal(Math.floor(bucket.tokens), 3);
});

test('TokenBucket.stats reports capacity, tokens and pending', async () => {
  // Large refill interval => reading stats can't refill enough to perturb the
  // token count, so the assertion is deterministic rather than timing-sensitive.
  const bucket = new TokenBucket({ capacity: 4, refillRate: 2, refillInterval: 600000 });
  await bucket.consume(1);
  const s = bucket.stats;
  assert.equal(s.capacity, 4);
  assert.equal(s.refillRate, 2);
  assert.equal(s.pending, 0);
  assert.ok(s.tokens > 2.9 && s.tokens < 3.1, `expected ~3 tokens, got ${s.tokens}`);
});

test('MultiBucket lazily creates one bucket per key and reuses it', () => {
  const multi = new MultiBucket({ capacity: 10, refillRate: 1 });
  const a1 = multi.get('endpoint-a');
  const a2 = multi.get('endpoint-a');
  const b = multi.get('endpoint-b');

  assert.equal(a1, a2, 'same key returns the same bucket instance');
  assert.notEqual(a1, b, 'different keys get different buckets');
  assert.deepEqual(Object.keys(multi.stats()).sort(), ['endpoint-a', 'endpoint-b']);
});
