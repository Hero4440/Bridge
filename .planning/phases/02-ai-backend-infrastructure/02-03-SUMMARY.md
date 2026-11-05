---
phase: 02-ai-backend-infrastructure
plan: 03
subsystem: ai
tags: [lambda, practice, bedrock, sonnet, crisis, rate-limit]
requires:
  - phase: 02-plan-01
    provides: converseWithTool, classify, checkRateLimit, fallback
provides: [practice Lambda — full guarded turn, 7 scenarios x 3 levels]
affects: [02-05-deploy, 06-frontend]
key-files:
  created: [app/amplify/functions/practice/{resource,prompts,handler}.ts, app/amplify/functions/practice/__tests__/handler.test.ts]
  modified: [AI_PROMPTS/Tejas.md]
requirements-completed: [LAMBDA-02, AI-01, AI-02, AI-03, LAMBDA-06, LAMBDA-08, AI-07]
completed: 2026-11-03
---

# Phase 2 / Plan 03: practice() Lambda

**Mo's scripted role-play: one §2.7-guarded prompt across all 7 scenarios × 3 levels returning one strength + one tip judged against the user's goal; crisis stops the role-play with 988 and skips the rate limiter; warm fallback on model failure; PracticeRun saved with no transcript.**

## Accomplishments
- `prompts.ts` — 7-scenario map, 3-level modifiers, §2.7 guardrails (parity, crisis→988, no impersonation), forced-tool schema (partnerReply/strength/tip). Logged in AI_PROMPTS.
- `handler.ts` — validate → `classify(input)` (crisis gate, never rate-limited) → `checkRateLimit` → Sonnet `converseWithTool` → `classify(output)` → log → reply. PracticeRun write stubbed for plan 05 (env Data client), no transcript.
- 4 unit tests pass (crisis gate / happy path / model fallback / rate limit).

## Verification
- `tsc` 0 · `vitest run amplify/functions/practice` → 4 passed. Crisis path asserted to skip `checkRateLimit` + model.

## Deviations
- PracticeRun `.create()` left as a commented stub — needs the `$amplify/env/practice` Data client + `allow.resource` wired in plan 05 (can't resolve pre-deploy). Full 7×3 live quality check is plan 05 / Phase 7.

*Completed 2026-11-03 · commit 718e14e*
