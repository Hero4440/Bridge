// app/src/lib/dm.ts
// Direct-message client layer. DMs reuse the Phase 4 Message real-time path via a deterministic,
// symmetric thread key, and go through the server-side sendDm/respondToRequest mutations (which
// hold non-contact first messages, flag unsafe ones, and stop on crisis). Pure helpers (threadId,
// isUnsafeLabel) are unit-tested.
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { observePrivateThread, type DirectMessage } from "./community";

const client = generateClient<Schema>();

// Deterministic + symmetric: A→B and B→A map to the same thread.
export function threadId(a: string, b: string): string {
  if (!a || !b) throw new Error("threadId requires two user ids");
  return `dm#${[a, b].sort().join("#")}`;
}

export function isUnsafeLabel(label: string): boolean {
  return ["money", "address", "unsafe", "crisis"].includes(label);
}

export type SendDmResult = {
  delivered: boolean;
  held: boolean;
  unsafe: boolean;
  crisis: boolean;
  reason?: string;
};

export async function sendDm(
  toUserId: string,
  text: string,
  clientMessageId?: string,
): Promise<SendDmResult> {
  const { data, errors } = await client.mutations.sendDm({
    toUserId,
    text,
    clientMessageId,
  });
  if (errors?.length)
    throw new Error(`sendDm failed: ${JSON.stringify(errors)}`);
  return {
    reason: data?.reason ?? "",
    delivered: data?.delivered ?? false,
    held: data?.held ?? false,
    unsafe: data?.unsafe ?? false,
    crisis: data?.crisis ?? false,
  };
}

export async function respondToRequest(
  requestId: string,
  accept: boolean,
): Promise<{ ok: boolean; accepted: boolean; reason: string }> {
  const { data, errors } = await client.mutations.respondToRequest({
    requestId,
    accept,
  });
  if (errors?.length)
    throw new Error(`respondToRequest failed: ${JSON.stringify(errors)}`);
  return {
    ok: data?.ok ?? false,
    accepted: data?.accepted ?? false,
    reason: data?.reason ?? "",
  };
}

export async function listRequests(myUserId: string) {
  const { data, errors } = await client.models.MessageRequest.list({
    filter: { toUserId: { eq: myUserId }, status: { eq: "pending" } },
  });
  if (errors?.length)
    throw new Error(`listRequests failed: ${JSON.stringify(errors)}`);
  return data;
}

// Live-subscribe to a DM thread, reusing the Phase 4 Message subscription (no new code).
export function observeThread(
  a: string,
  b: string,
  onItems: (items: DirectMessage[]) => void,
  onError?: (e: unknown) => void,
) {
  return observePrivateThread(threadId(a, b), onItems, onError);
}
