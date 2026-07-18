import { browserManager } from '../browser/browserManager.js';
import { SELECTORS } from './selectors.js';

class WhatsAppClient {
  async getAuthStatus() {
    try {
      const page = await browserManager.getPage();
      await page.goto('https://web.whatsapp.com', { waitUntil: 'domcontentloaded' });
      
      // Wait for either QR code or Chat list to appear
      const result = await Promise.race([
        page.waitForSelector(SELECTORS.QR_CODE, { timeout: 15000 }).then(() => 'NOT_AUTHENTICATED'),
        page.waitForSelector(SELECTORS.CHATS_LIST, { timeout: 15000 }).then(() => 'AUTHENTICATED')
      ]);
      
      return result;
    } catch (err) {
      console.error('Error checking auth status:', err);
      return 'UNKNOWN_ERROR';
    }
  }

  async testMode(phoneNumber, text) {
    return this._processMessage(phoneNumber, text, true);
  }

  async sendMessage(phoneNumber, text) {
    return this._processMessage(phoneNumber, text, false);
  }

  async _processMessage(phoneNumber, text, isTestMode) {
    try {
      const page = await browserManager.getPage();
      
      // Navigate to the direct send URL
      const encodedText = encodeURIComponent(text);
      // phoneNumber should be in format e.g., 919876543210 (no + sign for the URL)
      const cleanPhone = phoneNumber.replace('+', '');
      const url = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
      
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Wait for the message input to appear, or an invalid number dialog
      try {
        const result = await Promise.race([
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
      // This confirms the message actually went through
      try {
        await Promise.race([
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
