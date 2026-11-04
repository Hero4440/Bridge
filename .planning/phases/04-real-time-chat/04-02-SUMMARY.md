---
phase: 04-real-time-chat
plan: 02
subsystem: ai
tags: [bedrock, dailyTopic, topic-cache, amplify-data, $amplify/env, iam]
requires: [{ phase: 04-real-time-chat/01 }, { phase: 02-ai-backend-infrastructure }]
provides: [getDailyTopic query, dailyTopic Lambda, topic client helper]
affects: [04-04, 06-frontend]
requirements-completed: [CHAT-05]
completed: 2026-11-04
---
# Phase 4 / Plan 02: dailyTopic Lambda + cached daily topic
**Added the AI-generated, cached daily circle topic: a `dailyTopic` Lambda that reads today's Topic row first and only calls Bedrock when it's missing, wired as the `getDailyTopic` custom query with least-privilege Bedrock IAM and a typed client helper.**

## Accomplishments
- `functions/dailyTopic/{resource,prompts,handler}.ts` — mirrors the reflectReply shape. Handler: cache-read `Topic.get({groupId,date})` → return if present (NO Bedrock); else `converseWithTool` (Haiku), cache-write (swallow concurrent-duplicate), warm fallback (`fallback:true`). Logs `labels:[groupId]` + fallback only — never the topic text.
- `data/resource.ts` — `DailyTopicReply` customType + `getDailyTopic` authenticated custom query; extended schema-level auth to `[allow.resource(practice), allow.resource(dailyTopic)]` so the Lambda can read/write the Topic cache.
- `backend.ts` — `dailyTopic` in `defineBackend` + added to the `aiFunctions` exact-ARN Bedrock IAM loop (existing ARNs cover Haiku; no wildcard). Reserved concurrency stays off (account limit 10).
- `app/src/lib/topics.ts` — typed `getDailyTopic(groupId, groupName?)` helper. Prompt logged as P-04-TOPIC in `AI_PROMPTS/Tejas.md`.

## Verification
- Grep acceptance PASS (cache-read-before-generate, fallback branch, query/type/allow.resource, backend IAM, client helper, prompt entry).
- `npx tsc --noEmit -p tsconfig.app.json` exit 0. `amplify/tsconfig.json` shows exactly ONE error — `$amplify/env/dailyTopic` module not found — the documented post-deploy caveat (same as practice in Phase 3); the Plan 04 redeploy resolves it. No wildcard IAM.

## Deviations
- Daily topic kept as a NEW Lambda (`getDailyTopic`) rather than extending `previewReplies`, because it needs Data-client write access for the Topic cache and a distinct output shape (RESEARCH open-question default). Not rate-limited — the Topic cache already bounds it to one Bedrock call per circle per day.

*Completed 2026-11-04 · commit ef0b417 · live-verified in Plan 04*
