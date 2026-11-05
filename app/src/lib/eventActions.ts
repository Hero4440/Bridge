// Persisted personal event preparation and reflection, with trusted RSVP writes.
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { checked, allPages } from "./apiResults";
import { action } from "./community";
import type { Feeling } from "./reflection";
import { awardBadgeAfter } from "./badges";
const api = generateClient<Schema>();
export async function loadEventState(userId: string, eventId: string) {
  const [rsvps, prep, reflections] = await Promise.all([
    allPages((token) =>
      api.models.RSVP.list({
        filter: { eventId: { eq: eventId } },
        nextToken: token,
      }),
    ),
    api.models.EventPrep.get({ id: `${userId}#${eventId}` }).then(checked),
    allPages((token) =>
      api.models.Reflection.list({
        filter: { eventId: { eq: eventId } },
        nextToken: token,
      }),
    ),
  ]);
  return {
    rsvps,
    checked: (prep?.checked ?? []).filter((s): s is string => !!s),
    reflection: reflections[0] ?? null,
  };
}
export async function saveEventPrep(
  userId: string,
  eventId: string,
  tasks: string[],
) {
  const id = `${userId}#${eventId}`;
  const old = checked(await api.models.EventPrep.get({ id }));
  const row = { id, userId, eventId, checked: tasks };
  return checked(
    old
      ? await api.models.EventPrep.update(row)
      : await api.models.EventPrep.create(row),
  );
}
export async function rsvpEvent(
  eventId: string,
  status: "going" | "maybe" | "cant",
) {
  await action({ action: "rsvp", targetId: eventId, status });
  if (status === "going") awardBadgeAfter("event");
}
export async function reflectEvent(
  userId: string,
  eventId: string,
  feeling: Feeling,
  wins: string[],
  personalContext?: string,
) {
  const id = `${userId}#${eventId}`;
  const previous = checked(await api.models.Reflection.get({ id }));
  const input = {
    id,
    eventId,
    feeling,
    wins,
    timestamp: new Date().toISOString(),
  };
  const reflection = checked(
    previous
      ? await api.models.Reflection.update(input)
      : await api.models.Reflection.create(input),
  );
  const reply = checked(
    await api.queries.reflectReply({ feeling, wins, personalContext }),
  );
  return {
    reflection,
    reply: reply?.reply ?? "Thanks for taking a moment to reflect.",
    fallback: !!reply?.fallback,
  };
}

export async function myPlannedEventIds(userId: string) {
  const rows = await allPages((token) =>
    api.models.RSVP.list({
      filter: { userId: { eq: userId } },
      nextToken: token,
    }),
  );
  return rows
    .filter((r) => r.status === "going" || r.status === "maybe")
    .map((r) => r.eventId);
}
