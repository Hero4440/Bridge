// app/amplify/functions/shared/schemas.ts
// zod input + Bedrock-output schemas for every AI function (LAMBDA-06, BEDROCK-05).
import { z } from 'zod';

export const SCENARIOS = ['join', 'left-on-read', 'cancel', 'leave', 'repair', 'invite', 'disagree'] as const;

const practiceBaseInput = z.object({
  scenarioId: z.enum(SCENARIOS),
  level: z.number().int().min(1).max(3),
  goal: z.string().min(1).max(300),
  personalContext: z.string().max(1600).optional(),
});
export const practiceInput = z.discriminatedUnion('mode', [
  practiceBaseInput.extend({ mode: z.literal('start') }),
  practiceBaseInput.extend({
    mode: z.literal('turn'),
    message: z.string().min(1).max(1000),
    history: z.string().min(1).max(3600),
  }),
  practiceBaseInput.extend({
    mode: z.literal('finish'),
    history: z.string().min(1).max(3600),
  }),
]);
export const practicePartnerOutput = z.object({
  partnerReply: z.string().min(1),
  replyOptions: z.array(z.string()).min(1).max(3).default([]),
  hint: z.string().default(''),
});
export const practiceOutput = z.object({
  partnerReply: z.string().min(1),
  strength: z.string().min(1),
  tip: z.string().min(1),
  memory: z.string().min(1).max(500),
});

export const classifyInput = z.object({ text: z.string().min(1).max(2000) });
export const classifyOutput = z.object({
  label: z.enum(['crisis', 'money', 'address', 'unsafe', 'bias', 'safe']),
  confidence: z.number().min(0).max(1),
});

export const toneInput = z.object({
  text: z.string().min(1).max(1000),
  personalContext: z.string().max(1600).optional(),
});
export const toneOutput = z.object({ gentle: z.string().min(1), flaggedWords: z.array(z.string()) });

export const previewInput = z.object({ context: z.string().min(1).max(2000) });
export const previewOutput = z.object({ suggestions: z.array(z.string().min(1)).min(1).max(3) });
