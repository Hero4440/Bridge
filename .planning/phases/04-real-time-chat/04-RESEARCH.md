# Phase 4: Real-Time Chat - Research

**Researched:** 2026-11-04
**Status:** Ready for planning
**Note:** Codebase paths/signatures below are VERIFIED against the real tree (read directly). AppSync/Amplify API syntax verified against Amplify Gen 2 docs (aws-amplify v6.22, confirmed in `app/package.json`).

<summary>
Phase 4 wires the already-deployed `Message` model to real-time circle chat using the Amplify Data client's `observeQuery` (managed AppSync subscription + auto-reconnect), adds a `Group` model (makes the 6 circles real data) and a `Topic` model (cached daily topic), adds one new Bedrock Lambda (`dailyTopic`) that generates-if-missing, and reuses the existing `previewReplies` Lambda for starter chips. Every new AI piece follows the exact Phase 2 pattern (shared `converseWithTool`, Haiku model, warm fallback, exact-ARN IAM, rate limit). A `verify-phase4.ts` harness mirrors `verify-phase3.ts` for live two-account proof.
</summary>

<verified_codebase_facts>
## Verified codebase facts (read directly — NOT assumed)

### Bedrock / AI Lambda pattern (reuse exactly)
- **ONE Bedrock entry point:** `app/amplify/functions/shared/bedrock.ts` →
  `converseWithTool<T>({ modelId, system, message, toolName, inputSchema, validator, maxTokens?, timeoutMs? })`.
  Forces a tool (structured output), caps `maxTokens` at 500, `temperature: 0.2`, default 5s `AbortController` timeout, zod-validates the tool output. Returns `{ ok: true, value: T } | { ok: false }`. Any throttle/timeout/parse error → `{ ok: false }` so the caller returns a scripted fallback.
- **Model ids:** `app/amplify/shared/config.ts` → `CLASSIFY_MODEL_ID` (Haiku-class, cheap/fast) and `PRACTICE_MODEL_ID` (Sonnet). The daily topic is short → use `CLASSIFY_MODEL_ID`.
- **A new AI Lambda = 3 files** (mirror `app/amplify/functions/reflectReply/`):
  - `resource.ts`: `export const dailyTopic = defineFunction({ name:'dailyTopic', entry:'./handler.ts', timeoutSeconds: 29, memoryMB: 512 })`.
  - `handler.ts`: parse+zod-validate args, call `converseWithTool`, `logTurn(...)` (labels + fallback ONLY, never content), return `{ ...value, fallback }` or a warm fallback on `!ok`.
  - `prompts.ts`: `*_SYSTEM` string + `*_TOOL_SCHEMA` const (JSON schema). Must carry §2.7 guardrails. Log it in `AI_PROMPTS/Tejas.md` (Part 4).
- **Shared helpers available:** `shared/rateLimit.ts` (`checkRateLimit(userId)`, `RATE_LIMIT_MESSAGE`), `shared/fallback.ts` (`FALLBACKS`), `shared/log.ts` (`logTurn`), `shared/schemas.ts` (zod input/output), `shared/keywords.ts`, `shared/classify.ts`.

### Wiring a new Lambda into the backend (`app/amplify/backend.ts`)
1. `import { dailyTopic } from './functions/dailyTopic/resource'` and add to `defineBackend({ ... dailyTopic })`.
2. Add `backend.dailyTopic` to the `aiFunctions` array → grants `bedrock:InvokeModel` on the EXACT `BEDROCK_ARNS` (never `"*"`). The existing ARN list already covers the Haiku inference-profile + its routed foundation-model ARNs, so **no ARN change needed**.
3. If rate-limited, add `backend.dailyTopic` to the `for (const fn of [practice, tone, preview])` loop (grants the RateLimit table + `RATE_LIMIT_TABLE` env). Daily topic is cached so it's low-volume; rate-limiting is optional (Claude's discretion), but the cache is the primary guard.
4. **Reserved concurrency is intentionally OFF** (account Lambda concurrency limit is 10 — reserving is rejected). Do not re-add it.

