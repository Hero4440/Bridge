---
phase: 03-events-persistence
plan: 04
subsystem: ai
tags: [bedrock, reflectReply, practice-run, amplify-data, $amplify/env]
requires: [{ phase: 03-events-persistence/01 }, { phase: 02-ai-backend-infrastructure }]
provides: [reflectReply custom query, PracticeRun persistence]
affects: [03-05, 06-frontend]
requirements-completed: [EVENT-07]
completed: 2026-11-04
---
# Phase 3 / Plan 04: reflectReply + PracticeRun persistence
**Added the `reflectReply` Bedrock Converse custom query (warm Mo reply, §2.7 guardrails, warm fallback, reuses the shared helper + exact-ARN IAM) and wired PracticeRun persistence in the practice Lambda via the `$amplify/env` runtime Data client, with schema-level `allow.resource(practice)`.**

## Accomplishments
- `functions/reflectReply/{resource,prompts,handler}.ts` — Haiku reply via `converseWithTool`, warm fallback; registered as `reflectReply` custom query (`allow.authenticated()`), added to backend defineBackend + the Bedrock IAM loop. Prompt logged (P-03-REFLECT).
- `practice/handler.ts` — persists `PracticeRun {scenarioId, level, feedback}` (feedback = strength — tip; NO message/reply text, §2.8) via the runtime Data client, in try/catch so persistence never breaks the turn.
- `data/resource.ts` — schema-level `.authorization((allow) => [allow.resource(practice)])` grants the function Data access (the Phase-2 per-model form was invalid).

## Verification
- `tsc -p amplify` yields exactly ONE error — `getAmplifyDataClientConfig(env)` missing `AMPLIFY_DATA_DEFAULT_NAME` — because the env was generated in Phase 2 before the data grant. This is the documented `$amplify/env` caveat; the Plan-05 redeploy regenerates env/practice.ts and it resolves. All other Plan-04 code type-checks. No wildcard IAM; no transcript stored.

## Deviations
- reflectReply reuses the shared `converseWithTool` (DRY) rather than calling `ConverseCommand` directly; handler comment references the Converse API.
- PracticeRun uses the existing `feedback` field (strength — tip) since the model has no separate strength/tip/fallback columns.

*Completed 2026-11-04 · commit 27c1561 · live-verified in Plan 05*
