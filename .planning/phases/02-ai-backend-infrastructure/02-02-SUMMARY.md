---
phase: 02-ai-backend-infrastructure
plan: 02
subsystem: ai
tags: [lambda, classify, zod, safety]
requires:
  - phase: 02-plan-01
    provides: shared classify(), schemas, log
provides: [classify Lambda (defineFunction + zod-validated handler)]
affects: [02-05-deploy, 05-safety-dms]
key-files:
  created: [app/amplify/functions/classify/{resource,handler}.ts, app/amplify/functions/classify/__tests__/handler.test.ts]
requirements-completed: [LAMBDA-01, LAMBDA-06]
completed: 2026-11-03
---

# Phase 2 / Plan 02: classify() Lambda

**zod-validated classify endpoint delegating to the shared keyword-first labeler; invalid input returns the safer `unsafe` fallback (never throws); logs labels only.**

## Accomplishments
- `classify/resource.ts` — `defineFunction` (29s, 512MB).
- `classify/handler.ts` — `classifyInput.safeParse` → `classify()` → return `{label,confidence,fallback}`; bad input → `{unsafe,0.5,fallback:true}`; `logTurn` labels only.
- 2 unit tests pass (keyword crisis catch; invalid-input fallback).

## Verification
- `tsc --noEmit -p amplify/tsconfig.json` → 0 · `vitest run amplify/functions/classify` → 2 passed.

## Deviations
- Handler event typed `{ arguments; request?: unknown }` (avoids `any`). Custom-query wiring + IAM are plan 05.

*Completed 2026-11-03 · commit 718e14e*
