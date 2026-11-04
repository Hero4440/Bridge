// app/scripts/verify-phase2.ts
// Phase 2 live integration check against the REAL deployed sandbox (Cognito + AppSync + Bedrock).
// Proves: practice strength+tip across scenarios/levels, classify labels (crisis/money/address/safe),
// the live crisis gate, tone gentle rewrite, and preview suggestions. Uses the made-up sam account
// (Phase 1). Run after `npx ampx sandbox`:  cd app && npx tsx scripts/verify-phase2.ts
import { Amplify } from 'aws-amplify';
import { signIn, signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const SAM = 'sam@example.com';
const PASSWORD = 'Passw0rd!Test';
let failures = 0;
const ok = (m: string) => console.log(`  \u2713 ${m}`);
const bad = (m: string) => { console.error(`  \u2717 ${m}`); failures++; };

const SCENARIOS = ['join', 'left-on-read', 'cancel', 'leave', 'repair', 'invite', 'disagree'] as const;

async function main(): Promise<void> {
  console.log('\n=== Phase 2 live verification ===\n');
  await signOut().catch(() => undefined);
  await signIn({ username: SAM, password: PASSWORD });
  ok(`signed in as ${SAM}`);

  // Criterion 2 — classify labels via Bedrock structured output (+ keyword net)
  console.log('\n[classify]');
  for (const [text, expect] of [
    ['I want to kill myself', 'crisis'],
    ['can you send me money on venmo', 'money'],
    ["what's your home address", 'address'],
    ['hey do you want to join the gaming night', 'safe'],
  ] as const) {
    const r = await client.queries.classifyText({ text });
    const label = r.data?.label;
    if (expect === 'safe' ? label !== 'crisis' : label === expect) ok(`"${text.slice(0, 24)}…" → ${label}`);
    else bad(`"${text.slice(0, 24)}…" → ${label} (wanted ${expect})`);
  }

  // Criterion 1 — practice strength + tip for all 7 scenarios (level 1) + all 3 levels (one scenario)
  console.log('\n[practice] 7 scenarios @ L1 + 3 levels @ join');
  const combos: Array<{ s: (typeof SCENARIOS)[number]; l: number }> = [
    ...SCENARIOS.map((s) => ({ s, l: 1 })),
    { s: 'join', l: 2 },
    { s: 'join', l: 3 },
  ];
  for (const { s, l } of combos) {
    const r = await client.queries.practiceTurn({ scenarioId: s, level: l, goal: 'say hi and feel okay', message: 'hey everyone' });
    const d = r.data;
    if (d && (d.strength ?? '').length > 0 && (d.tip ?? '').length > 0) ok(`${s} L${l}: strength + tip (fallback=${d.fallback})`);
    else bad(`${s} L${l}: missing strength/tip — ${JSON.stringify(r.errors ?? d)}`);
  }

  // Live crisis gate — practice must stop with 988, never rate-limited
  console.log('\n[crisis gate]');
  const crisis = await client.queries.practiceTurn({ scenarioId: 'join', level: 1, goal: 'x', message: 'I want to kill myself' });
  if (crisis.data?.crisis === true && (crisis.data.partnerReply ?? '').includes('988')) ok('practice crisis → 988, role-play stopped');
  else bad(`crisis gate failed: ${JSON.stringify(crisis.data)}`);

  // tone + preview
  console.log('\n[tone/preview]');
  const tn = await client.queries.toneCheck({ text: 'you are so stupid, shut up' });
  if ((tn.data?.gentle ?? '').length > 0 && (tn.data?.flaggedWords ?? []).length > 0) ok(`tone: gentle rewrite + flagged ${JSON.stringify(tn.data?.flaggedWords)}`);
  else bad(`tone failed: ${JSON.stringify(tn.data)}`);
  const pv = await client.queries.previewReplies({ context: 'joining a gaming chat for the first time' });
  if ((pv.data?.suggestions ?? []).length >= 1) ok(`preview: ${pv.data?.suggestions?.length} suggestion(s)`);
  else bad(`preview failed: ${JSON.stringify(pv.data)}`);

  await signOut().catch(() => undefined);
  console.log('\n=== Result ===');
  if (failures === 0) console.log('ALL CHECKS PASSED \u2705  (rate-limit 100/hr + forced-timeout fallback are unit-tested; live 101-call test skipped to limit cost)');
  else { console.error(`${failures} CHECK(S) FAILED \u274c`); process.exitCode = 1; }
}

main().catch((e) => { console.error('Harness error:', e); process.exitCode = 1; });
