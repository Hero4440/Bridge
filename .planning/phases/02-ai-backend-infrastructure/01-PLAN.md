---
plan: 01
title: Shared Bedrock foundation — deps, config, converse helper, keyword+classify core, fallback, rate-limit
wave: 1
depends_on: []
autonomous: true
files_modified:
  - app/package.json
  - app/amplify/shared/config.ts
  - app/amplify/functions/shared/schemas.ts
  - app/amplify/functions/shared/bedrock.ts
  - app/amplify/functions/shared/keywords.ts
  - app/amplify/functions/shared/classify.ts
  - app/amplify/functions/shared/classify-prompts.ts
  - app/amplify/functions/shared/fallback.ts
  - app/amplify/functions/shared/rateLimit.ts
  - app/amplify/functions/shared/log.ts
  - app/amplify/functions/shared/__tests__/classify.test.ts
  - app/amplify/functions/shared/__tests__/fallback.test.ts
  - AI_PROMPTS/<YourName>.md
requirements: [BEDROCK-03, BEDROCK-04, BEDROCK-05, LAMBDA-06, LAMBDA-07, LAMBDA-08, AI-07]
must_haves:
  truths:
    - "Every Bedrock call goes through one helper that caps maxTokens at 500 and aborts after 5s"
    - "Crisis/money/address text is caught deterministically by keywords before any model call"
    - "classify() is the single labeling function; on model failure it leans to the safer 'unsafe' label"
    - "A timeout or throttle returns a short warm scripted fallback, never a raw error"
  artifacts:
    - path: "app/amplify/functions/shared/bedrock.ts"
      provides: "converseWithTool() — Converse API, forced tool, maxTokens<=500, 5s AbortController, zod-validated output"
      contains: "toolChoice"
    - path: "app/amplify/functions/shared/classify.ts"
      provides: "the ONE classify(text) — keyword-first then Haiku structured output"
      contains: "keywordLabel"
    - path: "app/amplify/functions/shared/keywords.ts"
      provides: "CRISIS/MONEY/ADDRESS regex + keywordLabel() returning crisis confidence 1 immediately"
      contains: "crisis"
    - path: "app/amplify/functions/shared/rateLimit.ts"
      provides: "atomic DynamoDB UpdateItem ADD counter, 100/hr, TTL, gentle message"
      contains: "ADD #c :one"
    - path: "app/amplify/shared/config.ts"
      provides: "REGION + CLASSIFY_MODEL_ID + PRACTICE_MODEL_ID (D-01)"
      contains: "PRACTICE_MODEL_ID"
  key_links:
    - from: "shared/classify.ts"
      to: "shared/bedrock.ts converseWithTool"
      via: "import after keywordLabel returns null"
      pattern: "converseWithTool"
---

<objective>
Create the shared Bedrock/safety foundation every Phase-2 Lambda depends on: SDK deps, model-id config, the single `converseWithTool()` helper (Converse API + forced tool + 500-token cap + 5s abort + zod validation), the keyword safety layer, the ONE `classify()` labeler, feature fallbacks, the rate-limit counter, and structured logging — all unit-tested.

Purpose: Later Lambdas (classify, practice, tone, preview) wire together tested primitives instead of re-implementing Bedrock plumbing. Satisfies D-02 (keyword-first, safer-on-fallback), D-03 (fallback helper), D-04 (rate limit), and locked Converse/toolConfig/zod/maxTokens rules.
Output: `app/amplify/functions/shared/*` + `app/amplify/shared/config.ts`, deps installed, vitest units green.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-ai-backend-infrastructure/02-CONTEXT.md
@.planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md
@.claude/skills/bridge/SKILL.md
@app/amplify/data/resource.ts

