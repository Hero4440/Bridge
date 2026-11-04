---
phase: 03-events-persistence
plan: 03
subsystem: ui
tags: [prep, reflection, amplify-data, fallback, vitest]
requires: [{ phase: 03-events-persistence/01 }]
provides: [static prep template, what-to-expect projection, saveReflection + warm fallback]
affects: [03-04, 03-05, 06-frontend]
requirements-completed: [EVENT-06, EVENT-07]
completed: 2026-11-04
---
# Phase 3 / Plan 03: prep template + reflection save
**`prep.ts` — static per-format checklist (in-person/voice/video/text) + host-field `whatToExpect` (no AI, D-02). `reflection.ts` — owner-only `saveReflection({feeling,wins})` (NO transcript, §2.8) + warm reply via an injected `replyFn`, `REFLECTION_FALLBACK` when Bedrock is down (D-03). 10 Vitest units pass.**

## Verification
- `tsc` 0 · `vitest run prep.test.ts reflection.test.ts` → 10 passed. prep.ts has zero Bedrock/AI calls; reflection.ts stores no transcript.

## Deviations
- The reply source is injected as `replyFn` (decouples from the Plan-04 `reflectReply` query that doesn't exist yet + keeps the fallback pure-testable via the exported `resolveReply`). The real query is wired by the caller (Plan 05 / Phase 6).

*Completed 2026-11-04*
