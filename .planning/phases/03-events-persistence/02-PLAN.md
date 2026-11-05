---
phase: 03-events-persistence
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/lib/rsvp.ts
  - app/src/lib/rsvp.test.ts
autonomous: true
requirements: [EVENT-03, EVENT-04, EVENT-05]

must_haves:
  truths:
    - "A user can set their RSVP to going/maybe/cant and it persists across navigation and refresh"
    - "Re-RSVPing updates the same record rather than creating a duplicate (fixes the in-memory bug)"
    - "An event detail shows exact going/maybe/cant counts derived purely from the RSVP list"
  artifacts:
    - path: "app/src/lib/rsvp.ts"
      provides: "Deterministic RSVP id, get-then-upsert setRsvp, pure countRsvps reducer"
      exports: ["rsvpId", "setRsvp", "getRsvp", "listRsvpsForEvent", "countRsvps"]
    - path: "app/src/lib/rsvp.test.ts"
      provides: "Vitest units for rsvpId determinism and countRsvps reducer"
      contains: "describe"
  key_links:
    - from: "app/src/lib/rsvp.ts"
      to: "RSVP model"
      via: "deterministic id get-then-upsert"
      pattern: "client\\.models\\.RSVP\\.(get|create|update)"
    - from: "setRsvp"
      to: "Cognito userId"
      via: "id bound to authenticated user, not client input"
      pattern: "rsvpId\\("
---

<objective>
Make RSVP state durable and countable: a deterministic `${eventId}#${userId}` id with get-then-upsert, and a pure, unit-tested count reducer. This delivers EVENT-03 (RSVP going/maybe/cant), EVENT-04 (survives nav + refresh; fixes the in-memory bug), and EVENT-05 (detail shows X/Y/Z counts).

Purpose: The prototype held RSVPs in memory so they vanished on refresh and could duplicate. Binding the id to the event+user and upserting fixes both, and a pure reducer makes counts testable without a backend.
Output: `app/src/lib/rsvp.ts` + `app/src/lib/rsvp.test.ts`.
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
@app/amplify/data/resource.ts

