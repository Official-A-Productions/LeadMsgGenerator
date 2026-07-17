/**
 * Dynamic prompt builder.
 * Builds system and user prompts from an arbitrary lead row object.
 * Never hardcodes field names — everything is derived from the row data.
 */

const WORD_COUNTS = {
  short: '40–60',
  medium: '60–100',
  long: '100–140',
};

const CTA_INSTRUCTIONS = {
  soft: 'End with a very soft, non-pushy call to action (e.g., "Would love to connect if this is relevant").',
  medium: 'End with a clear call to action inviting a conversation.',
  strong: 'End with a direct, confident call to action asking for a meeting or reply.',
};

const TONE_INSTRUCTIONS = {
  professional: 'Use a professional, business-to-business tone.',
  friendly: 'Use a warm, approachable and conversational tone.',
  luxury: 'Use an exclusive, high-end, luxury tone that signals premium value.',
  premium: 'Use a polished, premium tone that conveys quality and sophistication.',
  minimal: 'Use a minimal, direct, no-fluff tone. Short sentences, maximum clarity.',
};

const LANGUAGE_INSTRUCTIONS = {
  english: 'Write entirely in English.',
  hindi: 'Write entirely in Hindi (Devanagari script).',
  hinglish: 'Write in Hinglish (a natural mix of Hindi and English, as used in casual Indian business conversations).',
};

/**
 * Build system and user prompts for a single lead row.
 *
 * @param {object} row - Raw row object with arbitrary keys
 * @param {string} businessNameCol - The header key for Business Name
 * @param {string} phoneCol - The header key for Phone
 * @param {object} settings - { language, tone, length, emoji, cta }
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildPrompt(row, businessNameCol, phoneCol, settings) {
  const {
    language = 'english',
    tone = 'professional',
    length = 'medium',
    emoji = false,
    cta = 'soft',
  } = settings;

  const businessName = row[businessNameCol] || 'Unknown Business';

  // Build context from ALL non-empty columns except Business Name and Phone
  const contextLines = [];
  for (const [key, value] of Object.entries(row)) {
    if (key === '_rowIndex') continue;
    if (key === businessNameCol) continue;
    if (key === phoneCol) continue;
    if (value === '' || value === null || value === undefined) continue;
    contextLines.push(`${key}: ${value}`);
  }

  const contextBlock = contextLines.length > 0
    ? contextLines.join('\n')
    : 'No additional context available.';

  const wordCount = WORD_COUNTS[length] || '60–100';
  const emojiInstruction = emoji
    ? 'You may use 1–2 relevant emojis sparingly.'
    : 'Do NOT use any emojis.';

  const systemPrompt = `You are an expert sales copywriter specializing in personalized cold outreach for WhatsApp.

Rules:
- Sound human, natural, and authentic
- No AI-sounding phrases or robotic language
- No fake compliments or hollow openers
- No hallucinations — only use information provided
- GREETING RULE: Never use email addresses (like "Hi gg@gmail.com"), websites, phone numbers, or IDs to greet the recipient.
- If a person's name (e.g. Owner, Contact Name, First Name) is provided in the context, greet them by their first name (e.g. "Hi [Name],").
- If no person's name is available, address the business name directly (e.g. "Hi [Business Name] team," or "Hi [Business Name],") or simply start with "Hi there,".
- Mention one relevant business pain point specific to their industry
- Mention one concrete improvement or opportunity
- ${CTA_INSTRUCTIONS[cta] || CTA_INSTRUCTIONS.soft}
- ${TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional}
- ${LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.english}
- ${wordCount} words total
- ${emojiInstruction}
- Avoid spam trigger words
- Do not start with placeholder names or generic brackets (e.g. "[Name]") in the final message
- You must return ONLY valid JSON in this exact format, no markdown, no explanation:
{"businessType":"","message":""}`;

  const userPrompt = `Business Name: ${businessName}

Additional Context:
${contextBlock}

Task:
1. Determine the most likely Business Type for this business (e.g., "Restaurant", "Retail Store", "IT Services", "Real Estate Agency", etc.). If you cannot determine it, use "Business".
2. Generate one personalized WhatsApp outreach message following all the rules above.

Return ONLY the JSON object.`;

  return { systemPrompt, userPrompt };
}
