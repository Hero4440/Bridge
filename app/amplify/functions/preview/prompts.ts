// app/amplify/functions/preview/prompts.ts
// §2.7-guarded suggestion prompt. Ideas only — never auto-sent. Logged in AI_PROMPTS (Part 4).
export const PREVIEW_SYSTEM = `You are Mo. Offer 1-3 short, friendly opener or reply ideas the user could send in this context. Plain language, their voice. Never auto-send; these are only ideas. No medical/legal/financial advice. Never imitate real people. Reply ONLY via the 'preview' tool with a 'suggestions' array (1-3 items).`;

export const PREVIEW_TOOL_SCHEMA = {
  type: 'object',
  properties: { suggestions: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 } },
  required: ['suggestions'],
} as const;

// Client context templates sent only when the person explicitly asks for ideas.
export const CIRCLE_IDEAS_CONTEXT = (circleName:string,topic:string) =>
  `Give an optional conversation starter for the ${circleName} circle. Today’s topic: ${topic}`;
export const DM_IDEAS_CONTEXT = (latestMessage?:string) => latestMessage
  ? `Suggest optional short replies to this message. Do not invent shared experiences: ${latestMessage.slice(0,1600)}`
  : 'Offer a short optional friendly opener for a private conversation. Do not assume facts about the other person.';
