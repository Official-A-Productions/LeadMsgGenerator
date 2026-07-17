/**
 * Default message generation settings.
 */
export const DEFAULT_MESSAGE_SETTINGS = {
  language: 'english',
  tone: 'professional',
  length: 'medium',
  emoji: false,
  cta: 'soft',
};

export const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'hinglish', label: 'Hinglish' },
];

export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'premium', label: 'Premium' },
  { value: 'minimal', label: 'Minimal' },
];

export const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (40–60 words)' },
  { value: 'medium', label: 'Medium (60–100 words)' },
  { value: 'long', label: 'Long (100–140 words)' },
];

export const CTA_OPTIONS = [
  { value: 'soft', label: 'Soft' },
  { value: 'medium', label: 'Medium' },
  { value: 'strong', label: 'Strong' },
];
