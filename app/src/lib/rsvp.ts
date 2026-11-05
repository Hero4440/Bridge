// app/src/lib/rsvp.ts
// RSVP persistence: a deterministic logical key (${eventId}#${userId}), auth-bound get-then-upsert
// so a user's RSVP survives refresh and never duplicates (EVENT-03/04), and a pure count reducer
// for X/Y/Z detail counts (EVENT-05). userId always comes from the Cognito session, never a caller arg.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { currentUser } from './auth';

const client = generateClient<Schema>();

export type RsvpStatus = 'going' | 'maybe' | 'cant';
export interface RsvpCounts {
  going: number;
  maybe: number;
  cant: number;
}
export type RsvpRecord = Schema['RSVP']['type'];

export function rsvpId(eventId: string, userId: string): string {
  if (!eventId || !userId) throw new Error('rsvpId requires both eventId and userId');
  return `${eventId}#${userId}`;
}

async function sessionUserId(): Promise<string> {
  const u = await currentUser();
  return u.userId;
}

export async function listRsvpsForEvent(eventId: string): Promise<RsvpRecord[]> {
  const { data, errors } = await client.models.RSVP.list({ filter: { eventId: { eq: eventId } } });
  if (errors?.length) throw new Error(`listRsvpsForEvent failed: ${JSON.stringify(errors)}`);
  return data;
}

export async function getRsvp(eventId: string): Promise<RsvpRecord | null> {
  const uid = await sessionUserId();
  rsvpId(eventId, uid); // validates both present (guards unauthenticated upsert)
  const { data, errors } = await client.models.RSVP.list({ filter: { eventId: { eq: eventId }, userId: { eq: uid } } });
  if (errors?.length) throw new Error(`getRsvp failed: ${JSON.stringify(errors)}`);
  return data[0] ?? null;
}

export async function setRsvp(eventId: string, status: RsvpStatus): Promise<RsvpRecord> {
  const uid = await sessionUserId();
  rsvpId(eventId, uid); // logical key `${eventId}#${userId}`
  const existing = await getRsvp(eventId);
  if (existing) {
    const { data, errors } = await client.models.RSVP.update({ id: existing.id, status });
    if (errors?.length) throw new Error(`setRsvp update failed: ${JSON.stringify(errors)}`);
    if (!data) throw new Error('setRsvp update returned no data');
    return data;
  }
  const { data, errors } = await client.models.RSVP.create({ eventId, userId: uid, status });
  if (errors?.length) throw new Error(`setRsvp create failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('setRsvp create returned no data');
  return data;
}

// Pure reducer — no network — so EVENT-05 counts are unit-testable and reusable by the detail view.
export function countRsvps(rsvps: { status?: RsvpStatus | string | null }[]): RsvpCounts {
  const counts: RsvpCounts = { going: 0, maybe: 0, cant: 0 };
  for (const r of rsvps) {
    if (r.status === 'going' || r.status === 'maybe' || r.status === 'cant') counts[r.status] += 1;
  }
  return counts;
}
