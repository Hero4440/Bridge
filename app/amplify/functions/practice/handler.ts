// app/amplify/functions/practice/handler.ts
// Full guarded turn: validate → classify(input) → rate-limit → Sonnet Converse → classify(output)
// → save PracticeRun (feedback only, no message text) → reply. Crisis stops the role-play with 988 and is NEVER
// rate-limited (D-02/D-04). Warm fallback on model failure (D-03 / AI-07).
import { practiceInput, practiceOutput } from '../shared/schemas';
import { classify } from '../shared/classify';
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '../shared/rateLimit';
import { converseWithTool } from '../shared/bedrock';
import { FALLBACKS } from '../shared/fallback';
import { logTurn } from '../shared/log';
import { PRACTICE_MODEL_ID } from '../../shared/config';
import { PRACTICE_SYSTEM, PRACTICE_TOOL_SCHEMA, SCENARIOS } from './prompts';
// D-04: persist PracticeRun via the runtime Data client. `$amplify/env/practice` resolves only
// after deploy (generated into .amplify/) — isolated here; verified live in Plan 05.
import { env } from '$amplify/env/practice';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const dataClient = generateClient<Schema>();

type PracticeArgs = { scenarioId: keyof typeof SCENARIOS; level: number; goal: string; message: string };

export const handler = async (event: { arguments: PracticeArgs; identity?: { sub?: string } }) => {
  const started = Date.now();
  const userId = event.identity?.sub ?? 'anon';
  const parsed = practiceInput.safeParse(event.arguments);
  if (!parsed.success) return { ...FALLBACKS.practice, fallback: true };
  const { scenarioId, level, goal, message } = parsed.data;

  // 1. classify input — crisis stops the role-play and skips the rate limiter
  const inLabel = await classify(message);
  if (inLabel.label === 'crisis') {
    logTurn({ fn: 'practice', scenario: scenarioId, level, latencyMs: Date.now() - started, labels: ['crisis'], fallback: false });
    return {
      partnerReply: 'I want to pause here. You deserve support right now — you can call or text 988, and reach out to your trusted person.',
      strength: 'You spoke up about something hard.',
      tip: 'Talk to someone you trust today.',
      fallback: false,
      crisis: true,
    };
  }

  // 2. rate limit (non-crisis only)
  const rl = await checkRateLimit(userId);
  if (!rl.allowed) {
    logTurn({ fn: 'practice', scenario: scenarioId, level, latencyMs: Date.now() - started, labels: [inLabel.label], fallback: true });
    return { partnerReply: RATE_LIMIT_MESSAGE, strength: '', tip: '', fallback: true, rateLimited: true };
  }

  // 3. model
  const res = await converseWithTool({
    modelId: PRACTICE_MODEL_ID,
    system: PRACTICE_SYSTEM(SCENARIOS[scenarioId], level as 1 | 2 | 3, goal),
    message,
    toolName: 'feedback',
    inputSchema: PRACTICE_TOOL_SCHEMA as unknown as Record<string, unknown>,
    validator: practiceOutput,
    timeoutMs: 15000, // Sonnet feedback can take >5s; fallback is the safety net, not the norm
  });
  const reply = res.ok ? res.value : FALLBACKS.practice;

  // 4. classify output (the model's own reply) before returning
  const outLabel = await classify(reply.partnerReply);

  // 5. persist PracticeRun — feedback only (D-04 / §2.8): scenario, level, and the combined
  // strength+tip; never the user message or the partner reply (no raw conversation stored).
  try {
    await dataClient.models.PracticeRun.create({ scenarioId, level, feedback: `${reply.strength} — ${reply.tip}` });
  } catch {
    // persistence must never break the practice response; the turn still returns feedback
    logTurn({ fn: 'practice', scenario: scenarioId, level, latencyMs: Date.now() - started, labels: ['persist-error'], fallback: !res.ok });
  }
  logTurn({ fn: 'practice', scenario: scenarioId, level, latencyMs: Date.now() - started, labels: [inLabel.label, outLabel.label], fallback: !res.ok });
  return { ...reply, fallback: !res.ok };
};
