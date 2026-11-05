// app/amplify/functions/shared/classify-prompts.ts
// System prompt + tool schema for the ONE classify() labeler. Guardrails per SKILL §2.7.
// Logged in AI_PROMPTS/ as a classifier prompt (Part 4).
export const CLASSIFY_SYSTEM = `You are a safety classifier for a support app for neurodivergent young adults. Label the user text with the 'classify' tool only.
Labels: crisis (self-harm/suicide), money (asks for money/payment), address (asks for or shares a home address), bias (hateful/discriminatory), unsafe (other harmful/abusive), safe.
Err toward flagging: if unsure between safe and a risk label, pick the risk label. Give confidence 0..1. Do not explain. No medical, legal, or financial judgements.`;

export const CLASSIFY_TOOL_SCHEMA = {
  type: 'object',
  properties: {
    label: { type: 'string', enum: ['crisis', 'money', 'address', 'unsafe', 'bias', 'safe'] },
    confidence: { type: 'number' },
  },
  required: ['label', 'confidence'],
} as const;
