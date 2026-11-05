// Only trusted mutations create private DMs. Requests, blocks, sender identity, and retries are enforced here.
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '../shared/rateLimit';
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { classify } from "../shared/classify";
import { checked, allPages } from "../shared/results";
import { logTurn } from "../shared/log";
import { env } from "$amplify/env/sendDm";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource";
const config = await getAmplifyDataClientConfig(env);
Amplify.configure(config.resourceConfig, config.libraryOptions);
const api = generateClient<Schema>();
const input = z.object({
  toUserId: z.string().min(1).max(100),
  text: z.string().trim().min(1).max(2000),
  clientMessageId: z.string().min(1).max(100).optional(),
});
export const handler = async (event: {
  arguments: z.input<typeof input>;
  identity?: { sub?: string };
}) => {
  const started=Date.now();
  const fromUserId = event.identity?.sub;
  const parsed = input.safeParse(
    Object.fromEntries(
      Object.entries(event.arguments).filter(([, value]) => value !== null),
    ),
  );
  const result = {
    delivered: false,
    held: false,
    unsafe: false,
    crisis: false,
    reason: "",
  };
  if (!fromUserId || !parsed.success)
    return { ...result, reason: "Invalid message" };
  const { toUserId, text, clientMessageId } = parsed.data;
  if (toUserId === fromUserId)
    return { ...result, reason: "Choose another person" };
  try {
    const profiles = await allPages((token) =>
      api.models.User.list({
        filter: {
          or: [
            { owner: { eq: toUserId } },
            { owner: { beginsWith: `${toUserId}::` } },
          ],
        },
        selectionSet: ["id"],
        nextToken: token,
      }),
    );
    if (!profiles.length)
      return { ...result, reason: "This person is unavailable" };
    const contacts = await allPages((token) =>
      api.models.Contact.list({
        filter: {
          or: [
            { userId: { eq: fromUserId }, contactId: { eq: toUserId } },
            { userId: { eq: toUserId }, contactId: { eq: fromUserId } },
          ],
        },
        nextToken: token,
      }),
    );
    if (contacts.some((c) => c.status === "blocked"))
      return { ...result, reason: "This conversation is unavailable" };
    const classification = await classify(text);
    logTurn({
      fn: "sendDm",
      latencyMs: Date.now()-started,
      labels: [classification.label],
      fallback: classification.fallback,
    });
    if (classification.label === "crisis")
      return {
        ...result,
        crisis: true,
        reason:
          "Reach out to a trusted person for support. Your message was not sent.",
      };
    if(!(await checkRateLimit(fromUserId)).allowed)return {...result,reason:RATE_LIMIT_MESSAGE};
    const accepted =
      contacts.some(
        (c) => c.userId === fromUserId && c.status === "accepted",
      ) &&
      contacts.some((c) => c.userId === toUserId && c.status === "accepted");
    if (accepted) {
      const id = `${fromUserId}#${clientMessageId ?? randomUUID()}`;
      if (!checked(await api.models.DirectMessage.get({ id })))
        checked(
          await api.models.DirectMessage.create({
            id,
            threadId: `dm#${[fromUserId, toUserId].sort().join("#")}`,
            participants: [fromUserId, toUserId],
            senderId: fromUserId,
            content: text,
            createdAtMs: Date.now(),
            timestamp: new Date().toISOString(),
          }),
        );
      const noticeId = `dm-notice#${id}`;
      if (!checked(await api.models.Notification.get({ id: noticeId })))
        checked(
          await api.models.Notification.create({
            id: noticeId,
            userId: toUserId,
            peerId: fromUserId,
            type: "private-message",
            message: "You have a new private message.",
            read: false,
            timestamp: new Date().toISOString(),
          }),
        );
      return { ...result, delivered: true };
    }
    const id = `${fromUserId}#${toUserId}`;
    const existing = checked(await api.models.MessageRequest.get({ id }));
    if (existing?.status === "pending" && existing.firstMessage === text)
      return { ...result, held: true, unsafe: existing.unsafe ?? false };
    if (existing?.status === "pending")
      return {
        ...result,
        reason: "A message request is already waiting for their reply",
      };
    const request = {
      id,
      fromUserId,
      toUserId,
      firstMessage: text,
      status: "pending" as const,
      unsafe: ["money", "address", "unsafe"].includes(classification.label),
      createdAt: new Date().toISOString(),
    };
    checked(
      existing
        ? await api.models.MessageRequest.update(request)
        : await api.models.MessageRequest.create(request),
    );
    const noticeId = `request-notice#${id}`;
    const previous = checked(
      await api.models.Notification.get({ id: noticeId }),
    );
    const notice = {
      id: noticeId,
      userId: toUserId,
      peerId: fromUserId,
      type: "message-request",
      message: "You have a new message request. You choose whether to accept.",
      read: false,
      timestamp: new Date().toISOString(),
    };
    checked(
      previous
        ? await api.models.Notification.update(notice)
        : await api.models.Notification.create(notice),
    );
    return { ...result, held: true, unsafe: request.unsafe };
  } catch (error) {
    logTurn({
      fn: "sendDm",
      latencyMs: Date.now()-started,
      labels: [error instanceof Error ? error.name : "operation-error"],
      fallback: false,
    });
    return {
      ...result,
      reason: "Your message could not be sent. Please try again.",
    };
  }
};
