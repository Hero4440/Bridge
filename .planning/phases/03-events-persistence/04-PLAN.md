---
phase: 03-events-persistence
plan: 04
type: execute
wave: 2
depends_on: [1]
files_modified:
  - app/amplify/data/resource.ts
  - app/amplify/functions/reflectReply/resource.ts
  - app/amplify/functions/reflectReply/handler.ts
  - app/amplify/functions/reflectReply/prompts.ts
  - app/amplify/functions/practice/handler.ts
  - app/amplify/backend.ts
autonomous: true
requirements: [EVENT-07]

must_haves:
  truths:
    - "A reflectReply custom query returns a warm, in-role Mo reply via Bedrock Converse, with a warm fallback on throttle/timeout"
    - "The practice Lambda persists a PracticeRun (scenarioId/level/strength/tip/fallback) with NO transcript, using the $amplify/env Data client"
    - "The practice function has schema-level allow.resource access and least-privilege exact-ARN Bedrock IAM"
  artifacts:
    - path: "app/amplify/functions/reflectReply/handler.ts"
      provides: "Bedrock Converse reflection reply with guardrails + warm fallback"
      contains: "Converse"
    - path: "app/amplify/functions/practice/handler.ts"
      provides: "PracticeRun persistence via $amplify/env Data client"
      contains: "PracticeRun"
    - path: "app/amplify/data/resource.ts"
      provides: "reflectReply custom query + schema-level allow.resource(practice)"
      contains: "reflectReply"
  key_links:
    - from: "app/amplify/functions/practice/handler.ts"
      to: "PracticeRun model"
      via: "$amplify/env Data client create"
      pattern: "PracticeRun\\.create"
    - from: "app/amplify/data/resource.ts"
      to: "practice function"
      via: "allow.resource(practice)"
      pattern: "allow\\.resource\\("
---

<objective>
Add the warm Mo reflection reply and persist practice outcomes. D-03: a `reflectReply` Bedrock Converse custom query (§2.7 guardrails, warm fallback, exact-ARN IAM). D-04: the practice Lambda persists a `PracticeRun` (scenarioId/level/strength/tip/fallback, NO transcript) via the `$amplify/env` runtime Data client, with schema-level `allow.resource(practice)`.

Purpose: EVENT-07's reflection reply needs a real Bedrock call that degrades gracefully; D-04 closes the practice persistence gap so runs survive without ever storing a transcript. The `$amplify/env/practice` import only resolves after deploy, so it is isolated here and verified live in Plan 05 — no pre-deploy `amplify-tsc` gate is run on the practice handler.
Output: `reflectReply/` function trio, custom query + `allow.resource` in `data/resource.ts`, PracticeRun persistence in `practice/handler.ts`, IAM in `backend.ts`.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-events-persistence/03-CONTEXT.md
@.planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md
@app/amplify/data/resource.ts
@app/amplify/backend.ts
@app/amplify/functions/practice/handler.ts

