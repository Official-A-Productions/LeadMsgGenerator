import { APP_CONFIG } from '../../config/app.js';

/**
 * Retry strategy with exponential backoff.
 * Does NOT retry on 429 (rate limit) or 4xx auth errors — those are handled
 * by key rotation in ProviderManager. Only retries on transient network errors.
 *
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts
 * @param {number[]} delays - Delay in ms per attempt
 * @returns {Promise<any>}
 */
export async function withRetry(fn, maxAttempts = APP_CONFIG.maxRetries, delays = APP_CONFIG.retryDelays) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;

      // Do NOT retry on rate limit or auth errors — let ProviderManager rotate key
      if (status === 429 || status === 401 || status === 403 || status === 400) {
        throw err;
      }

      // For transient errors (5xx, network timeouts), wait and retry
      if (attempt < maxAttempts - 1) {
        const delay = delays[attempt] ?? delays[delays.length - 1];
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
