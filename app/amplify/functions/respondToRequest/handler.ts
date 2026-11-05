// Only the recipient may respond. Stable contact/message IDs make accepting a request safe to retry.
import { z } from "zod";
import { env } from "$amplify/env/respondToRequest";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource";
import { checked, allPages } from "../shared/results";
const config = await getAmplifyDataClientConfig(env);
Amplify.configure(config.resourceConfig, config.libraryOptions);
const api = generateClient<Schema>();
const input = z.object({
  requestId: z.string().min(1).max(250),
  accept: z.boolean(),
});
export const handler = async (event: {
  arguments: z.input<typeof input>;
  identity?: { sub?: string };
}) => {
  const me = event.identity?.sub;
  const parsed = input.safeParse(event.arguments);
  if (!me || !parsed.success)
    return { ok: false, accepted: false, reason: "Invalid request" };
  try {
    const request = checked(
      await api.models.MessageRequest.get({ id: parsed.data.requestId }),
    );
    if (!request || request.toUserId !== me)
      return {
        ok: false,
        accepted: false,
        reason: "This request is unavailable",
      };
    if (!parsed.data.accept) {
      if (request.status === "accepted")
        return {
          ok: false,
          accepted: false,
          reason: "This request was already accepted",
        };
      checked(
        await api.models.MessageRequest.update({
          id: request.id,
          status: "declined",
        }),
      );
      return { ok: true, accepted: false, reason: "" };
    }
    if (request.status === "declined")
      return {
        ok: false,
        accepted: false,
        reason: "This request is no longer pending",
      };
    const contacts = await allPages((token) =>
      api.models.Contact.list({
        filter: {
          or: [
            { userId: { eq: request.fromUserId }, contactId: { eq: me } },
            { userId: { eq: me }, contactId: { eq: request.fromUserId } },
          ],
        },
        nextToken: token,
      }),
    );
    if (contacts.some((c) => c.status === "blocked"))
      return {
        ok: false,
        accepted: false,
        reason: "This conversation is unavailable",
      };
    for (const [userId, contactId] of [
      [me, request.fromUserId],
      [request.fromUserId, me],
    ]) {
      if (contacts.some((c) => c.userId === userId && c.status === "accepted"))
        continue;
      const id = `${userId}#${contactId}`;
      const old = checked(await api.models.Contact.get({ id }));
      const row = { id, userId, contactId, status: "accepted" as const };
      checked(
        old
          ? await api.models.Contact.update(row)
          : await api.models.Contact.create(row),
      );
    }
    const id = `request#${request.id}`;
    if (!checked(await api.models.DirectMessage.get({ id })))
      checked(
        await api.models.DirectMessage.create({
          id,
          threadId: `dm#${[me, request.fromUserId].sort().join("#")}`,
          participants: [me, request.fromUserId],
          senderId: request.fromUserId,
          content: request.firstMessage,
          createdAtMs: Date.parse(request.createdAt ?? "") || Date.now(),
          timestamp: request.createdAt ?? new Date().toISOString(),
        }),
      );
    checked(
      await api.models.MessageRequest.update({
        id: request.id,
        status: "accepted",
      }),
    );
    return { ok: true, accepted: true, reason: "" };
  } catch {
    return {
      ok: false,
      accepted: false,
      reason: "The request could not be updated. Please try again.",
    };
  }
};
