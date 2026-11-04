---
plan: 02
title: classify() Lambda — validated safety/labeling custom query
wave: 2
depends_on: [01]
autonomous: true
files_modified:
  - app/amplify/functions/classify/resource.ts
  - app/amplify/functions/classify/handler.ts
  - app/amplify/functions/classify/__tests__/handler.test.ts
requirements: [LAMBDA-01, LAMBDA-06]
must_haves:
  truths:
    - "classify() detects crisis/unsafe/money/address/bias on arbitrary user text"
    - "Invalid arguments never throw — they return the safer 'unsafe' fallback"
    - "The handler logs labels only, never the input text"
  artifacts:
    - path: "app/amplify/functions/classify/resource.ts"
      provides: "defineFunction for classify (timeout 29s, 512MB)"
      contains: "defineFunction"
    - path: "app/amplify/functions/classify/handler.ts"
      provides: "zod-validated wrapper around shared classify()"
      contains: "classifyInput.safeParse"
  key_links:
    - from: "classify/handler.ts"
      to: "shared/classify.ts classify()"
      via: "import"
      pattern: "from '../shared/classify'"
---

<objective>
Deploy the `classify()` Lambda: validate `{text}` with zod, delegate to the shared `classify()` labeler (keyword-first then Haiku structured output), log labels only, and return `{label, confidence, fallback}`. This is the single labeling endpoint other features reach for safety decisions.

Purpose: LAMBDA-01 + success criterion 2 (crisis/unsafe/money/address detection via Bedrock structured output). The custom-query wiring + IAM happen in plan 05.
Output: `app/amplify/functions/classify/{resource,handler}.ts` + unit test.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-ai-backend-infrastructure/02-CONTEXT.md
@.claude/skills/bridge/SKILL.md
@app/amplify/functions/shared/classify.ts
@app/amplify/functions/shared/schemas.ts
@app/amplify/functions/shared/log.ts
</context>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| AppSync (Cognito) → classify Lambda | authenticated user text arrives |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-07 | Tampering (bad input) | handler.ts | mitigate | `classifyInput.safeParse`; invalid → unsafe fallback (task 2-02-02) |
| T-02-08 | Elevation (crisis miss) | handler.ts | mitigate | delegates to keyword-first classify(); label returned to caller for crisis routing |
| T-02-09 | Info disclosure | handler.ts logging | mitigate | logTurn with labels only, no text (task 2-02-02) |
| T-02-10 | Repudiation | handler.ts | accept | reqId logged; no auth events needed at this layer |
</threat_model>

<tasks>

<task type="auto" id="2-02-01">
  <name>defineFunction for classify</name>
  <read_first>app/amplify/functions/shared/classify.ts, .planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md</read_first>
  <files>app/amplify/functions/classify/resource.ts</files>
  <action>
Create `app/amplify/functions/classify/resource.ts` (comment the why):
```ts
import { defineFunction } from '@aws-amplify/backend';
// The one safety/labeling function (code standard #4). Keyword-first + Haiku structured output.
export const classify = defineFunction({ name: 'classify', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
```
Do NOT register it in backend.ts or data/resource.ts here — that is plan 05 (shared files).
  </action>
  <acceptance_criteria>
- `grep -q "name: 'classify'" app/amplify/functions/classify/resource.ts`
- `grep -q "timeoutSeconds: 29" app/amplify/functions/classify/resource.ts`
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
  </acceptance_criteria>
  <done>classify resource exports defineFunction with 29s timeout.</done>
</task>

<task type="auto" id="2-02-02" tdd="true">
  <name>classify handler — zod validate, delegate, log labels only</name>
  <read_first>app/amplify/functions/shared/classify.ts, app/amplify/functions/shared/schemas.ts, app/amplify/functions/shared/log.ts</read_first>
  <files>app/amplify/functions/classify/handler.ts, app/amplify/functions/classify/__tests__/handler.test.ts</files>
  <behavior>
    - valid { text:"I want to die" } → { label:'crisis', confidence:1, fallback:false }
    - invalid { text:"" } → { label:'unsafe', confidence:0.5, fallback:true } (never throws)
    - log line contains labels but not the text value
  </behavior>
  <action>
```ts
import { classifyInput } from '../shared/schemas';
import { classify } from '../shared/classify';
import { FALLBACKS } from '../shared/fallback';
import { logTurn } from '../shared/log';
export const handler = async (event: { arguments: { text: string }; request?: any }) => {
  const started = Date.now();
  const parsed = classifyInput.safeParse(event.arguments);
  if (!parsed.success) return { ...FALLBACKS.classify, fallback: true }; // safer default, no throw
  const res = await classify(parsed.data.text);
  logTurn({ fn: 'classify', latencyMs: Date.now() - started, labels: [res.label], fallback: res.fallback });
  return res;
};
```
Write `__tests__/handler.test.ts` for the behavior block (mock shared classify where needed; keyword path needs no mock).
  </action>
  <acceptance_criteria>
- `grep -q "classifyInput.safeParse" app/amplify/functions/classify/handler.ts`
- `grep -q "logTurn" app/amplify/functions/classify/handler.ts`
- `! grep -q "labels: \[.*text" app/amplify/functions/classify/handler.ts` (text not logged)
- `cd app && npx vitest run amplify/functions/classify` exits 0
  </acceptance_criteria>
  <done>Handler validates, delegates to classify(), returns fallback on bad input, logs labels only; tests pass.</done>
</task>

</tasks>

<verification>
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
- `cd app && npx vitest run amplify/functions/classify` exits 0
</verification>

<success_criteria>
classify Lambda source complete and unit-tested; crisis/money/address caught by keyword, other labels via Haiku; invalid input returns safer fallback; ready for custom-query wiring in plan 05.
</success_criteria>

<output>
After completion, create `.planning/phases/02-ai-backend-infrastructure/02-02-SUMMARY.md`.
</output>