<interfaces>
<!-- Contracts this plan CREATES for Wave 2 consumers. Executors in plans 02-04 import these directly. -->
converseWithTool<T>({ modelId, system, message, toolName, inputSchema, validator, maxTokens? }): Promise<{ ok: true; value: T } | { ok: false }>
keywordLabel(text): { label: 'crisis'|'money'|'address'; confidence: 1 } | null
classify(text): Promise<{ label: string; confidence: number; fallback: boolean }>
checkRateLimit(userId): Promise<{ allowed: boolean; count: number }>  // + RATE_LIMIT_MESSAGE
logTurn({ reqId?, fn, scenario?, level?, latencyMs, labels, fallback })  // NO message content
schemas: practiceInput/Output, classifyInput/Output, toneInput/Output, previewInput/Output, SCENARIOS
FALLBACKS: { practice, tone, preview, classify }
config: REGION, CLASSIFY_MODEL_ID, PRACTICE_MODEL_ID
</interfaces>
</context>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| user message → Lambda | untrusted free text enters every AI function |
| Lambda → Bedrock | prompt + user text leave to the model |
| Lambda → CloudWatch | log line could leak content |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-01 | Tampering/Info | converseWithTool output | mitigate | forced tool (`toolChoice`) + zod `safeParse` before returning (task 2-01-02) |
| T-02-02 | DoS (cost) | bedrock.ts | mitigate | `maxTokens: Math.min(x,500)`, temperature 0.2, 5s AbortController (task 2-01-02) |
| T-02-03 | Elevation (crisis bypass) | keywords.ts | mitigate | keyword layer returns crisis conf 1 BEFORE model; unit test asserts catch (task 2-01-02) |
| T-02-04 | Info disclosure (PII in logs) | log.ts | mitigate | logTurn accepts only reqId/fn/scenario/level/latency/labels/fallback; no text field (task 2-01-03) |
| T-02-05 | Info (unsafe default) | classify.ts fallback | mitigate | on model failure return FALLBACKS.classify label `unsafe` conf 0.5 (D-02, task 2-01-02) |
| T-02-06 | DoS (per-user flood) | rateLimit.ts | mitigate | atomic ADD counter 100/hr + TTL (task 2-01-03) |
</threat_model>

<tasks>

<task type="auto" id="2-01-01">
  <name>Install SDK deps + create config and zod schemas</name>
  <read_first>app/package.json, app/amplify/data/resource.ts, .planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md, .claude/skills/bridge/SKILL.md</read_first>
  <files>app/package.json, app/amplify/shared/config.ts, app/amplify/functions/shared/schemas.ts</files>
  <action>
From `app/`, install runtime deps: `npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb` (zod is already present from Phase 1 — confirm with `grep '"zod"' app/package.json`; install if absent).

Create `app/amplify/shared/config.ts` (comment the why — single source for region + model ids, filled after Bedrock enablement per D-01):
```ts
export const REGION = 'us-east-1';
// Cross-region inference-profile ids — use the `us.` prefix, NOT the bare model id (research pitfall).
// Finalized in plan 05 after `aws bedrock list-inference-profiles`. Env override lets deploy inject them.
export const CLASSIFY_MODEL_ID = process.env.CLASSIFY_MODEL_ID ?? 'us.anthropic.claude-3-5-haiku-20241022-v1:0';
export const PRACTICE_MODEL_ID = process.env.PRACTICE_MODEL_ID ?? 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
```

Create `app/amplify/functions/shared/schemas.ts` with zod input + Bedrock-output schemas (LAMBDA-06, BEDROCK-05):
```ts
import { z } from 'zod';
export const SCENARIOS = ['join','left-on-read','cancel','leave','repair','invite','disagree'] as const;
export const practiceInput = z.object({ scenarioId: z.enum(SCENARIOS), level: z.number().int().min(1).max(3), goal: z.string().min(1).max(300), message: z.string().min(1).max(1000) });
export const practiceOutput = z.object({ partnerReply: z.string().min(1), strength: z.string().min(1), tip: z.string().min(1) });
export const classifyInput = z.object({ text: z.string().min(1).max(2000) });
export const classifyOutput = z.object({ label: z.enum(['crisis','money','address','unsafe','bias','safe']), confidence: z.number().min(0).max(1) });
export const toneInput = z.object({ text: z.string().min(1).max(1000) });
export const toneOutput = z.object({ gentle: z.string().min(1), flaggedWords: z.array(z.string()) });
export const previewInput = z.object({ context: z.string().min(1).max(1000) });
export const previewOutput = z.object({ suggestions: z.array(z.string().min(1)).min(1).max(3) });
```
  </action>
  <acceptance_criteria>
