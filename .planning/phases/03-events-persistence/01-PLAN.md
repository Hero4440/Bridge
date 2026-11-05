---
phase: 03-events-persistence
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/amplify/data/resource.ts
  - app/src/lib/data.ts
autonomous: true
requirements: [EVENT-01, EVENT-02]
user_setup: []

must_haves:
  truths:
    - "An Event can be created with all 3-step-wizard fields and read back unchanged after refresh"
    - "A user other than the host can read an Event but cannot update it"
    - "circleId is optional so events are standalone (circle scoping deferred to Phase 4)"
  artifacts:
    - path: "app/amplify/data/resource.ts"
      provides: "Event model with reconciled wizard fields and authenticated-read / owner-write auth"
      contains: "usuallyQuiet"
    - path: "app/src/lib/data.ts"
      provides: "Typed Data client with createEvent/listEvents/getEvent/updateEvent helpers"
      exports: ["createEvent", "listEvents", "getEvent", "updateEvent"]
  key_links:
    - from: "app/src/lib/data.ts"
      to: "generateClient<Schema>()"
      via: "module-level client instance"
      pattern: "generateClient<Schema>\\(\\)"
    - from: "app/src/lib/data.ts"
      to: "Event model"
      via: "client.models.Event.create/list/get/update"
      pattern: "client\\.models\\.Event\\.(create|list|get|update)"
---

<objective>
Reconcile the Event data model with the 3-step create wizard and expose a typed Data client library for Event CRUD. This is the persistence foundation EVENT-01 (create via wizard → DynamoDB) and EVENT-02 (survive refresh) depend on.

Purpose: Every downstream plan (RSVP, prep, reflection, verification) reads and writes real Events. Without reconciled fields and a single typed client, each caller re-invents `generateClient` and the schema drifts from the wizard.
Output: Updated `Event` model in `data/resource.ts` and a new `app/src/lib/data.ts` with four typed Event helpers.
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

<interfaces>
<!-- Phase 1 established Event/RSVP/Reflection/PracticeRun with owner auth and Event.rsvps hasMany RSVP. -->
<!-- Phase 2 proved generateClient<Schema>() in client code. Reuse that pattern — do not re-derive. -->

Expected shape (ASSUMED from research — confirm field names against the live resource.ts on read):
```typescript
// app/amplify/data/resource.ts — Event model additions
Event: a.model({
  title: a.string().required(),        // "what"
  startAt: a.datetime().required(),
  durationMinutes: a.integer(),
  format: a.enum(['inPerson', 'voice', 'video', 'text']),
  venue: a.string(),                   // D-01: host free-text, no maps
  usuallyQuiet: a.boolean(),           // D-01: host-declared quiet venue
  capacity: a.integer(),               // group size
  sound: a.enum(['quiet', 'softMusic', 'loudMusic']),
  lighting: a.enum(['soft', 'bright', 'dim']),
  reminder: a.enum(['oneHour', 'oneDay', 'both']),
  tellTrustedPerson: a.boolean(),
  circleId: a.string(),                // D-05: optional, standalone events; scoping Phase 4
  // what-to-expect host fields (D-02: NOT AI): people/sound/lighting live in above fields + exit/break plan
  exitPlan: a.string(),
  rsvps: a.hasMany('RSVP', 'eventId'),
})
.authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])])
```

