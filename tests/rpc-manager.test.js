import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RpcManager } from '../src/shared/rpc/RpcManager.js';
import { RpcHealthMonitor } from '../src/shared/rpc/RpcHealthMonitor.js';

test('RpcManager executes successfully against first endpoint', async () => {
  let callOrder = [];
  const rpc = new RpcManager(
    ['https://endpoint-a.com/rpc', 'https://endpoint-b.com/rpc'],
    async (endpoint) => {
      callOrder.push(endpoint);
      return { result: 'ok', from: endpoint };
    },
    { requestTimeoutMs: 5000 }
  );

  const result = await rpc.execute();
  assert.equal(result.result, 'ok');
  assert.ok(callOrder.length >= 1);
  assert.equal(callOrder[0], 'https://endpoint-a.com/rpc');
});

test('RpcManager falls through on first endpoint failure', async () => {
  let callOrder = [];
  const rpc = new RpcManager(
    ['https://endpoint-a.com/rpc', 'https://endpoint-b.com/rpc'],
    async (endpoint) => {
      callOrder.push(endpoint);
      if (endpoint === 'https://endpoint-a.com/rpc') {
        throw new Error('Connection refused');
      }
      return { result: 'ok', from: endpoint };
    },
    { requestTimeoutMs: 5000, baseDelayMs: 10 }
  );

  const result = await rpc.execute();
  assert.equal(result.result, 'ok');
  assert.equal(result.from, 'https://endpoint-b.com/rpc');
  assert.deepEqual(callOrder, ['https://endpoint-a.com/rpc', 'https://endpoint-b.com/rpc']);
});

test('RpcManager throws when all endpoints fail', async () => {
  const rpc = new RpcManager(
    ['https://endpoint-a.com/rpc', 'https://endpoint-b.com/rpc'],
    async () => { throw new Error('Always fails'); },
    { requestTimeoutMs: 5000, baseDelayMs: 10 }
  );

  await assert.rejects(
    () => rpc.execute(),
    { message: 'Always fails' }
  );
});

test('RpcManager circuit breaker opens after threshold', async () => {
  let callCount = 0;
  const rpc = new RpcManager(
    ['https://bad-endpoint.com/rpc'],
    async () => {
      callCount++;
      throw new Error('Always fails');
    },
    { failureThreshold: 2, requestTimeoutMs: 5000, baseDelayMs: 10, openTimeoutMs: 500 }
  );

  await assert.rejects(() => rpc.execute());
  await assert.rejects(() => rpc.execute());
  assert.equal(callCount, 2);

  await assert.rejects(() => rpc.execute(), { message: 'Circuit breaker OPEN for RPC endpoints' });
  assert.equal(callCount, 2);
});

test('RpcManager circuit breaker half-open recovery', async () => {
  let callCount = 0;
  const rpc = new RpcManager(
    ['https://flakey-endpoint.com/rpc'],
    async () => {
      callCount++;
      if (callCount <= 2) throw new Error('Transient failure');
      return { result: 'recovered' };
    },
    { failureThreshold: 2, successThreshold: 1, requestTimeoutMs: 5000, baseDelayMs: 10, openTimeoutMs: 100 }
  );

  await assert.rejects(() => rpc.execute());
  await assert.rejects(() => rpc.execute());

  await new Promise((r) => setTimeout(r, 200));

  const result = await rpc.execute();
  assert.equal(result.result, 'recovered');
});

test('RpcHealthMonitor tracks endpoint health', () => {
  const monitor = new RpcHealthMonitor();
  monitor.register('https://good.com/rpc');
  monitor.register('https://bad.com/rpc');

  for (let i = 0; i < 10; i++) {
    monitor.recordSuccess('https://good.com/rpc', 100);
    monitor.recordError('https://bad.com/rpc');
  }

  const stats = monitor.getStats();
  const good = stats.find((s) => s.url === 'https://good.com/rpc');
  const bad = stats.find((s) => s.url === 'https://bad.com/rpc');

  assert.ok(good.isHealthy);
  assert.ok(!bad.isHealthy);
  assert.equal(bad.consecutiveFailures, 10);
});

test('RpcHealthMonitor sorts by health score', () => {
  const monitor = new RpcHealthMonitor();
  monitor.register('https://slow.com/rpc');
  monitor.register('https://fast.com/rpc');

  for (let i = 0; i < 10; i++) {
    monitor.recordSuccess('https://fast.com/rpc', 50);
    monitor.recordSuccess('https://slow.com/rpc', 3000);
  }

  const sorted = monitor.getSortedEndpoints();
  assert.equal(sorted[0], 'https://fast.com/rpc');
  assert.equal(sorted[1], 'https://slow.com/rpc');
});

test('RpcManager hedged requests return fastest', async () => {
  const rpc = new RpcManager(
    ['https://slow.com/rpc', 'https://fast.com/rpc'],
    async (endpoint) => {
      if (endpoint === 'https://slow.com/rpc') {
        await new Promise((r) => setTimeout(r, 200));
      }
      return { result: 'ok', from: endpoint };
    },
    { requestTimeoutMs: 5000, hedgedRequests: true, baseDelayMs: 10 }
  );

  const result = await rpc.execute();
  assert.equal(result.result, 'ok');
  assert.equal(result.from, 'https://fast.com/rpc');
});
