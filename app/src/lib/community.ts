// Live circles, private contacts/requests, and public first-name-only member projections.
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { checked, allPages } from "./apiResults";
import { lastN } from "./messages";
import { awardBadgeAfter } from "./badges";
const api = generateClient<Schema>();
export type Member = { id: string; name: string; photoKey?: string | null };
export type Group = Schema["Group"]["type"];
export type Membership = Schema["CircleMembership"]["type"];
export type Contact = Schema["Contact"]["type"];
export type Request = Schema["MessageRequest"]["type"];
export type DirectMessage = Schema["DirectMessage"]["type"];
export const circleStyles: Record<string, { bg: string; color: string }> = {
  gaming: { bg: "#FFF0EA", color: "#D4733A" },
  music: { bg: "#EEF0FA", color: "#5A4FB0" },
  anime: { bg: "#FEF0FA", color: "#8A3A9A" },
  cooking: { bg: "#FFF6E8", color: "#B07A20" },
  art: { bg: "#FDE8EF", color: "#A03060" },
  tech: { bg: "var(--tint)", color: "#3A7A5C" },
};
export function circleStyle(slug: string) {
  return circleStyles[slug] ?? { bg: "var(--tint)", color: "var(--accent)" };
}
export async function listMembers(): Promise<Record<string, Member>> {
  const rows = await allPages((token) =>
    api.models.User.list({
      nextToken: token,
      selectionSet: ["id", "owner", "firstName", "photoKey"],
    }),
  );
  return Object.fromEntries(
    rows.map((row) => {
      const id = row.owner?.split("::")[0] ?? row.id;
      return [
        id,
        {
          id,
          name: row.firstName?.trim() || "Bridge member",
          photoKey: row.photoKey,
        },
      ];
    }),
  );
}
export async function loadCommunity() {
  const [groups, members, memberships] = await Promise.all([
    allPages((token) => api.models.Group.list({ nextToken: token })),
    listMembers(),
    allPages((token) => api.models.CircleMembership.list({ nextToken: token })),
  ]);
  const order = Object.keys(circleStyles);
  groups.sort(
    (a, b) =>
      (order.indexOf(a.slug ?? a.name.toLowerCase()) < 0
        ? 99
        : order.indexOf(a.slug ?? a.name.toLowerCase())) -
      (order.indexOf(b.slug ?? b.name.toLowerCase()) < 0
        ? 99
        : order.indexOf(b.slug ?? b.name.toLowerCase())),
  );
  return { groups, members, memberships };
}
export async function joinCircle(userId: string, groupId: string) {
  const id = `${userId}#${groupId}`;
  const row = checked(await api.models.CircleMembership.get({ id }));
  const membership = (
    row ??
    checked(
      await api.models.CircleMembership.create({
        id,
        userId,
        groupId,
        muted: false,
        lastReadAt: Date.now(),
      }),
    )
  );
  awardBadgeAfter("circle");
  return membership;
}
export async function updateMembership(
  id: string,
  input: { muted?: boolean; lastReadAt?: number },
) {
  return checked(await api.models.CircleMembership.update({ id, ...input }));
}
export async function leaveMembership(id: string) {
  checked(
    await api.models.CircleMembership.delete({ id }, { selectionSet: ["id"] }),
  );
}
export async function action(input: {
  action: "send-circle" | "block" | "rsvp" | "share-event" | "invite-event";
  targetId: string;
  text?: string;
  status?: "going" | "maybe" | "cant";
  clientMessageId?: string;
}) {
  const result = checked(await api.mutations.communityAction(input));
  if (!result?.ok)
    throw new Error(
      result?.reason || "The action could not be completed. Please try again.",
    );
  return result;
}
export async function sendCircle(
  groupId: string,
  text: string,
  clientMessageId: string,
) {
  const result = await action({
    action: "send-circle",
    targetId: groupId,
    text,
    clientMessageId,
  });
  awardBadgeAfter("hello");
  return result;
}
export function observeContacts(
  next: (rows: Contact[]) => void,
  error: (error: unknown) => void,
) {
  return api.models.Contact.observeQuery().subscribe({
    next: (r) => next([...r.items]),
    error,
  });
}
export function observeRequests(
  next: (rows: Request[]) => void,
  error: (error: unknown) => void,
) {
  return api.models.MessageRequest.observeQuery().subscribe({
    next: (r) => next([...r.items]),
    error,
  });
}
export function observeDirectMessages(
  next: (rows: DirectMessage[]) => void,
  error: (error: unknown) => void,
) {
  return api.models.DirectMessage.observeQuery().subscribe({
    next: (r) =>
      next([...r.items].sort((a, b) => a.createdAtMs - b.createdAtMs)),
    error,
  });
}
export function observePrivateThread(
  threadId: string,
  next: (rows: DirectMessage[]) => void,
  error?: (error: unknown) => void,
) {
  return api.models.DirectMessage.observeQuery({
    filter: { threadId: { eq: threadId } },
  }).subscribe({
    next: (r) => next(lastN(r.items, 50, (m) => m.createdAtMs)),
    error,
  });
}
export async function report(
  targetId: string,
  targetType: "message" | "user" | "circle",
  reason: string,
) {
  checked(await api.models.Report.create({ targetId, targetType, reason }));
}
export async function previewDrafts(context: string, personalContext?: string) {
  const result = checked(
    await api.queries.previewReplies({
      context: [personalContext, context]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 2000),
    }),
  );
  return {
    suggestions: (result?.suggestions ?? []).filter((s): s is string => !!s),
    fallback: !!result?.fallback,
  };
}
export async function gentleDraft(text: string, personalContext?: string) {
  const result = checked(
    await api.queries.toneCheck({ text, personalContext }),
  );
  if (!result?.gentle)
    throw new Error(
      "Mo could not suggest a rewrite. Your own words are still here.",
    );
  return result.gentle;
}

export async function readThreadStates() {
  const rows = await allPages((token) =>
    api.models.ThreadState.list({ nextToken: token }),
  );
  return Object.fromEntries(rows.map((r) => [r.peerId, r.lastReadAt]));
}
export async function markThreadRead(
  userId: string,
  peerId: string,
  lastReadAt: number,
) {
  const id = `${userId}#${peerId}`;
  const previous = checked(await api.models.ThreadState.get({ id }));
  if (!previous || previous.lastReadAt < lastReadAt)
    checked(
      previous
        ? await api.models.ThreadState.update({ id, lastReadAt })
        : await api.models.ThreadState.create({
            id,
            userId,
            peerId,
            lastReadAt,
          }),
    );
  const notices = await allPages((token) =>
    api.models.Notification.list({
      filter: { peerId: { eq: peerId }, read: { eq: false } },
      nextToken: token,
    }),
  );
  for (const n of notices)
    checked(await api.models.Notification.update({ id: n.id, read: true }));
}