### Custom-query + Data-access pattern (`app/amplify/data/resource.ts`)
- A Lambda-backed query is registered as:
  ```ts
  DailyTopicReply: a.customType({ text: a.string(), fallback: a.boolean() }),
  getDailyTopic: a.query()
    .arguments({ groupId: a.string().required() })
    .returns(a.ref('DailyTopicReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(dailyTopic)),
  ```
- **Granting a Lambda the Data client** is done at the SCHEMA level (per-model `allow.resource` was found invalid in Phase 2/3). The file already ends with:
  `.authorization((allow) => [allow.resource(practice)]);`
  → change to `.authorization((allow) => [allow.resource(practice), allow.resource(dailyTopic)]);` so `dailyTopic` can read/write the `Topic` table from inside the Lambda via the `$amplify/env/dailyTopic` generated Data client (same mechanism `practice` uses to persist PracticeRun — see `functions/practice/handler.ts`).
- **CAVEAT (carried from Phase 3):** pre-deploy `tsc -p amplify` will throw `AMPLIFY_DATA_DEFAULT_NAME missing in DataClientEnv` for the new function until the sandbox is redeployed (the `$amplify/env/dailyTopic` module is generated at deploy). This is expected; the deploy resolves it.

### Current `Message` model (`app/amplify/data/resource.ts`)
```ts
Message: a.model({ content: a.string().required(), groupId: a.string(), senderId: a.string(), timestamp: a.datetime() })
  .authorization((allow) => [allow.authenticated()]),
// TODO(phase-chat): custom-query membership check (D-08) — DEFERRED TO PHASE 5 per 04-CONTEXT D-01.
```
- `allow.authenticated()` is CORRECT and must stay: owner-auth would break group subscription delivery (a subscriber only receives rows they own). This confirms CONTEXT D-01.
- `timestamp` is a user-set `a.datetime()`. Amplify auto-adds `createdAt`/`updatedAt`, but **implicit `createdAt` cannot be a GSI sort key** — add an explicit field if a GSI is used (see below).

### Data-client library pattern (`app/src/lib/data.ts`)
- `generateClient<Schema>()` created ONCE in the lib; typed wrappers throw on `errors?.length`. New chat helpers go in `app/src/lib/messages.ts` (and `topics.ts`) following this exact shape. `EventRecord = Schema['Event']['type']`, `CreateEventInput = Parameters<typeof client.models.Event.create>[0]`.

### Live-verify harness pattern (`app/scripts/verify-phase3.ts`)
- `Amplify.configure(outputs)`, `generateClient<Schema>()`, two made-up accounts `sam@example.com` / `jordan@example.com`, password `Passw0rd!Test`, `as(email)` helper (signOut→signIn), `assert(cond,msg)` counting failures, final `PHASEn VERIFY: PASS` + non-zero exit on failure. Mirror this for `verify-phase4.ts`.
- **No `scripts/seed/` exists yet** — this phase creates `app/scripts/seed/` (idempotent, Cognito-authenticated, made-up circle names).
</verified_codebase_facts>

<api_findings>
## Amplify Gen 2 / AppSync API findings (verified against docs)

### observeQuery (CHAT-02, CHAT-07) — real-time list
```ts
const sub = client.models.Message.observeQuery({
  filter: { groupId: { eq: groupId } },
}).subscribe({
  next: ({ items, isSynced }) => { /* items = full filtered set; isSynced=true after initial sync */ },
  error: (e) => { /* surface */ },
});
// later: sub.unsubscribe();
```
- `observeQuery` opens a managed AppSync subscription, merges create/update/delete into a local snapshot, and **auto-reconnects** on network drop, re-syncing on reconnect. This satisfies CHAT-02 (no polling) and the data half of CHAT-03.
- **It has NO server-side `limit` or `sort`** — it returns the entire filtered set. Enforce "last 50" (CHAT-07) **client-side**: sort by `createdAt`/`timestamp` desc and `slice(0,50)` (then reverse for display). For a circle demo this is fine; large-volume pagination (FEAT-04) is deferred.
- Alternative considered (NOT chosen, keep D-02): `list({ filter, limit: 50 })` for history + `onCreate` subscription for live. More code + manual reconnection + manual merge. `observeQuery` is simpler and gives reconnection free.

