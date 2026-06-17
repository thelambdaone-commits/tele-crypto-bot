import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGraphCommand, parsePeriod } from '../src/shared/chart.js';

test('/graph <token> with no period defaults to 365 days', () => {
  assert.deepEqual(parseGraphCommand('/graph eth'), { ok: true, symbol: 'eth', days: 365 });
});

test('/graph accepts explicit supported periods', () => {
  assert.equal(parseGraphCommand('/graph btc 30').days, 30);
  assert.equal(parseGraphCommand('/graph btc 7').days, 7);
});

test('/graph no longer accepts "all"', () => {
  assert.equal(parsePeriod('all'), null);
  assert.equal(parseGraphCommand('/graph eth all').ok, false);
});

test('/graph rejects unknown tokens and too many args', () => {
  assert.equal(parseGraphCommand('/graph xyz').ok, false);
  assert.equal(parseGraphCommand('/graph eth 30 extra').ok, false);
  assert.equal(parseGraphCommand('/graph').ok, false);
});
