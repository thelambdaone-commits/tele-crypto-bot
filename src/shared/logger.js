import { existsSync, mkdirSync } from 'fs';
import { appendFile, rename, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, '../../logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

// Keyed RPC/API URLs embed the secret in the query string (Helius `?api-key=…`)
// or the path (Alchemy `/v2/<key>`). Logs must identify the endpoint without
// leaking the key: keep the host, mask long path segments and the whole query.
const URL_IN_STRING = /https?:\/\/[^\s"'<>)\]]+/g;
export function redactUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/[A-Za-z0-9_-]{16,}/g, '***');
    return `${u.origin}${path === '/' ? '' : path}${u.search ? '?***' : ''}`;
  } catch {
    return String(url);
  }
}

// Ensure logs directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log levels with numeric values for filtering
 */
export const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const LEVEL_VALUES = {
  ERROR: 40,
  WARN: 30,
  INFO: 20,
  DEBUG: 10,
};

const DEFAULT_LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
let currentLogLevel = DEFAULT_LOG_LEVEL;

/**
 * Structured logger for AI-assisted debugging
 */
class Logger {
  constructor(logFile = 'bot.log') {
    this.logPath = join(LOG_DIR, logFile);
    this.errorLogPath = join(LOG_DIR, 'errors.log');
    // Serializes file appends so entries stay ordered without blocking the event loop
    this._writeQueue = Promise.resolve();
    this.redactKeys = new Set([
      'privateKey', 'encryptedPrivateKey',
      'seedPhrase', 'mnemonic', 'encryptedMnemonic',
      'secretKey', 'apiKey', 'apiSecret', 'apiPassphrase',
      'passphrase', 'masterKey',
    ]);
  }

  redact(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const key of Object.keys(clone)) {
      if (this.redactKeys.has(key)) {
        clone[key] = '[REDACTED]';
      } else if (typeof clone[key] === 'object' && clone[key] !== null) {
        clone[key] = this.redact(clone[key]);
      } else if (typeof clone[key] === 'string' && clone[key].includes('://')) {
        // Key-name redaction can't catch secrets embedded INSIDE a string
        // value: ethers/fetch error messages routinely quote the full request
        // URL, API key included. Scrub every URL in any logged string.
        clone[key] = clone[key].replace(URL_IN_STRING, (m) => redactUrl(m));
      }
    }
    return clone;
  }

  /**
   * Rotate log file if it exceeds max size (async)
   */
  async rotateIfNeeded(logPath) {
    try {
      const stats = await stat(logPath).catch(() => null);
      if (!stats || stats.size <= MAX_LOG_SIZE) return;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = logPath.replace('.log', `.${timestamp}.log`);
      await rename(logPath, rotatedPath);
    } catch {
      // Silently ignore rotation failures
    }
  }

  /**
   * Format log entry as JSON for easy parsing
   */
  formatEntry(level, message, context = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.redact(context),
    });
  }

  /**
   * Set the minimum log level for console output
   */
  setLevel(level) {
    if (LEVEL_VALUES[level] !== undefined) {
      currentLogLevel = level;
    }
  }

  /**
   * Check if a level should be shown in console output
   */
  _shouldLog(level) {
    return (LEVEL_VALUES[level] || 0) >= (LEVEL_VALUES[currentLogLevel] || 0);
  }

  /**
   * Write log entry
   * File output is always written (unfiltered for debugging).
   * Console output is filtered by LOG_LEVEL.
   */
  write(level, message, context = {}) {
    const entry = this.formatEntry(level, message, context);
    this._append(this.logPath, entry);

    // Also write errors to separate file
    if (level === LogLevel.ERROR) {
      this._append(this.errorLogPath, entry);
    }

    // Console output filtered by LOG_LEVEL
    if (this._shouldLog(level)) {
      const consoleMsg = `[${level}] ${message}`;
      if (level === LogLevel.ERROR) {
        console.error(consoleMsg, context);
      } else if (level === LogLevel.WARN) {
        console.warn(consoleMsg, context);
      } else {
        console.log(consoleMsg);
      }
    }
  }

  /**
   * Queue an async append; rotation runs in-queue so it never races a write.
   * Log-file I/O failures are swallowed — logging must never crash the bot.
   */
  _append(logPath, entry) {
    this._writeQueue = this._writeQueue
      .then(() => this.rotateIfNeeded(logPath))
      .then(() => appendFile(logPath, entry + '\n'))
      .catch(() => {});
  }

  /**
   * Wait for all queued file writes to land (used by tests / shutdown).
   */
  async flush() {
    await this._writeQueue;
  }

  error(message, context = {}) {
    this.write(LogLevel.ERROR, message, context);
  }

  warn(message, context = {}) {
    this.write(LogLevel.WARN, message, context);
  }

  info(message, context = {}) {
    this.write(LogLevel.INFO, message, context);
  }

  debug(message, context = {}) {
    this.write(LogLevel.DEBUG, message, context);
  }

  /**
   * Log bot interaction
   */
  logInteraction(chatId, username, action, details = {}) {
    this.info(`User interaction: ${action}`, {
      chatId,
      username,
      action,
      ...details,
    });
  }

  /**
   * Log error with full context
   */
  logError(error, context = {}) {
    this.error(error.message || String(error), {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    });
  }

  /**
   * Log transaction
   */
  logTransaction(chatId, chain, type, details = {}) {
    this.info(`Transaction: ${type}`, {
      chatId,
      chain,
      type,
      ...details,
    });
  }

  /**
   * Log with standardized context fields
   * Ensures chatId, userId, username, module, action are always present
   */
  logWithContext(level, message, ctx = {}) {
    const { chatId, userId, username, module, action, requestId, ...rest } = ctx;
    this.write(level, message, {
      chatId,
      userId,
      username,
      module: module || 'unknown',
      action: action || 'unknown',
      ...(requestId ? { requestId } : {}),
      ...rest,
    });
  }
}

// Export singleton instance
export const logger = new Logger();
