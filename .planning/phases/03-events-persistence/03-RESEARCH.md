
# Phase 3: Events & Persistence - Research

**Researched:** 2026 (late)
**Domain:** AWS Amplify Gen 2 Data (AppSync + DynamoDB) from React/Vite + Lambda runtime Data client
**Confidence:** MEDIUM (architecture HIGH, Amplify API shapes MEDIUM — tagged `[ASSUMED]`, confirm on deploy)

> **Tooling note for the planner:** this research was produced without Read/Bash/Context7/WebSearch access, so Amplify Gen 2 API *shapes* (import paths, option names, method signatures) are tagged `[ASSUMED]` and must be confirmed against the installed `aws-amplify` / `@aws-amplify/backend` version during the first `npx ampx sandbox` deploy. Architecture, data flow, and anything grounded in 03-CONTEXT or the Phase 1/2 state is HIGHER confidence and tagged accordingly.

<user_constraints>
## User Constraints (from 03-CONTEXT.md)

### Locked Decisions
- **D-01 Venue:** host free-text venue + sensory comfort fields + a "usually quiet" flag; NO maps/places/distance API.
- **D-02 Prep checklist:** STATIC template keyed by format (in-person vs online); the "pick an opener with Mo" item calls the Phase 2 `previewReplies` endpoint. "What to expect" renders host-set fields, not AI.
- **D-03 Reflection:** save feeling (hard/okay/good) + wins[] to DynamoDB AND return a short warm Mo reply via a Phase 2 Bedrock endpoint; warm fallback; Reflection stays owner-only.
- **D-04 PracticeRun persistence (folded from Phase 2):** wire the practice Lambda's `$amplify/env` Data client to CREATE a PracticeRun (scenarioId/level/strength/tip/fallback — NO raw transcript). Grant the function data access at SCHEMA level (per-model `allow.resource` was invalid in Phase 2).
- **D-05 Circle-linked events:** build standalone; store `circleId` if present; circle scoping is Phase 4. Don't block.

### Claude's Discretion
- Choice of RSVP upsert mechanism (deterministic id vs list-then-write).
- RSVP count aggregation approach (client reduce vs resolver) — recommend simplest correct.
- Whether the warm Mo reflection reply reuses an existing Phase 2 endpoint or adds a thin new query — recommend.
- `observeQuery` vs `list`+refetch for events.

