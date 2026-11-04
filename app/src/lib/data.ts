// app/src/lib/data.ts
// The single typed Amplify Data client for Bridge event persistence. Centralizing it here
// means callers never re-create the client and the schema stays the source of truth
// (fixes the prototype's in-memory state loss — EVENT-02/04).
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type EventRecord = Schema['Event']['type'];
export type CreateEventInput = Parameters<typeof client.models.Event.create>[0];
export type UpdateEventInput = Parameters<typeof client.models.Event.update>[0];

export async function createEvent(input: CreateEventInput): Promise<EventRecord> {
  const { data, errors } = await client.models.Event.create(input);
  if (errors?.length) throw new Error(`createEvent failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('createEvent returned no data');
  return data;
}

export async function listEvents(): Promise<EventRecord[]> {
  const { data, errors } = await client.models.Event.list();
  if (errors?.length) throw new Error(`listEvents failed: ${JSON.stringify(errors)}`);
  return data;
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  const { data, errors } = await client.models.Event.get({ id });
  if (errors?.length) throw new Error(`getEvent failed: ${JSON.stringify(errors)}`);
  return data;
}

export async function updateEvent(input: UpdateEventInput): Promise<EventRecord> {
  const { data, errors } = await client.models.Event.update(input);
  if (errors?.length) throw new Error(`updateEvent failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('updateEvent returned no data');
  return data;
}
