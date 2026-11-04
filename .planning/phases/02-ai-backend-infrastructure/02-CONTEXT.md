# Phase 2: AI Backend Infrastructure - Context

**Gathered:** 2026-11-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the AI layer behind Cognito-authorized AppSync custom queries:

- Four Lambda functions: `classify`, `practice`, `tone`, `preview` (each with `prompts.ts`)
- Bedrock Converse API integration with `toolConfig` structured output, zod-validated
- Per-user rate limiting (100 req/hour via a DynamoDB counter with TTL)
- Cost caps (maxTokens ≤ 500, capped input length) and scripted fallbacks on throttle/timeout
- Practice feedback working end-to-end for all 7 scenarios × 3 levels (strength + tip)

**Not in this phase:** UI screens / loading states wiring (Phase 6), events/chat/DM features
(Phases 3–5), and the feature-level verification of tone/Mo-reply/bias (AI-04/05/06 are Phase 7).
Phase 2 *deploys* the `tone` and `preview` Lambdas; their full feature wiring is later.
**Depends on:** Phase 1 (auth, schema incl. PracticeRun, `app/amplify` project, us-east-1).
</domain>

<decisions>
## Implementation Decisions

### Model selection (D-01) — resolves the REQUIREMENTS vs cost-control conflict
- **Split by function:** a small/fast model (Claude **Haiku** class) for `classify`, `tone`,
  `preview` (short, high-volume, latency-sensitive); a **stronger model** (Claude **Sonnet**
  class) for `practice` feedback, where quality is the core value.
- Exact model / inference-profile ids are resolved AFTER Bedrock access is enabled
  (`aws bedrock list-inference-profiles --region us-east-1`) and recorded in
  `app/amplify/shared/config.ts` (e.g. `PRACTICE_MODEL_ID`, `CLASSIFY_MODEL_ID`).
- Supersedes the literal "Claude 3.5 Sonnet v2 everywhere" reading of BEDROCK-01 and the
  blanket "small Claude everywhere" note — the split captures both intents.

### Safety classification conservativeness (D-02)
- `classify()` **biases toward over-flagging crisis** — a missed crisis is far worse than a
  false alarm for this user group. Low confidence threshold on the crisis label → show 988 +
  trusted-person prompt.
- The **keyword layer runs first as a guaranteed safety net** (deterministic) before the LLM
  JSON pass; crisis keywords alone are sufficient to trigger the crisis path even if the LLM
  disagrees. Money/address/unsafe flags follow the same keyword-first-then-LLM order.

### Fallback content & tone (D-03)
- On Bedrock throttle/timeout (>5s, after SDK retries): return **short, warm, feature-specific
  scripted replies**, never a raw error. Example (practice): "I couldn't think of feedback just
  now — you showed up and tried, that counts. Want to go again?"
- Every fallback returns `fallback: true` and is counted in logs (SKILL §1.3).

