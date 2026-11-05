// app/src/lib/messages.ts
// Circle chat data layer (CHAT-01/02/04/07). Sends messages and live-subscribes to a circle via
// the Data client's observeQuery (a managed AppSync subscription — push-based, not request loops,
// with auto-reconnect). observeQuery has no server-side sort/limit, so the newest-50 window (CHAT-07) is enforced
// client-side by the pure `lastN` helper (unit-tested).
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export type MessageRecord = Schema["Message"]["type"];

export async function sendMessage(input: {
  groupId: string;
  content: string;
  senderId: string;
}): Promise<MessageRecord> {
  const { data: result, errors } = await client.mutations.communityAction({
    action: "send-circle",
    targetId: input.groupId,
    text: input.content,
    clientMessageId: crypto.randomUUID(),
  });
  if (errors?.length || !result?.ok || !result.messageId)
    throw new Error(result?.reason || "The message could not be sent");
  const row = await client.models.Message.get({ id: result.messageId });
  if (row.errors?.length || !row.data)
    throw new Error("The sent message could not be loaded");
  return row.data;
}

// Pure: return at most the newest `n` items (by keyFn) in ASCENDING order for display.
export function lastN<T>(
  items: readonly T[],
  n: number,
  keyFn: (item: T) => number,
): T[] {
  return [...items]
    .sort((a, b) => keyFn(b) - keyFn(a)) // newest first
    .slice(0, n) // cap to the newest n
    .reverse(); // back to ascending (oldest→newest) for the chat view
}

// Live-subscribe to one circle's messages. Returns the subscription; the caller must unsubscribe.
export function observeMessages(
  groupId: string,
  onItems: (items: MessageRecord[]) => void,
  onError?: (error: unknown) => void,
) {
  return client.models.Message.observeQuery({
    filter: { groupId: { eq: groupId } },
  }).subscribe({
    next: ({ items }) => onItems(lastN(items, 50, (m) => m.createdAtMs ?? 0)),
    error: (error) => onError?.(error),
  });
}
