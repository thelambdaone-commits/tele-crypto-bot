import { ethers } from 'ethers';
import { rpcFallback } from './rpc-fallback.js';

const STATE_CLOSED = 'CLOSED';
const STATE_OPEN = 'OPEN';
const STATE_HALF_OPEN = 'HALF_OPEN';

const DEFAULT_OPTIONS = {
  failureThreshold: 5,
  successThreshold: 2,
  openTimeoutMs: 30000,
  halfOpenMaxRequests: 3,
  requestTimeoutMs: 15000,
  cooldownMs: 1000,
};

export class ResilientRpcClient {
  constructor(endpoints, options = {}) {
    this.endpoints = Array.isArray(endpoints) ? endpoints : [endpoints];
    this.opts = { ...DEFAULT_OPTIONS, ...options };

    this._state = STATE_CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._openTimer = null;
    this._pendingRequests = 0;

    this._metrics = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      stateTransitions: 0,
      lastFailureAt: null,
      lastSuccessAt: null,
      avgLatencyMs: 0,
    };

    this._providers = this.endpoints.map((url) => ({
      url,
      provider: new ethers.JsonRpcProvider(url),
      failures: 0,
      successes: 0,
    }));
  }

  get state() {
    return this._state;
  }

  get metrics() {
    return { ...this._metrics };
  }

  getProvider() {
    const active = this._providers.filter((p) => !p.disabled);
    if (active.length === 0) {
      this._providers.forEach((p) => (p.disabled = false));
      return this._providers[0].provider;
    }
    return active[0].provider;
  }

  async request(method, params = []) {
    if (this._state === STATE_OPEN) {
      throw new Error(`Circuit breaker OPEN for ${this.endpoints.join(', ')}`);
    }

    this._metrics.totalRequests++;
    this._pendingRequests++;

    const start = Date.now();

    try {
      const result = await this._executeWithFallback(method, params);
      this._recordSuccess(Date.now() - start);
      return result;
    } catch (error) {
      this._recordFailure();
      throw error;
    } finally {
      this._pendingRequests--;
    }
  }

  async _executeWithFallback(method, params) {
    const fn = async (endpoint) => {
      let provider = this._providers.find((p) => p.url === endpoint)?.provider;
      if (!provider) {
        provider = new ethers.JsonRpcProvider(endpoint);
        this._providers.push({ url: endpoint, provider, failures: 0, successes: 0 });
      }
      return await provider.send(method, params);
    };

    return await rpcFallback(this.endpoints, fn, {
      timeout: this.opts.requestTimeoutMs,
      maxRetries: this.endpoints.length - 1,
    });
  }

  _recordSuccess(_latency) {
    this._metrics.totalSuccesses++;
    this._metrics.lastSuccessAt = Date.now();
    this._metrics.avgLatencyMs = this._metrics.avgLatencyMs
      ? (this._metrics.avgLatencyMs + _latency) / 2
      : _latency;
    this._failureCount = 0;

    const provider = this._providers[0];
    if (provider) provider.successes++;

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

    const provider = this._providers[0];
    if (provider) provider.failures++;

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
      this._openTimer = setTimeout(() => {
        this._transitionTo(STATE_HALF_OPEN);
      }, this.opts.openTimeoutMs);
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
    this._state = STATE_OPEN;
    this._providers.forEach((p) => {
      try {
        p.provider.destroy();
      } catch (e) {}
    });
    this._providers = [];
  }
}
