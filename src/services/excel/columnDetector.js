import { BUSINESS_NAME_ALIASES, PHONE_ALIASES } from '../../constants/columns.js';
import { normalizeHeader } from '../../utils/format.js';

/**
 * Detect required and optional columns from a list of headers.
 *
 * @param {string[]} headers - Raw column headers from the Excel file
 * @returns {{ columnMap: object, errors: string[] }}
 *   columnMap: { businessName: string|null, phone: string|null, context: string[] }
 *   errors: validation messages if required columns are missing
 */
export function detectColumns(headers) {
  let businessNameCol = null;
  let phoneCol = null;
  const contextCols = [];
  const errors = [];

  for (const header of headers) {
    const normalized = normalizeHeader(header);

    if (!businessNameCol && BUSINESS_NAME_ALIASES.has(normalized)) {
      businessNameCol = header;
    } else if (!phoneCol && PHONE_ALIASES.has(normalized)) {
      phoneCol = header;
    } else {
      contextCols.push(header);
    }
  }

  if (!businessNameCol) {
    errors.push(
      'Could not find a "Business Name" column. Expected column names: Business Name, Company, Name, Store Name, Brand, etc.'
    );
  }

  if (!phoneCol) {
    errors.push(
      'Could not find a "Phone Number" column. Expected column names: Phone, Mobile, WhatsApp Number, Contact Number, etc.'
    );
  }

  return {
    columnMap: {
      businessName: businessNameCol,
      phone: phoneCol,
      context: contextCols,
    },
    errors,
  };
}
