---
phase: 05-safety-direct-messages
plan: 02
subsystem: ai-safety
tags: [lambda, custom-mutation, classify, amplify-data, owner-bypass, iam]
requires: [{ phase: 05-safety-direct-messages/01 }, { phase: 02-ai-backend-infrastructure }, { phase: 04-real-time-chat }]
provides: [sendDm, respondToRequest, sendHelpAlert mutations]
affects: [05-03, 05-04, 06-frontend]
requirements-completed: [DM-01, DM-02, DM-03, DM-04, SAFE-01, SAFE-02, SAFE-03, SAFE-06, SAFE-07]
completed: 2026-11-04
---
# Phase 5 / Plan 02: safety Lambdas + custom mutations
**Added the three server-side mutations that enforce the rules the client can't (SKILL §1.4): sendDm (classify + hold/deliver + crisis stop), respondToRequest (recipient-only accept → Contact), and sendHelpAlert (Notification owned by the connected guardian).**

## Accomplishments
- `functions/sendDm/` — `identity.sub` is the trusted sender. `classify()` runs first: crisis → `{crisis:true, delivered:false}` (SAFE-02). Contacts → `Message.create` on the `dm#<sorted pair>` thread (DM-01). Non-contacts → pending `MessageRequest` with `unsafe = label ∈ {money,address,unsafe}` (DM-02/03/SAFE-01/03). Logs labels/fallback only.
- `functions/respondToRequest/` — rejects unless `identity.sub === request.toUserId` (`forbidden`, T-05-03). Accept → reciprocal accepted `Contact`s + seed the thread with the held first message + mark accepted (DM-04). Decline → mark declined, create nothing (private).
- `functions/sendHelpAlert/` — lists the caller's `connected` GuardianLinks and `Notification.create({ userId: guardianId, type:'help' })` for each — a cross-owner write only possible server-side (Notification is `allow.owner()`; the IAM Data client bypasses it) (SAFE-06/07). In-app only, no SMS.
- `data/resource.ts` — `SendDmReply`/`RespondReply`/`HelpReply` customTypes + three `a.mutation()` endpoints (`allow.authenticated()`); schema-level auth extended with `allow.resource` for all three.
- `backend.ts` — all three in `defineBackend`; only `sendDm` added to the exact-ARN Bedrock IAM loop (the other two are Data-only). No wildcard, no reserved concurrency.

## Verification
- Grep acceptance PASS (classify-before-route + crisis stop; recipient check + Contact; guardian Notification + connected; no Bedrock import in the two Data-only Lambdas).
- `npx tsc --noEmit -p tsconfig.app.json` exit 0. `amplify/tsconfig.json` shows exactly 3 errors — `$amplify/env/{sendDm,respondToRequest,sendHelpAlert}` module-not-found — the documented post-deploy caveat; the Plan 04 deploy resolves them.

## Deviations
- None. Classification reuses the existing `classify()` (no new prompt → no AI_PROMPTS entry needed this plan).

*Completed 2026-11-04 · commit 3ecdeee · live-verified in Plan 04*
