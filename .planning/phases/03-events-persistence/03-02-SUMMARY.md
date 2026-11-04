---
phase: 03-events-persistence
plan: 02
subsystem: database
tags: [rsvp, amplify-data, upsert, vitest]
requires: [{ phase: 03-events-persistence/01 }]
provides: [RSVP deterministic id, get-then-upsert setRsvp, pure countRsvps]
affects: [03-05, 06-frontend]
requirements-completed: [EVENT-03, EVENT-04, EVENT-05]
completed: 2026-11-04
---
# Phase 3 / Plan 02: RSVP persistence + counts
**`app/src/lib/rsvp.ts`: deterministic `${eventId}#${userId}` logical key, auth-bound get-then-upsert (list by eventId+userId → update or create, fixing the prototype's in-memory duplicate/loss bug), and a pure `countRsvps` reducer. 6 Vitest units pass.**

## Verification
- `tsc` 0 · `vitest run src/lib/rsvp.test.ts` → 6 passed (id determinism/guards + reducer). userId always from the Cognito session (never a caller arg) — spoof-resistant.

## Deviations
- RSVP has no custom identifier, so upsert is filter-based (list eventId+userId → update/create) rather than a composite-PK get. Minor race under concurrent first-RSVP; a composite `identifier(['eventId','userId'])` is a future hardening. Live persistence/no-dupe proven in Plan 05.

*Completed 2026-11-04*
