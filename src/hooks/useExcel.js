import { useState, useCallback } from 'react';
import { parseExcelFile } from '../services/excel/reader.js';

/**
 * Manages file upload, parsing and column detection state.
 */
export function useExcel() {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [columnMap, setColumnMap] = useState({ businessName: null, phone: null, context: [] });
  const [parseErrors, setParseErrors] = useState([]);
  const [isParsing, setIsParsing] = useState(false);

  const loadFile = useCallback(async (uploadedFile) => {
    if (!uploadedFile) return;

    setIsParsing(true);
    setParseErrors([]);

    try {
      const { headers, rows, columnMap, errors } = await parseExcelFile(uploadedFile);
      setFile(uploadedFile);
      setHeaders(headers);
      setRows(rows);
      setColumnMap(columnMap);
      setParseErrors(errors);
    } catch (err) {
      setParseErrors([`Failed to parse file: ${err.message}`]);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setColumnMap({ businessName: null, phone: null, context: [] });
    setParseErrors([]);
  }, []);

  /**
   * Allow user to manually override detected column assignments.
   */
  const overrideColumnMap = useCallback((patch) => {
    setColumnMap((prev) => ({ ...prev, ...patch }));
  }, []);

  const isReady = !isParsing && rows.length > 0 && parseErrors.length === 0;

  return {
    file,
    headers,
    rows,
    columnMap,
    parseErrors,
    isParsing,
    isReady,
    loadFile,
    reset,
    overrideColumnMap,
  };
}
