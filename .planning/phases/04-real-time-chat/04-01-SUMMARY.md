---
phase: 04-real-time-chat
plan: 01
subsystem: data
tags: [amplify-data, schema, dynamodb, gsi, seed]
requires: [{ phase: 01-foundation-authentication }]
provides: [Group model, Topic model, Message groupId GSI, circle seed]
affects: [04-02, 04-03, 04-04, 06-frontend]
requirements-completed: [CHAT-01, CHAT-04, CHAT-07]
completed: 2026-11-04
---
# Phase 4 / Plan 01: chat schema + circle seed
**Added `Group` and `Topic` models, tightened `Message` for groupId-scoped newest-first queries, and seeded the 6 circles as real DynamoDB rows.**

## Accomplishments
- `data/resource.ts` — `Message.groupId` now required; added `createdAtMs: a.integer()` + a `messagesByGroup` GSI (`index('groupId').sortKeys(['createdAtMs'])`); kept `allow.authenticated()` (owner-auth would break group subscription delivery). Updated the D-08 TODO to say member-only visibility is deferred to Phase 5.
- `Group` model (name/slug/description/emoji, `allow.authenticated()`) — the 6 circles as real data.
- `Topic` model (groupId/date/text/fallback) with `.identifier(['groupId','date'])` — composite id makes `get()` a point read and `create` race-safe → one Bedrock call per circle per day (the D-03 cost guard).
- `app/scripts/seed/circles.ts` — idempotent, Cognito-authenticated upsert of Gaming/Music/Anime/Cooking/Art/Tech (list-by-slug → create-if-absent). Made-up names only; no secrets.

## Verification
- Grep acceptance PASS (Group/Topic/identifier/messagesByGroup/createdAtMs present; Message stays authenticated; seed references generateClient/models.Group/list; no key literals).
- `npx tsc --noEmit -p tsconfig.app.json` exit 0. Live seed run happens after deploy in Plan 04.

## Deviations
- None. (GSI added now per RESEARCH recommendation; `groupId` became required as a consequence.)

*Completed 2026-11-04 · commit 101283b · live-seeded/verified in Plan 04*
