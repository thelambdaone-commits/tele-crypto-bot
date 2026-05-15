import { logger } from '../logger.js';

const DEFAULT_OPTIONS = {
  checkIntervalMs: 60000,
  maxSamples: 50,
  errorWeight: 3,
  latencyWeight: 1,
  healthyThreshold: 0.7,
};

export class RpcHealthMonitor {
  constructor(options = {}) {
    this.opts = { ...DEFAULT_OPTIONS, ...options };
    this.endpoints = new Map();
    this._interval = null;
  }

  register(url, metadata = {}) {
    if (this.endpoints.has(url)) return;
    this.endpoints.set(url, {
      url,
      ...metadata,
      samples: [],
      consecutiveFailures: 0,
      totalRequests: 0,
      totalErrors: 0,
      lastChecked: null,
      isHealthy: true,
      disabled: false,
    });
  }

  recordSuccess(url, latencyMs) {
    const ep = this.endpoints.get(url);
    if (!ep) return;
    ep.samples.push({ success: true, latencyMs, time: Date.now() });
    if (ep.samples.length > this.opts.maxSamples) ep.samples.shift();
    ep.consecutiveFailures = 0;
    ep.totalRequests++;
    ep.lastChecked = Date.now();
    ep.isHealthy = true;
    ep.disabled = false;
  }

  recordError(url) {
    const ep = this.endpoints.get(url);
    if (!ep) return;
    ep.samples.push({ success: false, latencyMs: 0, time: Date.now() });
    if (ep.samples.length > this.opts.maxSamples) ep.samples.shift();
    ep.consecutiveFailures++;
    ep.totalRequests++;
    ep.totalErrors++;
    ep.lastChecked = Date.now();

    if (ep.consecutiveFailures >= 5) {
      ep.isHealthy = false;
      logger.warn('RPC endpoint marked unhealthy', { url, consecutiveFailures: ep.consecutiveFailures });
    }
  }

  getScore(url) {
    const ep = this.endpoints.get(url);
    if (!ep) return 0;
    if (ep.samples.length === 0) return 0.5;

    const recent = ep.samples.slice(-20);
    const successRate = recent.filter((s) => s.success).length / recent.length;
    const avgLatency = recent.filter((s) => s.success).reduce((sum, s) => sum + s.latencyMs, 0) /
      Math.max(1, recent.filter((s) => s.success).length);

    const latencyScore = Math.max(0, 1 - avgLatency / 5000);
    const errorScore = successRate;
    return errorScore * this.opts.errorWeight + latencyScore * this.opts.latencyWeight;
  }

  getSortedEndpoints() {
    return Array.from(this.endpoints.values())
      .filter((ep) => !ep.disabled)
      .sort((a, b) => this.getScore(b.url) - this.getScore(a.url))
      .map((ep) => ep.url);
  }

  getStats() {
    return Array.from(this.endpoints.values()).map((ep) => ({
      url: ep.url,
      isHealthy: ep.isHealthy,
      disabled: ep.disabled,
      score: this.getScore(ep.url),
      totalRequests: ep.totalRequests,
      totalErrors: ep.totalErrors,
      consecutiveFailures: ep.consecutiveFailures,
      samples: ep.samples.length,
    }));
  }

  enable(url) {
    const ep = this.endpoints.get(url);
    if (ep) {
      ep.disabled = false;
      ep.isHealthy = true;
    }
  }

  disable(url) {
    const ep = this.endpoints.get(url);
    if (ep) ep.disabled = true;
  }

  reset(url) {
    const ep = this.endpoints.get(url);
    if (ep) {
      ep.samples = [];
      ep.consecutiveFailures = 0;
      ep.isHealthy = true;
      ep.disabled = false;
    }
  }

  startAutoCheck(pingFn) {
    this.stop();
    this._interval = setInterval(async () => {
      for (const [url, ep] of this.endpoints) {
        if (ep.disabled) continue;
        try {
          const start = Date.now();
          await pingFn(url);
          this.recordSuccess(url, Date.now() - start);
        } catch {
          this.recordError(url);
        }
      }
    }, this.opts.checkIntervalMs);
    this._interval.unref();
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
}
