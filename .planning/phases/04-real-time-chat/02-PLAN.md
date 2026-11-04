---
phase: 04-real-time-chat
plan: 02
type: execute
wave: 2
depends_on: [1]
files_modified:
  - app/amplify/functions/dailyTopic/resource.ts
  - app/amplify/functions/dailyTopic/handler.ts
  - app/amplify/functions/dailyTopic/prompts.ts
  - app/amplify/data/resource.ts
  - app/amplify/backend.ts
  - app/src/lib/topics.ts
  - AI_PROMPTS/Tejas.md
autonomous: true
requirements: [CHAT-05]

must_haves:
  truths:
    - "A daily topic is AI-generated once per circle per day and cached in a Topic row; repeat calls read the cache, never Bedrock"
    - "The topic generator degrades to a warm fallback with fallback:true and never logs topic/message content"
    - "getDailyTopic is a Cognito-authorized custom query backed by a least-privilege Bedrock Lambda (exact ARNs, no wildcard)"
  artifacts:
    - path: "app/amplify/functions/dailyTopic/handler.ts"
      provides: "generate-if-missing daily topic via shared converseWithTool + Topic cache read/write"
      contains: "converseWithTool"
    - path: "app/amplify/data/resource.ts"
      provides: "DailyTopicReply customType + getDailyTopic query + schema-level allow.resource(dailyTopic)"
      contains: "getDailyTopic"
    - path: "app/src/lib/topics.ts"
      provides: "typed client helper calling the getDailyTopic query"
      contains: "getDailyTopic"
  key_links:
    - from: "app/src/lib/topics.ts"
      to: "dailyTopic Lambda via AppSync custom query"
      via: "client.queries.getDailyTopic"
      pattern: "queries.getDailyTopic"
---

<objective>
Add the AI-generated, cached daily topic (CHAT-05, CONTEXT D-03): a `dailyTopic` Lambda that reads today's `Topic` row for a circle and only calls Bedrock when it's missing, then caches the result. Register it as the `getDailyTopic` Cognito-authorized custom query, wire least-privilege Bedrock IAM, and expose a typed client helper.

Purpose: the daily topic lowers the cost of the first message in a circle. User chose AI generation; the Topic cache (one row per circle per day) is the mandatory cost guard so Bedrock is called at most once per circle per day.
Output: `functions/dailyTopic/{resource,handler,prompts}.ts`, schema + backend wiring, `app/src/lib/topics.ts`, and an AI_PROMPTS log entry.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-real-time-chat/04-CONTEXT.md
@.planning/phases/04-real-time-chat/04-RESEARCH.md
@app/amplify/functions/reflectReply/handler.ts
@app/amplify/functions/reflectReply/resource.ts
@app/amplify/functions/preview/prompts.ts
@app/amplify/functions/practice/handler.ts
@app/amplify/functions/shared/bedrock.ts
@app/amplify/shared/config.ts
@app/amplify/data/resource.ts
@app/amplify/backend.ts

