---
phase: 05-safety-direct-messages
plan: 03
type: execute
wave: 3
depends_on: [1, 2]
files_modified:
  - app/src/lib/dm.ts
  - app/src/lib/dm.test.ts
  - app/src/lib/safety.ts
autonomous: true
requirements: [DM-01, DM-02, DM-03, DM-04, DM-05, SAFE-02, SAFE-04, SAFE-05, SAFE-06]

must_haves:
  truths:
    - "The app sends DMs through sendDm, observes a DM thread, and accepts/declines requests via the server mutations"
    - "The app can report a message and block a contact, and trigger the trusted-person help alert"
    - "The DM thread key is deterministic and symmetric for the same pair of users"
  artifacts:
    - path: "app/src/lib/dm.ts"
      provides: "threadId helper + sendDm/observeThread/listRequests/respondToRequest client wrappers"
      contains: "threadId"
    - path: "app/src/lib/safety.ts"
      provides: "reportMessage, blockContact, sendHelpAlert client helpers"
      contains: "sendHelpAlert"
  key_links:
    - from: "app/src/lib/dm.ts"
      to: "sendDm / respondToRequest mutations + Message subscription"
      via: "client.mutations.* and observeMessages(threadId)"
      pattern: "mutations.sendDm"
---

<objective>
Add the client data layer for DMs and safety: a deterministic `threadId`, wrappers for the `sendDm`/`respondToRequest`/`sendHelpAlert` mutations, a DM-thread observer reusing Phase 4's `observeMessages`, and `reportMessage`/`blockContact` owner-scoped writes. Pure logic (threadId, unsafe predicate) is unit-tested.

Purpose: these are what the Phase 6 DM + safety screens consume; centralizing them keeps the schema the source of truth and makes the thread key + unsafe logic testable now.
Output: `app/src/lib/dm.ts` (+ test) and `app/src/lib/safety.ts`.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-safety-direct-messages/05-CONTEXT.md
@.planning/phases/05-safety-direct-messages/05-RESEARCH.md
@app/src/lib/data.ts
@app/src/lib/messages.ts
@app/src/lib/rsvp.test.ts
@app/amplify/data/resource.ts

