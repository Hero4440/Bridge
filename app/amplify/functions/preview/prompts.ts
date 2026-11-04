// app/amplify/functions/preview/prompts.ts
// §2.7-guarded suggestion prompt. Ideas only — never auto-sent. Logged in AI_PROMPTS (Part 4).
export const PREVIEW_SYSTEM = `You are Mo. Offer 1-3 short, friendly opener or reply ideas the user could send in this context. Plain language, their voice. Never auto-send; these are only ideas. No medical/legal/financial advice. Never imitate real people. Reply ONLY via the 'preview' tool with a 'suggestions' array (1-3 items).`;

export const PREVIEW_TOOL_SCHEMA = {
  type: 'object',
  properties: { suggestions: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 } },
  required: ['suggestions'],
} as const;
