import pLimit from 'p-limit';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from '../../config/app.js';
import { buildPrompt } from '../prompt/builder.js';
import { ROW_STATUS } from '../../constants/providers.js';
import { sleep } from '../ai/retryStrategy.js';

// Minimum gap between requests (ms). Free-tier Gemini = 15 req/min → 4s per request.
const REQUEST_GAP_MS = 4000;

// On a 429, wait this long before continuing to the next row.
const RATE_LIMIT_BACKOFF_MS = 65000;

/**
 * Batch processor — processes all leads with concurrency control.
 *
 * @param {object} params
 * @param {object[]} params.rows - Parsed lead rows
 * @param {string} params.businessNameCol - Column key for Business Name
 * @param {string} params.phoneCol - Column key for Phone
 * @param {object} params.settings - Message generation settings
 * @param {import('../ai/ProviderManager').ProviderManager} params.providerManager
 * @param {Function} params.onRowUpdate - Called on each row state change: (rowResult) => void
 * @param {Function} params.onProgress - Called with progress stats: (stats) => void
 * @param {AbortSignal} params.signal - AbortController signal for cancel/pause
 * @returns {Promise<object[]>} Final array of row results
 */
export async function processBatch({
  rows,
  businessNameCol,
  phoneCol,
  settings,
  providerManager,
  onRowUpdate,
  onProgress,
  signal,
}) {
  const limit = pLimit(APP_CONFIG.concurrency);
  const total = rows.length;
  let done = 0;
  let failed = 0;
  const startTime = Date.now();

  // Initialize result array
  const results = rows.map((row) => ({
    id: uuidv4(),
    rowIndex: row._rowIndex,
    businessName: row[businessNameCol] || '',
    phone: row[phoneCol] || '',
    businessType: '',
    message: '',
    status: ROW_STATUS.PENDING,
    error: null,
    _originalRow: row,
  }));

  // Emit initial state
  results.forEach((r) => onRowUpdate({ ...r }));

  const emitProgress = () => {
    onProgress({
      total,
      done,
      failed,
      remaining: total - done,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
      elapsedMs: Date.now() - startTime,
      providerLabel: providerManager.statusLabel,
    });
  };

  emitProgress();

  const tasks = results.map((result, i) =>
    limit(async () => {
      // Check cancellation
      if (signal?.aborted) {
        result.status = ROW_STATUS.SKIPPED;
        result.error = 'Cancelled';
        onRowUpdate({ ...result });
        return result;
      }

      // Skip rows with no business name
      if (!result.businessName.trim()) {
        result.status = ROW_STATUS.SKIPPED;
        result.error = 'Missing business name';
        done++;
        onRowUpdate({ ...result });
        emitProgress();
        return result;
      }

      result.status = ROW_STATUS.PROCESSING;
      onRowUpdate({ ...result });

      try {
        const { systemPrompt, userPrompt } = buildPrompt(
          rows[i],
          businessNameCol,
          phoneCol,
          settings
        );

        const generated = await providerManager.generateMessage(systemPrompt, userPrompt);

        result.status = ROW_STATUS.SUCCESS;
        result.businessType = generated.businessType;
        result.message = generated.message;
        result.error = null;
      } catch (err) {
        const is429 = err?.response?.status === 429;
        result.status = ROW_STATUS.ERROR;
        result.error = is429
          ? 'Rate limited (429) — waiting 65s before next request'
          : (err.message || 'Unknown error');
        failed++;

        if (is429) {
          // Update UI immediately so user sees what's happening
          onRowUpdate({ ...result });
          emitProgress();
          // Wait a full minute before the next request
          await sleep(RATE_LIMIT_BACKOFF_MS);
          return result;
        }
      }

      done++;
      onRowUpdate({ ...result });
      emitProgress();

      // Pace requests to stay within 15 req/min
      await sleep(REQUEST_GAP_MS);

      return result;
    })
  );

  await Promise.allSettled(tasks);
  return results;
}

/**
 * Re-generate a single row using the provider manager.
 */
export async function regenerateRow({ row, businessNameCol, phoneCol, settings, providerManager }) {
  const { systemPrompt, userPrompt } = buildPrompt(
    row._originalRow,
    businessNameCol,
    phoneCol,
    settings
  );
  return providerManager.generateMessage(systemPrompt, userPrompt);
}
