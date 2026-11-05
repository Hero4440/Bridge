---
plan: 03
title: practice() Lambda — Mo role-play, strength+tip across 7 scenarios × 3 levels
wave: 2
depends_on: [01]
autonomous: true
files_modified:
  - app/amplify/functions/practice/resource.ts
  - app/amplify/functions/practice/prompts.ts
  - app/amplify/functions/practice/handler.ts
  - app/amplify/functions/practice/__tests__/handler.test.ts
  - AI_PROMPTS/<YourName>.md
requirements: [LAMBDA-02, AI-01, AI-02, AI-03, LAMBDA-06, LAMBDA-08, AI-07]
must_haves:
  truths:
    - "Practice returns exactly one strength + one tip for all 7 scenarios at all 3 levels"
    - "Crisis input stops the role-play and surfaces 988 + trusted-person, never rate-limited"
    - "Non-crisis turns are rate-limited 100/hr; over limit returns a gentle Mo message"
    - "PracticeRun is saved with no raw transcript (scenario/level/labels/fallback only)"
  artifacts:
    - path: "app/amplify/functions/practice/prompts.ts"
      provides: "7-scenario map, 3-level modifiers, §2.7 guarded system prompt, forced-tool schema"
      contains: "left-on-read"
    - path: "app/amplify/functions/practice/handler.ts"
      provides: "validate→classify(in)→rate-limit→Sonnet→classify(out)→save→reply"
      contains: "PRACTICE_MODEL_ID"
  key_links:
    - from: "practice/handler.ts"
      to: "shared/classify.ts + shared/rateLimit.ts + shared/bedrock.ts"
      via: "import"
      pattern: "checkRateLimit"
---

<objective>
Deploy the `practice()` Lambda implementing Mo's scripted role-play: one parameterized system prompt covering all 7 scenarios × 3 support levels, returning a short partner reply + exactly one strength + one tip judged against the user's own goal. The turn runs validate → classify(input) → rate-limit → Sonnet Converse (forced tool) → classify(output) → save PracticeRun (no transcript) → reply, with the shared fallback on timeout.

Purpose: LAMBDA-02, AI-01/02/03 and success criterion 1 (strength+tip for 7×3). Rate-limit usage = LAMBDA-08; fallback = AI-07.
Output: `app/amplify/functions/practice/{resource,prompts,handler}.ts` + test; practice prompt logged.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-ai-backend-infrastructure/02-CONTEXT.md
@.claude/skills/bridge/SKILL.md
@app/amplify/functions/shared/bedrock.ts
@app/amplify/functions/shared/classify.ts
@app/amplify/functions/shared/rateLimit.ts
@app/amplify/functions/shared/schemas.ts
@app/amplify/data/resource.ts
</context>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| AppSync (Cognito) → practice Lambda | authenticated user goal + message |
| practice Lambda → Bedrock | user text leaves to Sonnet |
| practice Lambda → PracticeRun table | owner-only record written |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-11 | Tampering (prompt injection) | prompts.ts system prompt | mitigate | §2.7 guardrails embedded: stay in role, judge only against user goal, no impersonation/medical/financial, parity (task 2-03-01) |
| T-02-12 | Elevation (crisis bypass) | handler.ts | mitigate | classify(input) first; crisis → stop role-play + 988, never rate-limited (task 2-03-02) |
| T-02-13 | DoS (cost flood) | handler.ts | mitigate | checkRateLimit 100/hr for non-crisis + maxTokens 500 (task 2-03-02) |
| T-02-14 | Info disclosure (transcript) | PracticeRun write | mitigate | save scenario/level/strength/tip/fallback only, no message/partnerReply text (task 2-03-02) |
| T-02-15 | Info (output harm) | handler.ts | mitigate | classify(output) on model's own reply before returning |
</threat_model>

<tasks>

<task type="auto" id="2-03-01">
  <name>practice resource + parameterized guarded prompt (7 scenarios × 3 levels)</name>
  <read_first>.planning/phases/02-ai-backend-infrastructure/02-CONTEXT.md, .claude/skills/bridge/SKILL.md, app/amplify/functions/shared/schemas.ts</read_first>
  <files>app/amplify/functions/practice/resource.ts, app/amplify/functions/practice/prompts.ts, AI_PROMPTS/&lt;YourName&gt;.md</files>
  <action>
