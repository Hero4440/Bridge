// app/scripts/verify-phase1.ts
// Phase 1 live verification harness against the REAL deployed sandbox (Cognito +
// AppSync/DynamoDB). Proves: auto-confirm sign up (D-04, no confirmation step),
// sign in / sign out, and owner-isolation (DATA-10 / D-08) via a two-account test.
// Uses made-up emails only (SKILL §4). Run after `npx ampx sandbox` is green:
//   cd app && npx tsx scripts/verify-phase1.ts
import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const PASSWORD = 'Passw0rd!Test';
const SAM = 'sam@example.com';
const JORDAN = 'jordan@example.com';

let failures = 0;
const ok = (msg: string) => console.log(`  \u2713 ${msg}`);
const bad = (msg: string) => { console.error(`  \u2717 ${msg}`); failures++; };

async function ensureAccount(email: string): Promise<void> {
  try {
    const res = await signUp({ username: email, password: PASSWORD, options: { userAttributes: { email } } });
    if (res.isSignUpComplete) ok(`signUp ${email}: complete, no confirmation step (D-04)`);
    else bad(`signUp ${email}: expected auto-confirm but nextStep=${res.nextStep.signUpStep} (pre-sign-up trigger may not have fired)`);
  } catch (e: unknown) {
    const name = (e as { name?: string }).name;
    if (name === 'UsernameExistsException') ok(`signUp ${email}: already exists (ok, idempotent)`);
    else { bad(`signUp ${email} threw ${name ?? e}`); throw e; }
  }
}

async function as(email: string): Promise<void> {
  await signOut().catch(() => undefined);
  await signIn({ username: email, password: PASSWORD });
  const user = await getCurrentUser();
  ok(`signed in as ${email} (userId ${user.userId.slice(0, 8)}…)`);
}

async function main(): Promise<void> {
  console.log('\n=== Phase 1 live verification ===\n');

  console.log('[1] Accounts (auto-confirm sign up, D-04 / AUTH-01):');
  await ensureAccount(SAM);
  await ensureAccount(JORDAN);

  console.log('\n[2] Sign in / sign out round-trip (AUTH-02 / AUTH-04):');
  await as(SAM);
  const created = await client.models.Reflection.create({ feeling: 'okay', wins: ['said hi'] });
  if (created.data?.id) ok(`sam created a Reflection (${created.data.id.slice(0, 8)}…)`);
  else bad(`sam could not create a Reflection: ${JSON.stringify(created.errors)}`);
  const samList = await client.models.Reflection.list();
  if ((samList.data?.length ?? 0) >= 1) ok(`sam sees own Reflection(s): ${samList.data.length}`);
  else bad(`sam should see >=1 own Reflection, saw ${samList.data?.length ?? 0}`);
  await signOut();
  try { await getCurrentUser(); bad('signOut failed: still authenticated'); }
  catch { ok('signOut cleared the session (AUTH-04)'); }

  console.log('\n[3] Two-account owner isolation (DATA-10 / D-08):');
  await as(JORDAN);
  const jordanList = await client.models.Reflection.list();
  if ((jordanList.data?.length ?? 0) === 0) ok("jordan sees 0 of sam's Reflections — owner isolation holds");
  else bad(`LEAK: jordan sees ${jordanList.data.length} Reflection(s) belonging to another user`);
  await signOut().catch(() => undefined);

  console.log('\n=== Result ===');
  if (failures === 0) {
    console.log('ALL CHECKS PASSED \u2705  (note: AUTH-03 browser-refresh persistence is a manual browser check)');
  } else {
    console.error(`${failures} CHECK(S) FAILED \u274c`);
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error('Harness error:', e); process.exitCode = 1; });
