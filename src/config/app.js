/**
 * Central application configuration.
 * All environment-specific values live here.
 * Never hardcode URLs, ports, or keys anywhere else.
 */

export const APP_CONFIG = {
  name: 'AI Lead Message Generator',
  version: '1.0.0',

  /** Max concurrent AI requests — keep at 1 for free-tier API keys (15 req/min limit) */
  concurrency: 1,

  /** Retry attempts per key — keep low to avoid compounding 429s */
  maxRetries: 1,

  /** Backoff delay in ms before retry */
  retryDelays: [5000],

  /** Request timeout in ms */
  requestTimeout: 30000,

  /** localStorage namespace */
  storagePrefix: 'ailmg_',
};

/**
 * AI Provider base URLs.
 * Override via VITE_ environment variables for custom deployments.
 */
export const PROVIDER_URLS = {
  gemini: import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com',
  groq: import.meta.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
};
