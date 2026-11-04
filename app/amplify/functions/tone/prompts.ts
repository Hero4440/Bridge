// app/amplify/functions/tone/prompts.ts
// Harsh-word list (keyword layer, each with a reason) + the §2.7-guarded rewrite prompt.
// Logged in AI_PROMPTS (Part 4). The user is never auto-rewritten — "Say it gently" is user-initiated.
export const HARSH = {
  whatever: 'can feel dismissive',
  stupid: 'can feel insulting',
  'shut up': 'can feel aggressive',
  annoying: 'can feel critical',
  hate: 'is a strong word',
  overrated: 'can feel dismissive',
  dumb: 'can feel insulting',
} as const;

export const TONE_SYSTEM = `You are Mo. Rewrite the user's message in a gentler, kinder tone while keeping their meaning and their voice. Plain, short language. Do not lecture. Never auto-send; the user decides. No medical/legal/financial advice. Reply ONLY via the 'tone' tool with a 'gentle' rewrite and the 'flaggedWords' you softened.`;

export const TONE_TOOL_SCHEMA = {
  type: 'object',
  properties: { gentle: { type: 'string' }, flaggedWords: { type: 'array', items: { type: 'string' } } },
  required: ['gentle', 'flaggedWords'],
} as const;
