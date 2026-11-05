// app/src/lib/reflection.ts
// Owner-only reflection save (feeling + wins — NO transcript, §2.8) plus a warm Mo reply that
// degrades to a safe constant when Bedrock is unavailable (D-03). The real reply source
// (the reflectReply query from Plan 04) is injected as replyFn, so this lib stays decoupled
// and the fallback branch is pure-testable.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type Feeling = 'hard' | 'okay' | 'good';
export type ReflectionRecord = Schema['Reflection']['type'];
export type ReplyFn = (input: { feeling: Feeling; wins: string[] }) => Promise<string>;

export const REFLECTION_FALLBACK =
  "Thanks for sharing how that went — showing up and reflecting is real progress. I'm proud of you.";

// Pure reply resolution: uses the injected reply source if present, warm fallback otherwise.
export async function resolveReply(
  input: { feeling: Feeling; wins: string[] },
  replyFn?: ReplyFn,
): Promise<{ reply: string; fallback: boolean }> {
  if (!replyFn) return { reply: REFLECTION_FALLBACK, fallback: true };
  try {
    const reply = await replyFn(input);
    return reply && reply.trim() ? { reply, fallback: false } : { reply: REFLECTION_FALLBACK, fallback: true };
  } catch {
    return { reply: REFLECTION_FALLBACK, fallback: true };
  }
}

export async function saveReflection(
  input: { feeling: Feeling; wins: string[]; eventId?: string },
  replyFn?: ReplyFn,
): Promise<{ reflection: ReflectionRecord; reply: string; fallback: boolean }> {
  // Persist owner-only {feeling, wins} — never a transcript (§2.8). Save first so a reply
  // failure never loses the reflection (D-03).
  const { data, errors } = await client.models.Reflection.create({
    feeling: input.feeling,
    wins: input.wins,
    ...(input.eventId ? { eventId: input.eventId } : {}),
  });
  if (errors?.length) throw new Error(`saveReflection failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('saveReflection returned no data');

  const { reply, fallback } = await resolveReply({ feeling: input.feeling, wins: input.wins }, replyFn);
  return { reflection: data, reply, fallback };
}