`app/amplify/functions/practice/resource.ts`:
```ts
import { defineFunction } from '@aws-amplify/backend';
// Mo's scripted practice role-play. Sonnet-class (D-01). Writes PracticeRun (authz in plan 05).
export const practice = defineFunction({ name: 'practice', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
```

`app/amplify/functions/practice/prompts.ts` — one system prompt parameterized by scenario + level, all §2.7 guardrails inline:
```ts
export const SCENARIOS = {
  'join': 'joining an ongoing group chat',
  'left-on-read': 'a friend left your message on read',
  'cancel': 'a friend cancels plans last minute',
  'leave': 'leaving an event early when you are tired',
  'repair': 'repairing things after you said something harsh',
  'invite': 'inviting someone to do something',
  'disagree': 'disagreeing kindly',
} as const;
export const LEVELS = {
  1: 'Guided: offer gentle hint chips, be very encouraging.',
  2: 'Light help: fewer hints; only help if the user seems stuck.',
  3: 'On your own: no hints; add one small realistic surprise.',
} as const;
export const PRACTICE_SYSTEM = (scenario: string, level: 1|2|3, goal: string) => `You are Mo, a kind, short, non-judgmental practice buddy for a neurodivergent young adult.
Scenario: ${scenario}. Support level — ${LEVELS[level]}
The user's OWN goal: "${goal}". Judge ONLY against their goal; never toward "sounding more neurotypical".
Parity: your advice must NOT change if the user mentions any diagnosis.
Plain, friendly, short language. Stay in role. No medical/legal/financial advice ("I'm not sure, ask a person"). Never ask for or store ID, medication, financial or SSN data. No romantic/sexual/abusive role-play. Never imitate real people. Practice stays scripted and bounded. If the user expresses crisis or self-harm, STOP and show 988 + a trusted-person prompt. Flag any request for money or an address.
Respond ONLY via the 'feedback' tool: a short in-character partnerReply, exactly one genuine strength, and exactly one actionable tip tied to their goal.`;
export const PRACTICE_TOOL_SCHEMA = { type: 'object', properties: { partnerReply: { type: 'string' }, strength: { type: 'string' }, tip: { type: 'string' } }, required: ['partnerReply','strength','tip'] } as const;
```
Log PRACTICE_SYSTEM in `AI_PROMPTS/<YourName>.md` (Type=system/persona, Model=Sonnet, variables {scenario}{level}{goal}, guardrails §2.7, date).
  </action>
  <acceptance_criteria>
- `grep -c "'join'\|'left-on-read'\|'cancel'\|'leave'\|'repair'\|'invite'\|'disagree'" app/amplify/functions/practice/prompts.ts` ≥ 7 (all 7 scenario keys present)
- `grep -q "LEVELS = {" app/amplify/functions/practice/prompts.ts` and keys 1,2,3 present
- `grep -q "required: \['partnerReply','strength','tip'\]" app/amplify/functions/practice/prompts.ts`
- `grep -q "988" app/amplify/functions/practice/prompts.ts` and `grep -q "parity\|Parity" app/amplify/functions/practice/prompts.ts`
- `grep -q "practice" AI_PROMPTS/`*`.md`
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
  </acceptance_criteria>
  <done>practice resource + prompts cover 7 scenarios, 3 levels, §2.7 guardrails, strength+tip forced-tool schema; prompt logged.</done>
</task>

<task type="auto" id="2-03-02" tdd="true">
  <name>practice handler — full guarded turn + PracticeRun save (no transcript)</name>
  <read_first>app/amplify/functions/practice/prompts.ts, app/amplify/functions/shared/bedrock.ts, app/amplify/functions/shared/classify.ts, app/amplify/functions/shared/rateLimit.ts, app/amplify/data/resource.ts</read_first>
  <files>app/amplify/functions/practice/handler.ts, app/amplify/functions/practice/__tests__/handler.test.ts</files>
  <behavior>
    - crisis input → returns crisis reply with 988, does NOT call checkRateLimit or the model
    - valid non-crisis input + mocked ok model → { partnerReply, strength, tip, fallback:false }
    - model {ok:false} → FALLBACKS.practice with fallback:true
    - rate-limit over 100 → gentle RATE_LIMIT_MESSAGE, fallback:true
    - PracticeRun payload contains no message/partnerReply text field
  </behavior>
  <action>
