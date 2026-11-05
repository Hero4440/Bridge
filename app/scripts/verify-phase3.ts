// app/scripts/verify-phase3.ts
// Phase 3 end-to-end live verification against the REAL sandbox (no mocks). Signs in as two made-up
// test accounts and asserts: event create/persist, RSVP upsert + counts, prep/what-to-expect,
// reflection save + Mo reply, PracticeRun persistence (no transcript), and two-account owner isolation.
// Run after `npx ampx sandbox`:  cd app && npx tsx scripts/verify-phase3.ts
import { Amplify } from 'aws-amplify';
import { signIn, signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';
import { createEvent, getEvent } from '../src/lib/data';
import { setRsvp, listRsvpsForEvent, countRsvps } from '../src/lib/rsvp';
import { saveReflection } from '../src/lib/reflection';
import { prepFor, whatToExpect, type EventFormat } from '../src/lib/prep';

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

async function main(): Promise<void> {
  console.log('\n=== Phase 3 live verification ===\n');
  await as(A);
  console.log('[A] signed in as sam');

  // EVENT-01 / EVENT-02 — create + persist + read back
  const created = await createEvent({
    what: 'Game night', whenAt: new Date().toISOString(), durationMinutes: 60,
    format: 'inPerson', venue: 'Launchpad', usuallyQuiet: true,
    comfortSound: 'quiet', comfortLighting: 'soft', comfortSize: 8,
    reminder: 'oneHour', tellTrustedPerson: true, exitPlan: 'slip out the side',
  });
  assert(!!created.id, 'EVENT-01 create event → DynamoDB');
  const eventId = created.id;
  const got = await getEvent(eventId);
  assert(got?.what === 'Game night' && got?.venue === 'Launchpad', 'EVENT-02 event persists & reads back unchanged');

  // EVENT-03 / EVENT-04 — RSVP upsert (no duplicate on re-RSVP)
  await setRsvp(eventId, 'going');
  await setRsvp(eventId, 'maybe');
  const rsvps = await listRsvpsForEvent(eventId);
  assert(rsvps.length === 1, `EVENT-04 re-RSVP updates one record, no duplicate (found ${rsvps.length})`);
  assert(rsvps[0]?.status === 'maybe', 'EVENT-03 RSVP status persisted as latest (maybe)');

  // EVENT-05 — counts
  const counts = countRsvps(rsvps);
  assert(counts.maybe === 1 && counts.going === 0 && counts.cant === 0, `EVENT-05 counts ${JSON.stringify(counts)}`);

  // EVENT-06 — static prep + host what-to-expect (no AI)
  assert(prepFor((got?.format ?? 'inPerson') as EventFormat).checklist.length > 0, 'EVENT-06 prep template non-empty');
  assert(whatToExpect(got ?? {}).length > 0, 'EVENT-06 what-to-expect from host fields');

  // EVENT-07 — reflection save + warm Mo reply (real reflectReply query)
  const refl = await saveReflection(
    { feeling: 'good', wins: ['said hi'], eventId },
    async ({ feeling, wins }) => {
      const r = await client.queries.reflectReply({ feeling, wins });
      return r.data?.reply ?? '';
    },
  );
  assert(!!refl.reflection.id, 'EVENT-07 reflection saved owner-only');
  assert(refl.reply.length > 0, `EVENT-07 Mo reply returned (fallback=${refl.fallback})`);

  // D-04 — PracticeRun persisted with no transcript
  await client.queries.practiceTurn({ scenarioId: 'join', level: 1, goal: 'say hi', message: 'hey everyone' });
  const runs = await client.models.PracticeRun.list();
  assert(runs.data.length >= 1, 'D-04 PracticeRun persisted');
  const run = (runs.data[0] ?? {}) as Record<string, unknown>;
  assert(!('transcript' in run) && !('message' in run) && !('partnerReply' in run), 'D-04 PracticeRun stores no transcript/message field');

  // Two-account owner isolation as B
  await as(B);
  console.log('[B] signed in as jordan');
  const bEvent = await client.models.Event.get({ id: eventId });
  assert(!!bEvent.data, "isolation: B CAN read A's Event (authenticated read)");
  const bRefl = await client.models.Reflection.list();
  assert(bRefl.data.every((r) => r.id !== refl.reflection.id), "isolation: B CANNOT read A's Reflection (owner-only)");
  const bRuns = await client.models.PracticeRun.list();
  assert(bRuns.data.every((r) => r.id !== (run.id as string)), "isolation: B CANNOT read A's PracticeRun (owner-only)");
  const bUpd = await client.models.Event.update({ id: eventId, what: 'HACKED' });
  assert(!!bUpd.errors?.length || !bUpd.data || bUpd.data.what !== 'HACKED', "isolation: B CANNOT update A's Event (owner-write)");

  await signOut().catch(() => undefined);
  console.log('\n=== Result ===');
  if (failures === 0) console.log('PHASE3 VERIFY: PASS');
  else { console.error(`${failures} CHECK(S) FAILED \u274c`); process.exitCode = 1; }
}

main().catch((e) => { console.error('Harness error:', e); process.exitCode = 1; });
