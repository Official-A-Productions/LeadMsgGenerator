/**
 * Base class for AI providers. All providers must extend this.
 */
export class BaseAIProvider {
  /** @param {string} id - Provider identifier */
  constructor(id) {
    this.id = id;
  }

  /**
   * Generate a message for a lead.
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @param {string} apiKey
   * @param {string} [model]
   * @returns {Promise<{ businessType: string, message: string }>}
   */
  async generateMessage(_systemPrompt, _userPrompt, _apiKey, _model) {
    throw new Error(`Provider ${this.id} has not implemented generateMessage()`);
  }

  /**
   * Test if an API key is valid.
   * @param {string} apiKey
   * @returns {Promise<boolean>}
   */
  async testKey(_apiKey) {
    throw new Error(`Provider ${this.id} has not implemented testKey()`);
  }
}

/**
 * Parse the JSON response from AI.
 * Handles markdown code blocks and raw JSON.
 * @param {string} text
 * @returns {{ businessType: string, message: string }}
 */
export function parseAIResponse(text) {
  // Strip markdown code fences if present
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(clean);
    return {
      businessType: String(parsed.businessType || 'Business').trim(),
      message: String(parsed.message || '').trim(),
    };
  } catch {
    throw new Error(`Failed to parse AI JSON response: ${clean.slice(0, 200)}`);
  }
}