```ts
import { practiceInput, practiceOutput } from '../shared/schemas';
import { classify } from '../shared/classify';
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '../shared/rateLimit';
import { converseWithTool } from '../shared/bedrock';
import { FALLBACKS } from '../shared/fallback';
import { logTurn } from '../shared/log';
import { PRACTICE_MODEL_ID } from '../../shared/config';
import { PRACTICE_SYSTEM, PRACTICE_TOOL_SCHEMA, SCENARIOS } from './prompts';
// Data client for PracticeRun (env + schema authz wired in plan 05):
// import { generateClient } from 'aws-amplify/data'; import { env } from '$amplify/env/practice';

export const handler = async (event: any) => {
  const started = Date.now();
  const userId = event.identity?.sub ?? 'anon';
  const parsed = practiceInput.safeParse(event.arguments);
  if (!parsed.success) return { ...FALLBACKS.practice, fallback: true };
  const { scenarioId, level, goal, message } = parsed.data;

  const inLabel = await classify(message);            // 1. classify input
  if (inLabel.label === 'crisis') {                   // crisis: stop, 988, never rate-limited
    logTurn({ fn: 'practice', scenario: scenarioId, level, latencyMs: Date.now() - started, labels: ['crisis'], fallback: false });
    return { partnerReply: "I want to pause here. You deserve support right now — you can call or text 988, and reach out to your trusted person.", strength: "You spoke up about something hard.", tip: "Talk to someone you trust today.", fallback: false, crisis: true };
  }
  const rl = await checkRateLimit(userId);            // 2. rate limit (non-crisis only)
  if (!rl.allowed) { logTurn({ fn: 'practice', scenario: scenarioId, level, latencyMs: Date.now() - started, labels: [inLabel.label], fallback: true }); return { partnerReply: RATE_LIMIT_MESSAGE, strength: '', tip: '', fallback: true, rateLimited: true }; }

  const res = await converseWithTool({ modelId: PRACTICE_MODEL_ID, system: PRACTICE_SYSTEM(SCENARIOS[scenarioId], level, goal), message, toolName: 'feedback', inputSchema: PRACTICE_TOOL_SCHEMA as any, validator: practiceOutput }); // 3. model
  const reply = res.ok ? res.value : FALLBACKS.practice;
  const outLabel = await classify(reply.partnerReply); // 4. classify output

  // 5. save PracticeRun — NO transcript (TODO plan 05 wires the env Data client):
  // await client.models.PracticeRun.create({ scenarioId, level, strengthGiven: reply.strength, tipGiven: reply.tip, fallback: !res.ok });
  logTurn({ fn: 'practice', scenario: scenarioId, level, latencyMs: Date.now() - started, labels: [inLabel.label, outLabel.label], fallback: !res.ok });
  return { ...reply, fallback: !res.ok };
};
```
Write `__tests__/handler.test.ts` for the behavior block (mock classify/converseWithTool/checkRateLimit).
  </action>
  <acceptance_criteria>
- `grep -q "await classify(message)" app/amplify/functions/practice/handler.ts`
- `grep -q "inLabel.label === 'crisis'" app/amplify/functions/practice/handler.ts` and `grep -q "988" app/amplify/functions/practice/handler.ts`
- `grep -q "checkRateLimit(userId)" app/amplify/functions/practice/handler.ts`
- crisis path appears BEFORE checkRateLimit: `awk '/inLabel.label === .crisis./{c=NR} /checkRateLimit/{r=NR} END{exit !(c<r)}' app/amplify/functions/practice/handler.ts`
- `! grep -q "message," app/amplify/functions/practice/handler.ts | grep PracticeRun` (no transcript in save — PracticeRun.create payload has only scenarioId/level/strengthGiven/tipGiven/fallback)
- `cd app && npx vitest run amplify/functions/practice` exits 0
  </acceptance_criteria>
  <done>Handler runs the full guarded turn; crisis bypasses rate limit; fallback on model failure; PracticeRun save carries no transcript; tests pass.</done>
</task>

</tasks>

<verification>
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
- `cd app && npx vitest run amplify/functions/practice` exits 0
</verification>

<success_criteria>
practice Lambda returns strength+tip for all 7 scenarios × 3 levels; crisis stops role-play with 988 and skips rate limit; non-crisis turns rate-limited; model failure yields warm fallback; PracticeRun stores no transcript.
</success_criteria>

<output>
After completion, create `.planning/phases/02-ai-backend-infrastructure/02-03-SUMMARY.md`.
</output>