- `grep -q '@aws-sdk/client-bedrock-runtime' app/package.json` and `grep -q '@aws-sdk/lib-dynamodb' app/package.json`
- `grep -q 'PRACTICE_MODEL_ID' app/amplify/shared/config.ts` and `grep -q "us\\." app/amplify/shared/config.ts`
- `grep -q "scenarioId: z.enum(SCENARIOS)" app/amplify/functions/shared/schemas.ts`
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
  </acceptance_criteria>
  <done>Deps installed; config.ts exports REGION + both model ids; schemas.ts exports all 8 input/output schemas + SCENARIOS; typecheck passes.</done>
</task>

<task type="auto" id="2-01-02" tdd="true">
  <name>Bedrock converse helper + keyword layer + the one classify() + crisis unit test</name>
  <read_first>app/amplify/functions/shared/schemas.ts, app/amplify/shared/config.ts, .planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md, .claude/skills/bridge/SKILL.md</read_first>
  <files>app/amplify/functions/shared/bedrock.ts, app/amplify/functions/shared/keywords.ts, app/amplify/functions/shared/classify.ts, app/amplify/functions/shared/classify-prompts.ts, app/amplify/functions/shared/__tests__/classify.test.ts, AI_PROMPTS/&lt;YourName&gt;.md</files>
  <behavior>
    - keywordLabel("I want to kill myself") → { label:'crisis', confidence:1 } (no model call)
    - keywordLabel("send me money on venmo") → { label:'money', confidence:1 }
    - keywordLabel("what's your address") → { label:'address', confidence:1 }
    - keywordLabel("hey want to join the chat") → null
    - classify() when converseWithTool resolves {ok:false} → { label:'unsafe', confidence:0.5, fallback:true } (safer default, D-02)
  </behavior>
  <action>
Create `app/amplify/functions/shared/bedrock.ts` — converseWithTool (Converse API, forced tool, 500 cap, 5s abort, zod validate):
```ts
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import type { ZodSchema } from 'zod';
import { REGION } from '../../shared/config';
const client = new BedrockRuntimeClient({ region: REGION });
export type ToolResult<T> = { ok: true; value: T } | { ok: false };
export async function converseWithTool<T>(o: { modelId: string; system: string; message: string; toolName: string; inputSchema: Record<string, unknown>; validator: ZodSchema<T>; maxTokens?: number; }): Promise<ToolResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000); // D-03: 5s inside the 29s Lambda
  try {
    const out = await client.send(new ConverseCommand({
      modelId: o.modelId,
      system: [{ text: o.system }],
      messages: [{ role: 'user', content: [{ text: o.message }] }],
      inferenceConfig: { maxTokens: Math.min(o.maxTokens ?? 500, 500), temperature: 0.2 }, // BEDROCK-04
      toolConfig: { tools: [{ toolSpec: { name: o.toolName, inputSchema: { json: o.inputSchema } } }], toolChoice: { tool: { name: o.toolName } } }, // BEDROCK-03 forced tool
    }, { abortSignal: controller.signal }));
    const block = out.output?.message?.content?.find((c) => 'toolUse' in c) as any;
    const parsed = o.validator.safeParse(block?.toolUse?.input); // BEDROCK-05
    return parsed.success ? { ok: true, value: parsed.data } : { ok: false };
  } catch { return { ok: false }; } finally { clearTimeout(timer); }
}
```

Create `app/amplify/functions/shared/keywords.ts` (deterministic crisis/money/address — runs BEFORE any model, D-02):
```ts
export type SafetyLabel = 'crisis' | 'money' | 'address';
const CRISIS = /\b(kill myself|suicid|end my life|want to die|hurt myself|self[-\s]?harm|no reason to live)\b/i;
const MONEY = /\b(send (me )?money|venmo|cash\s?app|paypal|zelle|gift card|wire (me )?money|\$\d+)\b/i;
const ADDRESS = /(\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|blvd|lane|ln|drive|dr)\b|what('?s| is) your address|where do you live)/i;
export function keywordLabel(text: string): { label: SafetyLabel; confidence: 1 } | null {
  if (CRISIS.test(text)) return { label: 'crisis', confidence: 1 };
  if (MONEY.test(text)) return { label: 'money', confidence: 1 };
  if (ADDRESS.test(text)) return { label: 'address', confidence: 1 };
  return null;
}
```

