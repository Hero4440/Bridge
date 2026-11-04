---
phase: 02-ai-backend-infrastructure
plan: 04
subsystem: ai
tags: [lambda, tone, preview, bedrock, haiku]
requires:
  - phase: 02-plan-01
    provides: converseWithTool, checkRateLimit, fallback, keywords
provides: [tone Lambda (keyword-first gentle rewrite), preview Lambda (reply ideas)]
affects: [02-05-deploy, 07-quality]
key-files:
  created: [app/amplify/functions/tone/{resource,prompts,handler}.ts, app/amplify/functions/preview/{resource,prompts,handler}.ts, both __tests__/handler.test.ts]
  modified: [AI_PROMPTS/Tejas.md]
requirements-completed: [LAMBDA-03, LAMBDA-04, LAMBDA-06, AI-07, AI-08]
completed: 2026-11-03
---

# Phase 2 / Plan 04: tone() + preview() Lambdas

**tone() flags harsh words deterministically (each with a reason) then returns a Haiku gentle rewrite; preview() returns 1-3 short Mo reply ideas. Both zod-validate, rate-limit non-crisis turns, fall back warmly on timeout, and return promptly (AI-08) with a gentle rate-limit message.**

## Accomplishments
- `tone/` — HARSH word+reason map, §2.7 "never auto-send" prompt, keyword-first handler; flaggedWords built from the deterministic scan.
- `preview/` — §2.7 ideas-only prompt (1-3 suggestions), gentle `RATE_LIMIT_MESSAGE` at the cap.
- Both prompts logged in AI_PROMPTS. 4 + 4 unit tests pass.

## Verification
- `tsc` 0 · `vitest run amplify/functions/tone amplify/functions/preview` → 8 passed.

## Deviations
- Both reuse `CLASSIFY_MODEL_ID` (Haiku-class) per D-01. Feature wiring + bias probe (AI-04/05/06) remain Phase 7; custom-query + IAM are plan 05.

*Completed 2026-11-03 · commit 718e14e*
