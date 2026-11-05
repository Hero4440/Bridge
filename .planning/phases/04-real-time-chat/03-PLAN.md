---
phase: 04-real-time-chat
plan: 03
type: execute
wave: 2
depends_on: [1]
files_modified:
  - app/src/lib/messages.ts
  - app/src/lib/messages.test.ts
  - app/src/lib/connection.ts
  - app/src/lib/connection.test.ts
  - app/src/lib/chips.ts
autonomous: true
requirements: [CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-06, CHAT-07]

must_haves:
  truths:
    - "The app sends and live-subscribes to circle messages via observeQuery filtered by groupId — no polling anywhere"
    - "Message history is bounded to the newest 50 for a circle (client-side sort+slice over observeQuery snapshots)"
    - "AppSync connection state maps to a calm reconnecting/offline/online state for the banner (CHAT-03)"
    - "Starter chips produce editable suggestions via previewReplies and never auto-send"
  artifacts:
    - path: "app/src/lib/messages.ts"
      provides: "sendMessage + observeMessages (groupId filter, last-50 sort/slice) via the typed Data client"
      contains: "observeQuery"
    - path: "app/src/lib/connection.ts"
      provides: "ConnectionState → banner-state mapper + Hub subscription helper"
      contains: "ConnectionState"
    - path: "app/src/lib/chips.ts"
      provides: "starter-chip helper reusing previewReplies, suggestions editable (never auto-sent)"
      contains: "previewReplies"
  key_links:
    - from: "app/src/lib/messages.ts"
      to: "live AppSync Message subscription"
      via: "client.models.Message.observeQuery({ filter: { groupId } })"
      pattern: "observeQuery"
---

<objective>
Build the client data layer for circle chat: send a message, live-subscribe to a circle's messages via `observeQuery` (filtered by `groupId`, no polling), bound the list to the newest 50, map AppSync connection state to a banner state, and expose a starter-chip helper that reuses `previewReplies`. Pure logic (last-50 sort/slice, connection-state mapping) is unit-tested.

Purpose: these helpers are what the Phase 6 chat screen consumes. Centralizing them (like `data.ts`) keeps the schema the source of truth and makes the no-polling + last-50 + reconnect behavior testable now.
Output: `app/src/lib/{messages,connection,chips}.ts` + unit tests for the pure logic.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-real-time-chat/04-CONTEXT.md
@.planning/phases/04-real-time-chat/04-RESEARCH.md
@app/src/lib/data.ts
@app/src/lib/rsvp.test.ts
@app/amplify/data/resource.ts

