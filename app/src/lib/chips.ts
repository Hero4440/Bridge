// app/src/lib/chips.ts
// Starter-chip suggestions for circle chat (CHAT-06). Reuses the Phase 2 previewReplies Lambda to
// turn a chip into 1-3 draft messages. Suggestions are EDITABLE and NEVER auto-sent (§2.3): this
// helper returns drafts only and does not send anything — the composer and send are the user's.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type ChipKind = 'ask' | 'share' | 'own';

export async function suggestForChip(
  chip: ChipKind,
  circleName: string,
  topic?: string,
): Promise<{ suggestions: string[]; fallback: boolean }> {
  // "Write my own" opens a blank composer — no AI call.
  if (chip === 'own') return { suggestions: [], fallback: false };

  const intent = chip === 'ask' ? 'ask a friendly question' : 'share something of my own';
  const context = `In the ${circleName} circle${topic ? ` (today's topic: ${topic})` : ''}, help me ${intent}.`;
  const { data, errors } = await client.queries.previewReplies({ context });
  if (errors?.length) throw new Error(`suggestForChip failed: ${JSON.stringify(errors)}`);
  const suggestions = (data?.suggestions ?? []).filter((s): s is string => Boolean(s));
  return { suggestions, fallback: data?.fallback ?? false };
}
