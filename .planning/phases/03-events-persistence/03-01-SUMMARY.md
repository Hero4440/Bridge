---
phase: 03-events-persistence
plan: 01
subsystem: database
tags: [amplify-data, event, schema, data-client]
requires: [{ phase: 01-foundation-authentication }]
provides: [Event wizard fields, typed Event Data-client lib]
affects: [03-02, 03-04, 03-05, 06-frontend]
requirements-completed: [EVENT-01, EVENT-02]
completed: 2026-11-04
---
# Phase 3 / Plan 01: Event fields + Data client lib
**Reconciled the Event model with the 3-step wizard (venue, usuallyQuiet, reminder, tellTrustedPerson, exitPlan, circleId, durationMinutes; format → inPerson/voice/video/text) and added `app/src/lib/data.ts` with typed createEvent/listEvents/getEvent/updateEvent.**

## Verification
- `tsc --noEmit` on amplify + src both exit 0. Event auth stays owner-write / authenticated-read (EVENT-04 isolation). Types derived from `Schema['Event']` (no `any`).

## Deviations
- Kept Phase 1 field names (what/whenAt/comfortSound/Lighting/Size) and ADDED the missing wizard fields rather than renaming (avoids breaking the deployed schema); `comfortSize` doubles as capacity.

*Completed 2026-11-04*
