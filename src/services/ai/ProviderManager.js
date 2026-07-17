import { GeminiProvider } from './providers/gemini.js';
import { GroqProvider } from './providers/groq.js';
import { withRetry } from './retryStrategy.js';
import { PROVIDER_DEFINITIONS } from '../../config/providers.js';

const PROVIDER_INSTANCES = {
  gemini: new GeminiProvider(),
  groq: new GroqProvider(),
};

export class ProviderManager {
  /**
   * @param {object} config
   * @param {'gemini'|'groq'} config.activeProviderId
   * @param {string[]} config.apiKeys - Ordered list of keys for the active provider
   * @param {string} [config.model] - Model override
   * @param {Function} [config.onKeyChange] - Called when key rotation happens: (keyIndex) => void
   */
  constructor({ activeProviderId, apiKeys, model, onKeyChange }) {
    this.activeProviderId = activeProviderId;
    this.apiKeys = apiKeys || [];
    this.model = model;
    this.onKeyChange = onKeyChange || (() => {});
    this.currentKeyIndex = 0;

    const def = PROVIDER_DEFINITIONS.find((p) => p.id === activeProviderId);
    this.providerDef = def;
    this.instance = PROVIDER_INSTANCES[activeProviderId];

    if (!this.instance) {
      throw new Error(`Unknown provider: ${activeProviderId}`);
    }
  }

  /**
   * Generate a message with automatic key rotation on failure.
   * Tries each key up to maxRetries times before moving to the next key.
   *
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @returns {Promise<{ businessType: string, message: string, keyIndex: number }>}
   */
  async generateMessage(systemPrompt, userPrompt) {
    if (this.apiKeys.length === 0) {
      throw new Error(`No API keys configured for ${this.activeProviderId}.`);
    }

    const model = this.model || this.providerDef?.defaultModel;
    const startIndex = this.currentKeyIndex;
    const total = this.apiKeys.length;

    for (let offset = 0; offset < total; offset++) {
      const keyIndex = (startIndex + offset) % total;
      const apiKey = this.apiKeys[keyIndex];

      try {
        const result = await withRetry(
          () => this.instance.generateMessage(systemPrompt, userPrompt, apiKey, model),
          3,
          [2000, 4000, 8000]
        );

        // Success — persist this key as the current one
        this.currentKeyIndex = keyIndex;
        this.onKeyChange(keyIndex);
        return { ...result, keyIndex };
      } catch (err) {
        const is429 = err?.response?.status === 429;
        const isAuthErr =
          err?.response?.status === 401 || err?.response?.status === 403;

        // Only rotate key on rate-limit or auth failures
        if (is429 || isAuthErr) {
          // Try next key
          continue;
        }

        // Network / timeout → retry on same key (already handled by withRetry above)
        // If withRetry exhausted, try next key anyway
        continue;
      }
    }

    // All keys exhausted
    throw new Error(
      `All ${total} API key(s) for ${this.activeProviderId} failed. Please check your keys or quota.`
    );
  }

  /**
   * Test a specific API key.
   * @param {string} apiKey
   * @returns {Promise<boolean>}
   */
  async testKey(apiKey) {
    return this.instance.testKey(apiKey);
  }

  /** @returns {string} Human-readable current status */
  get statusLabel() {
    const providerName = this.providerDef?.name || this.activeProviderId;
    const keyNum = this.currentKeyIndex + 1;
    const total = this.apiKeys.length;
    return `${providerName} — Key ${keyNum}/${total}`;
  }
}
