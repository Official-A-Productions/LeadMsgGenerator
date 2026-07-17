export const ERROR_TYPES = {
  NEXT_KEY: 'NEXT_KEY',         // Try next API key, same provider
  NEXT_PROVIDER: 'NEXT_PROVIDER', // Try next provider entirely
  RETRY_SAME: 'RETRY_SAME',     // Retry same key with backoff
  FATAL: 'FATAL',               // Cannot recover, skip row
};

export const ROW_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
  SKIPPED: 'skipped',
};
