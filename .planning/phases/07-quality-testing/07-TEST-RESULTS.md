---
phase: 07-quality-testing
status: awaiting-human-verification
updated: 2026-11-05
---

# Phase 7 Test Results

## Automated Checks

| Check | Result | Evidence |
|---|---|---|
| Real demo seed | Pass | Two Cognito profiles, 5 events, 6 circles, 13 messages, and 6 topics verified in the sandbox; repeat run stayed idempotent. |
| Seed specification | Pass | `npm run seed:demo:check` |
| Lint | Pass with warnings | `npm run lint` exits 0; warnings are listed below. |
| Unit tests | Pass | 15 suites and 63 tests pass, including profile-owner isolation, second trusted-person persistence, Me activity aggregation, and the practice handler. |
| Production build | Pass with warning | TypeScript and Vite build successfully; Vite reports one large client chunk. |
| Amplify sandbox schema | Pass | Existing `hero4440` sandbox updated successfully; generated AppSync schema includes `gender`, `comfortMoHelp`, and `comfortPlainWords`. |

## Resolved Showstoppers

1. Event cards now use `whenAt`, `whereText`/`venue`, and `comfortSize`, with safe fallbacks for optional values.
2. `Circles`, `Dms`, `Events`, and `Practice` now pass the supported `error` prop to `ErrorRetry`.
3. `getCurrentUserProfile()` filters and verifies the signed-in Cognito owner; a focused test proves another readable profile is not returned.
4. The practice handler suite resolves Amplify's deploy-generated environment through a test-only alias.

## Other Automated Findings

- Lint reports set-state-in-effect warnings on several screens but exits successfully.
- Vite reports a client chunk larger than 500 kB; code splitting is deferred because it does not block the demo.

## Human Verification Pending

- Two-browser auth, circle subscription, RSVP, and DM checks
- Practice feedback and crisis-flow screenshots
- Phone-width and laptop-width checks
- Browser console inspection
- Three timed rehearsals of the demo script
- Figma parity screenshots and refresh-persistence checks for every Me subpage
- Remaining Home, Circles/DMs, Events, Practice/Mo, and onboarding parity audit from Plan 07-02

No manual checkbox is marked complete until a teammate performs and records the test.
