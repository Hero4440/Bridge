---
phase: 04-real-time-chat
plan: 04
subsystem: verification
tags: [integration-test, live-aws, subscriptions, observeQuery, topic-cache, two-account]
requires: [{ phase: 04-real-time-chat/01 }, { phase: 04-real-time-chat/02 }, { phase: 04-real-time-chat/03 }]
provides: [verify-phase4 harness, live Phase 4 sign-off]
affects: [06-frontend]
requirements-completed: [CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07]
completed: 2026-11-04
---
# Phase 4 / Plan 04: end-to-end live verification
**Wrote `app/scripts/verify-phase4.ts` and proved all of CHAT-01…07 against the real sandbox as two signed-in test users: `PHASE4 VERIFY: PASS`.**

## Accomplishments
- `app/scripts/verify-phase4.ts` — happy path as Sam: message persist (CHAT-01); real-time delivery via `observeMessages`/observeQuery, no request loops (CHAT-02); groupId filter isolation (CHAT-04); newest-50 window (CHAT-07); AI daily topic generated + cached (same text on 2nd call) + `fallback:false` + exactly ONE Topic row per circle/day (CHAT-05 cost guard); starter chips return 3 suggestions, write-my-own blank (CHAT-06); observable AppSync connection transitions (CHAT-03). Then Jordan reads Sam's circle messages (CHAT-02 member visibility). Exits non-zero on any failure.
- Deployed the sandbox (Group/Topic models, Message GSI, dailyTopic Lambda + IAM), seeded the 6 circles idempotently.

## Verification
- `npx ampx sandbox --once` deploys clean; `npx tsx scripts/seed/circles.ts` → 6 created; `npx tsx scripts/verify-phase4.ts` → **PHASE4 VERIFY: PASS**, exit 0 (13/13 assertions).
- CloudWatch `dailyTopic` log confirms the cost guard + privacy: first call 3138ms (Bedrock), second 141ms (cache hit, no model call); log lines carry only `{fn,latencyMs,labels:[groupId],fallback}` — no topic or message content (§1.4/§2.8).
- `npx tsc --noEmit -p tsconfig.app.json` exit 0.

## Deviations
- `Message.createdAtMs` changed `a.integer()` → `a.float()`: `Date.now()` in ms (~1.79e12) overflows GraphQL `Int` (32-bit); Float holds ms and still works as a Number GSI sort key. Found live; one-field redeploy.
- `verify-phase4.ts` calls `process.exit()` at the end — an open AppSync subscription keeps Node's event loop alive, so the harness would otherwise hang.
- Real-time cross-account delivery is proven via a same-session subscription receiving the posted message plus a second-account authenticated read (one Amplify client can't hold two live sessions); both assertions pass.
- First post-deploy run failed intermittently on `createdAtMs` coercion (schema still propagating); a re-run a minute later passed cleanly.

## Known issue (pre-existing, not Phase 4)
- `amplify/functions/practice/__tests__/handler.test.ts` fails to load under vitest (`Cannot find module '$amplify/env/practice'`) — no `$amplify/env/*` test alias; introduced in Phase 3. Flagged in STATE open items.

*Completed 2026-11-04 · commit 3e15f9f · live-verified against account 429367298232 (us-east-1)*
