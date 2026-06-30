export class TokenBucket {
  constructor(options = {}) {
    this.capacity = options.capacity || 60;
    this.refillRate = options.refillRate || 1;
    this.refillInterval = options.refillInterval || 1000;
    this.maxBacklog = options.maxBacklog || 10;
    this._tokens = this.capacity;
    this._lastRefill = Date.now();
    this._queue = [];
    this._processing = false;
  }

  get tokens() {
    this._refill();
    return this._tokens;
  }

  _refill() {
    const now = Date.now();
    const elapsed = now - this._lastRefill;
    const refillAmount = (elapsed / this.refillInterval) * this.refillRate;
    if (refillAmount > 0) {
      this._tokens = Math.min(this.capacity, this._tokens + refillAmount);
      this._lastRefill = now;
    }
  }

  async consume(count = 1, timeoutMs = 30000) {
    this._refill();
    if (this._tokens >= count) {
      this._tokens -= count;
      return;
    }
    if (this._queue.length >= this.maxBacklog) {
      throw new Error(`Rate limit backlog full (${this.maxBacklog} queued)`);
    }
    return new Promise((resolve, reject) => {
      const timer = timeoutMs
        ? setTimeout(() => {
            const idx = this._queue.indexOf(entry);
            if (idx !== -1) this._queue.splice(idx, 1);
            reject(new Error('Rate limit wait timeout'));
          }, timeoutMs)
        : null;
      const entry = { count, resolve, reject, timer };
      this._queue.push(entry);
      if (!this._processing) this._drain();
    });
  }

  async _drain() {
    if (this._processing) return;
    this._processing = true;
    try {
      while (this._queue.length > 0) {
        this._refill();
        if (this._tokens <= 0) {
          await new Promise((r) => setTimeout(r, Math.max(10, this.refillInterval)));
          continue;
        }
        const batch = [];
        let needed = 0;
        while (this._queue.length > 0 && needed < this._tokens) {
          const next = this._queue[0];
          if (needed + next.count <= this._tokens) {
            this._queue.shift();
            batch.push(next);
            needed += next.count;
          } else {
            break;
          }
        }
        if (batch.length > 0) {
          this._tokens -= needed;
          for (const item of batch) {
            if (item.timer) clearTimeout(item.timer);
            item.resolve();
          }
        } else {
          // The head request needs more tokens than are currently available
          // (the bucket holds a fractional token). Yield until the next refill
          // instead of busy-spinning the event loop — otherwise a single queued
          // request would block everything while waiting for a whole token.
          await new Promise((r) => setTimeout(r, Math.max(10, this.refillInterval)));
        }
      }
    } finally {
      this._processing = false;
    }
  }

  reset() {
    this._tokens = this.capacity;
    this._lastRefill = Date.now();
  }

  get pending() {
    return this._queue.length;
  }

  get stats() {
    this._refill();
    return {
      tokens: this._tokens,
      capacity: this.capacity,
      pending: this._queue.length,
      refillRate: this.refillRate,
      refillIntervalMs: this.refillInterval,
    };
  }
}

export class MultiBucket {
  constructor(defaultOptions = {}) {
    this._buckets = new Map();
    this._defaults = defaultOptions;
  }

  get(key, options = {}) {
    let bucket = this._buckets.get(key);
    if (!bucket) {
      bucket = new TokenBucket({ ...this._defaults, ...options });
      this._buckets.set(key, bucket);
    }
    return bucket;
  }

  stats() {
    const s = {};
    for (const [key, bucket] of this._buckets) {
      s[key] = bucket.stats;
    }
    return s;
  }

  resetAll() {
    for (const bucket of this._buckets.values()) bucket.reset();
    this._buckets.clear();
  }
}
