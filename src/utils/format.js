/**
 * Mask an API key for display — shows first 6 and last 4 chars.
 * @param {string} key
 * @returns {string}
 */
export function maskApiKey(key) {
  if (!key || key.length < 12) return '••••••••••••';
  return key.slice(0, 6) + '••••••••' + key.slice(-4);
}

/**
 * Format a phone number for display (leaves it as-is, just trims).
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  return String(phone).trim();
}

/**
 * Format milliseconds to a human-readable duration string.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (ms < 1000) return 'less than a second';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return `${m}m ${rem}s`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m`;
}

/**
 * Estimate remaining time based on elapsed and progress.
 * @param {number} done
 * @param {number} total
 * @param {number} elapsedMs
 * @returns {string}
 */
export function estimateRemaining(done, total, elapsedMs) {
  if (done === 0 || total === 0) return '—';
  const msPerRow = elapsedMs / done;
  const remaining = (total - done) * msPerRow;
  return formatDuration(remaining);
}

/**
 * Normalize a column header for comparison (lowercase, strip spaces/underscores).
 * @param {string} header
 * @returns {string}
 */
export function normalizeHeader(header) {
  return String(header).toLowerCase().replace(/[\s_-]+/g, ' ').trim();
}
