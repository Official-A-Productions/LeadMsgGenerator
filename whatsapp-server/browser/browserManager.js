import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data', 'browser-profile');

// Lock files Chrome leaves behind when it crashes or is killed
const LOCK_FILES = [
  path.join(DATA_DIR, 'SingletonLock'),
  path.join(DATA_DIR, 'SingletonCookie'),
  path.join(DATA_DIR, 'SingletonSocket'),
];

function cleanLockFiles() {
  for (const f of LOCK_FILES) {
    try {
      if (fs.existsSync(f)) {
        fs.rmSync(f, { force: true });
        console.log(`[BrowserManager] Removed stale lock file: ${f}`);
      }
    } catch (e) {
      // Ignore errors
    }
  }
}

class BrowserManager {
  constructor() {
    this.context = null;
    this.page = null;
    this._initPromise = null;
  }

  async init() {
    if (this.context) return;
    // Prevent concurrent init calls
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      try {
        // Clean up any stale Chrome lock files from a crashed/killed previous instance
        cleanLockFiles();

        console.log('[BrowserManager] Launching Chromium...');
        this.context = await chromium.launchPersistentContext(DATA_DIR, {
          headless: false,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ]
        });

        const pages = this.context.pages();
        this.page = pages.length > 0 ? pages[0] : await this.context.newPage();

        // If browser closes unexpectedly, reset so next getPage() re-launches
        this.context.on('close', () => {
          console.log('[BrowserManager] Browser context closed. Will re-launch on next request.');
          this.context = null;
          this.page = null;
          this._initPromise = null;
        });

        console.log('[BrowserManager] Chromium launched successfully.');
      } catch (err) {
        console.error('[BrowserManager] Failed to launch browser:', err.message);
        this.context = null;
        this.page = null;
        this._initPromise = null;
        throw err;
      } finally {
        this._initPromise = null;
      }
    })();

    return this._initPromise;
  }

  async getPage() {
    if (!this.context) await this.init();
    return this.page;
  }

  async close() {
    if (this.context) {
      await this.context.close();
      this.context = null;
      this.page = null;
    }
  }
}

export const browserManager = new BrowserManager();