<interfaces>
<!-- observeQuery has NO server limit/sort → sort by createdAtMs desc, slice(0,50), reverse for display. -->
<!-- Keep send writing content/groupId/senderId/timestamp/createdAtMs=Date.now(). -->
<!-- connection.ts maps ConnectionState enum → 'online' | 'reconnecting' | 'offline' (pure fn, unit-tested). -->
<!-- chips.ts calls client.queries.previewReplies({ context }); returns suggestions; NEVER sends. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 4-03-01: messages.ts — send + observe (groupId filter, last-50)</name>
  <files>app/src/lib/messages.ts, app/src/lib/messages.test.ts</files>
  <read_first>
    - Read app/src/lib/data.ts for the client + typed-wrapper pattern (throw on errors?.length, type aliases via Schema['X']['type']).
    - Read 04-RESEARCH.md "observeQuery" for the exact subscribe shape and the last-50 client-side rule.
    - Read app/src/lib/rsvp.test.ts for the vitest style used in this repo.
  </read_first>
  <action>
    Create `app/src/lib/messages.ts` with a why-comment:
    1. `export type MessageRecord = Schema['Message']['type']`.
    2. `export async function sendMessage(input: { groupId: string; content: string; senderId: string }): Promise<MessageRecord>` → `client.models.Message.create({ ...input, timestamp: new Date().toISOString(), createdAtMs: Date.now() })`, throw on errors.
    3. `export function lastN<T>(items, n, keyFn): T[]` — pure: sort by key desc, slice(0,n), return ascending for display. Default n=50.
    4. `export function observeMessages(groupId: string, onItems: (items: MessageRecord[]) => void, onError?: (e: unknown) => void)` → returns the subscription from `client.models.Message.observeQuery({ filter: { groupId: { eq: groupId } } }).subscribe({ next: ({ items }) => onItems(lastN(items, 50, m => m.createdAtMs ?? 0)), error })`. Caller unsubscribes.
    Create `app/src/lib/messages.test.ts`: unit-test `lastN` — fewer than 50 returns all ascending; more than 50 returns exactly the 50 newest ascending; stable ordering.
  </action>
  <verify>
    <automated>cd app && test -f src/lib/messages.ts && grep -Eq "observeQuery" src/lib/messages.ts && grep -Eq "filter: \{ groupId" src/lib/messages.ts && grep -Eq "Message.create" src/lib/messages.ts && grep -Eq "lastN" src/lib/messages.ts && npx vitest run src/lib/messages.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `messages.ts` references `observeQuery`, a `groupId` filter, `Message.create`, and `lastN` (grep each ≥1)
    - NO polling constructs: `grep -Eic "setInterval|setTimeout\(.*list|poll" src/lib/messages.ts` = 0
    - `npx vitest run src/lib/messages.test.ts` exits 0 with the last-50 cases green
  </acceptance_criteria>
  <done>send + observe helpers (groupId filter, last-50) with lastN unit-tested; no polling.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4-03-02: connection.ts — ConnectionState → banner-state mapper</name>
  <files>app/src/lib/connection.ts, app/src/lib/connection.test.ts</files>
  <read_first>
    - Read 04-RESEARCH.md "Connection-state banner" for the Hub.listen('api') + ConnectionState enum values.
  </read_first>
  <action>
    Create `app/src/lib/connection.ts` with a why-comment:
    1. `export type BannerState = 'online' | 'reconnecting' | 'offline'`.
    2. `export function bannerFor(state: ConnectionState): BannerState` (import type from `aws-amplify/api`) — `Connected` → 'online'; `Connecting | ConnectionDisrupted | ConnectionDisruptedPendingNetwork | ConnectedPendingNetwork | ConnectedPendingKeepAlive | ConnectedPendingDisconnect` → 'reconnecting'; `Disconnected` → 'offline'. Pure function.
    3. `export function onConnectionChange(cb: (s: BannerState) => void): () => void` — `Hub.listen('api', ...)` on `ConnectionStateChange`, maps via `bannerFor`, returns the unlisten fn.
    Create `app/src/lib/connection.test.ts`: assert `bannerFor` for every enum value maps to the expected BannerState.
  </action>
  <verify>
    <automated>cd app && test -f src/lib/connection.ts && grep -Eq "ConnectionState" src/lib/connection.ts && grep -Eq "Hub.listen\('api'" src/lib/connection.ts && grep -Eq "reconnecting" src/lib/connection.ts && npx vitest run src/lib/connection.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `connection.ts` imports/uses `ConnectionState`, `Hub.listen('api'`, and maps to `'reconnecting'` (grep each ≥1)
    - `connection.test.ts` covers every ConnectionState enum value (grep `Connected`, `Disconnected`, `ConnectionDisrupted` each ≥1)
    - `npx vitest run src/lib/connection.test.ts` exits 0
  </acceptance_criteria>
  <done>Pure ConnectionState→BannerState mapper + Hub helper, fully unit-tested.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4-03-03: chips.ts — starter chips reuse previewReplies (never auto-send)</name>
  <files>app/src/lib/chips.ts</files>
  <read_first>
    - Read app/src/lib/data.ts (client pattern) and app/amplify/functions/preview/handler.ts (previewReplies contract: arguments { context } → { suggestions, fallback }).
  </read_first>
  <action>
    Create `app/src/lib/chips.ts` with a why-comment: `export async function suggestForChip(chip: 'ask' | 'share' | 'own', circleName: string, topic?: string): Promise<{ suggestions: string[]; fallback: boolean }>`.
    - For `'own'`: return `{ suggestions: [], fallback: false }` (opens a blank composer — no AI call).
    - For `'ask'`/`'share'`: build a `context` string (chip intent + circleName + topic) and call `client.queries.previewReplies({ context })`, throw on errors, return `{ suggestions, fallback }`.
    - A comment MUST state suggestions are editable and never auto-sent (§2.3 guardrail). The helper returns suggestions only — it does NOT call sendMessage.
  </action>
  <verify>
    <automated>cd app && test -f src/lib/chips.ts && grep -Eq "queries.previewReplies" src/lib/chips.ts && grep -Eiq "never auto-sent|editable" src/lib/chips.ts && ! grep -Eq "sendMessage" src/lib/chips.ts</automated>
  </verify>
  <acceptance_criteria>
    - `chips.ts` calls `client.queries.previewReplies` (grep ≥1) and does NOT call `sendMessage` (grep = 0)
    - Comment states suggestions are editable / never auto-sent (grep ≥1)
    - `npx tsc --noEmit -p tsconfig.app.json` type-checks (no new errors)
  </acceptance_criteria>
  <done>Starter-chip helper returns editable suggestions via previewReplies; never auto-sends.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| User composer ↔ AI suggestion | Suggestions are drafts the user edits; agency preserved |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-01 | Information Disclosure | Polling leaking load / stale reads | mitigate | observeQuery (managed subscription) only; grep asserts no setInterval/poll. |
| T-04-08 | Tampering | AI auto-sending on the user's behalf | mitigate | chips.ts returns suggestions only, never calls sendMessage; asserted by grep. |
</threat_model>

<verification>
- `npx vitest run` green (messages + connection unit tests).
- messages.ts uses observeQuery + groupId filter, no polling (grep).
- connection.ts maps every ConnectionState; chips.ts never calls sendMessage (grep).
- Live real-time delivery + filter isolation proven in Plan 04.
</verification>

<success_criteria>
- Circle messages send and live-update via observeQuery filtered by groupId; no polling.
- History bounded to newest 50 (unit-proven); connection state maps to banner states (unit-proven).
- Starter chips produce editable suggestions via previewReplies, never auto-send.
</success_criteria>

<output>
After completion, create `.planning/phases/04-real-time-chat/04-03-SUMMARY.md`.
</output>
