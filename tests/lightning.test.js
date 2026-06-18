/**
 * LightningService (Step 1) — phoenixd HTTP client. fetch is mocked; no node.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LightningService } from '../src/modules/payments/lightning.service.js';

function mockFetch(handler) {
  const calls = [];
  const fn = async (url, opts) => {
    calls.push({ url, opts });
    return handler(url, opts);
  };
  return { fn, calls };
}
const ok = (body) => ({ ok: true, json: async () => body });

test('isConfigured reflects url + password', () => {
  assert.equal(new LightningService({ url: '', password: '' }).isConfigured(), false);
  assert.equal(new LightningService({ url: 'http://x', password: 'p' }).isConfigured(), true);
});

test('createInvoice POSTs to /createinvoice with HTTP Basic auth and returns the BOLT11', async () => {
  const m = mockFetch(() => ok({ paymentHash: 'h1', serialized: 'lnbc1...', amountSat: 1000 }));
  const ln = new LightningService({ url: 'http://node:9740/', password: 'secret', fetchImpl: m.fn });
  const inv = await ln.createInvoice({ amountSat: 1000, description: 'Facture' });
  assert.equal(inv.bolt11, 'lnbc1...');
  assert.equal(inv.paymentHash, 'h1');
  assert.equal(inv.amountSat, 1000);
  // trailing slash trimmed, correct path + method + body
  assert.equal(m.calls[0].url, 'http://node:9740/createinvoice');
  assert.equal(m.calls[0].opts.method, 'POST');
  assert.match(m.calls[0].opts.body, /amountSat=1000/);
  assert.equal(m.calls[0].opts.headers.Authorization, 'Basic ' + Buffer.from(':secret').toString('base64'));
});

test('createInvoice rejects a bad amount and a malformed node response', async () => {
  const m = mockFetch(() => ok({ paymentHash: 'h' })); // no serialized
  const ln = new LightningService({ url: 'http://x', password: 'p', fetchImpl: m.fn });
  await assert.rejects(() => ln.createInvoice({ amountSat: 0 }), /sats invalide/);
  await assert.rejects(() => ln.createInvoice({ amountSat: 100 }), /pas de BOLT11/);
});

test('lookupIncoming returns paid status + received sats', async () => {
  const m = mockFetch(() => ok({ isPaid: true, receivedSat: 1000, preimage: 'pre' }));
  const ln = new LightningService({ url: 'http://x', password: 'p', fetchImpl: m.fn });
  const r = await ln.lookupIncoming('hash123');
  assert.deepEqual(r, { isPaid: true, receivedSat: 1000, preimage: 'pre' });
  assert.match(m.calls[0].url, /\/payments\/incoming\/hash123$/);
});

test('calls throw clearly when Lightning is not configured', async () => {
  const ln = new LightningService({ url: '', password: '' });
  await assert.rejects(() => ln.lookupIncoming('h'), /non configuré/i);
});

test('a non-2xx node response surfaces the error message', async () => {
  const m = mockFetch(() => ({ ok: false, json: async () => ({ message: 'insufficient liquidity' }) }));
  const ln = new LightningService({ url: 'http://x', password: 'p', fetchImpl: m.fn });
  await assert.rejects(() => ln.createInvoice({ amountSat: 100 }), /insufficient liquidity/);
});
