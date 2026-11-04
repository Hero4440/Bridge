---
phase: 01-foundation-authentication
plan: 04
subsystem: infra
tags: [amplify-gen2, cdk, cognito, appsync, dynamodb, aws-budgets, deploy]
requires:
  - phase: 01-plan-02
    provides: auth + pre-sign-up trigger
  - phase: 01-plan-03
    provides: 9-model schema
provides:
  - deployed sandbox backend (Cognito, AppSync, DynamoDB x9, Lambda, IAM)
  - 30-day refresh token (AUTH-03)
  - $50/month AWS Budget (bridge-monthly) at 50/80/100% (INFRA-03)
  - amplify_outputs.json (gitignored)
affects: [05-frontend-auth, phase-2-ai]
tech-stack:
  added: []
  patterns: ["CDK override on cfnUserPoolClient for token validity", "CfnBudget in backend.createStack"]
key-files:
  modified: [app/amplify/backend.ts]
key-decisions:
  - "CDK bootstrap of us-east-1 required once before first sandbox deploy"
  - "Budget alert email set to a real deliverable address (config, not a secret)"
patterns-established:
  - "First deploy validates types + IAM + schema on real AWS (D-07 gate)"
requirements-completed: [INFRA-02, INFRA-03, INFRA-04, INFRA-05, AUTH-03, DATA-10]
duration: ~deploy 260s
completed: 2026-11-03
---

# Phase 1 / Plan 04: Backend wiring + budget + first deploy

**`backend.ts` composed auth + data + pre-sign-up with a 30-day refresh token and a $50/month `CfnBudget`; first `npx ampx sandbox` deploy succeeded in 260s — no TS2590 — provisioning Cognito, AppSync, 9 DynamoDB tables, the Lambda, IAM, and the budget.**

## Performance
- **Deploy:** 259.993s · **Completed:** 2026-11-03

## Accomplishments
- `defineBackend({ auth, data, preSignUp })`; 30-day refresh token via `backend.auth.resources.cfnResources.cfnUserPoolClient` (AUTH-03) — the `[ASSUMED]` CDK path compiled and deployed.
- `$50/month` `CfnBudget` `bridge-monthly` at 50/80/100% ACTUAL created (INFRA-03, D-06) — `CREATE_COMPLETE`.
- CDK-bootstrapped us-east-1 (one-time), then `npx ampx sandbox --once` deployed all stacks (INFRA-04/05).
- Amplify type-checks passed on the 9-model schema → **D-07 TS2590 risk did not materialize**.
- AppSync endpoint live; `amplify_outputs.json` generated and gitignored.

## Files Created/Modified
- `app/amplify/backend.ts` — backend composition, 30-day token CDK override, CfnBudget

## Decisions Made
- Ran `npx cdk bootstrap aws://429367298232/us-east-1` first (required for a new account/region). Deploy uses IAM user Tejas-123 (AdministratorAccess).

## Deviations from Plan
### Auto-fixed Issues
**1. [Blocking] region not bootstrapped**
- **Found during:** first `ampx sandbox` run (stopped immediately).
- **Fix:** `npx cdk bootstrap aws://429367298232/us-east-1`, then re-ran the deploy.
- **Verification:** deploy completed; CDKToolkit present.
---
**Total deviations:** 1 (one-time bootstrap). No scope change.

## Issues Encountered
- Initial IAM access key was invalid (`InvalidClientTokenId`); replaced with a working key for Tejas-123 before deploy.

## User Setup Required
- **INFRA-02 (Bedrock, for Phase 2):** enable Anthropic model access in the Bedrock console (us-east-1) and record the model/inference-profile id into `app/amplify/shared/config.ts` `BEDROCK_MODEL_ID`. Not needed until Phase 2.
- **INFRA-03 email:** budget created; AWS emails the alert address — no confirmation needed for plain EMAIL subscribers.

## Next Phase Readiness
- Backend live; Plan 05 verified auth + isolation against it.

---
*Phase: 01-foundation-authentication*
*Completed: 2026-11-03*
