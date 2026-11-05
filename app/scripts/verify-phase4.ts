// app/scripts/verify-phase4.ts
// Phase 4 end-to-end live verification against the REAL sandbox (nothing simulated). Signs in as
// two made-up test accounts and asserts: message persistence, real-time subscription delivery
// (push-based, no request loops), groupId filter isolation, the newest-50 window, the AI daily
// topic cached to one row per circle per day, starter-chip suggestions, an observable AppSync
// connection state, and cross-member read visibility.
// Run after `npx ampx sandbox` + seeding:  cd app && npx tsx scripts/verify-phase4.ts
import { Amplify } from 'aws-amplify';
import { signIn, signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';
import { sendMessage, observeMessages } from '../src/lib/messages';
import { getDailyTopic } from '../src/lib/topics';
import { suggestForChip } from '../src/lib/chips';
import { onConnectionChange, type BannerState } from '../src/lib/connection';

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
const as = async (email: string): Promise<void> => {
  await signOut().catch(() => undefined);
  await signIn({ username: email, password: PASSWORD });
};
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function main(): Promise<void> {
  console.log('\n=== Phase 4 live verification ===\n');
  await as(A);
  console.log('[A] signed in as sam');

  // CHAT-03 — collect AppSync connection-state transitions during the run
  const states: BannerState[] = [];
  const unlisten = onConnectionChange((s) => states.push(s));

  // CHAT-02 — real-time delivery via a managed subscription (push-based, no request loops)
  const gid = `verify-chat-${Date.now()}`;
  const marker = `hello-${Date.now()}`;
  let received = false;
  const sub = observeMessages(gid, (items) => { if (items.some((m) => m.content === marker)) received = true; });
  await sleep(1500); // allow the subscription to establish + initial sync
  const sent = await sendMessage({ groupId: gid, content: marker, senderId: 'sam' });
  assert(!!sent.id, 'CHAT-01 message persisted to DynamoDB');
  for (let i = 0; i < 40 && !received; i += 1) await sleep(250); // up to ~10s
  assert(received, 'CHAT-02 message delivered in real-time via subscription (no request loops)');

  // CHAT-04 — groupId filter isolation
  const gidOther = `verify-other-${Date.now()}`;
  await sendMessage({ groupId: gidOther, content: 'other-circle', senderId: 'sam' });
  await sleep(1000);
  const scoped = await client.models.Message.list({ filter: { groupId: { eq: gid } } });
  assert(scoped.data.every((m) => m.content !== 'other-circle'), 'CHAT-04 messages filtered by groupId (no cross-circle leak)');
  sub.unsubscribe();

  // CHAT-07 — newest-50 window (observeMessages caps via lastN)
  const gid50 = `verify-50-${Date.now()}`;
  for (let i = 0; i < 55; i += 1) await sendMessage({ groupId: gid50, content: `m${i}`, senderId: 'sam' });
  const snapLen = await new Promise<number>((resolve) => {
    const s = observeMessages(gid50, (items) => { if (items.length >= 50) { s.unsubscribe(); resolve(items.length); } });
    setTimeout(() => { s.unsubscribe(); resolve(-1); }, 15000);
  });
  assert(snapLen === 50, `CHAT-07 history bounded to newest 50 (got ${snapLen})`);

  // CHAT-05 — AI daily topic, cached one row per circle per day (cost guard)
  const tid = `verify-topic-${Date.now()}`;
  const t1 = await getDailyTopic(tid, 'Gaming');
  const t2 = await getDailyTopic(tid, 'Gaming');
  assert(t1.text.length > 0, 'CHAT-05 daily topic generated');
  assert(t1.text === t2.text, 'CHAT-05 second call returns the SAME cached topic');
  assert(t1.fallback === false, `CHAT-05 real Mo topic (fallback=${t1.fallback})`);
  const topicRows = await client.models.Topic.list({ filter: { groupId: { eq: tid } } });
  assert(topicRows.data.length === 1, `CHAT-05 exactly ONE Topic row cached per circle/day — cost guard (found ${topicRows.data.length})`);

  // CHAT-06 — starter chips reuse previewReplies; drafts only, never auto-sent
  const chip = await suggestForChip('ask', 'Gaming', t1.text);
  assert(chip.suggestions.length >= 1 && chip.fallback === false, `CHAT-06 starter-chip suggestions returned (${chip.suggestions.length})`);
  const own = await suggestForChip('own', 'Gaming');
  assert(own.suggestions.length === 0, 'CHAT-06 write-my-own opens a blank composer (no AI call)');

  // CHAT-03 — connection state was observable (real connection, not a simulated flag)
  await sleep(500);
  unlisten();
  assert(states.length > 0, `CHAT-03 AppSync connection state observable [${states.join(', ')}]`);

  // CHAT-02 — circle messages visible to other authenticated members
  await as(B);
  console.log('[B] signed in as jordan');
  const bRead = await client.models.Message.list({ filter: { groupId: { eq: gid } } });
  assert(bRead.data.some((m) => m.content === marker), 'CHAT-02 circle messages visible to other members (authenticated read)');

  await signOut().catch(() => undefined);
  console.log('\n=== Result ===');
  if (failures === 0) console.log('PHASE4 VERIFY: PASS');
  else console.error(`${failures} CHECK(S) FAILED \u274c`);
  // Open AppSync subscriptions keep Node's event loop alive; exit explicitly after flushing.
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('Harness error:', e); process.exit(1); });