<interfaces>
<!-- Mirror functions/reflectReply exactly (resource/handler/prompts shape). Use CLASSIFY_MODEL_ID (Haiku). -->
<!-- Use the $amplify/env/dailyTopic generated Data client to read/write the Topic table (like practice/handler.ts uses it for PracticeRun). Pre-deploy tsc AMPLIFY_DATA_DEFAULT_NAME error is EXPECTED until redeploy. -->
<!-- Add backend.dailyTopic to the aiFunctions IAM loop; the existing BEDROCK_ARNS already cover Haiku. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 4-02-01: dailyTopic Lambda (resource + prompts + generate-if-missing handler)</name>
  <files>app/amplify/functions/dailyTopic/resource.ts, app/amplify/functions/dailyTopic/prompts.ts, app/amplify/functions/dailyTopic/handler.ts</files>
  <read_first>
    - Read app/amplify/functions/reflectReply/{resource,handler,prompts}.ts — copy the exact 3-file shape, imports, and fallback style.
    - Read app/amplify/functions/practice/handler.ts for how it imports and uses the `$amplify/env` generated Data client to read/write a model.
    - Read app/amplify/functions/shared/bedrock.ts (converseWithTool contract) and app/amplify/shared/config.ts (CLASSIFY_MODEL_ID).
    - Read app/amplify/functions/preview/prompts.ts for the §2.7-guarded prompt + TOOL_SCHEMA style.
  </read_first>
  <action>
    Create the three files under `app/amplify/functions/dailyTopic/`:
    1. `resource.ts`: `export const dailyTopic = defineFunction({ name: 'dailyTopic', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 })` with a why-comment.
    2. `prompts.ts`: `TOPIC_SYSTEM` (Mo voice; one short, friendly, inclusive conversation-starter for the named circle; plain language; §2.7 guardrails: no medical/legal/financial advice, never imitate real people, nothing unsafe; reply ONLY via the 'topic' tool with a `text` string) and `TOPIC_TOOL_SCHEMA` ({ type:'object', properties:{ text:{type:'string'} }, required:['text'] }).
    3. `handler.ts`: args `{ groupId: string, groupName?: string }`, identity.sub. Logic:
       - zod-validate; derive `date = new Date().toISOString().slice(0,10)`.
       - Use the `$amplify/env/dailyTopic` Data client: `Topic.get({ groupId, date })`. If a row exists → return `{ text: row.text, fallback: row.fallback ?? false }` (NO Bedrock call).
       - If missing → `converseWithTool({ modelId: CLASSIFY_MODEL_ID, system: TOPIC_SYSTEM, message: groupName ?? groupId, toolName:'topic', inputSchema: TOPIC_TOOL_SCHEMA, validator: topicOutput })`.
       - On ok → `Topic.create({ groupId, date, text, fallback:false })` (swallow a conditional/duplicate error so concurrent opens don't double-generate), return `{ text, fallback:false }`. On !ok → write+return a warm fallback (`{ text: 'What's something small that went okay today?', fallback:true }`).
       - `logTurn({ fn:'dailyTopic', latencyMs, labels:[groupId], fallback })` — NEVER log the topic text.
  </action>
  <verify>
    <automated>cd app && test -f amplify/functions/dailyTopic/handler.ts && grep -Eq "converseWithTool" amplify/functions/dailyTopic/handler.ts && grep -Eq "Topic.get" amplify/functions/dailyTopic/handler.ts && grep -Eq "fallback: true" amplify/functions/dailyTopic/handler.ts && grep -Eq "defineFunction" amplify/functions/dailyTopic/resource.ts && grep -Eq "TOPIC_SYSTEM" amplify/functions/dailyTopic/prompts.ts</automated>
  </verify>
  <acceptance_criteria>
    - Three files exist under `amplify/functions/dailyTopic/` (resource/handler/prompts)
    - handler references `converseWithTool`, `Topic.get`, and a `fallback: true` branch (grep each ≥1)
    - handler reads the cache BEFORE generating (a `Topic.get` call precedes the `converseWithTool` call in file order)
    - prompts.ts defines `TOPIC_SYSTEM` and `TOPIC_TOOL_SCHEMA` (grep each ≥1)
    - No raw content logged: `logTurn` call contains `labels` and `fallback` but not the topic text variable
  </acceptance_criteria>
  <done>dailyTopic Lambda generates-if-missing and caches; warm fallback; logs labels only.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4-02-02: Register getDailyTopic query + grant Data access + Bedrock IAM</name>
  <files>app/amplify/data/resource.ts, app/amplify/backend.ts</files>
  <read_first>
    - Read app/amplify/data/resource.ts — the Phase 2 custom-query block (PreviewReply/previewReplies) for the exact `a.customType` + `a.query().arguments().returns().authorization().handler()` pattern, and the final schema-level `.authorization((allow) => [allow.resource(practice)])`.
    - Read app/amplify/backend.ts — the `defineBackend({...})` call and the `aiFunctions` array + BEDROCK_ARNS loop.
  </read_first>
  <action>
    1. In `data/resource.ts`: add `DailyTopicReply: a.customType({ text: a.string(), fallback: a.boolean() })` and
       `getDailyTopic: a.query().arguments({ groupId: a.string().required(), groupName: a.string() }).returns(a.ref('DailyTopicReply')).authorization((allow) => [allow.authenticated()]).handler(a.handler.function(dailyTopic))`.
       Import `dailyTopic` from `../functions/dailyTopic/resource` at the top (match how `practice`/`preview` are imported).
       Extend the schema-level authorization to `.authorization((allow) => [allow.resource(practice), allow.resource(dailyTopic)])` so the Lambda can read/write Topic.
    2. In `backend.ts`: import `dailyTopic`, add it to `defineBackend({ ... dailyTopic })`, and add `backend.dailyTopic` to the `aiFunctions` array (grants `bedrock:InvokeModel` on the existing exact `BEDROCK_ARNS` — no ARN change). Do NOT add reserved concurrency.
  </action>
  <verify>
    <automated>cd app && grep -Eq "getDailyTopic: a" amplify/data/resource.ts && grep -Eq "DailyTopicReply" amplify/data/resource.ts && grep -Eq "allow.resource\(dailyTopic\)" amplify/data/resource.ts && grep -Eq "dailyTopic" amplify/backend.ts && grep -Eq "aiFunctions = \[.*dailyTopic|backend.dailyTopic" amplify/backend.ts</automated>
  </verify>
  <acceptance_criteria>
    - `data/resource.ts` contains `getDailyTopic: a`, `DailyTopicReply`, and `allow.resource(dailyTopic)` (grep each ≥1)
    - `backend.ts` imports `dailyTopic`, includes it in `defineBackend`, and adds it to the Bedrock IAM loop (grep `dailyTopic` ≥2)
    - No wildcard IAM: `grep -Eic "resources: \['\\*'\]|InvokeModel.*\\*" amplify/backend.ts` = 0
    - Pre-deploy `tsc -p amplify/tsconfig.json` error is limited to the documented `AMPLIFY_DATA_DEFAULT_NAME` `$amplify/env` caveat (resolved by the Plan 04 redeploy)
  </acceptance_criteria>
  <done>getDailyTopic registered as an authenticated custom query with Data access and least-privilege Bedrock IAM.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4-02-03: Typed topic client helper + prompt log</name>
  <files>app/src/lib/topics.ts, AI_PROMPTS/Tejas.md</files>
  <read_first>
    - Read app/src/lib/data.ts for the `generateClient<Schema>()` + typed-wrapper-throws-on-errors pattern.
    - Read AI_PROMPTS/Tejas.md tail + SKILL §4 for the prompt-log entry format.
  </read_first>
  <action>
    1. Create `app/src/lib/topics.ts` with a why-comment: export `async function getDailyTopic(groupId: string, groupName?: string): Promise<{ text: string; fallback: boolean }>` calling `client.queries.getDailyTopic({ groupId, groupName })`, throwing on `errors?.length`, returning the data. Reuse a shared client (import from `data.ts` if it exports one, else create one as data.ts does).
    2. Append an AI_PROMPTS entry (`## P-04-TOPIC: daily circle topic` — Purpose/Type system/Model Haiku/Used in app/amplify/functions/dailyTopic/prompts.ts, Guardrails included, Last changed 2026-11-04 by Tejas) with the full TOPIC_SYSTEM text in a fenced block. Append-only.
  </action>
  <verify>
    <automated>cd app && test -f src/lib/topics.ts && grep -Eq "queries.getDailyTopic" src/lib/topics.ts && grep -Eq "P-04-TOPIC" ../AI_PROMPTS/Tejas.md</automated>
  </verify>
  <acceptance_criteria>
    - `app/src/lib/topics.ts` exists and calls `client.queries.getDailyTopic` and throws on errors (grep `queries.getDailyTopic` ≥1, `errors` ≥1)
    - `AI_PROMPTS/Tejas.md` contains a `P-04-TOPIC` entry with the full prompt text (grep ≥1)
    - `npx tsc --noEmit -p tsconfig.app.json` type-checks (no new errors)
  </acceptance_criteria>
  <done>Typed getDailyTopic client helper added; TOPIC prompt logged.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| Client ↔ dailyTopic Lambda | AppSync authorizes via Cognito before the Lambda runs |
