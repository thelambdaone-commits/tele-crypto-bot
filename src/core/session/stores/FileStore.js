import { promises as fs } from 'fs';
import { join } from 'path';
import { logger } from '../../../shared/logger.js';

/**
 * File-based session store for persistence across restarts
 */
export class FileStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async save(data) {
    try {
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(this.filePath, json, 'utf8');
      logger.debug('Sessions saved to file', { path: this.filePath, count: Object.keys(data).length });
    } catch (error) {
      logger.logError(error, { context: 'FileStore.save', path: this.filePath });
    }
  }

  async load() {
    try {
      const exists = await fs.access(this.filePath).then(() => true).catch(() => false);
      if (!exists) return {};

      const json = await fs.readFile(this.filePath, 'utf8');
      const data = JSON.parse(json);
      logger.info('Sessions loaded from file', { path: this.filePath, count: Object.keys(data).length });
      return data;
    } catch (error) {
      logger.logError(error, { context: 'FileStore.load', path: this.filePath });
      return {};
    }
  }
}