<interfaces>
<!-- Phase 2 established the AI Lambda pattern: Converse API, toolConfig for structured output, zod validation, -->
<!-- classify() on input and output, exact-ARN Bedrock IAM in backend.ts. Reuse these patterns. -->
```typescript
// D-04 runtime Data client inside a Lambda (resolves ONLY post-deploy):
import { env } from '$amplify/env/practice';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();
// client.models.PracticeRun.create({ scenarioId, level, strength, tip, fallback }) — NO transcript
```
```typescript
// reflectReply custom query (authenticated), returns a warm reply string/object:
reflectReply: a.query()
  .arguments({ feeling: a.string().required(), wins: a.string().array() })
  .returns(a.ref('ReflectReply'))  // or a.json()
  .authorization((allow) => [allow.authenticated()])
  .handler(a.handler.function(reflectReply)),
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 3-04-01: reflectReply Bedrock Converse custom query</name>
  <files>app/amplify/functions/reflectReply/resource.ts, app/amplify/functions/reflectReply/handler.ts, app/amplify/functions/reflectReply/prompts.ts, app/amplify/data/resource.ts, app/amplify/backend.ts</files>
  <read_first>
    - Read an existing Phase 2 AI function (e.g. `app/amplify/functions/toneCheck/` or `practice/`): copy its Converse API usage, zod validation, `classify()` output-check, maxTokens/temperature caps, and fallback pattern. Reuse rather than re-derive.
    - Read how Phase 2 wired exact-ARN Bedrock IAM for an AI function in `backend.ts`, and how custom queries are registered in `data/resource.ts`.
    - Confirm the chosen model/inference-profile ARN already recorded in `app/amplify/shared/config.ts`.
  </read_first>
  <action>
    Create `reflectReply/resource.ts` (`defineFunction`), `reflectReply/prompts.ts` (the warm, in-role Mo system prompt as a named constant — §2.7 guardrails: stay in role, short/kind/non-judgmental, no medical/legal/financial advice, crisis → 988 + trusted person, no romantic/abusive content, judge nothing against "sound neurotypical"), and `reflectReply/handler.ts` using the Converse API (`@aws-sdk/client-bedrock-runtime`) with low temperature and capped maxTokens. Validate input with zod; run `classify()` on input and output per the §2.7/house pattern. On throttle/timeout: SDK retries then return a warm fallback with `fallback: true` (never dead-end).

    Register the `reflectReply` custom query in `data/resource.ts` with `allow.authenticated()` and `a.handler.function(reflectReply)`. In `backend.ts`, grant the reflectReply Lambda `bedrock:InvokeModel` scoped to the EXACT model / inference-profile ARNs (plus the foundation-model ARNs for every region a cross-region profile routes to) — never `"*"`. Log only request id / labels / fallback, never message content.

    Reuse the existing reflection reply if Phase 2 already exposes an equivalent; if so, document the reuse in the SUMMARY instead of duplicating. Add a why-comment to each new file. No `@ts-nocheck`, no `any` without a commented reason.
  </action>
  <verify>
    <automated>cd app && grep -Eq "reflectReply" amplify/data/resource.ts && grep -Eq "Converse|ConverseCommand" amplify/functions/reflectReply/handler.ts && grep -Eq "fallback" amplify/functions/reflectReply/handler.ts && grep -Eq "bedrock:InvokeModel" amplify/backend.ts && ! grep -Eq "resources: \[['\"]\*['\"]\]" amplify/backend.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "reflectReply" app/amplify/data/resource.ts` ≥ 1 and the query uses `allow.authenticated()`
    - handler.ts uses the Converse API (grep "Converse" ≥1) and returns `fallback` (grep ≥1)
    - `app/amplify/functions/reflectReply/prompts.ts` exists and contains the system prompt constant
    - `backend.ts` grants `bedrock:InvokeModel` and contains NO `resources: ['*']` for the reflectReply policy: `grep -Ec "resources: \['\*'\]" app/amplify/backend.ts` = 0
    - handler.ts contains no `@ts-nocheck` (grep -c = 0)
  </acceptance_criteria>
  <done>reflectReply custom query live with Converse, guardrailed prompt, warm fallback, exact-ARN IAM.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3-04-02: Persist PracticeRun via $amplify/env + schema allow.resource(practice)</name>
  <files>app/amplify/functions/practice/handler.ts, app/amplify/data/resource.ts</files>
  <read_first>
    - Read the current `app/amplify/functions/practice/handler.ts` fully: it already computes strength/tip and a fallback flag. Add persistence at the end without altering the existing Converse call or response contract.
    - Read the PracticeRun model in resource.ts: confirm fields (scenarioId, level, strength, tip, fallback) and that there is NO transcript field. If a transcript-like field exists, do NOT write to it.
    - IMPORTANT: `$amplify/env/practice` resolves ONLY after deploy. Do NOT add a pre-deploy `amplify-tsc`/`npx tsc` gate on this handler — isolate the import and verify via deploy + integration in Plan 05.
  </read_first>
  <action>
    In `practice/handler.ts`, add the runtime Data client exactly per the interface block: `import { env } from '$amplify/env/practice'`, `getAmplifyDataClientConfig(env)` from `@aws-amplify/backend/function/runtime`, `Amplify.configure(...)`, `generateClient<Schema>()`. After computing the reply, persist `client.models.PracticeRun.create({ scenarioId, level, strength, tip, fallback })` — NO transcript, no raw message text (§2.8). Wrap persistence in try/catch so a persistence error logs (request id + labels only) but never breaks the practice response. Keep the `$amplify/env` import grouped/isolated at the top with a comment noting it resolves post-deploy.

    In `data/resource.ts`, add schema-level `.authorization((allow) => [allow.resource(practice)])` to the PracticeRun model (D-04) so the practice function can use the Data client, importing the `practice` function reference. Do not broaden PracticeRun's owner auth — it stays `allow.owner()` for users PLUS `allow.resource(practice)` for the function.
  </action>
  <verify>
    <automated>cd app && grep -Eq "\\\$amplify/env/practice" amplify/functions/practice/handler.ts && grep -Eq "getAmplifyDataClientConfig" amplify/functions/practice/handler.ts && grep -Eq "PracticeRun\.create" amplify/functions/practice/handler.ts && ! grep -Eiq "transcript" amplify/functions/practice/handler.ts && grep -Eq "allow\.resource\(" amplify/data/resource.ts</automated>
  </verify>
  <acceptance_criteria>
    - handler.ts imports from `$amplify/env/practice` and calls `getAmplifyDataClientConfig` (grep each ≥1)
    - `grep -c "PracticeRun.create" app/amplify/functions/practice/handler.ts` ≥ 1
    - `grep -Eic "transcript" app/amplify/functions/practice/handler.ts` = 0 (no transcript persisted)
    - `grep -c "allow.resource(" app/amplify/data/resource.ts` ≥ 1 and PracticeRun retains `allow.owner()`
    - NOTE: no pre-deploy tsc gate on practice/handler.ts (the `$amplify/env` module resolves only after deploy — verified in Plan 05)
  </acceptance_criteria>
  <done>practice handler persists PracticeRun (no transcript) via the runtime Data client; PracticeRun has schema-level allow.resource(practice).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| AppSync (Cognito-authorized) → reflectReply Lambda → Bedrock | User feeling/wins text reaches the model |