### Rate-limit-hit UX (D-04)
- At 100 req/hour/user: respond with a **gentle Mo message** ("Let's take a breather — try again
  in a bit"), not a hard error.
- **Safety/crisis paths are never rate-limited or blocked.**

### Carried forward (locked — from SKILL.md + Phase 1)
- ONE `classify(text, labels)` → `{label, confidence 0..1}` for ALL labeling; never call the
  model for labels elsewhere. Prompts in `prompts.ts` beside each function, each logged (Part 4).
- Bedrock **Converse API**, `toolConfig` + JSON schema for structured output, zod-validate the
  response, low temperature, `maxTokens` capped.
- Lambdas behind Amplify **custom queries** (`a.query()`), Cognito-authorized (`allow.authenticated()`),
  IAM least-privilege with exact model/inference-profile ARNs (never `*`); cross-region inference
  profiles need IAM for the profile ARN + the foundation-model ARNs in every routed region.
- **No raw transcripts** anywhere (log request id, scenario, level, latency, labels, `fallback` only).
- Each turn: validate → `classify()` input → model call with `prompts.ts` system prompt →
  `classify()` output → save `PracticeRun` → reply.

### Claude's Discretion
- DynamoDB rate-limit counter design (PK/TTL shape) and the zod schemas.
- Exact `toolConfig` JSON schemas per function; retry/backoff timings within the >5s budget.
- Reserved concurrency values on AI functions.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Build rules & AI conventions
- `.claude/skills/bridge/SKILL.md` §1.4 — Bedrock/Lambda/IAM/cost conventions, Converse API, classify, cost guards.
- `.claude/skills/bridge/SKILL.md` §2.3 — Mo behavior (practice scenarios, levels, one strength + one tip).
- `.claude/skills/bridge/SKILL.md` §2.5 — classify() single-function rule (LLM JSON + keyword rules).
- `.claude/skills/bridge/SKILL.md` §2.7 — AI guardrails for EVERY system prompt (role, parity, crisis, no medical/legal/financial, flag money/address).
- `.claude/skills/bridge/SKILL.md` §2.8 — privacy: what Mo can see, no raw transcripts, owner-only PracticeRun.
- `.claude/skills/bridge/SKILL.md` §3 (items 4,5,7,8,10) — classify/prompts/fallback/tone-keyword/guardrail code standards.

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — LAMBDA-01..08, BEDROCK-01..05, AI-01, AI-02, AI-03, AI-07, AI-08.
- `.planning/ROADMAP.md` §"Phase 2" — goal + 5 success criteria.

### Architecture & Phase 1 contract
- `docs/AI_INTEGRATION.md` — how live Bedrock calls connect to the UI (read before wiring).
- `tech design/index.html` — AWS architecture + API endpoint design (practiceTurn custom query shape).
- `.planning/phases/01-foundation-authentication/01-CONTEXT.md` — Phase 1 locked decisions (region, schema, auth).
- `app/amplify/data/resource.ts` — the deployed `PracticeRun` model fields this phase writes to.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/amplify/functions/pre-sign-up/` — the established `defineFunction` + handler pattern to mirror for the AI Lambdas.
- `app/amplify/shared/config.ts` — already holds `AWS_REGION` + `BEDROCK_MODEL_ID` placeholder; extend with per-model ids.
- `app/amplify/data/resource.ts` — `PracticeRun` (owner-only) is the sink for practice results; add custom `a.query()` endpoints here.
- `app/amplify/backend.ts` — where AI function IAM (exact Bedrock ARNs) and reserved concurrency get wired.
- `zod` already installed (Phase 1).

### Established Patterns
- Amplify Gen 2 code-first; custom queries via `a.query().handler(a.handler.function(fn))` with `allow.resource(fn)` for data access.
- Phase 1 proved deploy + owner-isolation; AI endpoints add to the same backend.

### Integration Points
- `app/amplify/functions/{classify,practice,tone,preview}/` (new) each with `handler.ts` + `prompts.ts`.
- `app/amplify/data/resource.ts` custom queries (e.g. `practiceTurn`), Cognito-authorized.
- `app/amplify/backend.ts` — `bedrock:InvokeModel` policy with exact ARNs; Budget from Phase 1 already guards cost.
</code_context>

<specifics>
## Specific Ideas
- Prerequisite before execution: enable Anthropic model access in the Bedrock console (us-east-1,
  INFRA-02) and record the chosen ids — the $50 budget (Phase 1) is already in place.
- Practice feedback is the core value: prioritize its quality (model D-01) and its fallback warmth (D-03).
</specifics>

<deferred>
## Deferred Ideas
- Tone-check and Mo reply-idea *feature wiring* + bias probe (AI-04/05/06) — Phase 7.
- Bedrock quota increase to 500 RPM (BEDROCK-02) is an AWS Support request — start early but it's an external action, not code.
- Scheduled/quiet check-ins (EventBridge) — stretch, not this phase.

Discussion stayed within the AI-backend boundary.
</deferred>

---

*Phase: 02-ai-backend-infrastructure*
*Context gathered: 2026-11-03*
