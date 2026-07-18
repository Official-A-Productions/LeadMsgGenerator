import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export function normalizePhone(phoneStr, defaultCountry = 'IN') {
  if (!phoneStr) return { valid: false, error: 'Empty phone number' };

  try {
    // Basic cleanup: remove extra spaces, dashes, etc
    let cleanStr = phoneStr.trim();
    
    // Parse the number
    const phoneNumber = parsePhoneNumber(cleanStr, defaultCountry);
    
    if (phoneNumber && phoneNumber.isValid()) {
      return {
        valid: true,
        normalized: phoneNumber.format('E.164') // Returns like +919876543210
      };
    }
    
    return { valid: false, error: 'Invalid phone number format' };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
