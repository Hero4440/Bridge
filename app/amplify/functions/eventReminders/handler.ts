// EventBridge delivers real, deduplicated private reminders; it never logs event or message content.
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/eventReminders";
import type { Schema } from "../../data/resource";
import { checked, allPages } from "../shared/results";
const config = await getAmplifyDataClientConfig(env);
Amplify.configure(config.resourceConfig, config.libraryOptions);
const api = generateClient<Schema>();
export async function handler() {
  const now = Date.now();
  const events = await allPages((token) =>
    api.models.Event.list({
      filter: {
        whenAt: {
          gt: new Date(now).toISOString(),
          le: new Date(now + 86400000).toISOString(),
        },
      },
      nextToken: token,
    }),
  );
  let sent = 0;
  for (const event of events) {
    if (!event.whenAt || !event.reminder) continue;
    const remaining = Date.parse(event.whenAt) - now;
    const moments =
      event.reminder === "both"
        ? [86400000, 3600000]
        : [event.reminder === "oneDay" ? 86400000 : 3600000];
    for (const moment of moments) {
      // A ten-minute window tolerates delayed scheduled invocations without a late flood.
      if (remaining > moment || remaining < moment - 600000) continue;
      const people = await allPages((token) =>
        api.models.RSVP.list({
          filter: { eventId: { eq: event.id }, status: { eq: "going" } },
          nextToken: token,
        }),
      );
      for (const person of people) {
        if (!person.userId) continue;
        const id = `event-reminder#${event.id}#${event.whenAt}#${moment}#${person.userId}`;
        if (checked(await api.models.Notification.get({ id }))) continue;
        const result = await api.models.Notification.create({
          id,
          userId: person.userId,
          type: "event-reminder",
          eventId: event.id,
          message: `${event.what} starts ${moment === 3600000 ? "in about an hour" : "tomorrow"}. Check your plan when you’re ready.`,
          read: false,
          timestamp: new Date().toISOString(),
        });
        if (!result.errors?.length) sent++;
      }
    }
  }
  console.log(
    JSON.stringify({ fn: "event-reminders", events: events.length, sent }),
  );
  return { sent };
}
