export class RequestCache {
  constructor(options = {}) {
    this._ttlMs = options.ttlMs || 5000;
    this._cache = new Map();
    this._inFlight = new Map();
  }

  _key(method, args) {
    return `${method}:${JSON.stringify(args)}`;
  }

  async dedup(method, args, fetcher) {
    const key = this._key(method, args);
    const existing = this._inFlight.get(key);
    if (existing) return existing;
    const promise = fetcher().finally(() => {
      if (this._inFlight.get(key) === promise) {
        this._inFlight.delete(key);
      }
    });
    this._inFlight.set(key, promise);
    return promise;
  }

  async get(method, args, fetcher, ttlMs) {
    const key = this._key(method, args);
    const ttl = ttlMs ?? this._ttlMs;
    const cached = this._cache.get(key);
    if (cached && Date.now() - cached.ts < ttl) {
      return cached.value;
    }
    return this.dedup(method, args, async () => {
      const value = await fetcher();
      this._cache.set(key, { value, ts: Date.now() });
      return value;
    });
  }

  invalidate(method, args) {
    const key = this._key(method, args);
    this._cache.delete(key);
  }

  invalidateAll() {
    this._cache.clear();
  }

  get size() {
    return this._cache.size + this._inFlight.size;
  }
}