<interfaces>
<!-- threadId(a,b) MUST sort the two uids so A→B and B→A produce the same 'dm#...' key. -->
<!-- observeThread reuses observeMessages(threadId, ...) from messages.ts — no new subscription code. -->
<!-- reportMessage/blockContact are owner writes via client.models.*; sendHelpAlert via client.mutations.sendHelpAlert. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 5-03-01: dm.ts — threadId + DM/request client wrappers</name>
  <files>app/src/lib/dm.ts, app/src/lib/dm.test.ts</files>
  <read_first>
    - Read app/src/lib/data.ts (client + throw-on-errors) and app/src/lib/messages.ts (observeMessages signature, MessageRecord type) and rsvp.test.ts (vitest style).
  </read_first>
  <action>
    Create `app/src/lib/dm.ts` with a why-comment:
    1. `export function threadId(a: string, b: string): string` → `'dm#' + [a,b].sort().join('#')` (deterministic, symmetric). Throw on empty input.
    2. `export function isUnsafeLabel(label: string): boolean` → `['money','address','unsafe','crisis'].includes(label)` (pure).
    3. `export async function sendDm(toUserId, text)` → `client.mutations.sendDm({ toUserId, text })`, throw on errors, return `{ delivered, held, unsafe, crisis }`.
    4. `export async function respondToRequest(requestId, accept)` → `client.mutations.respondToRequest({ requestId, accept })`, throw on errors.
    5. `export async function listRequests(myUserId)` → `client.models.MessageRequest.list({ filter: { toUserId: { eq: myUserId }, status: { eq: 'pending' } } })`.
    6. `export function observeThread(a, b, onItems, onError?)` → `observeMessages(threadId(a,b), onItems, onError)` (reuse Phase 4).
    Create `app/src/lib/dm.test.ts`: `threadId('u1','u2') === threadId('u2','u1')`; different pairs differ; throws on empty; `isUnsafeLabel` true for money/address/unsafe/crisis, false for safe/bias.
  </action>
  <verify>
    <automated>cd app && test -f src/lib/dm.ts && grep -Eq "mutations.sendDm" src/lib/dm.ts && grep -Eq "respondToRequest" src/lib/dm.ts && grep -Eq "observeMessages" src/lib/dm.ts && grep -Eq "threadId" src/lib/dm.ts && npx vitest run src/lib/dm.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `dm.ts` references `mutations.sendDm`, `respondToRequest`, `observeMessages`, and `threadId` (grep each ≥1)
    - `dm.test.ts` proves threadId symmetry (`threadId('u1','u2') === threadId('u2','u1')`) and isUnsafeLabel cases
    - `npx vitest run src/lib/dm.test.ts` exits 0
  </acceptance_criteria>
  <done>threadId + DM/request client wrappers with symmetric-key + unsafe-predicate tests.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 5-03-02: safety.ts — report, block, help alert</name>
  <files>app/src/lib/safety.ts</files>
  <read_first>
    - Read app/src/lib/data.ts (client + error pattern) and the Contact/Report models in app/amplify/data/resource.ts.
  </read_first>
  <action>
    Create `app/src/lib/safety.ts` with a why-comment:
    1. `export async function reportMessage(targetId, reason, targetType: 'message'|'user' = 'message')` → `client.models.Report.create({ reporterId: <current sub>, targetType, targetId, reason, createdAt: new Date().toISOString() })`, throw on errors. (Get the current user's sub via `getCurrentUser` from `aws-amplify/auth`, matching how other libs read identity — or accept reporterId as an argument if simpler; document the choice.)
    2. `export async function blockContact(contactRowId)` → `client.models.Contact.update({ id: contactRowId, status: 'blocked' })`, throw on errors (SAFE-05).
    3. `export async function sendHelpAlert(note?)` → `client.mutations.sendHelpAlert({ note })`, throw on errors, return `{ notified }` (SAFE-06).
    A comment MUST note warnings are private and nothing is auto-blocked (§2.3) — report/block are user-initiated.
  </action>
  <verify>
    <automated>cd app && test -f src/lib/safety.ts && grep -Eq "Report.create" src/lib/safety.ts && grep -Eq "status: 'blocked'" src/lib/safety.ts && grep -Eq "mutations.sendHelpAlert" src/lib/safety.ts && npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep -v node_modules | head</automated>
  </verify>
  <acceptance_criteria>
    - `safety.ts` calls `Report.create`, `Contact.update` with `status: 'blocked'`, and `mutations.sendHelpAlert` (grep each ≥1)
    - Comment states report/block are user-initiated / warnings private (grep ≥1)
    - `npx tsc --noEmit -p tsconfig.app.json` exit 0
  </acceptance_criteria>
  <done>report/block/help client helpers added (owner writes + help mutation).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| User action ↔ safety write | Report/block are explicit user actions; help alert goes through the server mutation |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-05-05 | Tampering | Blocking/reporting on another user's behalf | mitigate | Report is owner-scoped; Contact.update only affects the caller's own Contact row (owner auth). |
| T-05-09 | Availability | Auto-blocking removing user agency | accept | Design choice (§2.3): warn, don't auto-block; "Send anyway" works. Report/block stay user-initiated. |
</threat_model>

<verification>
- `npx vitest run` green (dm.test.ts threadId + unsafe predicate).
- dm.ts uses mutations.sendDm/respondToRequest + observeMessages; safety.ts uses Report.create/Contact blocked/sendHelpAlert (grep).
- `npx tsc --noEmit -p tsconfig.app.json` exit 0.
- Live flows proven in Plan 04.
</verification>

<success_criteria>
- DMs send via sendDm, threads observe via the reused subscription, requests accept/decline via the server mutation.
- Report creates a record; block sets Contact blocked; help alert triggers the trusted-person notification.
- Deterministic symmetric thread key (unit-proven).
</success_criteria>

<output>
After completion, create `.planning/phases/05-safety-direct-messages/05-03-SUMMARY.md`.
</output>
