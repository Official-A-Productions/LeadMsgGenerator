import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Normalizes any phone number into E.164 format (+919876543210).
 * Prevents double country-code bugs (e.g. 91919876543210).
 */
export function normalizePhone(phoneStr, defaultCountry = 'IN') {
  if (!phoneStr) return { valid: false, error: 'Empty phone number' };

  try {
    // 1. Remove all non-digits except leading '+'
    let raw = String(phoneStr).trim();
    const hasPlus = raw.startsWith('+');
    let digits = raw.replace(/\D/g, ''); // digits only

    if (!digits) return { valid: false, error: 'No digits in phone number' };

    // 2. Pre-process Indian phone numbers (default country IN)
    if (defaultCountry === 'IN' || !hasPlus) {
      // If 12 digits starting with '91', user provided country code without '+'
      if (digits.length === 12 && digits.startsWith('91')) {
        digits = digits.slice(2); // extract 10-digit national number
      }
      // If 11 digits starting with '0', remove leading zero
      else if (digits.length === 11 && digits.startsWith('0')) {
        digits = digits.slice(1);
      }

      // If we now have a standard 10-digit Indian mobile number
      if (digits.length === 10) {
        raw = `+91${digits}`;
      } else if (hasPlus) {
        raw = `+${digits}`;
      } else {
        raw = digits;
      }
    } else {
      raw = hasPlus ? `+${digits}` : digits;
    }

    // 3. Parse with libphonenumber-js
    const phoneNumber = parsePhoneNumber(raw, defaultCountry);

    if (phoneNumber && phoneNumber.isValid()) {
      return {
        valid: true,
        normalized: phoneNumber.format('E.164') // Returns like +919870555330
      };
    }

    // Fallback: If libphonenumber fails but we have a valid 10-digit number for IN
    if (digits.length === 10) {
      return {
        valid: true,
        normalized: `+91${digits}`
      };
    }

    return { valid: false, error: `Invalid phone number format (${phoneStr})` };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
