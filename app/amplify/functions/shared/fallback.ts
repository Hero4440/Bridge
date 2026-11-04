// app/amplify/functions/shared/fallback.ts
// Short, warm, feature-specific scripted replies used when Bedrock throttles/times out
// (D-03 / AI-07). Never a raw error. classify leans to the safer 'unsafe' label.
export const FALLBACKS = {
  practice: {
    partnerReply: 'Thanks for telling me.',
    strength: 'You showed up and gave it a try — that matters.',
    tip: "When you're ready, try one short sentence about how you feel.",
  },
  tone: {
    gentle: "Here's a softer way: try leading with how you feel.",
    flaggedWords: [] as string[],
  },
  preview: {
    suggestions: ['Hi! Mind if I join?', 'Hey, this looks fun — can I say hi?'],
  },
  classify: { label: 'unsafe' as const, confidence: 0.5 },
} as const;
