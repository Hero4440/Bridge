---
plan: 04
title: tone() + preview() Lambdas — gentle rewrites and Mo reply suggestions
wave: 2
depends_on: [01]
autonomous: true
files_modified:
  - app/amplify/functions/tone/resource.ts
  - app/amplify/functions/tone/prompts.ts
  - app/amplify/functions/tone/handler.ts
  - app/amplify/functions/tone/__tests__/handler.test.ts
  - app/amplify/functions/preview/resource.ts
  - app/amplify/functions/preview/prompts.ts
  - app/amplify/functions/preview/handler.ts
  - app/amplify/functions/preview/__tests__/handler.test.ts
  - AI_PROMPTS/<YourName>.md
requirements: [LAMBDA-03, LAMBDA-04, LAMBDA-06, AI-07, AI-08]
must_haves:
  truths:
    - "tone() flags harsh words via the keyword layer first, then returns a gentle rewrite"
    - "preview() returns 1-3 short Mo reply suggestions"
    - "Both validate input with zod, rate-limit non-crisis turns, and fall back on timeout"
  artifacts:
    - path: "app/amplify/functions/tone/handler.ts"
      provides: "keyword harsh-word flagging + Converse gentle rewrite"
      contains: "toneInput.safeParse"
    - path: "app/amplify/functions/preview/handler.ts"
      provides: "reply suggestions with gentle rate-limit message"
      contains: "previewInput.safeParse"
  key_links:
    - from: "tone/handler.ts & preview/handler.ts"
      to: "shared/bedrock.ts + shared/rateLimit.ts + shared/fallback.ts"
      via: "import"
      pattern: "converseWithTool"
---

<objective>
Deploy the `tone()` and `preview()` Lambdas. tone() runs the harsh-word keyword layer first (deterministic, with a per-word reason) and only calls the Haiku Converse `/tone` rewrite when needed, returning `{gentle, flaggedWords}`. preview() returns 1-3 short Mo opener/reply suggestions. Both zod-validate, rate-limit non-crisis turns, and use the shared fallback on timeout — returning promptly so the UI's "takes a few seconds the first time" copy (Phase 6) has a responsive endpoint plus a gentle rate-limit message (AI-08).

Purpose: LAMBDA-03, LAMBDA-04, LAMBDA-06, AI-07, AI-08.
Output: two function dirs + unit tests; tone/preview prompts logged. Custom-query wiring + IAM in plan 05.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-ai-backend-infrastructure/02-CONTEXT.md
@.claude/skills/bridge/SKILL.md
@app/amplify/functions/shared/bedrock.ts
@app/amplify/functions/shared/rateLimit.ts
@app/amplify/functions/shared/schemas.ts
@app/amplify/functions/shared/fallback.ts
</context>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| AppSync (Cognito) → tone/preview Lambda | authenticated user text |
| Lambda → Bedrock | user text leaves to Haiku |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-16 | Tampering (injection) | tone/preview prompts | mitigate | §2.7 guardrails in both system prompts; user never auto-sent/auto-rewritten — "Say it gently" is user-initiated (task 2-04-01/02) |
| T-02-17 | DoS (cost) | both handlers | mitigate | checkRateLimit + maxTokens 500 + keyword-first tone avoids needless model calls (task 2-04-01/02) |
| T-02-18 | Info disclosure | both handlers logging | mitigate | logTurn labels only, no text |
| T-02-19 | Availability | both handlers | mitigate | shared fallback returns warm scripted reply on timeout (AI-07) |
</threat_model>

<tasks>

<task type="auto" id="2-04-01" tdd="true">
  <name>tone() — resource, §2.7 prompt, keyword-first handler</name>
  <read_first>app/amplify/functions/shared/keywords.ts, app/amplify/functions/shared/bedrock.ts, app/amplify/functions/shared/schemas.ts, .claude/skills/bridge/SKILL.md</read_first>
  <files>app/amplify/functions/tone/resource.ts, app/amplify/functions/tone/prompts.ts, app/amplify/functions/tone/handler.ts, app/amplify/functions/tone/__tests__/handler.test.ts, AI_PROMPTS/&lt;YourName&gt;.md</files>
  <behavior>
    - text with "stupid"/"shut up"/"hate" → flaggedWords non-empty, each with a reason
    - clean text with no harsh words → still returns { gentle, flaggedWords: [] }
    - model {ok:false} → FALLBACKS.tone, fallback:true
    - invalid input → fallback, no throw
  </behavior>
  <action>
`tone/resource.ts`: `defineFunction({ name: 'tone', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 })` (comment why — Haiku-class, D-01).

