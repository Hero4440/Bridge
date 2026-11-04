// app/scripts/verify-phase5.ts
// Phase 5 end-to-end live verification against the REAL sandbox (nothing simulated). Two made-up
// accounts prove: a non-contact first message is HELD (not delivered), an unsafe one is flagged,
// crisis stops delivery, the recipient (only) can accept → Contact + seeded thread, DMs deliver +
// load history, "I need help" writes a Notification owned by the connected guardian (owner-bypass),
// and report/block persist.
// Run after `npx ampx sandbox`:  cd app && npx tsx scripts/verify-phase5.ts
import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';
import { sendDm, respondToRequest, listRequests, threadId } from '../src/lib/dm';
import { reportMessage, blockContact, sendHelpAlert } from '../src/lib/safety';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const PASSWORD = 'Passw0rd!Test';
const A = 'sam@example.com';
const B = 'jordan@example.com';
let failures = 0;
const assert = (cond: boolean, msg: string): void => {
  if (cond) console.log(`  \u2713 ${msg}`);
  else { console.error(`  \u2717 ${msg}`); failures += 1; }
};
const as = async (email: string): Promise<string> => {
  await signOut().catch(() => undefined);
  await signIn({ username: email, password: PASSWORD });
  const { userId } = await getCurrentUser();
  return userId;
};
const threadMessages = async (a: string, b: string) =>
  (await client.models.Message.list({ filter: { groupId: { eq: threadId(a, b) } } })).data;

async function cleanup(samSub: string, jordanSub: string): Promise<void> {
  await as(A);
  for (const c of (await client.models.Contact.list({ filter: { contactId: { eq: jordanSub } } })).data) {
    await client.models.Contact.delete({ id: c.id });
  }
  for (const r of (await client.models.MessageRequest.list({ filter: { fromUserId: { eq: jordanSub }, toUserId: { eq: samSub } } })).data) {
    await client.models.MessageRequest.delete({ id: r.id });
  }
  await as(B);
  for (const c of (await client.models.Contact.list({ filter: { contactId: { eq: samSub } } })).data) {
    await client.models.Contact.delete({ id: c.id });
  }
}

async function main(): Promise<void> {
  console.log('\n=== Phase 5 live verification ===\n');
  const samSub = await as(A);
  const jordanSub = await as(B);
  await cleanup(samSub, jordanSub);

  // DM-02 / SAFE-01 — first message from a non-contact is HELD, not delivered
  await as(B);
  console.log('[B] jordan → sam (not yet contacts)');
  const r1 = await sendDm(samSub, 'hi, can we talk?');
  assert(r1.held && !r1.delivered, 'DM-02 non-contact first message held, not delivered');
  assert((await threadMessages(samSub, jordanSub)).length === 0, 'SAFE-01 held message NOT in the thread yet');

  // DM-03 / SAFE-03 — unsafe first message flagged (keyword layer)
  const r2 = await sendDm(samSub, 'can you send me money to cashapp');
  assert(r2.held && r2.unsafe, 'DM-03 unsafe first message flagged (money)');

  // SAFE-02 — crisis stops delivery
  const r3 = await sendDm(samSub, 'i want to hurt myself');
  assert(r3.crisis && !r3.delivered && !r3.held, 'SAFE-02 crisis stops delivery (988 + trusted person)');

  // DM-04 — only the recipient accepts; accept creates a Contact + seeds the thread
  const samSub2 = await as(A);
  console.log('[A] sam reviews requests');
  const pending = await listRequests(samSub2);
  const greeting = pending.find((p) => p.firstMessage === 'hi, can we talk?');
  const moneyReq = pending.find((p) => p.firstMessage === 'can you send me money to cashapp');
  assert(!!greeting && !!moneyReq, 'DM-02 both held requests visible to the recipient');
  const acc = await respondToRequest(greeting!.id, true);
  assert(acc.ok && acc.accepted, 'DM-04 recipient accepts the request');
  const samContacts = await client.models.Contact.list({ filter: { contactId: { eq: jordanSub } } });
  assert(samContacts.data.some((c) => c.status === 'accepted'), 'DM-04 accept creates an accepted Contact');
  assert((await threadMessages(samSub, jordanSub)).some((m) => m.content === 'hi, can we talk?'), 'DM-04 held message seeded into the thread');

  // Authorization — the sender (jordan) cannot accept a request addressed to sam
  await as(B);
  const forbid = await respondToRequest(moneyReq!.id, true);
  assert(!forbid.ok, 'authz: non-recipient (sender) cannot accept a request');

  // DM-01 / DM-05 — contacts deliver to the thread + history loads
  const samSub3 = await as(A);
  const r4 = await sendDm(jordanSub, 'glad we connected');
  assert(r4.delivered && !r4.held, 'DM-01 message between contacts delivers to the thread');
  assert((await threadMessages(samSub3, jordanSub)).some((m) => m.content === 'glad we connected'), 'DM-05 thread history loads delivered messages');

  // SAFE-06 / SAFE-07 — "I need help" notifies the connected guardian
  // sam links jordan as a connected trusted person, then triggers the alert.
  for (const g of (await client.models.GuardianLink.list({ filter: { userId: { eq: samSub3 }, guardianId: { eq: jordanSub } } })).data) {
    await client.models.GuardianLink.delete({ id: g.id });
  }
  await client.models.GuardianLink.create({ userId: samSub3, guardianId: jordanSub, status: 'connected', permissions: ['help'] });
  const help = await sendHelpAlert('need support');
  assert(help.notified >= 1, 'SAFE-06 help alert created a notification for the trusted person');

  // SAFE-04 — report persists
  await reportMessage('msg-under-test', 'spam');
  assert((await client.models.Report.list({ filter: { targetId: { eq: 'msg-under-test' } } })).data.length >= 1, 'SAFE-04 report creates a Report record');

  // SAFE-05 — block sets Contact.status=blocked
  const toBlock = samContacts.data[0];
  await blockContact(toBlock.id);
  const blocked = await client.models.Contact.get({ id: toBlock.id });
  assert(blocked.data?.status === 'blocked', 'SAFE-05 block sets Contact.status=blocked');

  // SAFE-07 — the guardian actually receives the in-app notification
  await as(B);
  const notifs = await client.models.Notification.list({ filter: { userId: { eq: jordanSub }, type: { eq: 'help' } } });
  assert(notifs.data.length >= 1, "SAFE-07 guardian receives the in-app 'help' Notification");

  await signOut().catch(() => undefined);
  console.log('\n=== Result ===');
  if (failures === 0) console.log('PHASE5 VERIFY: PASS');
  else console.error(`${failures} CHECK(S) FAILED \u274c`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('Harness error:', e); process.exit(1); });
