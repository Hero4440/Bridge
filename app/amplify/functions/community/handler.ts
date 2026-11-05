// Server authorization for circle sends, private blocking, atomic RSVPs, and chosen event sharing.
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '../shared/rateLimit';
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { env } from "$amplify/env/community";
import type { Schema } from "../../data/resource";
import { communityInput, parseCommunityInput } from "./input";
import { classify } from "../shared/classify";
import { checked, allPages } from "../shared/results";
import { logTurn } from "../shared/log";
const config = await getAmplifyDataClientConfig(env);
Amplify.configure(config.resourceConfig, config.libraryOptions);
const api = generateClient<Schema>();
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const input = communityInput;
type Identity = { sub?: string };
export const handler = async (event: {
  arguments: z.input<typeof input>;
  identity?: Identity;
}) => {
  const started=Date.now();
  const userId = event.identity?.sub;
  const parsed = parseCommunityInput(event.arguments);
  if (!userId || !parsed.success)
    return { ok: false, reason: "Invalid request" };
  const value = parsed.data;
  try {
    if (value.action === "block") {
      if (value.targetId === userId)
        return { ok: false, reason: "You cannot block yourself" };
      const existing = checked(
        await api.models.Contact.get({ id: `${userId}#${value.targetId}` }),
      );
      const row = {
        id: `${userId}#${value.targetId}`,
        userId,
        contactId: value.targetId,
        status: "blocked" as const,
      };
      checked(
        existing
          ? await api.models.Contact.update(row)
          : await api.models.Contact.create(row),
      );
      // A historical contact may have a generated ID; update it too.
      const previous = await allPages((token) =>
        api.models.Contact.list({
          filter: { userId: { eq: userId }, contactId: { eq: value.targetId } },
          nextToken: token,
        }),
      );
      for (const contact of previous)
        if (contact.status !== "blocked")
          checked(
            await api.models.Contact.update({
              id: contact.id,
              status: "blocked",
            }),
          );
      return { ok: true };
    }
    if (value.action === "send-circle") {
      if (!value.text) return { ok: false, reason: "Write a message first" };
      const group = checked(await api.models.Group.get({ id: value.targetId }));
      if (!group) return { ok: false, reason: "This circle is unavailable" };
      const membership = checked(
        await api.models.CircleMembership.get({ id: `${userId}#${group.id}` }),
      );
      if (!membership || membership.userId !== userId)
        return { ok: false, reason: "Join this circle before sending" };
      const result = await classify(value.text);
      logTurn({
        fn: "circle-send",
        latencyMs: Date.now()-started,
        labels: [result.label],
        fallback: result.fallback,
      });
      if (result.label === "crisis")
        return {
          ok: false,
          crisis: true,
          reason:
            "Reach out to a trusted person for support. Your message was not sent.",
        };
      if(!(await checkRateLimit(userId)).allowed)return {ok:false,reason:RATE_LIMIT_MESSAGE};
      const id = `${userId}#${value.clientMessageId ?? randomUUID()}`;
      const existing = checked(await api.models.Message.get({ id }));
      if (existing) return { ok: true, messageId: id };
      checked(
        await api.models.Message.create({
          id,
          groupId: group.id,
          senderId: userId,
          content: value.text,
          unsafe:["unsafe","money","address"].includes(result.label),
          createdAtMs: Date.now(),
          timestamp: new Date().toISOString(),
        }),
      );
      return {
        ok: true,
        messageId: id,
        unsafe: ["unsafe", "money", "address"].includes(result.label),
      };
    }
    const eventRow = checked(
      await api.models.Event.get({ id: value.targetId }),
    );
    if (!eventRow) return { ok: false, reason: "This event is unavailable" };
    if (value.action === "invite-event") {
      if (
        eventRow.owner !== userId &&
        !eventRow.owner?.startsWith(`${userId}::`)
      )
        return { ok: false, reason: "Only the host can invite people" };
      const recipients = z
        .array(z.string().min(1).max(100))
        .max(50)
        .parse(JSON.parse(value.text ?? "[]"));
      const contacts = await allPages((token) =>
        api.models.Contact.list({
          filter: { userId: { eq: userId }, status: { eq: "accepted" } },
          nextToken: token,
        }),
      );
      let notified = 0;
      for (const recipient of new Set(recipients)) {
        if (!contacts.some((c) => c.contactId === recipient))
          return { ok: false, reason: "Choose an accepted contact" };
        const blocked = await allPages((token) =>
          api.models.Contact.list({
            filter: {
              userId: { eq: recipient },
              contactId: { eq: userId },
              status: { eq: "blocked" },
            },
            nextToken: token,
          }),
        );
        if (blocked.length)
          return { ok: false, reason: "This contact is unavailable" };
        const id = `event-invite#${eventRow.id}#${recipient}`;
        if (!checked(await api.models.Notification.get({ id })))
          checked(
            await api.models.Notification.create({
              id,
              userId: recipient,
              eventId: eventRow.id,
              type: "event-invite",
              message: `You’re invited to ${eventRow.what}. Open the event to choose whether to go.`,
              read: false,
              timestamp: new Date().toISOString(),
            }),
          );
        notified++;
      }
      return { ok: true, notified };
    }
    if (value.action === "share-event") {
      const links = await allPages((token) =>
        api.models.GuardianLink.list({
          filter: { userId: { eq: userId }, status: { eq: "connected" } },
          nextToken: token,
        }),
      );
      let notified = 0;
      for (const link of links) {
        if (
          !link.guardianId ||
          !link.permissions?.some((p) => p === "events" || p === "sharePlan")
        )
          continue;
        checked(
          await api.models.Notification.create({
            userId: link.guardianId,
            type: "shared-event",
            eventId: eventRow.id,
            message: `A connected person shared their plan: ${eventRow.what}${eventRow.whenAt ? ` · ${new Date(eventRow.whenAt).toLocaleString("en-US", { timeZone: "America/Phoenix" })}` : ""}${eventRow.venue || eventRow.whereText ? ` · ${eventRow.venue || eventRow.whereText}` : ""}`,
            read: false,
            timestamp: new Date().toISOString(),
          }),
        );
        notified++;
      }
      return { ok: true, notified };
    }
    if (!value.status) return { ok: false, reason: "Choose an RSVP" };
    if (
      !eventRow.whenAt ||
      Date.parse(eventRow.whenAt) + (eventRow.durationMinutes ?? 60) * 60000 <=
        Date.now()
    )
      return { ok: false, reason: "This event has ended" };
    const rsvps = await allPages((token) =>
      api.models.RSVP.list({
        filter: { eventId: { eq: eventRow.id } },
        nextToken: token,
      }),
    );
    // Bootstrap legacy events exactly once before making atomic capacity changes.
    const current = await db.send(
      new GetCommand({
        TableName: env.EVENT_TABLE,
        Key: { id: eventRow.id },
        ConsistentRead: true,
      }),
    );
    if (!current.Item)
      return { ok: false, reason: "This event is unavailable" };
    if (current.Item.goingCount === undefined) {
      try {
        await db.send(
          new UpdateCommand({
            TableName: env.EVENT_TABLE,
            Key: { id: eventRow.id },
            UpdateExpression: "SET goingCount=:count",
            ConditionExpression: "attribute_not_exists(goingCount)",
            ExpressionAttributeValues: {
              ":count": rsvps.filter((r) => r.status === "going").length,
            },
          }),
        );
      } catch (error) {
        if (
          !(error instanceof Error) ||
          error.name !== "ConditionalCheckFailedException"
        )
          throw error;
      }
    }
    const previous = rsvps.find((r) => r.userId === userId);
    const id = previous?.id ?? `${eventRow.id}#${userId}`;
    const exact = await db.send(
      new GetCommand({
        TableName: env.RSVP_TABLE,
        Key: { id },
        ConsistentRead: true,
      }),
    );
    const old = exact.Item;
    const delta =
      Number(value.status === "going") - Number(old?.status === "going");
    const now = new Date().toISOString();
    const row = {
      id,
      eventId: eventRow.id,
      userId,
      status: value.status,
      timestamp: now,
      owner: old?.owner ?? userId,
      createdAt: old?.createdAt ?? now,
      updatedAt: now,
      __typename: "RSVP",
    };
    const eventValues: Record<string, number> = { ":delta": delta, ":zero": 0 };
    let condition = "attribute_exists(id)";
    if (delta > 0 && eventRow.comfortSize) {
      condition += " AND goingCount < :capacity";
      eventValues[":capacity"] = eventRow.comfortSize;
    }
    if (delta < 0) condition += " AND goingCount > :zero";
    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: env.EVENT_TABLE,
              Key: { id: eventRow.id },
              UpdateExpression:
                "SET goingCount=if_not_exists(goingCount,:zero)+:delta",
              ConditionExpression: condition,
              ExpressionAttributeValues: eventValues,
            },
          },
          {
            Put: {
              TableName: env.RSVP_TABLE,
              Item: row,
              ConditionExpression: old
                ? "#status=:previous"
                : "attribute_not_exists(id)",
              ...(old
                ? {
                    ExpressionAttributeNames: { "#status": "status" },
                    ExpressionAttributeValues: { ":previous": old.status },
                  }
                : {}),
            },
          },
        ],
      }),
    );
    return { ok: true };
  } catch (error) {
    logTurn({
      fn: "community",
      latencyMs: Date.now()-started,
      labels: [error instanceof Error ? error.name : "operation-error"],
      fallback: false,
    });
    return {
      ok: false,
      reason:
        value.action === "rsvp"
          ? "This event may be full or your RSVP changed. Refresh and try again."
          : "The action could not be completed. Please try again.",
    };
  }
};
