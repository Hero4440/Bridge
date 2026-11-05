// app/amplify/functions/sendHelpAlert/handler.ts
// "I need help" → notify the caller's connected trusted person(s) (SAFE-06/07). Finds connected
// GuardianLinks for identity.sub and creates a Notification owned by each guardian. This MUST be a
// Lambda: Notification is allow.owner(), so the client can't write a row owned by the guardian; the
// IAM Data client here bypasses owner auth. In-app only — no SMS (§2.4); 988 is a client-side link.
import { z } from 'zod';
import { logTurn } from '../shared/log';
import { env } from '$amplify/env/sendHelpAlert';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const dataClient = generateClient<Schema>();

const input = z.object({ note: z.string().max(500).optional() });

export const handler = async (event: { arguments: { note?: string }; identity?: { sub?: string } }) => {
  const started = Date.now();
  const me = event.identity?.sub ?? 'anon';
  const parsed = input.safeParse(event.arguments);
  if (!parsed.success) return { notified: 0 };

  // Find the caller's connected trusted person(s)
  const { data: links } = await dataClient.models.GuardianLink.list({
    filter: { userId: { eq: me }, status: { eq: 'connected' } },
  });

  let notified = 0;
  for (const link of links) {
    if (!link.guardianId) continue;
    await dataClient.models.Notification.create({
      userId: link.guardianId, // owned by the guardian (owner-bypass via IAM Data client)
      type: 'help',
      message: 'Someone you support asked for help.',
      read: false,
      timestamp: new Date().toISOString(),
    });
    notified += 1;
  }

  logTurn({ fn: 'sendHelpAlert', latencyMs: Date.now() - started, labels: [`notified:${notified}`], fallback: false });
  return { notified };
};
