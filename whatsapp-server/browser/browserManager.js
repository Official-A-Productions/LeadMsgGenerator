import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data', 'browser-profile');

class BrowserManager {
  constructor() {
    this.context = null;
    this.page = null;
  }

  async init() {
    if (this.context) return;
    
    this.context = await chromium.launchPersistentContext(DATA_DIR, {
      headless: false, // WhatsApp Web requires a visible browser or QR scan becomes tricky/blocked sometimes. Can be true if strictly needed, but let's default to false for scanning QR code easily.
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    // Get the first default page
    const pages = this.context.pages();
    this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
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
