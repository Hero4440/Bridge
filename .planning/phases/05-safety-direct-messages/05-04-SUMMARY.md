---
phase: 05-safety-direct-messages
plan: 04
subsystem: verification
tags: [integration-test, live-aws, dm, safety, owner-binding, two-account]
requires: [{ phase: 05-safety-direct-messages/01 }, { phase: 05-safety-direct-messages/02 }, { phase: 05-safety-direct-messages/03 }]
provides: [verify-phase5 harness, live Phase 5 sign-off]
affects: [06-frontend]
requirements-completed: [DM-01, DM-02, DM-03, DM-04, DM-05, SAFE-01, SAFE-02, SAFE-03, SAFE-04, SAFE-05, SAFE-06, SAFE-07]
completed: 2026-11-04
---
# Phase 5 / Plan 04: end-to-end live verification
**Wrote `app/scripts/verify-phase5.ts` and proved all of DM-01…05 + SAFE-01…07 against the real sandbox as two signed-in test users: `PHASE5 VERIFY: PASS` (15/15).**

## Accomplishments
- `app/scripts/verify-phase5.ts` — two-account harness: non-contact first message HELD (not delivered), unsafe flagged (money), crisis stops delivery, recipient-only accept → accepted Contact + seeded thread, non-recipient cannot accept, contacts deliver + history loads, "I need help" notifies the connected guardian, report persists, block sets Contact blocked, guardian reads the help Notification. Per-run tag markers + count-based asserts make it resilient to leftover data; `process.exit` for the open-subscription case.
- Deployed the sandbox (MessageRequest/Report models, sendDm/respondToRequest/sendHelpAlert Lambdas + mutations).

## Verification
- `npx tsx scripts/verify-phase5.ts` → **PHASE5 VERIFY: PASS**, exit 0 (15/15).
- CloudWatch `sendDm` log: `{"fn":"sendDm","labels":["safe"|"money"|"crisis"],"fallback":false}` — labels only, no message content (§1.4/§2.8); crisis logged `latencyMs:0` (keyword layer, no Bedrock call).
- `npx tsc --noEmit -p tsconfig.app.json` exit 0.

## Deviations / fixes found live
- **Contact + Notification owner binding** (`allow.owner()` → `allow.ownerDefinedIn('userId').identityClaim('sub')`): rows created by the respondToRequest / sendHelpAlert Lambdas had `owner: null` (same class as Phase 3's PracticeRun), so the owning user couldn't block their Contact (SAFE-05) and the guardian couldn't read the help Notification (SAFE-07). Binding the owner to the Lambda-set `userId` fixed both. Two redeploys.
- Harness rewritten mid-run to be contamination-resilient (unique `TAG` per run, count-based SAFE-07, minimal cleanup) after the first version's heavy cleanup hung on cross-account delete loops.

## Known issue (pre-existing, not Phase 5)
- `amplify/functions/practice/__tests__/handler.test.ts` still fails to load under vitest (`$amplify/env/practice`) — flagged in STATE for a test-alias fix.

*Completed 2026-11-04 · commit f24984f · live-verified against account 429367298232 (us-east-1)*
