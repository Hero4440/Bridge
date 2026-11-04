---
phase: 01-foundation-authentication
plan: 05
subsystem: auth
tags: [aws-amplify, cognito, appsync, data-client, verification]
requires:
  - phase: 01-plan-04
    provides: deployed sandbox + amplify_outputs.json
provides:
  - frontend Amplify.configure at startup (AUTH-05)
  - typed auth wrapper (src/lib/auth.ts)
  - PASSING live verification of auth round-trip + two-account owner isolation
affects: [phase-6-frontend]
tech-stack:
  added: []
  patterns: ["generateClient<Schema>() with userPool auth", "node tsx verification harness against real sandbox"]
key-files:
  created: [app/src/lib/auth.ts, app/scripts/verify-phase1.ts]
  modified: [app/src/main.tsx, app/tsconfig.app.json]
key-decisions:
  - "Verification done via a Node/tsx harness against REAL Cognito/AppSync (no mocks, SKILL §1.3)"
patterns-established:
  - "Owner isolation proven by a two-account test (A creates, B cannot read)"
requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, DATA-10]
duration: ~live test
completed: 2026-11-03
---

# Phase 1 / Plan 05: Frontend auth + live verification

**`Amplify.configure(outputs)` wired at startup, a typed `aws-amplify/auth` wrapper, and a live verification harness that PASSED against real Cognito/AppSync: auto-confirm sign up (no code step), sign in/out, and two-account owner isolation (jordan sees 0 of sam's Reflections).**

## Performance
- **Completed:** 2026-11-03

## Accomplishments
- `src/main.tsx` — `Amplify.configure(outputs)` at bootstrap (AUTH-05); `tsconfig.app.json` gained `resolveJsonModule`.
- `src/lib/auth.ts` — typed wrappers: `authSignUp/authSignIn/authSignOut/currentUser/currentSession` (no `any`).
- `scripts/verify-phase1.ts` — idempotent live harness (made-up emails sam/jordan).
- **Live run: ALL CHECKS PASSED** against the deployed sandbox:
  - signUp sam + jordan → complete, **no confirmation step** (D-04 / AUTH-01) — pre-sign-up trigger confirmed working live.
  - signIn / signOut round-trip (AUTH-02 / AUTH-04).
  - sam created + saw 1 Reflection; after re-auth, **jordan saw 0 of sam's** → server-side owner isolation (DATA-10 / D-08).

## Files Created/Modified
- `app/src/main.tsx` — Amplify.configure
- `app/src/lib/auth.ts` — auth surface
- `app/scripts/verify-phase1.ts` — live verification harness
- `app/tsconfig.app.json` — resolveJsonModule

## Decisions Made
- A two-account owner-isolation test is the authoritative DATA-10 proof (not a type/lint check).

## Deviations from Plan
None — plan executed as written; `main.tsx` was wired after the Plan 04 deploy generated `amplify_outputs.json`.

## Issues Encountered
None.

## Manual-Only Verification (remaining, non-blocking)
- **AUTH-03 browser-refresh persistence:** a script can't reload a tab. Confirm in-browser: sign in, hard-refresh, still signed in (30-day refresh token). Script confirms tokens are issued; the refresh-survival click is manual.

## Next Phase Readiness
- Auth + data foundation is live and verified. Phase 6 builds the real screens on `src/lib/auth.ts` + `generateClient<Schema>()`.

---
*Phase: 01-foundation-authentication*
*Completed: 2026-11-03*
