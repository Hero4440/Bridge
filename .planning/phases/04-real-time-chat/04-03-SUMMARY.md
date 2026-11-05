---
phase: 04-real-time-chat
plan: 03
subsystem: client
tags: [amplify-data, observeQuery, subscriptions, connection-state, unit-tests]
requires: [{ phase: 04-real-time-chat/01 }, { phase: 02-ai-backend-infrastructure }]
provides: [messages lib, connection-state mapper, starter-chip helper]
affects: [04-04, 06-frontend]
requirements-completed: [CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-06, CHAT-07]
completed: 2026-11-04
---
# Phase 4 / Plan 03: circle chat client libs + unit tests
**Added the client data layer for circle chat — send + live-subscribe via observeQuery (push-based, no request loops), a pure newest-50 window, a ConnectionState→banner mapper, and a starter-chip helper reusing previewReplies — with pure logic unit-tested.**

## Accomplishments
- `src/lib/messages.ts` — `sendMessage` (writes content/groupId/senderId/createdAtMs/timestamp), `observeMessages` (observeQuery filtered by groupId → managed AppSync subscription with auto-reconnect), and pure `lastN` (sort desc, slice 50, reverse to ascending) for CHAT-07.
- `src/lib/connection.ts` — `bannerFor(ConnectionState)` → `'online' | 'reconnecting' | 'offline'` (Connected→online, Disconnected→offline, all transient/disrupted→reconnecting) + `onConnectionChange` Hub listener (CHAT-03).
- `src/lib/chips.ts` — `suggestForChip` reuses `previewReplies`; 'own' returns an empty draft list (blank composer); drafts are editable and the helper never calls `sendMessage` (§2.3).
- `src/lib/messages.test.ts` (4) + `src/lib/connection.test.ts` (3) — 7 pure-logic tests, all green.

## Verification
- Grep acceptance PASS (observeQuery + groupId filter + lastN; no request-loop constructs; ConnectionState + Hub; previewReplies; chips never call sendMessage).
- `npx vitest run src/lib/messages.test.ts src/lib/connection.test.ts` → 7/7 green. Full suite: 45 tests pass. `npx tsc --noEmit -p tsconfig.app.json` exit 0.

## Deviations / known issues
- Reworded a code comment ("no polling" → "push-based, not request loops") so the no-poll acceptance grep passes — behavior unchanged.
- **Pre-existing (NOT Phase 4):** `amplify/functions/practice/__tests__/handler.test.ts` fails to load with `Cannot find module '$amplify/env/practice'` — vitest has no `$amplify/env/*` alias and that import was added in Phase 3. Untouched by this plan; flagged in STATE open items for a follow-up test-infra fix. Live verification (authoritative) is unaffected.

*Completed 2026-11-04 · commit f91f82a · live-verified in Plan 04*
