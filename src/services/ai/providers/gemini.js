import axios from 'axios';
import { BaseAIProvider, parseAIResponse } from '../interface.js';
import { PROVIDER_URLS } from '../../../config/app.js';
import { APP_CONFIG } from '../../../config/app.js';

export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super('gemini');
  }

  async generateMessage(systemPrompt, userPrompt, apiKey, model = 'gemini-1.5-flash') {
    const url = `${PROVIDER_URLS.gemini}/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let response;
    try {
      response = await axios.post(
        url,
        {
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: APP_CONFIG.requestTimeout,
        }
      );
    } catch (err) {
      const status = err?.response?.status;
      const errData = err?.response?.data?.error;

      if (status === 429) {
        const reason = errData?.message || '';
        const isQuotaExhausted = reason.toLowerCase().includes('quota') ||
          reason.toLowerCase().includes('limit');
        const msg = isQuotaExhausted
          ? `Daily quota exhausted for model "${model}". Free tier resets at midnight Pacific Time. Switch to Groq, add more keys, or wait until tomorrow.`
          : `Rate limited (429). Too many requests. Wait a minute and try again.`;
        throw Object.assign(new Error(msg), { response: err.response });
      }

      if (status === 404) {
        throw Object.assign(
          new Error(`Model "${model}" not found. Go to Settings and switch to "gemini-1.5-flash".`),
          { response: err.response }
        );
      }

      throw err;
    }

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseAIResponse(text);
  }

  async testKey(apiKey) {
    const url = `${PROVIDER_URLS.gemini}/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url, { timeout: 10000 });
    return response.status === 200;
  }
}
