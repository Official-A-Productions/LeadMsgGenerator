import { ERROR_TYPES } from '../constants/providers.js';

/**
 * Classifies an error into an action type for the ProviderManager.
 *
 * @param {Error|AxiosError} error
 * @returns {'NEXT_KEY'|'NEXT_PROVIDER'|'RETRY_SAME'|'FATAL'}
 */
export function classifyError(error) {
  const status = error?.response?.status;
  const message = (error?.message || '').toLowerCase();
  const data = error?.response?.data || {};
  const dataStr = JSON.stringify(data).toLowerCase();

  // Rate limit → try next key
  if (status === 429) return ERROR_TYPES.NEXT_KEY;

  // Auth/billing failures → try next key (key may be invalid/over quota)
  if (status === 401 || status === 403) return ERROR_TYPES.NEXT_KEY;

  // Payment required → try next key
  if (status === 402) return ERROR_TYPES.NEXT_KEY;

  // Quota / billing strings
  if (
    dataStr.includes('quota') ||
    dataStr.includes('billing') ||
    dataStr.includes('exceeded') ||
    dataStr.includes('limit') ||
    dataStr.includes('insufficient_quota')
  ) {
    return ERROR_TYPES.NEXT_KEY;
  }

  // Invalid key
  if (
    dataStr.includes('invalid api key') ||
    dataStr.includes('invalid_api_key') ||
    dataStr.includes('incorrect api key')
  ) {
    return ERROR_TYPES.NEXT_KEY;
  }

  // Provider service error → try next provider (or rotate keys)
  if (status === 503 || status === 502 || status === 504) {
    return ERROR_TYPES.NEXT_PROVIDER;
  }

  // Network errors → retry same key
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('enotfound') ||
    error?.code === 'ECONNABORTED' ||
    !status
  ) {
    return ERROR_TYPES.RETRY_SAME;
  }

  // Bad request (malformed prompt, etc.) → fatal for this row
  if (status === 400) return ERROR_TYPES.FATAL;

  // Unknown → try next key
  return ERROR_TYPES.NEXT_KEY;
}
