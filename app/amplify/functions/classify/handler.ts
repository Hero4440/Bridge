// app/amplify/functions/classify/handler.ts
// zod-validated wrapper around the shared classify() labeler. Invalid input never throws —
// it returns the safer 'unsafe' fallback. Logs labels only (SKILL §2.8).
import { classifyInput } from '../shared/schemas';
import { classify } from '../shared/classify';
import { FALLBACKS } from '../shared/fallback';
import { logTurn } from '../shared/log';

export const handler = async (event: { arguments: { text: string }; request?: unknown }) => {
  const started = Date.now();
  const parsed = classifyInput.safeParse(event.arguments);
  if (!parsed.success) return { ...FALLBACKS.classify, fallback: true }; // safer default, no throw
  const res = await classify(parsed.data.text);
  logTurn({ fn: 'classify', latencyMs: Date.now() - started, labels: [res.label], fallback: res.fallback });
  return res;
};