### Deferred Ideas (OUT OF SCOPE)
- Circle scoping / membership rules for events (Phase 4).
- Maps / places / distance / venue search API (explicitly rejected in D-01).
- Web push / scheduled reminders (reminder preference is stored only; delivery is later).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EVENT-01 | Create event via 3-step wizard → DynamoDB | `client.models.Event.create()` (Standard Stack §Create); wizard-field reconciliation (Pattern: Event fields) |
| EVENT-02 | Events persist / survive refresh | Data client is source of truth; `Event.list()` on mount (Pattern 1) |
| EVENT-03 | RSVP Going/Maybe/Can't | `RSVP.create/update` with status enum (Pattern 3) |
| EVENT-04 | RSVP persists across navigation + refresh (fix prototype in-memory bug) | Deterministic-id upsert + list-from-datastore, never in-memory (Pattern 3, Pitfall 2) |
| EVENT-05 | Event detail shows RSVP counts (X going / Y maybe / Z can't) | Client-side reduce over `RSVP.list({filter:{eventId}})` (Pattern 4) |
| EVENT-06 | Prep screen: sensory expectations + checklist by type | Static per-format template + host-field "what to expect" + previewReplies opener (Pattern 5, D-02) |
| EVENT-07 | Post-event reflection saves feeling + wins | `Reflection.create` owner-only + warm Mo reply endpoint (Pattern 6, D-03) |
| D-04 | PracticeRun persisted from practice Lambda, no transcript | `$amplify/env` runtime Data client + schema-level grant (Pattern 2 — the critical one) |
</phase_requirements>

## Summary

Phase 3 turns the figma prototype's in-memory event/RSVP/reflection flows into durable DynamoDB-backed behavior using the Amplify Gen 2 Data client that Phase 1 provisioned and Phase 2 proved (`generateClient<Schema>()` works). The dominant theme is **the data client, not React state, is the source of truth** — this is what fixes the prototype's refresh/navigation data-loss bug (EVENT-04) for free. Screens read with `list()`/`get()` on mount and refetch after each mutation; no feature here needs polling, and `observeQuery()` is an optional live-sync nicety rather than a requirement.

Two things carry real risk and deserve the planner's attention. First, **RSVP uniqueness**: one RSVP per `(eventId, userId)` is cleanest with a **deterministic id** (`${eventId}::${userId}`) so upsert is a simple get-then-create/update and duplicates/races can't occur. Second, and most important, **D-04's Lambda-side Data client**: the practice function must configure an IAM-authed Data client at runtime via `getAmplifyDataClientConfig($amplify/env/practice)` and be granted access **at the schema level** (`a.schema({...}).authorization(allow => [allow.resource(practice)])`), because the per-model grant failed in Phase 2. The `$amplify/env/*` module only exists after a deploy generates `.amplify/`, so that import must stay inside the amplify/function build and out of the app/src tsc path.

**Primary recommendation:** Add a single typed data wrapper in `app/src/lib/data.ts` exposing `createEvent`, `listEvents`, `getEvent`, `upsertRsvp`, `countRsvps`, `saveReflection`; use deterministic RSVP ids; add a thin `reflectReply` custom query for the warm Mo reply (practiceTurn/previewReplies are semantically wrong); grant the practice function at schema level and persist PracticeRun with `authMode: 'iam'` and no transcript.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Event create / list / detail | API (AppSync+DynamoDB) via Data client | Client (React render + optimistic UI) | Persistence and owner auth belong in the data layer; EVENT-02/04 require the datastore to be source of truth |
| RSVP upsert + uniqueness | API (DynamoDB item keyed by deterministic id) | Client (status pick UI) | Uniqueness must be enforced by key design, not client memory |
| RSVP counts (EVENT-05) | Client (reduce over listed items) | API (list query) | Small dataset; a reduce is correct and avoids a custom resolver |
| Prep "what to expect" | Client (render host-set Event fields) | — | D-02: not AI; pure projection of stored fields |
| Prep "pick opener with Mo" | API (Phase 2 `previewReplies` Lambda→Bedrock) | Client (invoke + render) | AI stays behind the authorized custom query |
| Reflection save | API (DynamoDB, `allow.owner()`) | Client | Owner-only privacy (SKILL.md 2.8) |
| Reflection warm reply | API (new `reflectReply` Lambda→Bedrock) | Client (fallback render) | Keep Bedrock behind a Cognito-authorized query; warm fallback client-safe |
| PracticeRun persistence (D-04) | API (practice Lambda writes via runtime Data client, IAM) | — | Server-side write; client never creates PracticeRun |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `aws-amplify` (`aws-amplify/data`) | installed by Phase 1 — confirm with `npm view aws-amplify version` `[ASSUMED]` | `generateClient<Schema>()`, `models.*` CRUD, `observeQuery` | Official Gen 2 client; already proven in Phase 2 verify script |
| `@aws-amplify/backend` | matches Phase 1 `[ASSUMED]` | `defineData`, `a.schema`, `a.model`, `allow.*`, `defineFunction` | Backend-as-TypeScript for schema + auth + functions |
| `@aws-amplify/backend/function/runtime` | same package `[ASSUMED]` | `getAmplifyDataClientConfig(env)` for Lambda-side Data client | The supported Gen 2 way to use the Data client inside a function (D-04) |
| `@aws-sdk/client-bedrock-runtime` | from Phase 2 | Converse API for the `reflectReply` Lambda | SKILL.md 1.4 mandates Converse |
| `zod` | from Phase 2 | Validate custom-query args + structured Bedrock output | SKILL.md 1.4/2.5 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | confirm in `app/package.json` `[ASSUMED]` | Unit tests for pure helpers (count reducer, id builder, prep template selector) | Logic with no AWS dependency |
| Phase 1 `app/src/lib/auth.ts` | existing | Current user identity (for deterministic RSVP id, owner checks) | Everywhere a userId is needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Deterministic RSVP id | List-by-(eventId,userId) then create/update | Works but an extra round-trip and a race window if two taps land together |
| Client-side count reduce (EVENT-05) | Custom AppSync resolver / Lambda aggregate | Over-engineered at this scale; adds infra and a second code path |
| New `reflectReply` query | Reuse `practiceTurn`/`previewReplies` | Both have wrong args/semantics; reuse would force misleading inputs |
| `observeQuery` live sync | `list()` on mount + refetch after mutation | list+refetch fully satisfies EVENT-02/04; observeQuery is a later UX upgrade |

**Installation:** none expected — all libraries landed in Phase 1/2. Confirm with `npm ls aws-amplify @aws-amplify/backend` in `app/`.

**Version verification:** before planning locks API shapes, run in `app/`:
```bash
npm view aws-amplify version
npm ls aws-amplify @aws-amplify/backend
```
Record the installed versions in the plan; training-era API shapes below are `[ASSUMED]` until matched against these.

## Architecture Patterns

### System Architecture Diagram

```
                         app/src (Vite React)
  ┌───────────────────────────────────────────────────────────────┐
  │  Screens: Events / EventDetail / CreateWizard / Prep / Reflect  │
  │        │ read on mount / refetch after mutation                 │
  │        ▼                                                         │
  │  app/src/lib/data.ts  (typed wrapper over generateClient<Schema>)│
  └───────┬───────────────────────────────┬────────────────────────┘
          │ userPool auth (Cognito JWT)    │ previewReplies / reflectReply
          ▼                                ▼        (a.query, authenticated)
   ┌──────────────┐                 ┌───────────────────────────┐
   │   AppSync     │                 │  AppSync custom queries    │
   │  (Data API)   │                 │  (Cognito authorizes first)│
   └──────┬────────┘                 └──────────┬────────────────┘
          │ owner/authenticated rules            │
          ▼                                       ▼
   ┌──────────────┐                        ┌─────────────┐
   │  DynamoDB     │                        │  Lambda      │──► Bedrock Converse
   │ Event / RSVP  │                        │ preview /    │    (+ warm fallback)
   │ Reflection    │                        │ reflect      │
   │ PracticeRun   │◄───────────────────────│ practice     │
   └──────────────┘   IAM-authed runtime    └─────────────┘
                      Data client (D-04):
                      getAmplifyDataClientConfig($amplify/env/practice)
                      → Amplify.configure → generateClient → PracticeRun.create
```

Trace of EVENT-04: tap RSVP → `data.upsertRsvp` → DynamoDB item (deterministic id) → navigate away → screen remounts → `data.countRsvps(eventId)` re-lists from DynamoDB → correct state restored. Nothing lives in React-only memory.

### Recommended Project Structure
```
app/src/
├── lib/
│   ├── auth.ts          # existing — current user
│   ├── data.ts          # NEW — typed Data client wrapper (all models)
│   └── prep.ts          # NEW — static prep templates by format (D-02)
├── screens/
│   ├── Events.tsx        # list (EVENT-02)
│   ├── CreateEvent.tsx   # 3-step wizard (EVENT-01)
│   ├── EventDetail.tsx   # RSVP + counts (EVENT-03/04/05)
│   ├── Prep.tsx          # what-to-expect + checklist + opener (EVENT-06)
│   └── Reflect.tsx       # feeling+wins + Mo reply (EVENT-07)
app/amplify/
├── data/resource.ts      # add fields, reflectReply query, schema-level allow.resource(practice)
└── functions/
    ├── practice/handler.ts   # add $amplify/env Data client + PracticeRun.create (D-04)
    ├── reflect/handler.ts     # NEW thin Bedrock reply
    └── reflect/prompts.ts     # NEW system prompt (log in AI_PROMPTS)
```

### Pattern 1: Frontend Data client (events) — `[ASSUMED]` shapes
```typescript
// app/src/lib/data.ts
// Typed wrapper so screens never touch generateClient directly; the datastore is the
// single source of truth (fixes EVENT-02/04). Confirm imports against installed version.
import { generateClient } from 'aws-amplify/data';            // [ASSUMED]
import type { Schema } from '../../amplify/data/resource';     // [ASSUMED path]

const client = generateClient<Schema>();                       // authMode from Amplify.configure (userPool)

export async function listEvents() {
  const { data, errors } = await client.models.Event.list();   // [ASSUMED] returns {data, errors, nextToken}
  if (errors) throw new Error(errors.map(e => e.message).join('; '));
  return data;
}

export async function getEvent(id: string) {
  const { data } = await client.models.Event.get({ id });      // [ASSUMED]
  return data;
}

export async function createEvent(input: Schema['Event']['type']) {
  const { data, errors } = await client.models.Event.create(input); // owner set automatically
  if (errors) throw new Error(errors.map(e => e.message).join('; '));
  return data;
}
```
- **List filters** `[ASSUMED]`: `Event.list({ filter: { format: { eq: 'in_person' } } })`; combine with `and`/`or`. Paginated — default page size ~100, pass `limit`/`nextToken`.
- **Live-ish updates** `[ASSUMED]`: `client.models.Event.observeQuery().subscribe({ next: ({ items, isSynced }) => setEvents(items) })` keeps a list auto-synced via AppSync subscriptions. Optional; `list()`+refetch is enough for this phase and simpler. (SKILL.md's "subscriptions not polling" rule targets live chat, not event lists.)
- **Auth mode**: Phase 1 should have set the default authMode in `Amplify.configure`; if a call needs an explicit mode, pass `{ authMode: 'userPool' }` `[ASSUMED]`.

### Pattern 2: Lambda runtime Data client + PracticeRun (D-04) — THE CRITICAL ONE `[ASSUMED]`
```typescript
// app/amplify/functions/practice/handler.ts
// $amplify/env/practice is generated into .amplify/ at deploy time — it does NOT exist
// before the first `ampx sandbox`. Keep this import in the function build only.
import type { Schema } from '../../data/resource';
import { env } from '$amplify/env/practice';                                   // [ASSUMED] resolves post-deploy
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'; // [ASSUMED]
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env); // [ASSUMED] async
Amplify.configure(resourceConfig, libraryOptions);
const data = generateClient<Schema>();

export const handler = async (event) => {
  // ... existing classify/Bedrock/classify practice turn ...
  await data.models.PracticeRun.create(
    {
      scenarioId,
      level,
      strength,          // one strength
      tip,               // one tip
      fallback,          // boolean — true when Bedrock was throttled/timed out
      // NO raw transcript, NO message content (SKILL.md 1.3/2.8/3.8)
    },
    { authMode: 'iam' },  // [ASSUMED] function access is IAM
  );
  return reply;
};
```
```typescript
// app/amplify/data/resource.ts — SCHEMA-LEVEL grant (per-model allow.resource failed in Phase 2)
import { practice } from '../functions/practice/resource';   // defineFunction export
const schema = a.schema({
  Event: a.model({ /* ... */ }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),
  RSVP: a.model({ /* ... */ }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),
  Reflection: a.model({ /* ... */ }).authorization(allow => [allow.owner()]),
  PracticeRun: a.model({ /* ... */ }).authorization(allow => [allow.owner()]),
  // ... custom queries ...
}).authorization(allow => [allow.resource(practice)]);        // [ASSUMED] schema-level grant → IAM access for the fn
export const data = defineData({ schema });
```
- **tsc caveat** `[ASSUMED/VERIFIED-by-Phase2-note]`: `$amplify/env/practice` resolves only after a deploy writes `.amplify/generated/env/practice.ts` and the amplify tsconfig path mapping. The app/src `tsc --noEmit` does not compile `amplify/functions/**`, so the frontend type-check is unaffected. The *backend* type-check will error before the first `ampx sandbox`; structure work so `ampx sandbox` runs once before relying on `npx tsc` over amplify, and keep the `$amplify/env` import only in handler files (never imported from app/src).
- **Circular import**: `data/resource.ts` imports the function's `resource.ts` (the `defineFunction`), and the function's `handler.ts` imports `Schema` from `data/resource.ts`. This is fine — `resource.ts` (definitions) and `handler.ts` (runtime) are separate files; don't import the handler from data.

### Pattern 3: RSVP upsert with deterministic id (EVENT-03/04) `[ASSUMED]`
```typescript
// app/src/lib/data.ts
// One RSVP per (event, user). Deterministic id makes upsert trivial and race-proof.
import { getCurrentUserId } from './auth';   // existing wrapper

const rsvpId = (eventId: string, userId: string) => `${eventId}::${userId}`;

export async function upsertRsvp(eventId: string, status: 'going' | 'maybe' | 'cant') {
  const userId = await getCurrentUserId();
  const id = rsvpId(eventId, userId);
  const existing = await client.models.RSVP.get({ id });        // [ASSUMED]
  if (existing.data) {
    const { data } = await client.models.RSVP.update({ id, status });
    return data;
  }
  const { data } = await client.models.RSVP.create({ id, eventId, status }); // owner set to current user
  return data;
}
```
- The Phase 1 relationship (`Event.rsvps hasMany('RSVP','eventId')`, `RSVP.event belongsTo`) keys on `eventId`; setting a custom `id` is independent of that and allowed `[ASSUMED]`.
- If a model-declared custom `id` field is awkward, fall back to a non-key `userId` field + list-by-filter upsert (Alternatives table). Deterministic id preferred.

### Pattern 4: RSVP counts (EVENT-05) — client reduce `[ASSUMED]`
```typescript
export async function countRsvps(eventId: string) {
  const { data } = await client.models.RSVP.list({ filter: { eventId: { eq: eventId } } }); // [ASSUMED]
  const counts = { going: 0, maybe: 0, cant: 0 };
  for (const r of data) counts[r.status as keyof typeof counts]++;
  return counts; // -> "X going / Y maybe / Z can't"; capacity line = `${counts.going} of ${event.capacity} spots`
}
```
- Fine for event-sized lists. If an event could exceed one page, loop `nextToken`. Document the assumption that events stay small.

### Pattern 5: Prep screen (EVENT-06 / D-02)
```typescript
// app/src/lib/prep.ts — static templates; NOT AI (D-02). "What to expect" is a projection of Event fields.
export const PREP_TEMPLATES = {
  in_person: ['Plan travel', 'Pick an exit line', 'Pack headphones', 'Share plan with trusted person'],
  online:    ['Test mic or choose text-only', 'Pick an opener with Mo', 'Set a log-off time'],
} as const;
// "Pick an opener with Mo" item -> call Phase 2 previewReplies (authorized custom query), render openers.
// "What to expect" -> render event.whereText, comfortSound, comfortLighting, comfortSize, usuallyQuiet, durationMins.
```

### Pattern 6: Reflection (EVENT-07 / D-03)
```typescript
export async function saveReflection(input: { eventId?: string; feeling: 'hard'|'okay'|'good'; wins: string[] }) {
  const { data } = await client.models.Reflection.create(input); // owner-only; stays private
  // then warm Mo reply:
  try {
    const { data: reply } = await client.queries.reflectReply({ feeling: input.feeling, wins: input.wins }); // [ASSUMED] new query
    return { reflection: data, moReply: reply?.message ?? WARM_FALLBACK[input.feeling] };
  } catch {
    return { reflection: data, moReply: WARM_FALLBACK[input.feeling] }; // warm fallback, fallback:true behavior
  }
}
const WARM_FALLBACK = {
  hard: "That took real courage. Showing up when it is hard is the whole point.",
  okay: "Nice — you did the thing. Every time gets a little easier.",
  good: "Love this. Hold onto what made today work.",
};
```
- **Recommendation:** add a thin `reflectReply: a.query().arguments({ feeling: a.string().required(), wins: a.string().array() }).returns(a.ref('ReflectReply')).authorization(allow => [allow.authenticated()]).handler(a.handler.function(reflect))`. New small Lambda reusing the Phase 2 Converse + classify + prompts.ts pattern; follows SKILL.md 2.7 guardrails. Reflection record never includes the Mo reply text beyond what's needed; no raw transcript.

### Anti-Patterns to Avoid
- **Reading events/RSVP from React state as the source of truth** — this is the prototype's EVENT-04 bug. Always read from the Data client on mount.
- **Importing `$amplify/env/*` from app/src** — breaks the frontend type-check and build.
- **Per-model `allow.resource(fn)`** — failed in Phase 2; grant at schema level.
- **Storing the practice transcript or message content in PracticeRun/logs** — forbidden (SKILL.md).
- **Polling for RSVP counts** — just refetch on navigation; counts are cheap.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Owner assignment on create | Manual `owner` field writes | `allow.owner()` auto-sets owner from Cognito identity | Hand-setting owner is a security hole and auth-model drift |
| Lambda→Data auth/signing | Manual SigV4 / AppSync fetch | `getAmplifyDataClientConfig(env)` + `generateClient` | Official path handles IAM creds, endpoint, region |
| RSVP uniqueness | Dedup scan + cleanup job | Deterministic id key | Key design makes dupes impossible |
| Real-time list sync (if needed) | setInterval polling | `observeQuery()` subscription | AppSync subscriptions are the supported path (and SKILL.md bans polling for live data) |
| Structured Mo reply | Free-form string parsing | Bedrock `toolConfig` + zod (Phase 2 pattern) | Deterministic, validated output |

**Key insight:** every "custom" solution here either duplicates something Amplify already does (auth, signing, sync) or recreates the prototype bug (in-memory state). The correct Phase 3 move is to delete prototype state logic and lean on the Data client.

## Runtime State Inventory

Phase 3 is additive (new fields + new persistence wiring), not a rename/refactor. The one state-adjacent concern:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | New Event fields (capacity, durationMins, onlineMode, reminderPref, tellTrustedPerson, usuallyQuiet, circleId) added to an already-deployed Event model | Additive schema change; DynamoDB is schemaless so existing items simply lack the new attributes — ensure read paths treat them as optional. No data migration needed. |
| Live service config | None — all infra is in `amplify/` | None — verified by scope (no console-only state) |
| OS-registered state | None | None |
| Secrets/env vars | None new (Bedrock access already granted in Phase 2; reflect Lambda needs its own `bedrock:InvokeModel` policy with exact model ARN) | Add least-privilege policy for the new reflect function in `backend.ts` |
| Build artifacts | `.amplify/generated/env/*` regenerated on deploy (includes new `reflect` function env) | Redeploy sandbox after adding the function |

**Note:** making Event fields additive/optional avoids breaking the Phase 1-created events. State explicitly in the plan: new fields are nullable.

## Common Pitfalls

### Pitfall 1: `$amplify/env` tsc failure before deploy
**What goes wrong:** `npx tsc --noEmit` over amplify fails with "cannot find module '$amplify/env/practice'".
**Why:** that module is generated at deploy into `.amplify/`.
**How to avoid:** run `npx ampx sandbox` once before relying on backend tsc; keep the import inside handler files only; the app/src type-check is unaffected because it doesn't compile `amplify/functions/**`.
**Warning signs:** red squiggle on the `$amplify/env` import in a fresh clone — expected until first deploy.

### Pitfall 2: RSVP state lost on navigate/refresh (EVENT-04 regression)
**What goes wrong:** copying the prototype's in-memory RSVP array into React state.
**Why:** React state is cleared on unmount/refresh.
**How to avoid:** source RSVP + counts from `client.models.RSVP` every mount; treat local state as a cache refreshed after each mutation.
**Warning signs:** RSVP shows correctly until you leave the page.

### Pitfall 3: Per-model function grant
**What goes wrong:** `PracticeRun.authorization(allow => [allow.resource(practice)])` — failed in Phase 2.
**How to avoid:** grant at schema level `a.schema({...}).authorization(allow => [allow.resource(practice)])`.

### Pitfall 4: Duplicate RSVPs from double-tap
**What goes wrong:** two quick taps create two RSVP items.
**How to avoid:** deterministic id makes the second write an update, not a new item.

### Pitfall 5: Owner-auth read leakage / over-restriction
**What goes wrong:** assuming `authenticated().to(['read'])` lets anyone edit, or assuming `allow.owner()` alone lets other users see an event.
**How to avoid:** Event = `owner()` (write) + `authenticated().to(['read'])` so all signed-in users can browse events but only the host edits. Reflection + PracticeRun = `owner()` only (private). Confirm the exact Phase 1 rules and verify with the two-account test.

### Pitfall 6: circleId treated as required
**What goes wrong:** blocking event creation on a circle (Phase 4 concern).
**How to avoid:** `circleId` optional/nullable (D-05); standalone events store null.

## Code Examples

(See Patterns 1–6 above — all carry `[ASSUMED]` tags on API shapes and source comments.)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Amplify Gen 1 `DataStore` / GraphQL codegen | Gen 2 `generateClient<Schema>()` typed from `a.schema` | Gen 2 GA (2024) `[ASSUMED]` | Use `client.models.*`, no codegen step |
| Lambda access to data via manual AppSync calls | `getAmplifyDataClientConfig(env)` + `generateClient` | Gen 2 function runtime `[ASSUMED]` | The supported D-04 path |
| In-memory prototype state | Data client as source of truth | this phase | Fixes EVENT-02/04 |

**Deprecated/outdated:** Gen 1 `Amplify.configure(awsconfig)` + `API.graphql` — not used in Gen 2.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `generateClient<Schema>()` + `client.models.Event.create/list/get/update` signatures and `{data, errors}` return shape | Pattern 1/3/4 | Wrapper code needs signature fixes; low risk (proven in Phase 2 verify) |
| A2 | `getAmplifyDataClientConfig(env)` is async and returns `{resourceConfig, libraryOptions}` | Pattern 2 | D-04 handler rewrite if shape differs; MEDIUM — confirm first |
| A3 | Schema-level `.authorization(allow => [allow.resource(practice)])` grants IAM write to all models | Pattern 2 | PracticeRun write denied; confirm on deploy (Phase 2 note supports this) |
| A4 | Function Data calls use `authMode: 'iam'` | Pattern 2 | Access denied if different mode name |
| A5 | Custom `id` can be set on RSVP.create alongside the hasMany/belongsTo `eventId` relationship | Pattern 3 | Fall back to filter-based upsert |
| A6 | `list({ filter: { field: { eq } } })` filter syntax | Pattern 1/4 | Adjust filter object shape |
| A7 | `observeQuery()` subscription shape `{ items, isSynced }` | Pattern 1 | Only affects optional live sync |
| A8 | A new `a.query().handler(a.handler.function(reflect))` custom query with `allow.authenticated()` works like Phase 2's `previewReplies` | Pattern 6 | Follows proven Phase 2 pattern; LOW risk |
| A9 | Adding nullable fields to the deployed Event model is a non-destructive sandbox update | Runtime State Inventory | If destructive, plan a redeploy strategy |
| A10 | Installed `aws-amplify`/`@aws-amplify/backend` versions match these API shapes | Standard Stack | Verify via `npm view` before locking plan |

**All A-items above need confirmation at first sandbox deploy or via `npm`/Context7 lookup during planning.**

## Open Questions

1. **Exact `getAmplifyDataClientConfig` signature and `authMode` for function writes**
   - What we know: this is the Gen 2 supported path; schema-level grant is required.
   - What's unclear: async vs sync, exact option names, whether `authMode:'iam'` is implicit.
   - Recommendation: confirm against installed `@aws-amplify/backend` docs/Context7 in planning; prototype the practice handler write first since D-04 is the riskiest item.

2. **Reflection warm reply — reuse vs new query**
   - What we know: D-03 wants a Phase 2 Bedrock endpoint + warm fallback.
   - What's unclear: whether the team prefers not adding a new Lambda.
   - Recommendation: add thin `reflectReply` (cleanest); if the team wants zero new endpoints, generate the warm reply client-side from templates and skip Bedrock for reflection (still satisfies "warm reply", loses the AI touch). Flag for user confirmation.

3. **Event edit scope**
   - What we know: requirements cover create/list/detail/RSVP, not edit/delete.
   - Recommendation: keep edit/delete out of Phase 3 unless the planner finds it trivial; host edit can be a later add.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| AWS SSO / `~/.aws` creds | sandbox deploy, two-account test | assumed ✓ (Phase 1/2 deployed) | — | `aws sso login` |
| Amplify sandbox (`npx ampx sandbox`) | generating `$amplify/env`, live tests | assumed ✓ | — | — |
| Bedrock access (model ARN) | `reflectReply` Lambda | ✓ from Phase 2 | model TBD in `shared/config.ts` | warm static fallback |
| `vitest` | unit tests | confirm in app/package.json `[ASSUMED]` | — | any test runner already present |

**Missing dependencies with no fallback:** none identified (could not probe — no Bash this session; confirm `aws sts get-caller-identity` and `npx ampx sandbox` before execution).

## Validation Architecture

> Included by default — could not read `.planning/config.json` this session; if `workflow.nyquist_validation` is explicitly `false`, drop this section.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `vitest` (confirm in `app/package.json`) `[ASSUMED]` |
| Config file | `app/vitest.config.ts` if present, else Wave 0 |
| Quick run command | `cd app && npx vitest run <file> `[ASSUMED]` |
| Full suite command | `cd app && npx vitest run` + `npx tsc --noEmit` (app) |
| Live/integration | Node script using `generateClient` against the sandbox (same shape as the Phase 2 verify script) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EVENT-01 | create event writes to DynamoDB | integration (sandbox) | `node scripts/verify/events.mjs --create` | ❌ Wave 0 |
| EVENT-02 | events survive refresh (list returns created) | integration | `node scripts/verify/events.mjs --list` | ❌ Wave 0 |
| EVENT-03 | RSVP going/maybe/cant persists | integration | `node scripts/verify/rsvp.mjs --set going` | ❌ Wave 0 |
| EVENT-04 | RSVP survives re-list (no in-memory) | integration | `node scripts/verify/rsvp.mjs --set maybe && node scripts/verify/rsvp.mjs --read` | ❌ Wave 0 |
| EVENT-05 | counts X/Y/Z correct | unit (reducer) + integration | `npx vitest run src/lib/data.count.test.ts` | ❌ Wave 0 |
| EVENT-06 | prep template by format + what-to-expect projection | unit | `npx vitest run src/lib/prep.test.ts` | ❌ Wave 0 |
| EVENT-07 | reflection saves feeling+wins; warm fallback on Bedrock error | unit (fallback) + integration (save) | `npx vitest run src/lib/reflect.test.ts` + `node scripts/verify/reflect.mjs` | ❌ Wave 0 |
| D-04 | practice Lambda creates PracticeRun, no transcript | integration | `node scripts/verify/practice-run.mjs` (invoke practiceTurn as signed-in user, then read PracticeRun as owner; assert no message/transcript field) | ❌ Wave 0 |
| Owner isolation | two-account privacy | integration | `node scripts/verify/isolation.mjs` (see below) | ❌ Wave 0 |

### Two-account owner-isolation check (required, SKILL.md "tested with two accounts")
1. Sign in as **User A** (test account), create an Event, an RSVP, a Reflection, and trigger a PracticeRun.
2. Sign in as **User B** (second test account).
3. Assert: B **can read** A's Event (authenticated read), B **cannot read** A's Reflection or PracticeRun (owner-only → empty/denied), B **cannot update** A's Event (owner-write).
4. Assert B's own RSVP on A's event is a distinct item (deterministic id includes B's userId) and does not overwrite A's.
Use real Cognito test accounts seeded by `scripts/seed/` with made-up names (no real participant data).

### Sampling Rate
- **Per task commit:** relevant `npx vitest run <file>` + `npx tsc --noEmit` (app).
- **Per wave merge:** full `npx vitest run` + the sandbox integration scripts for touched requirements.
- **Phase gate:** full suite green, all integration verify scripts pass against the sandbox, two-account isolation passes, before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `app/src/lib/data.ts` + `data.count.test.ts` (count reducer, rsvp id builder) — EVENT-05/03
- [ ] `app/src/lib/prep.ts` + `prep.test.ts` — EVENT-06
- [ ] `app/src/lib/reflect` fallback unit — EVENT-07
- [ ] `scripts/verify/{events,rsvp,reflect,practice-run,isolation}.mjs` — integration (reuse Phase 2 verify-script scaffolding)
- [ ] Confirm/add `vitest` to `app/package.json` if absent
- [ ] Two real test accounts for isolation (seed script)

## Security Domain

> Included by default — could not read `security_enforcement` from config; drop only if explicitly `false`.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (inherited) | Cognito email, 30-day session (Phase 1) |
| V3 Session Management | yes (inherited) | Cognito-managed JWT |
| V4 Access Control | **yes (core)** | `allow.owner()` on Reflection/PracticeRun; `owner()`+`authenticated().to(['read'])` on Event/RSVP; function IAM via schema-level `allow.resource` with exact Bedrock ARN |
| V5 Input Validation | yes | zod on `reflectReply` args and any wizard-submitted fields; validate enums (feeling, status, format) |
| V6 Cryptography | no (no new crypto) | — |

### Known Threat Patterns for Amplify Gen 2 + Bedrock
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reflection/PracticeRun readable by others | Information disclosure | `allow.owner()` only; verified by two-account test |
| Over-broad IAM on practice/reflect Lambda | Elevation of privilege | Least privilege; exact model ARN, never `*` (SKILL.md 1.4) |
| Transcript/message content leaking into PracticeRun or logs | Information disclosure | Store only scenarioId/level/strength/tip/fallback; log request id/labels/latency only |
| RSVP spoof/overwrite of another user | Tampering | Deterministic id bound to Cognito userId + owner auth |
| Bedrock prompt-injection via reflection wins[] | Tampering | Keep `reflectReply` on-rails (SKILL.md 2.7 guardrails), classify output, warm fallback |

## Sources

### Primary (HIGH confidence)
- `.planning/phases/03-events-persistence/03-CONTEXT.md` — D-01..D-05 (via prompt)
- Phase 1 state: Event/RSVP/Reflection/PracticeRun models + owner auth (via prompt)
- Phase 2 state: `generateClient<Schema>()` proven, `previewReplies`/`practiceTurn` queries, per-model `allow.resource` failure (via prompt)
- `.claude/skills/bridge/SKILL.md` — team rules, AWS conventions, privacy, guardrails (in context)

### Secondary (MEDIUM confidence)
- Amplify Gen 2 Data client + function runtime patterns from training knowledge — **unverified this session**, all tagged `[ASSUMED]`.

### Tertiary (LOW confidence)
- None added — no WebSearch available; no low-confidence web claims to report.

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — libraries known from Phase 1/2, versions unverified (no npm access).
- Architecture / data flow / locked-decision mapping: HIGH — grounded in 03-CONTEXT + Phase 1/2 state.
- Amplify API shapes (Patterns): MEDIUM — training-based, tagged `[ASSUMED]`, confirm on deploy.
- Pitfalls: HIGH — several come directly from the stated Phase 2 experience and the prototype bug.

**Research date:** 2026 (late)
**Valid until:** confirm Amplify API shapes at first sandbox deploy; architecture valid for the phase.
