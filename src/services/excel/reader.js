import * as XLSX from 'xlsx';
import { detectColumns } from './columnDetector.js';

/**
 * Parse an Excel (.xlsx) or CSV file into structured lead data.
 *
 * @param {File} file
 * @returns {Promise<{ headers: string[], rows: object[], columnMap: object, errors: string[] }>}
 */
export async function parseExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // Convert to array of objects with header row
  const raw = XLSX.utils.sheet_to_json(ws, {
    defval: '',
    raw: false,
  });

  if (!raw.length) {
    return { headers: [], rows: [], columnMap: {}, errors: ['The file appears to be empty.'] };
  }

  const headers = Object.keys(raw[0]);
  const { columnMap, errors } = detectColumns(headers);

  // Filter out completely blank rows
  const rows = raw
    .map((row, idx) => ({
      _rowIndex: idx + 2, // 1-based + header
      ...row,
    }))
    .filter((row) => {
      const values = Object.values(row).filter((v) => v !== '' && v !== null && v !== undefined);
      // Exclude _rowIndex from the check
      return values.length > 1;
    });

  return { headers, rows, columnMap, errors };
}
