import axios from 'axios';
import { BaseAIProvider, parseAIResponse } from '../interface.js';
import { PROVIDER_URLS } from '../../../config/app.js';
import { APP_CONFIG } from '../../../config/app.js';

export class GroqProvider extends BaseAIProvider {
  constructor() {
    super('groq');
  }

  async generateMessage(systemPrompt, userPrompt, apiKey, model = 'llama3-8b-8192') {
    const response = await axios.post(
      `${PROVIDER_URLS.groq}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: APP_CONFIG.requestTimeout,
      }
    );

    const text = response.data.choices?.[0]?.message?.content || '';
    return parseAIResponse(text);
  }

  async testKey(apiKey) {
    const response = await axios.get(`${PROVIDER_URLS.groq}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });
    return response.status === 200;
  }
}
