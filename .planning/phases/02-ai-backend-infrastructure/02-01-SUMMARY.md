---
phase: 02-ai-backend-infrastructure
plan: 01
subsystem: ai
tags: [bedrock, converse-api, zod, classify, rate-limit, vitest]
requires:
  - phase: 01-foundation-authentication
    provides: amplify project, PracticeRun model, config.ts
provides:
  - converseWithTool() shared Bedrock helper (forced tool, 500-cap, 5s abort, zod)
  - keyword safety layer (deterministic crisis/money/address)
  - the ONE classify() labeler (keyword-first, safer-on-fallback)
  - feature fallbacks, DynamoDB rate-limit counter, privacy-safe logging
  - 8 zod schemas + SCENARIOS
affects: [02-02-classify, 02-03-practice, 02-04-tone-preview, 02-05-deploy]
tech-stack:
  added: ["@aws-sdk/client-bedrock-runtime", "@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb"]
  patterns: ["one converseWithTool() + one classify() reused by all AI functions"]
key-files:
  created: [app/amplify/functions/shared/{bedrock,keywords,classify,classify-prompts,fallback,rateLimit,log,schemas}.ts, app/amplify/functions/shared/__tests__/*.test.ts]
  modified: [app/amplify/shared/config.ts, app/package.json, AI_PROMPTS/Tejas.md]
key-decisions:
  - "Model ids default to us. inference-profile ids with env override; confirmed in plan 05"
  - "Bedrock ToolInputSchema.json cast with a commented `as any` (recursive DocumentType); zod validates at runtime"
patterns-established:
  - "keyword-first safety; classify leans 'unsafe' on model failure (D-02)"
  - "logTurn emits labels only, never user content (SKILL §2.8)"
requirements-completed: [BEDROCK-03, BEDROCK-04, BEDROCK-05, LAMBDA-06, LAMBDA-07, LAMBDA-08, AI-07]
duration: ~12min
completed: 2026-11-03
---

# Phase 2 / Plan 01: Shared Bedrock foundation

**One `converseWithTool()` (Converse + forced tool + 500-token cap + 5s abort + zod), a deterministic keyword safety net, the single `classify()` labeler, warm fallbacks, an atomic DynamoDB rate-limit counter, and content-free logging — all unit-tested (10/10).**

## Accomplishments
- `converseWithTool()` enforces forced-tool structured output (BEDROCK-03), `maxTokens ≤ 500` (BEDROCK-04), zod validation (BEDROCK-05), 5s abort + fallback on failure (LAMBDA-07).
- `keywordLabel()` catches crisis/money/address deterministically before any model call (D-02).
- `classify()` = the ONE labeler (SKILL §3.4); leans to `unsafe` on model failure.
- `checkRateLimit()` atomic `UpdateItem ADD`, 100/hr, TTL, fails open without a table (LAMBDA-08).
- `logTurn()` emits reqId/fn/scenario/level/latency/labels/fallback only (SKILL §2.8).
- 8 zod schemas + SCENARIOS (LAMBDA-06). Classifier prompt logged to AI_PROMPTS (Part 4).

## Task Commits
1–3 folded into `bc082b7` (inline sequential execution).

## Verification
- `npx tsc --noEmit -p amplify/tsconfig.json` → exit 0
- `npx vitest run amplify/functions/shared` → 10 passed (crisis-catch + fallback + log privacy)
- No wildcard IAM in shared.

## Deviations from Plan
- `log.ts` comment worded to avoid the literal words text/message/content (plan's own comment would trip its grep) — behavior identical.
- `as any` on the Bedrock tool input schema is commented (SKILL §3.1 allows with a why); block/output typed without `any`.

## Next
Wave 2 (plans 02 classify, 03 practice, 04 tone+preview) import these interfaces; they do not re-implement Bedrock plumbing.

---
*Phase: 02-ai-backend-infrastructure*
*Completed: 2026-11-03*