Create `app/amplify/functions/shared/classify-prompts.ts` (§2.7 guardrails; this is the classifier persona — log it in AI_PROMPTS):
```ts
export const CLASSIFY_SYSTEM = `You are a safety classifier for a support app for neurodivergent young adults. Label the user text with the 'classify' tool only.
Labels: crisis (self-harm/suicide), money (asks for money/payment), address (asks for/shares a home address), bias (hateful/discriminatory), unsafe (other harmful/abusive), safe.
Err toward flagging: if unsure between safe and a risk label, pick the risk label. Give confidence 0..1. Do not explain. No medical/legal/financial judgements.`;
export const CLASSIFY_TOOL_SCHEMA = { type: 'object', properties: { label: { type: 'string', enum: ['crisis','money','address','unsafe','bias','safe'] }, confidence: { type: 'number' } }, required: ['label','confidence'] } as const;
```

Create `app/amplify/functions/shared/classify.ts` — THE single labeler (code standard #4):
```ts
import { keywordLabel } from './keywords';
import { converseWithTool } from './bedrock';
import { classifyOutput } from './schemas';
import { FALLBACKS } from './fallback';
import { CLASSIFY_MODEL_ID } from '../../shared/config';
import { CLASSIFY_SYSTEM, CLASSIFY_TOOL_SCHEMA } from './classify-prompts';
export type ClassifyResult = { label: string; confidence: number; fallback: boolean };
export async function classify(text: string): Promise<ClassifyResult> {
  const kw = keywordLabel(text);
  if (kw) return { ...kw, fallback: false }; // immediate, deterministic
  const res = await converseWithTool({ modelId: CLASSIFY_MODEL_ID, system: CLASSIFY_SYSTEM, message: text, toolName: 'classify', inputSchema: CLASSIFY_TOOL_SCHEMA as any, validator: classifyOutput });
  return res.ok ? { ...res.value, fallback: false } : { ...FALLBACKS.classify, fallback: true }; // D-02 safer default
}
```
(Note: `./fallback` is created in task 2-01-03; this import resolves once that task lands — both tasks are in this plan.)

Write `app/amplify/functions/shared/__tests__/classify.test.ts` covering the behavior block above (mock converseWithTool to assert the safer fallback). Append a log entry for CLASSIFY_SYSTEM to `AI_PROMPTS/<YourName>.md` using the Part 4 template (ID, Purpose, Type=classifier, Model=Haiku, Used in path, guardrails §2.7, date).
  </action>
  <acceptance_criteria>
- `grep -q "toolChoice" app/amplify/functions/shared/bedrock.ts`
- `grep -q "Math.min(o.maxTokens ?? 500, 500)" app/amplify/functions/shared/bedrock.ts`
- `grep -q "setTimeout(() => controller.abort(), 5000)" app/amplify/functions/shared/bedrock.ts`
- `grep -q "label: 'crisis', confidence: 1" app/amplify/functions/shared/keywords.ts`
- `grep -q "CLASSIFY_SYSTEM" app/amplify/functions/shared/classify.ts`
- `cd app && npx vitest run amplify/functions/shared/__tests__/classify.test.ts` exits 0 (crisis-catch test present and passing)
- `grep -q "classifier" AI_PROMPTS/`*`.md`
  </acceptance_criteria>
  <done>bedrock/keywords/classify/classify-prompts exist; crisis keyword test passes; classify leans 'unsafe' on model failure; classify prompt logged.</done>
</task>

<task type="auto" id="2-01-03" tdd="true">
  <name>Feature fallbacks, rate-limit counter, structured log + fallback unit test</name>
  <read_first>app/amplify/functions/shared/schemas.ts, app/amplify/shared/config.ts, .planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md</read_first>
  <files>app/amplify/functions/shared/fallback.ts, app/amplify/functions/shared/rateLimit.ts, app/amplify/functions/shared/log.ts, app/amplify/functions/shared/__tests__/fallback.test.ts</files>
  <behavior>
    - FALLBACKS.practice has non-empty strength, tip, partnerReply strings
    - FALLBACKS.classify === { label:'unsafe', confidence:0.5 }
    - checkRateLimit with no RATE_LIMIT_TABLE env → { allowed:true, count:0 } (fail-open locally)
    - logTurn output JSON has no 'message'/'text' key
  </behavior>
  <action>
Create `app/amplify/functions/shared/fallback.ts` (short warm scripted replies, D-03 / AI-07):
```ts
export const FALLBACKS = {
  practice: { partnerReply: "Thanks for telling me.", strength: "You showed up and gave it a try — that matters.", tip: "When you're ready, try one short sentence about how you feel." },
  tone: { gentle: "Here's a softer way: try leading with how you feel.", flaggedWords: [] as string[] },
  preview: { suggestions: ["Hi! Mind if I join?", "Hey, this looks fun — can I say hi?"] },
  classify: { label: 'unsafe' as const, confidence: 0.5 },
} as const;
```

Create `app/amplify/functions/shared/rateLimit.ts` (atomic counter, D-04 — crisis callers simply skip this):
```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { REGION } from '../../shared/config';
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const LIMIT = 100;
export const RATE_LIMIT_MESSAGE = "Mo needs a short break — you've done a lot this hour. Try again in a little while. 💛";
export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const table = process.env.RATE_LIMIT_TABLE;
  if (!table) return { allowed: true, count: 0 }; // fail-open when table not wired (local/tests)
  const hour = Math.floor(Date.now() / 3_600_000);
  const res = await doc.send(new UpdateCommand({
    TableName: table, Key: { pk: `${userId}#${hour}` },
    UpdateExpression: 'ADD #c :one SET #t = :ttl',
    ExpressionAttributeNames: { '#c': 'count', '#t': 'ttl' },
    ExpressionAttributeValues: { ':one': 1, ':ttl': (hour + 2) * 3600 },
    ReturnValues: 'ALL_NEW',
  }));
  const count = Number(res.Attributes?.count ?? 0);
  return { allowed: count <= LIMIT, count };
}
```

Create `app/amplify/functions/shared/log.ts` (privacy §2.8 — no content):
```ts
export function logTurn(f: { reqId?: string; fn: string; scenario?: string; level?: number; latencyMs: number; labels: string[]; fallback: boolean }) {
  console.log(JSON.stringify(f)); // reqId/fn/scenario/level/latency/labels/fallback ONLY — never message text
}
```

Write `app/amplify/functions/shared/__tests__/fallback.test.ts` for the behavior block.
  </action>
  <acceptance_criteria>
- `grep -q "ADD #c :one" app/amplify/functions/shared/rateLimit.ts`
- `grep -q "const LIMIT = 100" app/amplify/functions/shared/rateLimit.ts`
- `grep -q "label: 'unsafe' as const, confidence: 0.5" app/amplify/functions/shared/fallback.ts`
- `! grep -Eq "text|message|content" app/amplify/functions/shared/log.ts` (log carries no content field)
- `cd app && npx vitest run amplify/functions/shared/__tests__/fallback.test.ts` exits 0
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
  </acceptance_criteria>
  <done>fallback/rateLimit/log exist; fallback test passes; rate limit fails open without table; log emits no content; typecheck passes.</done>
</task>

</tasks>

<verification>
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
- `cd app && npx vitest run amplify/functions/shared` exits 0 (crisis-catch + fallback tests green)
- `grep -rq "'\\*'" app/amplify/functions/shared` returns nothing (no wildcards introduced here)
</verification>

<success_criteria>
Shared helpers compile and are unit-tested; converseWithTool enforces 500-token cap + 5s abort + forced tool + zod; keyword crisis catch proven by test; classify leans safer on failure; rate-limit counter + fallbacks ready for Wave 2 import.
</success_criteria>

<output>
After completion, create `.planning/phases/02-ai-backend-infrastructure/02-01-SUMMARY.md`.
</output>
