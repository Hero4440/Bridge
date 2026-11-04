---
phase: 05-safety-direct-messages
plan: 01
subsystem: data
tags: [amplify-data, schema, message-request, report]
requires: [{ phase: 01-foundation-authentication }, { phase: 04-real-time-chat }]
provides: [MessageRequest model, Report model]
affects: [05-02, 05-03, 05-04, 06-frontend]
requirements-completed: [DM-02, SAFE-04]
completed: 2026-11-04
---
# Phase 5 / Plan 01: MessageRequest + Report models
**Added the two new models Phase 5 needs; DMs reuse the existing Message model (dm# thread key), so Message is unchanged.**

## Accomplishments
- `data/resource.ts` — `MessageRequest` (`fromUserId/toUserId/firstMessage/status[pending,accepted,declined]/unsafe/createdAt`, `allow.authenticated()`; writes only via the Plan 02 Lambdas) and `Report` (`reporterId/targetType[message,user]/targetId/reason/createdAt`, `allow.owner()+authenticated read`).
- Message left untouched — DMs set `groupId = dm#<sorted uid pair>` and reuse Phase 4's send/observe/last-50 path.

## Verification
- Grep: MessageRequest + Report present with firstMessage/targetType fields; Message block byte-for-byte unchanged (content/groupId/senderId/createdAtMs/timestamp + GSI).
- `npx tsc --noEmit -p tsconfig.app.json` exit 0.

## Deviations
- Acceptance grep `groupId: a.string().required()` == 1 was over-strict (Topic.groupId from Phase 4 also matches → 3 hits). Verified Message unchanged directly instead; no functional issue.

*Completed 2026-11-04 · live-verified in Plan 04*
