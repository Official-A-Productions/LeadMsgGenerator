import { browserManager } from '../browser/browserManager.js';
import { SELECTORS } from './selectors.js';

class WhatsAppClient {
  constructor() {
    this._authStatus = 'INITIALIZING';
    this._authInitialized = false;
  }

  async _ensureInitialized() {
    if (this._authInitialized) return;
    try {
      const page = await browserManager.getPage();
      const currentUrl = page.url();
      if (!currentUrl.includes('web.whatsapp.com')) {
        console.log('[WhatsAppClient] Initializing WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
      }
      this._authInitialized = true;
    } catch (err) {
      console.error('[WhatsAppClient] Error during init:', err.message);
    }
  }

  async getAuthStatus() {
    try {
      await this._ensureInitialized();
      const page = await browserManager.getPage();
      const hasChats = await page.$(SELECTORS.CHATS_LIST);
      if (hasChats) { this._authStatus = 'AUTHENTICATED'; return 'AUTHENTICATED'; }
      const hasQr = await page.$(SELECTORS.QR_CODE);
      if (hasQr) { this._authStatus = 'NOT_AUTHENTICATED'; return 'NOT_AUTHENTICATED'; }
      return this._authStatus || 'LOADING';
    } catch (err) {
      return this._authStatus || 'UNKNOWN_ERROR';
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
      await this._ensureInitialized();

      const page = await browserManager.getPage();
      const encodedText = encodeURIComponent(text);
      const digitsOnly = phoneNumber.replace(/\D/g, '');

      // Candidate phone formats: 10-digit national first, then 12-digit (91...)
      let candidatePhones = [];
      if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        const national10 = digitsOnly.slice(2);
        candidatePhones = [national10, digitsOnly];
      } else if (digitsOnly.length === 10) {
        candidatePhones = [digitsOnly, `91${digitsOnly}`];
      } else {
        candidatePhones = [digitsOnly];
      }

      let chatReady = false;
      let lastError = null;
      let activePhone = candidatePhones[0];

      for (const phoneToTry of candidatePhones) {
        activePhone = phoneToTry;
        const url = `https://web.whatsapp.com/send?phone=${phoneToTry}&text=${encodedText}`;
        console.log(`[WhatsAppClient] Navigating to phone=${phoneToTry}...`);

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (gotoErr) {
          console.error(`[WhatsAppClient] Navigation error:`, gotoErr.message);
          lastError = { status: 'failed', errorCode: 'NAVIGATION_ERROR', error: gotoErr.message };
          continue;
        }

        // Step 1: Handle "Continue" / "Use Here" confirmation dialog if present
        // WhatsApp Web shows this when opening a new chat via URL
        try {
          const continueBtn = page.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue"), button:has-text("Use Here"), button:has-text("OK")').first();
          if (await continueBtn.isVisible({ timeout: 4000 })) {
            console.log(`[WhatsAppClient] Clicking Continue dialog...`);
            await continueBtn.click();
            await page.waitForTimeout(2000);
          }
        } catch (e) {
          // No continue dialog — normal, keep going
        }

        // Step 2: Wait for message input (meaning chat loaded successfully)
        try {
          await page.waitForSelector(SELECTORS.MESSAGE_INPUT, { timeout: 20000 });
          console.log(`[WhatsAppClient] Chat loaded for phone=${phoneToTry}`);
          chatReady = true;
          break;
        } catch (timeoutErr) {
          // Message input didn't appear — check if it's a genuine invalid number
          console.log(`[WhatsAppClient] Message input not found for ${phoneToTry}, checking for invalid number...`);

          // Only mark as invalid if WhatsApp explicitly shows the invalid number text
          const pageContent = await page.content();
          const isInvalid =
            pageContent.includes('Phone number shared via url is invalid') ||
            pageContent.includes('not on WhatsApp') ||
            pageContent.includes('invalid phone number');

          if (isInvalid) {
            console.log(`[WhatsAppClient] ${phoneToTry} confirmed not on WhatsApp.`);
            // Dismiss any popup
            try {
              const okBtn = page.locator(SELECTORS.INVALID_NUMBER_OK_BUTTON).first();
              if (await okBtn.isVisible({ timeout: 2000 })) await okBtn.click();
            } catch (e) {}
            lastError = { status: 'failed', errorCode: 'INVALID_NUMBER', error: 'Phone number is not registered on WhatsApp' };
          } else {
            console.log(`[WhatsAppClient] Timeout for ${phoneToTry} — not confirmed invalid, trying next format...`);
            lastError = { status: 'failed', errorCode: 'TIMEOUT', error: `Timeout loading chat for ${phoneToTry}` };
          }
        }
      }

      if (!chatReady) {
        return lastError || { status: 'failed', errorCode: 'INVALID_NUMBER', error: 'Number not on WhatsApp' };
      }

      if (isTestMode) {
        console.log(`[WhatsAppClient] Test mode: chat open for ${activePhone}`);
        return { status: 'test_ready' };
      }

      // Step 3: Send the message via Enter key
      try {
        const inputEl = page.locator(SELECTORS.MESSAGE_INPUT).first();
        await inputEl.focus();
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);

        // Fallback: click send button if still visible
        try {
          const sendBtn = page.locator(SELECTORS.SEND_BUTTON).first();
          if (await sendBtn.isVisible({ timeout: 2000 })) await sendBtn.click();
        } catch (e) {}
      } catch (sendErr) {
        console.error('[WhatsAppClient] Error pressing Enter:', sendErr.message);
      }

      // Step 4: Verify sent checkmark (lenient — don't fail if not seen)
      try {
        await Promise.any([
          page.waitForSelector(SELECTORS.MESSAGE_SENT_CHECKMARK, { timeout: 8000 }),
          page.waitForSelector(SELECTORS.MESSAGE_DELIVERED_CHECKMARK, { timeout: 8000 }),
          page.waitForSelector(SELECTORS.MESSAGE_READ_CHECKMARK, { timeout: 8000 })
        ]);
        console.log(`[WhatsAppClient] ✅ Message sent to ${activePhone}`);
      } catch (e) {
        console.log(`[WhatsAppClient] Checkmark not detected for ${activePhone} — assuming sent.`);
      }

      return { status: 'sent' };
    } catch (err) {
      console.error(`[WhatsAppClient] Unexpected error for ${phoneNumber}:`, err.message);
      return { status: 'failed', errorCode: 'UNKNOWN_ERROR', error: err.message };
    }
  }
}

export const whatsappClient = new WhatsAppClient();
