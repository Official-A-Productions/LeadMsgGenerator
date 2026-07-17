/**
 * Column alias maps for auto-detection.
 * Keys are canonical names, values are accepted variants (all lowercase).
 */

export const BUSINESS_NAME_ALIASES = new Set([
  'business name',
  'businessname',
  'business_name',
  'company',
  'company name',
  'companyname',
  'company_name',
  'name',
  'store name',
  'storename',
  'shop name',
  'shopname',
  'brand',
  'brand name',
  'brandname',
  'organization',
  'organisation',
  'outlet',
  'outlet name',
]);

export const PHONE_ALIASES = new Set([
  'phone',
  'phone number',
  'phonenumber',
  'phone_number',
  'mobile',
  'mobile number',
  'mobilenumber',
  'mobile_number',
  'whatsapp',
  'whatsapp number',
  'whatsappnumber',
  'whatsapp_number',
  'contact',
  'contact number',
  'contactnumber',
  'contact_number',
  'number',
  'cell',
  'cell number',
  'cellnumber',
  'telephone',
  'tel',
]);

/** Columns that are always excluded from AI context */
export const EXCLUDED_FROM_CONTEXT = new Set([
  'businessname',
  'phonenumber',
]);