### Connection-state banner (CHAT-03) — "reconnecting…"
```ts
import { Hub } from 'aws-amplify/utils';
import { ConnectionState } from 'aws-amplify/api';
Hub.listen('api', (data) => {
  const { payload } = data;
  if (payload.event === 'ConnectionStateChange') {
    const state = payload.data.connectionState as ConnectionState;
    // 'Connected' → hide banner; 'Connecting' | 'ConnectionDisrupted' |
    // 'ConnectionDisruptedPendingNetwork' → show "Reconnecting…"; 'Disconnected' → show offline
  }
});
```
- `ConnectionState` enum values: `Connected`, `Connecting`, `ConnectionDisrupted`, `ConnectionDisruptedPendingNetwork`, `Disconnected`, `ConnectedPendingDisconnect`, `ConnectedPendingKeepAlive`, `ConnectedPendingNetwork`. Map the disrupted/connecting group to a calm "Reconnecting…" state (real connection state, not a fake loading flag).
- This is the documented, non-polling way to drive CHAT-03's UI. The banner component is Phase 6 polish; Phase 4 exposes the observable state + a thin helper.

### Secondary index on Message (efficiency, optional for demo scale)
```ts
Message: a.model({
  content: a.string().required(),
  groupId: a.string().required(),
  senderId: a.string(),
  createdAtMs: a.integer(),           // explicit sort value (implicit createdAt can't be a GSI sort key)
  timestamp: a.datetime(),
}).secondaryIndexes((index) => [index('groupId').sortKeys(['createdAtMs']).queryField('messagesByGroup')])
  .authorization((allow) => [allow.authenticated()]),
```
- At demo volume `observeQuery` + client slice is sufficient; the GSI is a performance nicety for the history query. **Planner's call** whether to add it now or defer (adding it is a schema change → requires redeploy). If added, `groupId` must become `.required()`.

### New models
```ts
Group: a.model({                      // makes the 6 circles REAL data (no constant arrays)
  name: a.string().required(), slug: a.string(), description: a.string(), emoji: a.string(),
}).authorization((allow) => [allow.authenticated()]),   // read for all; seeded via scripts/seed

Topic: a.model({                      // cached daily topic — one row per circle per day
  groupId: a.string().required(), date: a.string().required(), // date = YYYY-MM-DD (UTC)
  text: a.string().required(), fallback: a.boolean(),
}).identifier(['groupId','date'])     // composite id → natural generate-if-missing + race-safe
  .authorization((allow) => [allow.authenticated()]),
```
- Composite identifier `['groupId','date']` means `Topic.get({ groupId, date })` is a point read and `Topic.create` with a condition fails if the row exists → **one Bedrock call per circle per day** even under concurrent opens (cost guard D-03).

### Daily-topic generate-if-missing flow (CHAT-05, D-03)
`getDailyTopic(groupId)` Lambda (uses `$amplify/env/dailyTopic` Data client):
1. `date = new Date().toISOString().slice(0,10)`.
2. `Topic.get({ groupId, date })` → if present, return `{ text, fallback }` (NO Bedrock call).
3. If missing: `converseWithTool({ modelId: CLASSIFY_MODEL_ID, system: TOPIC_SYSTEM, message: <circle name/desc>, toolName:'topic', inputSchema: TOPIC_TOOL_SCHEMA, validator: topicOutput })`.
4. On `ok`: `Topic.create({ groupId, date, text, fallback:false })` (ignore conditional-create races), return it. On `!ok`: create+return a warm fallback (`fallback:true`).
- Logs: `logTurn({ fn:'dailyTopic', labels:[groupId], fallback })` — never the topic text as "content" beyond what's needed.

### Starter chips (CHAT-06, D-04) — reuse previewReplies
- `client.queries.previewReplies({ context })` → `{ suggestions: string[], fallback }`. Chips pass circle + today's topic as `context`; results fill an **editable composer**; nothing is auto-sent (§2.3 / PREVIEW_SYSTEM already says "Never auto-send"). "Write my own" opens a blank composer. No new Lambda for chips.