<interfaces>
<!-- RSVP model from Phase 1: Event.rsvps hasMany RSVP. RSVP has eventId + status + owner. -->
<!-- ASSUMED shapes — confirm field/enum names against live resource.ts on read. -->
```typescript
// RSVP: deterministic id prevents duplicates; owner-auth binds to the Cognito user.
type RsvpStatus = 'going' | 'maybe' | 'cant';
interface RsvpCounts { going: number; maybe: number; cant: number }

// Get current user id for binding (reuse auth helper):
import { getCurrentUserId } from './auth'; // confirm exact export name in app/src/lib/auth.ts
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 3-02-01: Deterministic RSVP id + get-then-upsert setRsvp</name>
  <files>app/src/lib/rsvp.ts</files>
  <read_first>
    - Read app/src/lib/auth.ts to find the exact helper that returns the current Cognito userId (e.g. `getCurrentUserId`). Use it — never accept userId as a client-supplied argument.
    - Read the RSVP model in app/amplify/data/resource.ts: confirm the status enum values and whether the id field is custom-settable (identifier). If RSVP uses the default auto id, store the deterministic key in a required `eventUser` field and query on it instead; prefer a custom `identifier(['eventId','userId'])` only if Phase 1 already defined it.
  </read_first>
  <behavior>
    - `rsvpId('E1','U1')` returns the string `"E1#U1"` deterministically; same inputs → same output.
    - `rsvpId` with empty eventId or userId throws (guards against unauthenticated upsert).
  </behavior>
  <action>
    Create `app/src/lib/rsvp.ts` starting with a one-line why-comment. Reuse the module-level pattern from `data.ts` (or import a shared client) — do not spin a second `generateClient` if one is exported. Implement:
    - `rsvpId(eventId: string, userId: string): string` → returns `` `${eventId}#${userId}` ``; throws if either part is falsy.
    - `getRsvp(eventId: string)` → resolves current userId via the auth helper, computes the deterministic id, and does `client.models.RSVP.get` (or a `.list` filtered on the deterministic `eventUser` key if the model has no custom identifier). Returns the record or null.
    - `setRsvp(eventId: string, status: RsvpStatus)` → resolves current userId from Cognito (NOT an argument), computes the id, GET-then-upsert: if a record exists call `update` with the new status, else `create`. This get-then-upsert is the EVENT-04 fix — re-RSVPing never creates a duplicate.
    - `listRsvpsForEvent(eventId: string)` → `client.models.RSVP.list({ filter: { eventId: { eq: eventId } } })`, returns `data`.

    RSVP writes must be real AppSync/DynamoDB calls, owner-auth. The userId MUST come from the authenticated session so a client cannot spoof another user's RSVP id. Strict TS, no `any`, check `errors` and throw.
  </action>
  <verify>
    <automated>cd app && grep -Eq "rsvpId\(" src/lib/rsvp.ts && grep -Eq "\\$\{eventId\}#\\$\{userId\}" src/lib/rsvp.ts && grep -Eq "client\.models\.RSVP\.(get|create|update)" src/lib/rsvp.ts && grep -Eq "client\.models\.RSVP\.update" src/lib/rsvp.ts && npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '${eventId}#${userId}' app/src/lib/rsvp.ts` ≥ 1
    - File references both `client.models.RSVP.create` and `client.models.RSVP.update` (get-then-upsert, not create-only)
    - `setRsvp` signature takes `(eventId, status)` only — `grep -Eq "setRsvp\(eventId: string, status" app/src/lib/rsvp.ts` matches (no userId param)
    - `grep -c ": any" app/src/lib/rsvp.ts` = 0
    - `cd app && npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Deterministic id, auth-bound userId, get-then-upsert implemented; tsc passes; no duplicate-create path.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3-02-02: Pure countRsvps reducer + X/Y/Z projection</name>
  <files>app/src/lib/rsvp.ts</files>
  <read_first>
    - Confirm the RSVP status enum values from resource.ts so the reducer's keys match exactly (going/maybe/cant).
  </read_first>
  <behavior>
    - `countRsvps([])` → `{ going: 0, maybe: 0, cant: 0 }`.
    - `countRsvps([{status:'going'},{status:'going'},{status:'maybe'}])` → `{ going: 2, maybe: 1, cant: 0 }`.
    - Unknown/null status values are ignored (not counted) rather than throwing.
  </behavior>
  <action>
    Add a pure function `countRsvps(rsvps: { status: RsvpStatus | string | null }[]): RsvpCounts` to `rsvp.ts`. It MUST be pure (no network, no client calls) so it is unit-testable in isolation and reusable by the EVENT-05 detail view. Group by status into `{ going, maybe, cant }`, defaulting each to 0, ignoring unrecognized statuses. Export the `RsvpStatus` and `RsvpCounts` types. Do not fetch inside the reducer — callers pass the result of `listRsvpsForEvent`.
  </action>
  <verify>
    <automated>cd app && grep -Eq "export function countRsvps|export const countRsvps" src/lib/rsvp.ts && npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `countRsvps` is exported and contains no `client.models` / `fetch` calls (grep -c "client.models" within the countRsvps body region = 0; keep it a standalone pure function)
    - `cd app && npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Pure `countRsvps` reducer returns {going,maybe,cant}, no side effects, tsc passes.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3-02-03: Vitest units for rsvpId and countRsvps</name>
  <files>app/src/lib/rsvp.test.ts</files>
  <read_first>
    - Read .planning/codebase/TESTING.md and confirm Vitest is the configured runner and the test file glob (so `rsvp.test.ts` is picked up).
  </read_first>
  <action>
    Create `app/src/lib/rsvp.test.ts` with Vitest. Cover: (1) `rsvpId('E1','U1')` === `'E1#U1'` and determinism across calls; (2) `rsvpId('', 'U1')` and `rsvpId('E1','')` throw; (3) `countRsvps` empty → all zeros; (4) mixed list → correct {going,maybe,cant}; (5) unknown status ignored. Import only the pure/deterministic functions — do NOT invoke `setRsvp`/network helpers in units (those are covered live in Plan 05). No mocked DynamoDB; pure functions need no mocks.
  </action>
  <verify>
    <automated>cd app && npx vitest run src/lib/rsvp.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `cd app && npx vitest run src/lib/rsvp.test.ts` exits 0 with all tests passing
    - Test file contains at least 5 `it(`/`test(` cases (grep -c ≥ 5)
    - No `vi.mock(` of AppSync/DynamoDB present (grep -c "vi.mock" = 0)
  </acceptance_criteria>
  <done>Vitest green for id determinism, id guards, and reducer behavior.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser client → AppSync RSVP mutation | Client requests an RSVP write; id and owner derive from the Cognito session, not request body |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-04 | Spoofing | RSVP on behalf of another user | mitigate | `setRsvp` derives userId from the authenticated session; the deterministic id `${eventId}#${userId}` binds the record to that user; RSVP model uses owner auth. A client cannot craft another user's id. |
| T-03-05 | Tampering | Duplicate / overwritten RSVP records | mitigate | Deterministic id + get-then-upsert guarantees one record per (event,user); re-RSVP updates in place (EVENT-04 fix). |
| T-03-06 | Information Disclosure | Reading others' RSVP status | accept | RSVP counts are aggregate and intentionally visible for EVENT-05; individual status exposure handled by RSVP model auth, validated in Plan 05. |
</threat_model>

<verification>
- `cd app && npx vitest run src/lib/rsvp.test.ts` green.
- `cd app && npx tsc --noEmit` exits 0.
- Live persistence (set → refresh → reread, no duplicates) and count correctness asserted against the sandbox in Plan 05.
</verification>

<success_criteria>
- Deterministic auth-bound RSVP id with get-then-upsert (no duplicates).
- Pure `countRsvps` reducer for X/Y/Z counts.
- Vitest units green; tsc passes.
</success_criteria>

<output>
After completion, create `.planning/phases/03-events-persistence/03-02-SUMMARY.md`.
</output>
