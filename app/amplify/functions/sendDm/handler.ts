// app/amplify/functions/sendDm/handler.ts
// DM send with safety routing (DM-01/02/03, SAFE-01/02/03). Uses identity.sub as the trusted
// sender (never a client arg). classify() runs FIRST: crisis stops delivery (SAFE-02); otherwise
// a message to an existing contact is delivered to the dm# thread, and a first message from a
// non-contact is HELD as a pending MessageRequest with an unsafe flag from classify (DM-02/03).
// Logs labels/fallback only — never the message text (§2.8).
import { z } from 'zod';
import { classify } from '../shared/classify';
import { logTurn } from '../shared/log';
import { env } from '$amplify/env/sendDm';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const dataClient = generateClient<Schema>();

const sendDmInput = z.object({ toUserId: z.string().min(1), text: z.string().min(1).max(2000) });
const UNSAFE_LABELS = ['money', 'address', 'unsafe'];
const threadKey = (a: string, b: string): string => `dm#${[a, b].sort().join('#')}`;

export const handler = async (event: { arguments: { toUserId: string; text: string }; identity?: { sub?: string } }) => {
  const started = Date.now();
  const fromUserId = event.identity?.sub ?? 'anon';
  const parsed = sendDmInput.safeParse(event.arguments);
  if (!parsed.success) return { delivered: false, held: false, unsafe: false, crisis: false };
  const { toUserId, text } = parsed.data;

  // 1. classify FIRST — crisis stops delivery and signals support (SAFE-02)
  const label = await classify(text);
  if (label.label === 'crisis') {
    logTurn({ fn: 'sendDm', latencyMs: Date.now() - started, labels: ['crisis'], fallback: label.fallback });
    return { delivered: false, held: false, unsafe: false, crisis: true };
  }

  // 2. are they already contacts? (accepted either direction)
  const { data: contacts } = await dataClient.models.Contact.list({
    filter: { userId: { eq: fromUserId }, contactId: { eq: toUserId }, status: { eq: 'accepted' } },
  });
  const areContacts = contacts.length > 0;

  if (areContacts) {
    // 3a. deliver to the DM thread (DM-01)
    await dataClient.models.Message.create({
      groupId: threadKey(fromUserId, toUserId),
      content: text,
      senderId: fromUserId,
      createdAtMs: Date.now(),
      timestamp: new Date().toISOString(),
    });
    logTurn({ fn: 'sendDm', latencyMs: Date.now() - started, labels: [label.label], fallback: label.fallback });
    return { delivered: true, held: false, unsafe: false, crisis: false };
  }

  // 3b. first message from a non-contact → HELD as a pending request with an unsafe flag (DM-02/03/SAFE-01)
  const unsafe = UNSAFE_LABELS.includes(label.label);
  await dataClient.models.MessageRequest.create({
    fromUserId,
    toUserId,
    firstMessage: text,
    status: 'pending',
    unsafe,
    createdAt: new Date().toISOString(),
  });
  logTurn({ fn: 'sendDm', latencyMs: Date.now() - started, labels: [label.label], fallback: label.fallback });
  return { delivered: false, held: true, unsafe, crisis: false };
};
