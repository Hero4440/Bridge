// app/amplify/functions/preview/handler.ts
// Returns 1-3 short Mo reply ideas. Validates input, rate-limits non-crisis turns, falls back
// warmly on timeout (AI-07), and returns promptly so Phase 6's loading copy has a responsive
// endpoint (AI-08). Logs labels only.
import { previewInput, previewOutput } from '../shared/schemas';
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '../shared/rateLimit';
import { converseWithTool } from '../shared/bedrock';
import { FALLBACKS } from '../shared/fallback';
import { logTurn } from '../shared/log';
import { CLASSIFY_MODEL_ID } from '../../shared/config';
import { PREVIEW_SYSTEM, PREVIEW_TOOL_SCHEMA } from './prompts';

export const handler = async (event: { arguments: { context: string }; identity?: { sub?: string } }) => {
  const started = Date.now();
  const userId = event.identity?.sub ?? 'anon';
  const parsed = previewInput.safeParse(event.arguments);
  if (!parsed.success) return { ...FALLBACKS.preview, fallback: true };

  const rl = await checkRateLimit(userId);
  if (!rl.allowed) return { suggestions: [RATE_LIMIT_MESSAGE], fallback: true, rateLimited: true };

  const res = await converseWithTool({
    modelId: CLASSIFY_MODEL_ID, // Haiku-class
    system: PREVIEW_SYSTEM,
    message: parsed.data.context,
    toolName: 'preview',
    inputSchema: PREVIEW_TOOL_SCHEMA as unknown as Record<string, unknown>,
    validator: previewOutput,
  });
  logTurn({ fn: 'preview', latencyMs: Date.now() - started, labels: ['preview'], fallback: !res.ok });
  if (!res.ok) return { ...FALLBACKS.preview, fallback: true };
  return { suggestions: res.value.suggestions, fallback: false };
};
