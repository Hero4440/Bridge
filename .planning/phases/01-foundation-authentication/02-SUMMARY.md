---
phase: 01-foundation-authentication
plan: 02
subsystem: auth
tags: [cognito, amplify-gen2, lambda-trigger, pre-sign-up, vitest]
requires:
  - phase: 01-plan-01
    provides: Amplify Gen 2 skeleton + Vitest
provides:
  - Cognito email/password auth (no groups, no custom attributes)
  - pre-sign-up Lambda trigger that auto-confirms users (D-04, no email verification)
  - passing unit test for the auto-confirm handler
affects: [04-backend-wiring, 05-frontend-auth]
tech-stack:
  added: []
  patterns: ["auth triggers wired via defineFunction + defineAuth.triggers"]
key-files:
  created: [app/amplify/functions/pre-sign-up/resource.ts, app/amplify/functions/pre-sign-up/handler.ts, app/amplify/functions/pre-sign-up/handler.test.ts]
  modified: [app/amplify/auth/resource.ts]
key-decisions:
  - "Email+password only in Cognito; profile data deferred to User model (D-02/D-03)"
  - "autoConfirmUser + autoVerifyEmail in pre-sign-up handler = no confirmation-code flow (D-04)"
patterns-established:
  - "Lambda handler unit tests use unknown-casts (no `any`) to satisfy SKILL §3.1"
requirements-completed: [AUTH-01, AUTH-03, AUTH-04, INFRA-01]
duration: ~6min
completed: 2026-11-03
---

# Phase 1 / Plan 02: Cognito auth + auto-confirm trigger

**Email/password Cognito via `defineAuth`, with a pre-sign-up Lambda that sets `autoConfirmUser`/`autoVerifyEmail` so there is no confirmation-code step (D-04), covered by a passing Vitest unit test.**

## Performance
- **Duration:** ~6 min · **Completed:** 2026-11-03 · **Tasks:** 3 · **Files:** 4

## Accomplishments
- `amplify/auth/resource.ts` — `loginWith: { email: true }` + `triggers: { preSignUp }`; no groups, no custom attributes (replaced the default scaffold).
- `functions/pre-sign-up/{resource,handler}.ts` — `defineFunction({ name: 'pre-sign-up' })` and a `PreSignUpTriggerHandler` that auto-confirms (+ auto-verifies email when present).
- `functions/pre-sign-up/handler.test.ts` — 2 Vitest cases (email present / absent), both passing.

## Task Commits
1. **auth resource** — `41243d1`
2. **pre-sign-up resource + handler** — `41243d1`
3. **handler unit test (tdd)** — `41243d1`

## Files Created/Modified
- `app/amplify/auth/resource.ts` — Cognito email login + trigger
- `app/amplify/functions/pre-sign-up/resource.ts` — function definition
- `app/amplify/functions/pre-sign-up/handler.ts` — auto-confirm logic
- `app/amplify/functions/pre-sign-up/handler.test.ts` — unit test (2 passing)

## Deviations from Plan

### Auto-fixed Issues

**1. [Acceptance-criterion false positive] comment word "groups" tripped the no-groups grep**
- **Found during:** Task 2-02-01 verification
- **Issue:** Plan greps the auth file for `groups`; my explanatory comment used the word "groups", a false positive. The config itself has no groups.
- **Fix:** Reworded comment to "no group tiers"; config unchanged.
- **Verification:** `grep -Eq 'customAttributes|userAttributes|groups' amplify/auth/resource.ts` now returns clean.

**2. [TS strict] test avoids `any`**
- **Issue:** The plan's sample test used `{} as never` / loose callback args; SKILL §3.1 forbids `any`.
- **Fix:** Cast the mock event via `as unknown as PreSignUpTriggerEvent` and invoke the handler through an `unknown`-typed function signature. No `: any`.
- **Verification:** `grep -c ': any'` returns 0; `vitest run` passes; `tsc --noEmit -p tsconfig.app.json` exits 0.

---
**Total deviations:** 2 auto-fixed (1 comment wording, 1 strict-typing). No scope change.

## Issues Encountered
None. Full auth round-trip against real Cognito is proven in Plan 05 (post-deploy).

## Next Phase Readiness
- Auth + trigger defined; will deploy in Plan 04 (`backend.ts` composes them) and be live-tested in Plan 05.
- Note [ASSUMED] in RESEARCH: confirm `triggers.preSignUp` key + `autoVerifyEmail` behavior on the first `ampx sandbox` run.

---
*Phase: 01-foundation-authentication*
*Completed: 2026-11-03*
