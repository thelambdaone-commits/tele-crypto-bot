import { withTimeout } from '../rpc-timeout.js';
import { RpcHealthMonitor } from './RpcHealthMonitor.js';
import { TokenBucket } from './token-bucket.js';
import { RequestCache } from './request-cache.js';

const STATE_CLOSED = 'CLOSED';
const STATE_OPEN = 'OPEN';
const STATE_HALF_OPEN = 'HALF_OPEN';

const DEFAULT_OPTIONS = {
  failureThreshold: 5,
  successThreshold: 2,
  openTimeoutMs: 30000,
  requestTimeoutMs: 15000,
  baseDelayMs: 500,
  hedgedRequests: false,
  // Per-endpoint rate limiting (token bucket)
  rps: null,
  rpsBurst: null,
  // Request dedup + TTL cache
  cacheTtlMs: null,
  // Write-idempotency: check receipt/tx status before retry
  isWrite: false,
  idempotencyCheck: null,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RpcManager {
  constructor(endpoints, fetchFn, options = {}) {
    this.endpoints = Array.isArray(endpoints) ? endpoints : [endpoints];
    this.fetchFn = fetchFn;
    this.opts = { ...DEFAULT_OPTIONS, ...options };

    this._state = STATE_CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._openTimer = null;

    this.health = new RpcHealthMonitor();
    for (const url of this.endpoints) {
      this.health.register(url);
    }

    this._buckets = new Map();
    if (this.opts.rps) {
      for (const url of this.endpoints) {
        this._buckets.set(
          url,
          new TokenBucket({
            capacity: this.opts.rpsBurst || this.opts.rps * 2,
            refillRate: this.opts.rps,
            refillInterval: 1000,
          })
        );
      }
    }

    this._cache = this.opts.cacheTtlMs ? new RequestCache({ ttlMs: this.opts.cacheTtlMs }) : null;

    this._metrics = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      stateTransitions: 0,
      lastFailureAt: null,
      lastSuccessAt: null,
      avgLatencyMs: 0,
    };
  }

  get state() {
    return this._state;
  }

  get metrics() {
    return { ...this._metrics };
  }

  get healthStats() {
    return this.health.getStats();
  }

  get cacheStats() {
    return this._cache ? { size: this._cache.size } : null;
  }

  get rateLimitStats() {
    const s = {};
    for (const [url, bucket] of this._buckets) {
      s[url] = bucket.stats;
    }
    return s;
  }

  async execute(args = {}) {
    if (this._state === STATE_OPEN) {
      throw new Error('Circuit breaker OPEN for RPC endpoints');
    }

    this._metrics.totalRequests++;

    if (this._cache && !this.opts.isWrite) {
      return this._cache.get('rpc', args, async () => {
        return this._executeWithTracking(args);
      });
    }

    return this._executeWithTracking(args);
  }

  async _executeWithTracking(args) {
    const start = Date.now();
    try {
      const result = await (this.opts.hedgedRequests
        ? this._executeHedged(args)
        : this._executeWithFallback(args));
      this._recordSuccess(Date.now() - start);
      return result;
    } catch (error) {
      this._recordFailure();
      throw error;
    }
  }

  async _executeWithFallback(args) {
    const sortedEndpoints = this.health.getSortedEndpoints();
    const endpointList = sortedEndpoints.length > 0 ? sortedEndpoints : this.endpoints;
    const totalAttempts = endpointList.length;

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      const endpoint = endpointList[attempt % endpointList.length];
      const attemptStart = Date.now();

      const bucket = this._buckets.get(endpoint);
      if (bucket) {
        try {
          await bucket.consume(1, 2000);
        } catch {
          this.health.recordError(endpoint, 'local rate-limit wait timeout');
          continue;
        }
      }

      try {
        const result = await withTimeout(
          this.fetchFn(endpoint, args),
          this.opts.requestTimeoutMs,
          `RPC timeout after ${this.opts.requestTimeoutMs}ms for ${endpoint}`
        );
        this.health.recordSuccess(endpoint, Date.now() - attemptStart);
        return result;
      } catch (error) {
        this.health.recordError(endpoint, error?.message);

        if (this.opts.isWrite && this.opts.idempotencyCheck) {
          const alreadyLanded = await this.opts.idempotencyCheck(args, error);
          if (alreadyLanded) {
            this.health.recordSuccess(endpoint, Date.now() - attemptStart);
            return alreadyLanded;
          }
        }

        const isLastAttempt = attempt === totalAttempts - 1;
        if (isLastAttempt) throw error;
        await sleep(this.opts.baseDelayMs * Math.pow(2, attempt));
      }
    }
  }

  async _executeHedged(args) {
    const sortedEndpoints = this.health.getSortedEndpoints();
    const top2 = sortedEndpoints.slice(0, 2);
    if (top2.length === 0) top2.push(...this.endpoints.slice(0, 2));

    const promises = top2.map(async (endpoint) => {
      const bucket = this._buckets.get(endpoint);
      const hedgedStart = Date.now();
      if (bucket) {
        try {
          await bucket.consume(1, 500);
        } catch {
          throw new Error('Rate limited');
        }
      }
      return withTimeout(
        this.fetchFn(endpoint, args),
        this.opts.requestTimeoutMs,
        `Hedged RPC timeout for ${endpoint}`
      )
        .then((r) => {
          this.health.recordSuccess(endpoint, Date.now() - hedgedStart);
          return r;
        })
        .catch((e) => {
          this.health.recordError(endpoint, e?.message);
          throw e;
        });
    });

    return await Promise.race(promises);
  }

  invalidateCache(method, args) {
    if (this._cache) this._cache.invalidate(method, args);
  }

  _recordSuccess(latencyMs) {
    this._metrics.totalSuccesses++;
    this._metrics.lastSuccessAt = Date.now();
    this._metrics.avgLatencyMs = this._metrics.avgLatencyMs
      ? (this._metrics.avgLatencyMs + latencyMs) / 2
      : latencyMs;
    this._failureCount = 0;

    if (this._state === STATE_HALF_OPEN) {
      this._successCount++;
      if (this._successCount >= this.opts.successThreshold) {
        this._transitionTo(STATE_CLOSED);
      }
    }
  }

  _recordFailure() {
    this._metrics.totalFailures++;
    this._metrics.lastFailureAt = Date.now();
    this._failureCount++;

    if (this._state === STATE_CLOSED && this._failureCount >= this.opts.failureThreshold) {
      this._transitionTo(STATE_OPEN);
    }
    if (this._state === STATE_HALF_OPEN) {
      this._transitionTo(STATE_OPEN);
    }
  }

  _transitionTo(newState) {
    this._state = newState;
    this._metrics.stateTransitions++;

    if (this._openTimer) {
      clearTimeout(this._openTimer);
      this._openTimer = null;
    }

    if (newState === STATE_OPEN) {
      this._successCount = 0;
      this._openTimer = setTimeout(() => this._transitionTo(STATE_HALF_OPEN), this.opts.openTimeoutMs);
      this._openTimer.unref();
    }

    if (newState === STATE_HALF_OPEN) {
      this._successCount = 0;
      this._failureCount = 0;
    }

    if (newState === STATE_CLOSED) {
      this._failureCount = 0;
      this._successCount = 0;
    }
  }

  async destroy() {
    if (this._openTimer) {
      clearTimeout(this._openTimer);
      this._openTimer = null;
    }
    this.health.stop();
    this._state = STATE_OPEN;
  }
}
