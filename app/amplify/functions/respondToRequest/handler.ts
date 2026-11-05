// app/amplify/functions/respondToRequest/handler.ts
// Accept/decline a pending MessageRequest (DM-04). Authorizes server-side: only the request's
// toUserId (== identity.sub) may respond (T-05-03). Accept creates reciprocal accepted Contacts
// and seeds the dm# thread with the held first message; decline just marks it (sender not told why).
import { z } from 'zod';
import { logTurn } from '../shared/log';
import { env } from '$amplify/env/respondToRequest';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const dataClient = generateClient<Schema>();

const input = z.object({ requestId: z.string().min(1), accept: z.boolean() });
const threadKey = (a: string, b: string): string => `dm#${[a, b].sort().join('#')}`;

export const handler = async (event: { arguments: { requestId: string; accept: boolean }; identity?: { sub?: string } }) => {
  const started = Date.now();
  const me = event.identity?.sub ?? 'anon';
  const parsed = input.safeParse(event.arguments);
  if (!parsed.success) return { ok: false, accepted: false, reason: 'bad-input' };
  const { requestId, accept } = parsed.data;

  const { data: request } = await dataClient.models.MessageRequest.get({ id: requestId });
  if (!request) return { ok: false, accepted: false, reason: 'not-found' };
  // Only the recipient may respond (T-05-03)
  if (request.toUserId !== me) {
    logTurn({ fn: 'respondToRequest', latencyMs: Date.now() - started, labels: ['forbidden'], fallback: false });
    return { ok: false, accepted: false, reason: 'forbidden' };
  }

  if (!accept) {
    await dataClient.models.MessageRequest.update({ id: requestId, status: 'declined' });
    logTurn({ fn: 'respondToRequest', latencyMs: Date.now() - started, labels: ['declined'], fallback: false });
    return { ok: true, accepted: false, reason: '' };
  }

  // Accept: reciprocal accepted Contacts (cross-owner write via IAM Data client) + seed the thread
  await dataClient.models.Contact.create({ userId: request.toUserId, contactId: request.fromUserId, status: 'accepted' });
  await dataClient.models.Contact.create({ userId: request.fromUserId, contactId: request.toUserId, status: 'accepted' });
  await dataClient.models.Message.create({
    groupId: threadKey(request.fromUserId, request.toUserId),
    content: request.firstMessage,
    senderId: request.fromUserId,
    createdAtMs: Date.now(),
    timestamp: new Date().toISOString(),
  });
  await dataClient.models.MessageRequest.update({ id: requestId, status: 'accepted' });
  logTurn({ fn: 'respondToRequest', latencyMs: Date.now() - started, labels: ['accepted'], fallback: false });
  return { ok: true, accepted: true, reason: '' };
};
