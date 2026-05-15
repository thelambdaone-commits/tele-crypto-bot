/**
 * In-memory session store using LRU-like eviction
 */
export class MemoryStore {
  constructor(maxSize = 1000) {
    this.sessions = new Map();
    this.maxSize = maxSize;
  }

  get(chatId) {
    const session = this.sessions.get(chatId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  set(chatId, data) {
    if (this.sessions.size >= this.maxSize && !this.sessions.has(chatId)) {
      this._evictOldest();
    }
    this.sessions.set(chatId, {
      ...data,
      lastActivity: Date.now(),
    });
  }

  delete(chatId) {
    this.sessions.delete(chatId);
  }

  keys() {
    return Array.from(this.sessions.keys());
  }

  clear() {
    this.sessions.clear();
  }

  _evictOldest() {
    const sorted = [...this.sessions.entries()].sort(
      (a, b) => a[1].lastActivity - b[1].lastActivity
    );
    const oldest = sorted[0];
    if (oldest) {
      this.sessions.delete(oldest[0]);
    }
  }

  getAll() {
    return Object.fromEntries(this.sessions);
  }

  loadAll(data) {
    this.sessions = new Map(Object.entries(data));
  }
}