| Lambda ↔ Bedrock | Least-privilege InvokeModel on exact ARNs only |
| Lambda logs → operators | Logs carry labels/fallback, never topic content |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-03 | Denial of Service / Cost | Repeated Bedrock calls draining the $50 budget | mitigate | Topic cache (one row/circle/day) + composite-id conditional create; maxTokens≤500; verified live (same row on 2nd call) in Plan 04. |
| T-04-04 | Information Disclosure | Topic/message content in logs | mitigate | logTurn logs labels/fallback only; verified via `aws logs tail` in Plan 04. |
| T-04-07 | Elevation of Privilege | Over-broad Bedrock IAM | mitigate | dailyTopic added to the exact-ARN aiFunctions loop; no wildcard. |
</threat_model>

<verification>
- Three dailyTopic files exist; handler caches before generating; warm fallback present (grep).
- getDailyTopic query + DailyTopicReply + allow.resource(dailyTopic) in schema; dailyTopic in backend IAM loop (grep); no wildcard IAM.
- topics.ts calls the query; P-04-TOPIC logged.
- Pre-deploy tsc limited to the documented `$amplify/env` caveat; resolved on the Plan 04 deploy.
- Live cache + fallback + no-content-logs behavior proven in Plan 04.
</verification>

<success_criteria>
- Daily topic AI-generated once per circle per day and cached in a Topic row; repeat call hits cache (no Bedrock).
- Warm fallback on Bedrock failure; no content logged.
- getDailyTopic is a Cognito-authorized custom query with least-privilege Bedrock IAM; prompt logged.
</success_criteria>

<output>
After completion, create `.planning/phases/04-real-time-chat/04-02-SUMMARY.md`.
</output>