`tone/prompts.ts` — harsh-word list + reasons + §2.7-guarded rewrite prompt:
```ts
export const HARSH = { whatever:'can feel dismissive', stupid:'can feel insulting', 'shut up':'can feel aggressive', annoying:'can feel critical', hate:'is a strong word', overrated:'can feel dismissive', dumb:'can feel insulting' } as const;
export const TONE_SYSTEM = `You are Mo. Rewrite the user's message in a gentler, kinder tone while keeping their meaning and their voice. Plain, short language. Do not lecture. Never auto-send; the user decides. No medical/legal/financial advice. Reply ONLY via the 'tone' tool with a 'gentle' rewrite and the 'flaggedWords' you softened.`;
export const TONE_TOOL_SCHEMA = { type:'object', properties:{ gentle:{type:'string'}, flaggedWords:{type:'array', items:{type:'string'}} }, required:['gentle','flaggedWords'] } as const;
```

`tone/handler.ts`: validate `toneInput`; scan for HARSH keys first (build flaggedWords with reasons); call checkRateLimit (non-crisis); call converseWithTool (Haiku CLASSIFY_MODEL_ID is Haiku-class — reuse CLASSIFY_MODEL_ID) with toneOutput validator; on `!ok` return FALLBACKS.tone + fallback:true; logTurn labels only. Log TONE_SYSTEM in AI_PROMPTS.
  </action>
  <acceptance_criteria>
- `grep -q "toneInput.safeParse" app/amplify/functions/tone/handler.ts`
- `grep -q "HARSH" app/amplify/functions/tone/handler.ts`
- `grep -q "required:\['gentle','flaggedWords'\]" app/amplify/functions/tone/prompts.ts`
- `grep -q "Never auto-send" app/amplify/functions/tone/prompts.ts`
- `grep -q "tone" AI_PROMPTS/`*`.md`
- `cd app && npx vitest run amplify/functions/tone` exits 0
  </acceptance_criteria>
  <done>tone flags harsh words first, rewrites via Haiku, validates+rate-limits+falls back; prompt logged; tests pass.</done>
</task>

<task type="auto" id="2-04-02" tdd="true">
  <name>preview() — resource, §2.7 prompt, suggestions handler with gentle rate-limit copy</name>
  <read_first>app/amplify/functions/shared/bedrock.ts, app/amplify/functions/shared/rateLimit.ts, app/amplify/functions/shared/schemas.ts, app/amplify/functions/shared/fallback.ts</read_first>
  <files>app/amplify/functions/preview/resource.ts, app/amplify/functions/preview/prompts.ts, app/amplify/functions/preview/handler.ts, app/amplify/functions/preview/__tests__/handler.test.ts, AI_PROMPTS/&lt;YourName&gt;.md</files>
  <behavior>
    - valid input + mocked ok model → { suggestions: string[1..3], fallback:false }
    - model {ok:false} → FALLBACKS.preview, fallback:true
    - rate-limit over 100 → gentle RATE_LIMIT_MESSAGE in a suggestion-shaped reply, fallback:true
    - invalid input → fallback, no throw
  </behavior>
  <action>
`preview/resource.ts`: `defineFunction({ name: 'preview', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 })`.

`preview/prompts.ts` — §2.7-guarded suggestion prompt:
```ts
export const PREVIEW_SYSTEM = `You are Mo. Offer 1-3 short, friendly opener or reply ideas the user could send in this context. Plain language, their voice. Never auto-send; these are only ideas. No medical/legal/financial advice. Never imitate real people. Reply ONLY via the 'preview' tool with a 'suggestions' array (1-3 items).`;
export const PREVIEW_TOOL_SCHEMA = { type:'object', properties:{ suggestions:{type:'array', items:{type:'string'}, minItems:1, maxItems:3} }, required:['suggestions'] } as const;
```

`preview/handler.ts`: validate `previewInput`; checkRateLimit (over limit → return `{ suggestions: [RATE_LIMIT_MESSAGE], fallback:true, rateLimited:true }`); converseWithTool (Haiku CLASSIFY_MODEL_ID) with previewOutput validator; `!ok` → FALLBACKS.preview + fallback:true; logTurn labels only. Return promptly (no artificial delay) — AI-08. Log PREVIEW_SYSTEM in AI_PROMPTS.
  </action>
  <acceptance_criteria>
- `grep -q "previewInput.safeParse" app/amplify/functions/preview/handler.ts`
- `grep -q "RATE_LIMIT_MESSAGE" app/amplify/functions/preview/handler.ts`
- `grep -q "minItems:1, maxItems:3" app/amplify/functions/preview/prompts.ts`
- `grep -q "preview" AI_PROMPTS/`*`.md`
- `cd app && npx vitest run amplify/functions/preview` exits 0
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
  </acceptance_criteria>
  <done>preview returns 1-3 suggestions, validates+rate-limits+falls back, gentle message at limit; prompt logged; tests pass.</done>
</task>

</tasks>

<verification>
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
- `cd app && npx vitest run amplify/functions/tone amplify/functions/preview` exits 0
</verification>

<success_criteria>
tone() and preview() Lambda source complete, unit-tested, §2.7-guarded, keyword-first for tone, zod-validated, rate-limited, fallback on timeout, gentle rate-limit copy; ready for wiring in plan 05.
</success_criteria>

<output>
After completion, create `.planning/phases/02-ai-backend-infrastructure/02-04-SUMMARY.md`.
</output>