| practice Lambda → DynamoDB (PracticeRun) via IAM role | Function writes outcome rows |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-10 | Elevation of Privilege | Over-broad Lambda IAM | mitigate | reflectReply `bedrock:InvokeModel` scoped to exact model/profile ARNs (no `"*"`); practice gets Data access via schema `allow.resource(practice)`, not a wildcard policy. Grep gate + Plan 05 confirms. |
| T-03-11 | Information Disclosure | Transcript / message content leak | mitigate | PracticeRun stores scenarioId/level/strength/tip/fallback only; logs carry request id + labels + fallback, never content (§2.8). Grep asserts no `transcript`. |
| T-03-12 | Tampering/Injection | Prompt injection via feeling/wins | mitigate | reflectReply system prompt (§2.7) keeps Mo in role; `classify()` on input and output; warm fallback on anomaly/throttle. |
| T-03-13 | Denial of Service | Bedrock throttle on reflectReply | mitigate | SDK retries then warm fallback (`fallback: true`); capped maxTokens/temperature; counts fallbacks in logs. |
</threat_model>

<verification>
- Static gates: grep for reflectReply query, Converse usage, fallback, exact-ARN IAM (no `['*']`), `$amplify/env/practice`, `PracticeRun.create`, `allow.resource(`, and absence of `transcript`.
- Deliberately NO pre-deploy tsc on `practice/handler.ts` (the `$amplify/env` import resolves post-deploy). Runtime correctness — reflectReply returns a warm reply, PracticeRun persists with no transcript — is proven live in Plan 05.
</verification>

<success_criteria>
- reflectReply Bedrock Converse custom query with §2.7 guardrails, warm fallback, exact-ARN IAM.
- practice handler persists PracticeRun via `$amplify/env` Data client, no transcript.
- PracticeRun has schema-level `allow.resource(practice)` alongside `allow.owner()`.
</success_criteria>

<output>
After completion, create `.planning/phases/03-events-persistence/03-04-SUMMARY.md`.
</output>
