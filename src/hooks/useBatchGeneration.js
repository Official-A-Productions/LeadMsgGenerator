import { useState, useCallback, useRef } from 'react';
import { ProviderManager } from '../services/ai/ProviderManager.js';
import { processBatch, regenerateRow } from '../services/generation/batchProcessor.js';
import { ROW_STATUS } from '../constants/providers.js';

const IDLE = 'idle';
const RUNNING = 'running';
const DONE = 'done';
const ERROR = 'error';

/**
 * Orchestrates the batch generation process.
 * Exposes results, progress stats, and controls (start/pause/cancel/regenerate).
 */
export function useBatchGeneration() {
  const [state, setState] = useState(IDLE);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({
    total: 0,
    done: 0,
    failed: 0,
    remaining: 0,
    percent: 0,
    elapsedMs: 0,
    providerLabel: '',
  });
  const [batchError, setBatchError] = useState(null);

  const abortControllerRef = useRef(null);
  const managerRef = useRef(null);

  const updateRow = useCallback((updatedRow) => {
    setResults((prev) =>
      prev.map((r) => (r.id === updatedRow.id ? updatedRow : r))
    );
  }, []);

  /**
   * Start a new batch.
   * @param {object} params - { rows, businessNameCol, phoneCol, settings, activeProviderId, apiKeys, model }
   */
  const start = useCallback(async ({ rows, businessNameCol, phoneCol, settings, activeProviderId, apiKeys, model }) => {
    if (apiKeys.length === 0) {
      setBatchError(`No API keys configured. Please add keys in Settings.`);
      setState(ERROR);
      return;
    }

    setBatchError(null);
    setState(RUNNING);
    setResults([]);

    abortControllerRef.current = new AbortController();

    managerRef.current = new ProviderManager({
      activeProviderId,
      apiKeys,
      model,
      onKeyChange: () => {}, // Progress panel reads from manager directly
    });

    try {
      const finalResults = await processBatch({
        rows,
        businessNameCol,
        phoneCol,
        settings,
        providerManager: managerRef.current,
        onRowUpdate: updateRow,
        onProgress: setProgress,
        signal: abortControllerRef.current.signal,
      });

      setResults(finalResults);
      setState(DONE);
    } catch (err) {
      setBatchError(err.message);
      setState(ERROR);
    }
  }, [updateRow]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(DONE);
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(IDLE);
    setResults([]);
    setProgress({ total: 0, done: 0, failed: 0, remaining: 0, percent: 0, elapsedMs: 0, providerLabel: '' });
    setBatchError(null);
  }, []);

  /**
   * Regenerate a single row in-place.
   * @param {string} rowId
   * @param {object} params - { businessNameCol, phoneCol, settings }
   */
  const regenerate = useCallback(async (rowId, { businessNameCol, phoneCol, settings }) => {
    if (!managerRef.current) return;

    setResults((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, status: ROW_STATUS.PROCESSING, error: null } : r
      )
    );

    try {
      const row = results.find((r) => r.id === rowId);
      if (!row) return;

      const generated = await regenerateRow({
        row,
        businessNameCol,
        phoneCol,
        settings,
        providerManager: managerRef.current,
      });

      setResults((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? { ...r, status: ROW_STATUS.SUCCESS, businessType: generated.businessType, message: generated.message, error: null }
            : r
        )
      );
    } catch (err) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === rowId ? { ...r, status: ROW_STATUS.ERROR, error: err.message } : r
        )
      );
    }
  }, [results]);

  /**
   * Manually edit a row's message.
   */
  const editRow = useCallback((rowId, patch) => {
    setResults((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r))
    );
  }, []);

  const successResults = results.filter((r) => r.status === ROW_STATUS.SUCCESS);

  return {
    state,
    results,
    successResults,
    progress,
    batchError,
    isIdle: state === IDLE,
    isRunning: state === RUNNING,
    isDone: state === DONE,
    isError: state === ERROR,
    start,
    cancel,
    reset,
    regenerate,
    editRow,
  };
}
