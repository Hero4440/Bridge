---
phase: 05-safety-direct-messages
plan: 03
subsystem: client
tags: [amplify-data, dm, threadId, safety, unit-tests]
requires: [{ phase: 05-safety-direct-messages/01 }, { phase: 05-safety-direct-messages/02 }, { phase: 04-real-time-chat }]
provides: [dm lib, safety lib]
affects: [05-04, 06-frontend]
requirements-completed: [DM-01, DM-02, DM-03, DM-04, DM-05, SAFE-02, SAFE-04, SAFE-05, SAFE-06]
completed: 2026-11-04
---
# Phase 5 / Plan 03: DM + safety client libs
**Added the client layer for DMs and safety: a deterministic/symmetric thread key, wrappers for the server mutations, a DM-thread observer reusing Phase 4, and owner-scoped report/block — with pure logic unit-tested.**

## Accomplishments
- `src/lib/dm.ts` — `threadId(a,b)` (symmetric `dm#<sorted pair>`), `isUnsafeLabel`, `sendDm`/`respondToRequest`/`listRequests` wrappers over the Plan 02 mutations, and `observeThread` reusing `observeMessages` (no new subscription code).
- `src/lib/safety.ts` — `reportMessage` (owner `Report.create` with the current user's sub), `blockContact` (`Contact.update status:'blocked'`), `sendHelpAlert` (server mutation). Comment notes report/block are user-initiated and warnings are private (§2.3).
- `src/lib/dm.test.ts` — 6 pure-logic tests (threadId symmetry/determinism/throws + isUnsafeLabel), all green.

## Verification
- Grep acceptance PASS (mutations.sendDm/respondToRequest, observeMessages, threadId; Report.create, status:'blocked', mutations.sendHelpAlert).
- `npx vitest run src/lib/dm.test.ts` → 6/6 green. `npx tsc --noEmit -p tsconfig.app.json` exit 0.

## Deviations
- `reportMessage` reads the reporter sub via `getCurrentUser()` (matches the authenticated client); no reporterId argument needed.

*Completed 2026-11-04 · live-verified in Plan 04*
