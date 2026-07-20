import { browserManager } from '../browser/browserManager.js';
import { SELECTORS } from './selectors.js';

class WhatsAppClient {
  constructor() {
    // Cached auth state so we don't navigate on every poll
    this._authStatus = 'INITIALIZING';
    this._authInitialized = false;
    this._initPromise = null;
  }

  /**
   * Initialize the browser and navigate to WhatsApp Web exactly ONCE.
   * Subsequent calls return immediately.
   */
  async _ensureInitialized() {
    if (this._authInitialized) return;
    // Prevent concurrent init calls
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      try {
        const page = await browserManager.getPage();
        await page.goto('https://web.whatsapp.com', { waitUntil: 'domcontentloaded' });
        // Give the page time to load JS and render
        await page.waitForTimeout(3000);

        // Determine initial auth state
        const result = await Promise.any([
          page.waitForSelector(SELECTORS.QR_CODE, { timeout: 30000 }).then(() => 'NOT_AUTHENTICATED'),
          page.waitForSelector(SELECTORS.CHATS_LIST, { timeout: 30000 }).then(() => 'AUTHENTICATED')
        ]).catch(() => 'LOADING');

        this._authStatus = result;
        this._authInitialized = true;

        // If not yet authenticated, watch for the chat list to appear (QR scan)
        if (result === 'NOT_AUTHENTICATED' || result === 'LOADING') {
          this._watchForAuth(page);
        }
      } catch (err) {
        console.error('Error during WhatsApp init:', err.message);
        this._authStatus = 'UNKNOWN_ERROR';
        this._authInitialized = true; // Mark done so we don't loop
      } finally {
        this._initPromise = null;
      }
    })();

    return this._initPromise;
  }

  /**
   * After QR is shown, watch for the chat list to appear (user scanned QR).
   * Updates cached status without navigating.
   */
  async _watchForAuth(page) {
    try {
      await page.waitForSelector(SELECTORS.CHATS_LIST, { timeout: 300000 }); // Wait up to 5 minutes
      this._authStatus = 'AUTHENTICATED';
      console.log('WhatsApp authenticated successfully!');
    } catch (err) {
      console.log('Auth watch timed out — user did not scan QR within 5 minutes.');
    }
  }

  /**
   * Returns cached auth status. Does NOT navigate the browser.
   */
  async getAuthStatus() {
    // Start init in background if not done yet (non-blocking for first call)
    if (!this._authInitialized && !this._initPromise) {
      this._ensureInitialized(); // fire-and-forget
    }
    return this._authStatus;
  }

  async testMode(phoneNumber, text) {
    return this._processMessage(phoneNumber, text, true);
  }

  async sendMessage(phoneNumber, text) {
    return this._processMessage(phoneNumber, text, false);
  }

  async _processMessage(phoneNumber, text, isTestMode) {
    try {
      // Ensure authenticated before sending
      await this._ensureInitialized();
      if (this._authStatus !== 'AUTHENTICATED') {
        return { status: 'failed', errorCode: 'NOT_AUTHENTICATED', error: 'WhatsApp is not authenticated. Please scan the QR code.' };
      }

      const page = await browserManager.getPage();
      
      // Navigate to the direct send URL
      const encodedText = encodeURIComponent(text);
      const cleanPhone = phoneNumber.replace('+', '');
      const url = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
      
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Wait for the message input to appear, or an invalid number dialog
      try {
        const result = await Promise.any([
          page.waitForSelector(SELECTORS.MESSAGE_INPUT, { timeout: 20000 }).then(() => 'READY'),
          page.waitForSelector(SELECTORS.INVALID_NUMBER_DIALOG, { timeout: 20000 }).then(() => 'INVALID')
        ]);

        if (result === 'INVALID') {
          return { status: 'failed', errorCode: 'INVALID_NUMBER', error: 'Number not on WhatsApp or invalid' };
        }
      } catch (e) {
        return { status: 'failed', errorCode: 'TIMEOUT', error: 'Timeout waiting for chat to load' };
      }

      if (isTestMode) {
        return { status: 'test_ready' }; // Stop here in test mode
      }

      // Find and click the send button
      await page.waitForSelector(SELECTORS.SEND_BUTTON, { timeout: 5000 });
      await page.click(SELECTORS.SEND_BUTTON);

      // Wait for a sent/delivered/read checkmark on the last message
      try {
        await Promise.any([
          page.waitForSelector(SELECTORS.MESSAGE_SENT_CHECKMARK, { timeout: 15000 }),
          page.waitForSelector(SELECTORS.MESSAGE_DELIVERED_CHECKMARK, { timeout: 15000 }),
          page.waitForSelector(SELECTORS.MESSAGE_READ_CHECKMARK, { timeout: 15000 })
        ]);
      } catch (e) {
        return { status: 'failed', errorCode: 'SEND_CONFIRMATION_TIMEOUT', error: 'Message sent but confirmation checkmark not seen' };
      }

      return { status: 'sent' };
    } catch (err) {
      console.error(`Error sending message to ${phoneNumber}:`, err);
      return { status: 'failed', errorCode: 'UNKNOWN_ERROR', error: err.message };
    }
  }
}

export const whatsappClient = new WhatsAppClient();
