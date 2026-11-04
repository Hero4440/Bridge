---
phase: 03-events-persistence
plan: 05
subsystem: verification
tags: [integration-test, live-aws, owner-isolation, practice-run, amplify-data]
requires: [{ phase: 03-events-persistence/01 }, { phase: 03-events-persistence/02 }, { phase: 03-events-persistence/03 }, { phase: 03-events-persistence/04 }]
provides: [verify-phase3 harness, live Phase 3 sign-off]
affects: [06-frontend]
requirements-completed: [EVENT-01, EVENT-02, EVENT-03, EVENT-04, EVENT-05, EVENT-06, EVENT-07]
completed: 2026-11-04
---
# Phase 3 / Plan 05: end-to-end live verification + PracticeRun owner fix
**Wrote `app/scripts/verify-phase3.ts`, an end-to-end harness that drives the real sandbox (AppSync/DynamoDB/Lambda/Bedrock) as two signed-in test users, and fixed PracticeRun owner attribution so a user can read back their own runs while another user cannot.**

## Accomplishments
- `app/scripts/verify-phase3.ts` — happy path as test user Sam: create event → get (persistence), RSVP going→maybe (upsert, exactly 1 record), counts, prep + what-to-expect (host-derived, no AI), reflection saved owner-only with a warm Mo reply (`fallback=false`), PracticeRun persisted with no transcript field. Then isolation as Jordan: CAN read Sam's Event, CANNOT read Sam's Reflection or PracticeRun, CANNOT update Sam's Event. Exits non-zero on first failure; prints `PHASE3 VERIFY: PASS` only when all pass. No mocks; made-up names only.
- **PracticeRun owner fix** — `data/resource.ts`: `PracticeRun` auth changed from `allow.owner()` to `allow.ownerDefinedIn('userId').identityClaim('sub')`, and the practice Lambda (`functions/practice/handler.ts`) now sets `userId` explicitly from `event.identity.sub`. Root cause: Amplify ignores a Lambda-supplied `owner` value under `allow.owner()`, so rows were stored with `owner: null` and the owning user's scoped list returned 0. Binding the owner to an explicit `userId` the trusted function writes makes owner isolation hold for Lambda-created rows.

## Verification
- `npx ampx sandbox --once` → `Deployment completed`; PracticeRun AppSync auth resolvers updated; `amplify_outputs.json` regenerated (not committed).
- `npx tsx scripts/verify-phase3.ts` → **PHASE3 VERIFY: PASS**, exit 0. All 15 assertions green: EVENT-01…07 happy path, D-04 PracticeRun persisted + no transcript, and all four two-account isolation checks (Jordan reads Sam's Event; denied Sam's Reflection/PracticeRun; denied updating Sam's Event).
- Real Mo reflection reply returned with `fallback=false` (real Bedrock Claude). No message content stored on PracticeRun (feedback = strength — tip only).

## Deviations
- PracticeRun owner binding uses `ownerDefinedIn('userId')` rather than the default `allow.owner()` implicit owner field, because the writer is a trusted Lambda, not the client. Client-created owner models (Reflection, etc.) keep `allow.owner()`.

*Completed 2026-11-04 · live-verified against account 429367298232 (us-east-1)*
