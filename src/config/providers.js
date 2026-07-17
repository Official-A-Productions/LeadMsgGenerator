import { PROVIDER_URLS } from './app.js';

/**
 * AI provider definitions with their capabilities and configuration.
 * Only Gemini and Groq are supported.
 */
export const PROVIDER_DEFINITIONS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    priority: 1,
    baseUrl: PROVIDER_URLS.gemini,
    defaultModel: 'gemini-1.5-flash',
    models: [
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-pro',
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    priority: 2,
    baseUrl: PROVIDER_URLS.groq,
    defaultModel: 'llama-3.1-8b-instant',
    models: [
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
  },
];