```typescript
// app/src/lib/data.ts — Schema type source
import type { Schema } from '../../amplify/data/resource';
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 3-01-01: Reconcile Event model fields and auth in data/resource.ts</name>
  <files>app/amplify/data/resource.ts</files>
  <read_first>
    - Read the current `Event` model definition in app/amplify/data/resource.ts in full before editing. Phase 1 already created Event with some fields; only ADD what is missing. Do not drop existing fields or the `rsvps: a.hasMany('RSVP', ...)` relationship.
    - Confirm the existing authorization rule. The goal is owner can create/update/delete, any authenticated user can read (so non-hosts can see events to RSVP).
  </read_first>
  <action>
    Add the wizard fields missing from the Event model, matching the 3-step create flow (per D-01, D-05): `venue` (string, free-text, no maps), `usuallyQuiet` (boolean), `capacity` (integer, group size), `sound` (enum quiet|softMusic|loudMusic), `lighting` (enum soft|bright|dim), `reminder` (enum oneHour|oneDay|both), `tellTrustedPerson` (boolean), `circleId` (string, OPTIONAL — events are standalone; circle scoping is Phase 4 per D-05), `exitPlan` (string, the break/exit "what to expect" host field), and `format`/`durationMinutes`/`startAt`/`title` if any are absent.

    Set Event authorization to `[allow.owner(), allow.authenticated().to(['read'])]` so a non-host can read an event but only the owner can mutate it. Do NOT add `allow.authenticated().to(['update'])` — EVENT-04 isolation requires that B cannot update A's event.

    Do NOT touch Reflection, PracticeRun, or RSVP in this task. Do NOT add any circle-scoped authorization (deferred to Phase 4). No field may be mocked or placeholder — these are real DynamoDB columns.
  </action>
  <verify>
    <automated>cd app && grep -Eq "usuallyQuiet" amplify/data/resource.ts && grep -Eq "tellTrustedPerson" amplify/data/resource.ts && grep -Eq "circleId" amplify/data/resource.ts && grep -Eq "allow\.authenticated\(\)\.to\(\[['\"]read['\"]\]\)" amplify/data/resource.ts && npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "usuallyQuiet" app/amplify/data/resource.ts` ≥ 1
    - `grep -c "tellTrustedPerson" app/amplify/data/resource.ts` ≥ 1
    - `grep -c "circleId" app/amplify/data/resource.ts` ≥ 1
    - Event auth contains `allow.authenticated().to(['read'])` and `allow.owner()`; contains NO `allow.authenticated().to(['update'])`
    - `cd app && npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Event model has all reconciled wizard fields, circleId is optional, auth is owner-write / authenticated-read, and tsc passes.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3-01-02: Create typed Event Data client library app/src/lib/data.ts</name>
  <files>app/src/lib/data.ts</files>
  <read_first>
    - Read app/src/lib/auth.ts to match the existing module and import conventions.
    - Read how Phase 2 client code calls `generateClient<Schema>()` (grep the app/src tree) and reuse the exact import path for `Schema`.
  </read_first>
  <action>
    Create `app/src/lib/data.ts` beginning with a one-line comment stating what the file does and why (per code standard 2). Create a single module-level `const client = generateClient<Schema>()` using `Schema` from `../../amplify/data/resource`. Export four typed async helpers:
    - `createEvent(input: CreateEventInput)` → calls `client.models.Event.create(input)`, returns the created Event or throws on `errors`.
    - `listEvents()` → `client.models.Event.list()`, returns `data`.
    - `getEvent(id: string)` → `client.models.Event.get({ id })`, returns `data`.
    - `updateEvent(input: { id: string } & Partial<...>)` → `client.models.Event.update(input)`.

    Derive `CreateEventInput` from the generated Schema types (`Schema['Event']['type']`-style), not a hand-written interface, so field drift is caught by tsc. Each helper must check the AppSync `errors` array and throw a descriptive Error when present (never silently swallow). No mock data, no hardcoded event arrays, no in-memory store — these call real AppSync/DynamoDB. Strict TypeScript, no `any`.
  </action>
  <verify>
    <automated>cd app && grep -Eq "generateClient<Schema>\(\)" src/lib/data.ts && grep -Eq "export (async )?function createEvent|export const createEvent" src/lib/data.ts && grep -Eq "client\.models\.Event\.create" src/lib/data.ts && grep -Eq "client\.models\.Event\.list" src/lib/data.ts && grep -Eq "client\.models\.Event\.get" src/lib/data.ts && grep -Eq "client\.models\.Event\.update" src/lib/data.ts && npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `app/src/lib/data.ts` exports `createEvent`, `listEvents`, `getEvent`, `updateEvent` (grep each symbol = ≥1)
    - File contains `generateClient<Schema>()` exactly once (grep -c = 1)
    - File contains `client.models.Event.create`, `.list`, `.get`, `.update`
    - `grep -c ": any" app/src/lib/data.ts` = 0 (no untyped escapes)
    - `cd app && npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>A single typed Data client exposes Event CRUD, errors throw, tsc passes, no `any`.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser client → AppSync | Authenticated user submits Event create/update; AppSync authorizes via Cognito before the resolver runs |
| One Cognito user → another user's Event | Non-host reads events but must not mutate them |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-01 | Tampering | Event.update by non-owner | mitigate | Event auth is `allow.owner()` for writes + `allow.authenticated().to(['read'])` only; no authenticated update rule. Verified by two-account isolation test in Plan 05 (B cannot update A's Event). |
| T-03-02 | Information Disclosure | Event fields readable cross-user | accept | Events are intentionally discoverable by authenticated users so non-hosts can RSVP; no PII in Event fields (venue is host free-text, no participant data). |
| T-03-03 | Tampering/Injection | Free-text `venue`/`exitPlan`/`title` | mitigate | Stored as data, never evaluated; these fields are not passed to Bedrock in this plan. Rendering sanitation is a Phase 6 UI concern; data layer stores verbatim. |
</threat_model>

<verification>
- `cd app && npx tsc --noEmit` exits 0 after both tasks.
- Event model exposes all wizard fields (grep usuallyQuiet, tellTrustedPerson, circleId, capacity, reminder, sound, lighting).
- `app/src/lib/data.ts` is the only module calling `generateClient<Schema>()` for Events (grep across app/src shows the Event CRUD centralized here).
- Full round-trip (create → list → refresh survival) is asserted live in Plan 05 against the sandbox.
</verification>

<success_criteria>
- Event model reconciled with the 3-step wizard; circleId optional; owner-write / authenticated-read auth.
- `app/src/lib/data.ts` provides typed `createEvent`/`listEvents`/`getEvent`/`updateEvent`, errors throw, no `any`.
- tsc passes.
</success_criteria>

<output>
After completion, create `.planning/phases/03-events-persistence/03-01-SUMMARY.md`.
</output>
