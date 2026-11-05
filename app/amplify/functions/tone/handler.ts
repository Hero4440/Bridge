// app/amplify/functions/tone/handler.ts
// Keyword-first tone check: flag harsh words deterministically (with a reason), rate-limit
// non-crisis turns, then call the Haiku rewrite. Warm fallback on timeout (AI-07). Logs labels only.
import { toneInput, toneOutput } from '../shared/schemas';
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '../shared/rateLimit';
import { converseWithTool } from '../shared/bedrock';
import { FALLBACKS } from '../shared/fallback';
import { logTurn } from '../shared/log';
import { CLASSIFY_MODEL_ID } from '../../shared/config';
import { withPersonalContext } from '../shared/context';
import { HARSH, TONE_SYSTEM, TONE_TOOL_SCHEMA } from './prompts';

export const handler = async (event: { arguments: { text: string; personalContext?: string }; identity?: { sub?: string } }) => {
  const started = Date.now();
  const userId = event.identity?.sub ?? 'anon';
  const parsed = toneInput.safeParse(event.arguments);
  if (!parsed.success) return { ...FALLBACKS.tone, fallback: true };
  const { text, personalContext } = parsed.data;

  // keyword layer first — deterministic harsh-word flags with a per-word reason
  const flaggedWords = Object.entries(HARSH)
    .filter(([w]) => new RegExp(`\\b${w}\\b`, 'i').test(text))
    .map(([w, reason]) => `${w} (${reason})`);

  const rl = await checkRateLimit(userId);
  if (!rl.allowed) return { gentle: RATE_LIMIT_MESSAGE, flaggedWords, fallback: true, rateLimited: true };

  const res = await converseWithTool({
    modelId: CLASSIFY_MODEL_ID, // Haiku-class
    system: TONE_SYSTEM,
    message: withPersonalContext(text, personalContext),
    toolName: 'tone',
    inputSchema: TONE_TOOL_SCHEMA as unknown as Record<string, unknown>,
    validator: toneOutput,
  });
  logTurn({ fn: 'tone', latencyMs: Date.now() - started, labels: flaggedWords.length ? ['harsh'] : ['clean'], fallback: !res.ok });
  if (!res.ok) return { ...FALLBACKS.tone, flaggedWords, fallback: true };
  return { gentle: res.value.gentle, flaggedWords, fallback: false };
};
