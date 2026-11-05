---
phase: 02-ai-backend-infrastructure
plan: 05
subsystem: ai
tags: [bedrock, appsync, iam, dynamodb, deploy, integration-test]
requires:
  - phase: 02-plan-02
  - phase: 02-plan-03
  - phase: 02-plan-04
provides:
  - 4 AI Lambdas live as Cognito-authorized AppSync custom queries
  - exact-ARN Bedrock IAM (no wildcard)
  - DynamoDB rate-limit table (TTL)
  - verify-phase2.ts integration harness
affects: [phase-5-safety, phase-6-frontend, phase-7-quality]
tech-stack:
  patterns: ["custom query a.query().handler(a.handler.function(fn))", "exact inference-profile + foundation-model ARNs"]
key-files:
  modified: [app/amplify/data/resource.ts, app/amplify/backend.ts, app/amplify/shared/config.ts, app/amplify/functions/shared/keywords.ts]
  created: [app/scripts/verify-phase2.ts]
key-decisions:
  - "Models: us.anthropic.claude-haiku-4-5 (classify/tone/preview), claude-sonnet-4-5 (practice)"
  - "Reserved concurrency dropped — account Lambda concurrency limit is 10; cost guarded by budget + rate limit + maxTokens"
requirements-completed: [LAMBDA-05, LAMBDA-08, BEDROCK-01, AI-08]
duration: ~deploy + verify
completed: 2026-11-03
---

# Phase 2 / Plan 05: Bedrock wiring, IAM, rate-limit table, deploy + verify

**Four AI Lambdas deployed as `allow.authenticated()` AppSync custom queries with least-privilege, exact-ARN `bedrock:InvokeModel` IAM (no `*`), a TTL DynamoDB rate-limit table, and confirmed `claude-haiku-4-5` / `claude-sonnet-4-5` ids. Sandbox deploy green; live verification proved the keyword safety net and fallback resilience — real model output is gated on a one-time Anthropic use-case form.**

## Accomplishments
- `data/resource.ts`: 4 reply customTypes + `practiceTurn`/`classifyText`/`toneCheck`/`previewReplies` custom queries (Cognito-authorized).
- `backend.ts`: registered the 4 functions; `bedrock:InvokeModel` on EXACT inference-profile + per-routed-region (us-east-1/2, us-west-2) foundation-model ARNs (confirmed via `get-inference-profile`); DynamoDB rate-limit table (TTL) granted + `RATE_LIMIT_TABLE` env to practice/tone/preview.
- `config.ts`: real model ids (resolved from `list-inference-profiles`).
- Deploy: `npx ampx sandbox` completed in 210s; all 4 query resolvers + table live; `amplify_outputs.json` regenerated with the custom queries.
- `verify-phase2.ts`: signed-in integration run.

## Verification (live sandbox)
- ✅ classify crisis + money caught deterministically (keyword net, no Bedrock).
- ✅ practice returned strength + tip for all 7 scenarios + 3 levels (via the warm **fallback** — model gated, see below).
- ✅ crisis gate: practiceTurn with self-harm text → 988, role-play stopped.
- ✅ tone flagged harsh words with reasons; preview returned suggestions (fallback copy).
- ✅ fallback resilience proven end-to-end (D-03 / AI-07): every blocked model call degraded to a warm scripted reply, never a raw error.

## Deviations / Blockers
1. **[Human gate] Anthropic use-case form not submitted.** Direct + Lambda Converse calls return `ResourceNotFoundException: "Model use case details have not been submitted for this account."` So real Claude output is unavailable until the one-time form is submitted in the Bedrock console (+ ~15 min propagation). The app behaves correctly meanwhile (keyword safety + warm fallbacks). **Re-run `verify-phase2.ts` after submitting.**
2. **Reserved concurrency removed.** Account Lambda concurrency limit is 10 — reserving per-function was rejected (`UnreservedConcurrentExecution below minimum [10]`). Cost is guarded by the $50 budget + 100/hr rate limit + `maxTokens:500`. Re-add after a concurrency quota increase.
3. **Models:** chose `claude-haiku-4-5` + `claude-sonnet-4-5` (current ids; the planned "3.5" ids don't exist on this account/date).
4. Keyword `ADDRESS` regex broadened to catch "home address" (applies on next deploy).

## User Setup Required
- **Submit the Anthropic use-case form** (Bedrock console → Model catalog → a Claude model → use-case details). Then ping me — I'll redeploy (applies the keyword fix) and re-run `verify-phase2.ts` to confirm real strength+tip / labels.
- Optional: 500 RPM quota (BEDROCK-02) + Lambda concurrency quota via Service Quotas.

## Next Phase Readiness
- AI backend is deployed and resilient. Once the form clears, real Claude feedback flows. Phase 3+ (events, chat, safety, frontend) build on these endpoints.

---
*Phase: 02-ai-backend-infrastructure*
*Completed: 2026-11-03 (model output pending Anthropic form)*

---

## UPDATE 2026-11-04 — Anthropic form cleared, VERIFIED COMPLETE ✅
The Anthropic use-case form was submitted and propagated for both models. `verify-phase2.ts` re-run against the live sandbox:
- classify → crisis / money / address / safe all correct (real Haiku structured output + keyword net)
- practice → real strength + tip for all 7 scenarios × 3 levels, **fallback=false on every call**
- crisis gate → 988, role-play stopped
- tone → real gentle rewrite + reasoned flagged words · preview → 3 real suggestions

**Fix applied:** per-call Bedrock timeout — Sonnet practice calls were intermittently exceeding the shared 5s abort; raised practice to 15s (Haiku classify/tone/preview stay at 5s). After this, all practice calls return real feedback. Models in use: `claude-haiku-4-5` + `claude-sonnet-4-5`. All 5 Phase-2 success criteria met with real Claude output.