### Seeding (`app/scripts/seed/`)
- Schema is Cognito-only (`allow.authenticated()`), so the seed script must `signIn` as a made-up account first (reuse the harness auth helper), then upsert the 6 `Group` rows idempotently (list → create-if-absent). Made-up circle names per SKILL §2.2: Gaming, Music, Anime, Cooking, Art, Tech. Run after deploy with `npx tsx scripts/seed/circles.ts`.
</api_findings>

<pitfalls>
## Pitfalls
- **Owner-auth breaks group subscriptions.** Keep `Message` on `allow.authenticated()`; do NOT switch to owner (a subscriber only gets rows they own → no one sees others' messages). Member-only scoping (D-08) is a Phase-5 server-side custom query, not an auth-rule change.
- **observeQuery has no server limit/sort** — enforce last-50 client-side; don't expect `limit`/`sort` options on it.
- **Implicit `createdAt` can't be a GSI sort key** — if adding the `messagesByGroup` index, add an explicit numeric/string sort field.
- **`$amplify/env/dailyTopic` tsc error pre-deploy is expected** (same as Phase 3's practice); the sandbox deploy generates the module.
- **AppSync idle disconnect (~2-3 min, noted in STATE.md)** is exactly what the reconnect banner + observeQuery auto-resync handle — verify by observing a ConnectionState transition, not by faking it.
- **Cost:** never call `getDailyTopic` → Bedrock on every render; the `Topic.get` cache + composite-id conditional create keep it to one call/circle/day. maxTokens stays ≤500 via the shared helper.
- **No raw transcripts in logs/tables** (§1.4/§2.8): `logTurn` already logs labels+fallback only; message content lives only in the `Message` table (that's the chat itself, allowed), never echoed to logs.
- **Redeploy is a schema change** (new models + custom query + GSI). Expect a full `npx ampx sandbox --once` and regenerated `amplify_outputs.json` (gitignored).
</pitfalls>

<validation_architecture>
## Validation Architecture

Phase 4 is verified live against the real sandbox (nothing mocked), mirroring `verify-phase3.ts` as `app/scripts/verify-phase4.ts`, plus targeted unit tests for pure logic.

**Unit-testable (vitest, pure logic):**
- Last-50 sort+slice helper (ordering + cap) — `app/src/lib/messages.test.ts`.
- ConnectionState → banner-state mapper (each enum value → shown/hidden/offline) — pure function.
- Daily-topic date-key derivation (YYYY-MM-DD UTC).

**Live integration (two accounts, real AppSync/DynamoDB/Lambda/Bedrock):**
- CHAT-01: `Message.create` persists; row readable back.
- CHAT-02: account A's `observeQuery` snapshot receives a message posted by account B within the subscription (real-time, no polling) — asserts delivery, confirms `isSynced`.
- CHAT-04: `observeQuery` filtered by `groupId` returns only that circle's messages (post to two groups, assert isolation of the filter).
- CHAT-07: after seeding >50 messages, initial snapshot slice is exactly 50, newest.
- CHAT-05: `getDailyTopic(groupId)` returns a topic; a SECOND call returns the SAME cached row (assert one `Topic` row for groupId+date → cost guard proven); real topic `fallback:false` (Bedrock up).
- CHAT-06: `previewReplies({ context })` returns 1-3 suggestions (`fallback:false`).
- CHAT-03: ConnectionState is observable via Hub (assert at least a `Connected` transition is received) — reconnection UI itself is Phase 6.
- Logs assertion: `aws logs tail` on `dailyTopic` shows labels/fallback only, no topic/message content.

**Success marker:** `PHASE4 VERIFY: PASS`, exit 0.
</validation_architecture>

<open_questions>
## Open questions for the planner (all have a recommended default)
- Add the `messagesByGroup` GSI now vs defer? **Recommend add now** (one redeploy, clean history query) — makes `groupId` required.
- Rate-limit `getDailyTopic`? **Recommend no** (cache already bounds it) — keep the `aiFunctions` IAM grant, skip the rate-limit loop.
- `dailyTopic` as a new Lambda vs extend `previewReplies`? **Recommend new Lambda** (`getDailyTopic`) — different output shape + needs Data-client write access for the cache.
</open_questions>

---

*Phase: 04-real-time-chat*
*Research completed: 2026-11-04 (codebase-verified)*
