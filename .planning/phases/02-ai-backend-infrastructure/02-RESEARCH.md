# Phase 2: AI Backend Infrastructure - Research

**Researched:** 2026-11-03
**Domain:** Amplify Gen 2 Lambdas behind AppSync custom queries, Amazon Bedrock (Claude) via the Converse API with forced-tool structured output, zod validation, DynamoDB rate limiting, scripted fallbacks, cost controls.
**Confidence:** MEDIUM — architecture/safety sequencing HIGH; all package versions, model/inference-profile ids, routed regions, and a few Gen 2 override APIs are `[ASSUMED]` (no npm/AWS/Context7 access this session). Confirm on first deploy via `npm view` and `aws bedrock list-inference-profiles --region us-east-1`.

> Provenance: distilled from the phase researcher's findings + the locked 02-CONTEXT.md decisions + the proven Phase 1 Amplify Gen 2 patterns. API shapes tagged `[ASSUMED]` must be confirmed on the first `npx ampx sandbox` run.

## Summary

Four Lambda functions — `classify`, `practice`, `tone`, `preview` — are added under `app/amplify/functions/`, each with `handler.ts` + `prompts.ts`, defined via `defineFunction` and exposed as **AppSync custom queries** (`a.query()`) that AppSync authorizes with Cognito before invoking the Lambda. A shared `converseWithTool()` helper owns the Bedrock call: `ConverseCommand` with a **forced tool** (`toolChoice`) whose `inputSchema` is a JSON Schema, a **5s AbortController** timeout, adaptive SDK retries, zod validation of the tool-use output, and a single failure path that returns a **scripted fallback** (`fallback: true`). `classify()` runs a **deterministic keyword layer first** (instant crisis/money/address catch) before any model call or rate-limit check, with a deliberately **low crisis threshold** (D-02). `practice()` runs the full turn: zod-validate input → crisis gate → rate limit → Sonnet-class model → `classify()` the output → save `PracticeRun` (no raw transcript) → typed reply. Rate limiting is an **atomic DynamoDB `UpdateItem ADD`** on `userId#hour` with TTL, 100/hr, and **crisis/safety is never limited** (D-04). IAM grants `bedrock:InvokeModel` on **exact** inference-profile + per-region foundation-model ARNs (never `*`).

**Primary recommendation:** build a single shared `bedrock.ts` helper (Converse + forced tool + timeout + fallback), reuse it in all four functions, and get a green `npx ampx sandbox` deploy with the IAM ARNs correct before wiring feature logic — the #1 failure is `AccessDenied` from a cross-region inference profile missing the routed foundation-model ARNs.

## Standard Stack

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@aws-sdk/client-bedrock-runtime` | latest (confirm `npm view`) | `ConverseCommand`, `toolConfig`, retries | Add to `app/package.json` `[ASSUMED]` |
| `@aws-amplify/backend` | installed (Phase 1) | `defineFunction`, `a.query`, `a.customType`, `secret()` | — |
| `zod` | installed (Phase 1) | validate Lambda inputs + Bedrock tool output | SKILL §1.3 |
| `aws-lambda` types | installed (Phase 1) | handler typing | — |
| `@aws-sdk/client-dynamodb` + `lib-dynamodb` | latest | atomic rate-limit counter | or use the Amplify Data client `[ASSUMED]` |

**Install:** `cd app && npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb` (confirm exact names/versions).

## Architecture Patterns

### Pattern 1 — defineFunction + custom query wiring
```ts
// app/amplify/functions/practice/resource.ts  [ASSUMED]
import { defineFunction } from '@aws-amplify/backend';
export const practice = defineFunction({
  name: 'practice',
  entry: './handler.ts',
  timeoutSeconds: 29,              // > the 5s model budget, < AppSync 30s
  memoryMB: 512,
  // reserved concurrency set in backend.ts (cost control)
});
```
```ts
// app/amplify/data/resource.ts (add to the existing schema)  [ASSUMED]
import { practice } from '../functions/practice/resource';
// ...inside a.schema({ ...models,
  PracticeReply: a.customType({
    strength: a.string(),
    tip: a.string(),
    fallback: a.boolean().required(),
  }),
  practiceTurn: a
    .query()
    .arguments({ scenarioId: a.string().required(), level: a.integer().required(),
                 goal: a.string().required(), message: a.string().required() })
    .returns(a.ref('PracticeReply'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(practice)),
// })
```
Grant a function the Data client for `PracticeRun` writes via `allow.resource(practice)` on the model, and read the client from `$amplify/env/practice` generated env. Every reply customType has `fallback: boolean`.

### Pattern 2 — shared Bedrock Converse helper (forced tool + timeout + fallback)
```ts
// app/amplify/functions/shared/bedrock.ts  [ASSUMED Converse/tool shapes]
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import type { ZodSchema } from 'zod';
const client = new BedrockRuntimeClient({ maxAttempts: 3 }); // adaptive retries; region from env (us-east-1)

export async function converseWithTool<T>(opts: {
  modelId: string; system: string; userText: string;
  toolName: string; inputSchema: object; schema: ZodSchema<T>; maxTokens?: number;
}): Promise<{ value: T } | { fallback: true }> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 5000);          // D-03 hard 5s budget
  try {
    const res = await client.send(new ConverseCommand({
      modelId: opts.modelId,
      system: [{ text: opts.system }],
      messages: [{ role: 'user', content: [{ text: opts.userText }] }],
      inferenceConfig: { maxTokens: opts.maxTokens ?? 500, temperature: 0.2 },
      toolConfig: {
        tools: [{ toolSpec: { name: opts.toolName, inputSchema: { json: opts.inputSchema } } }],
        toolChoice: { tool: { name: opts.toolName } },       // FORCE structured output
      },
    }), { abortSignal: ctl.signal });
    const block = res.output?.message?.content?.find((c) => 'toolUse' in c) as { toolUse?: { input: unknown } } | undefined;
    const parsed = opts.schema.safeParse(block?.toolUse?.input);
    return parsed.success ? { value: parsed.data } : { fallback: true };
  } catch {
    return { fallback: true };                                 // throttle/timeout → fallback
  } finally { clearTimeout(timer); }
}
```

### Pattern 3 — classify() keyword-first, crisis over-flag (D-02)
```ts
// Deterministic layer runs BEFORE model + BEFORE rate limit; crisis keywords alone trigger crisis.
const CRISIS = [/\bkill myself\b/i, /\bend it\b/i, /\bhurt myself\b/i, /\bsuicide\b/i /* ... */];
const MONEY  = [/\bvenmo\b/i, /\bcash app\b/i, /\bsend .*money\b/i /* ... */];
const ADDRESS= [/\bwhere do you live\b/i, /\byour address\b/i, /\bmeet .*alone\b/i /* ... */];
export function keywordLabel(text: string): { label: string; confidence: number } | null {
  if (CRISIS.some((r) => r.test(text))) return { label: 'crisis', confidence: 1 };
  if (MONEY.some((r) => r.test(text)))  return { label: 'money',   confidence: 0.9 };
  if (ADDRESS.some((r)=> r.test(text))) return { label: 'address', confidence: 0.9 };
  return null;
}
// classify(): keywordLabel() first → if crisis, return immediately (never rate-limited); else
// Haiku-class Converse toolConfig returning {label, confidence}; bias threshold LOW for crisis;
// on fallback, lean to the SAFER label ('unsafe') rather than 'safe'.
```

### Pattern 4 — practice() full turn
validate(zod) → `keywordLabel`/`classify` the input (crisis gate: stop role-play, return 988 + trusted-person reply) → rate-limit check → `converseWithTool` with the Sonnet-class model and the `prompts.ts` system prompt (SKILL §2.7 guardrails, judge ONLY the user's `goal`) → `classify` the output → save `PracticeRun {scenarioId, level, feedback, hintsUsed}` (NO raw transcript, SKILL §2.8) → return `PracticeReply`.

### Pattern 5 — IAM (backend.ts), exact ARNs
```ts
// app/amplify/backend.ts  [ASSUMED ARN shapes — confirm with list-inference-profiles]
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
for (const fn of [backend.classify, backend.practice, backend.tone, backend.preview]) {
  fn.resources.lambda.addToRolePolicy(new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      'arn:aws:bedrock:us-east-1:<acct>:inference-profile/us.anthropic...',   // the profile
      'arn:aws:bedrock:us-east-1::foundation-model/anthropic...',             // routed region(s)
      'arn:aws:bedrock:us-east-2::foundation-model/anthropic...',
      'arn:aws:bedrock:us-west-2::foundation-model/anthropic...',
    ],
  }));
}
// reserved concurrency (cost): fn.resources.cfnResources.cfnFunction.reservedConcurrentExecutions = 5;
```

### Pattern 6 — per-user rate limit (D-04)
Atomic `UpdateItem` with `ADD #c :one`, key `userId#<epochHour>`, TTL ~2h; if returned count > 100 return the gentle Mo message. **Skip the whole limiter when the input is crisis** (AI-08 / D-04). A dedicated `RateLimit` model or a raw DynamoDB table — either works; raw table avoids owner-auth overhead.

### Anti-patterns
- `resources: ['*']` in the Bedrock policy (SKILL §1.4). Use exact ARNs.
- Logging message content / model transcripts (SKILL §2.8). Log reqId/scenario/level/latency/labels/fallback only.
- Calling the model for labels outside `classify()` (SKILL §3.4).
- Prompts inline instead of `prompts.ts` named constants (SKILL §3.5, Part 4 logging).
- Rate-limiting or blocking the crisis path.

## Common Pitfalls
1. **Cross-region inference profile `AccessDenied`** — the profile ARN alone is not enough; IAM must also allow the foundation-model ARN in EVERY region the `us.` profile routes to. #1 deploy failure. `[ASSUMED]` region list — confirm.
2. **Forced tool not honored** — must set `toolChoice: { tool: { name } }`; without it the model may return prose. Validate with zod and fall back if the tool block is missing.
3. **Model vs inference-profile id** — Anthropic on Bedrock generally requires the cross-region **inference profile** id (e.g. `us.anthropic.claude-...`), not the bare model id, for `ConverseCommand`. Resolve via `aws bedrock list-inference-profiles`. `[ASSUMED]`
4. **One-time model access** — enable Anthropic models in the Bedrock console (us-east-1) before any call (INFRA-02); may need a use-case form.
5. **Timeout budget** — AbortController at 5s, Lambda timeout ~29s (< AppSync 30s). SDK `maxAttempts` retries must fit inside the abort.
6. **Quota** — default Bedrock RPM is low; BEDROCK-02 (500 RPM) is an AWS Support request — external, start early.

## Validation Architecture

### Test framework
| Property | Value |
|----------|-------|
| Framework | Vitest (installed Phase 1) |
| Quick | `cd app && npx tsc --noEmit -p amplify/tsconfig.json` |
| Unit | `cd app && npx vitest run` (keyword layer, zod schemas, fallback shape — pure, no AWS) |
| Integration | `npx tsx scripts/verify-phase2.ts` against the deployed sandbox (real Bedrock, signed-in user) |

### Requirement → test map
| Req | Behavior | Test |
|-----|----------|------|
| LAMBDA-01 classify | crisis/unsafe/money/address labels | unit: keywordLabel crisis-catch; integration: classify() on sample texts |
| LAMBDA-02 practice | strength+tip for 7×3 | integration: practiceTurn as signed-in user returns both fields |
| LAMBDA-03 tone / LAMBDA-04 preview | deployed + callable | integration: query returns typed reply (feature wiring Phase 7) |
| LAMBDA-05 IAM | exact Bedrock ARNs | review backend.ts; sandbox deploy has no AccessDenied |
| LAMBDA-06 zod | input validation | unit: invalid args rejected |
| LAMBDA-07 fallback | >5s → fallback:true | unit: forced timeout path returns {fallback:true}; integration: simulate |
| LAMBDA-08 rate limit | 100/hr; crisis exempt | integration: 101st call gentle message; crisis still answered |
| BEDROCK-01 model | Claude reachable us-east-1 | integration: a real Converse call succeeds |
| BEDROCK-03 structured | forced tool JSON | unit: zod parse of tool input; integration: real structured reply |
| BEDROCK-04 maxTokens | ≤500 | review inferenceConfig; log tokens |
| BEDROCK-05 zod validate | validated before return | unit |
| AI-01/02/03 | 7 scenarios × 3 levels, strength+tip judged vs goal | integration across scenario matrix |
| AI-07 fallback | scripted replies | unit/integration |
| AI-08 loading/latency | returns promptly; limit UX | integration |

### Wave 0 gaps
- [ ] `npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb`
- [ ] `app/amplify/functions/shared/bedrock.ts` + unit tests (fallback + tool-parse, pure)
- [ ] keyword-layer unit tests (crisis catch is a safety gate — non-negotiable)
- [ ] `app/scripts/verify-phase2.ts` integration harness (signed-in user, real Bedrock, made-up data)
- [ ] confirm model/inference-profile ids + routed regions after Bedrock enablement

## Assumptions Log
| # | Claim | Risk if wrong |
|---|-------|---------------|
| A1 | `@aws-sdk/client-bedrock-runtime` ConverseCommand + toolConfig shapes | high — won't compile/call; confirm on deploy |
| A2 | Anthropic needs the `us.` inference-profile id, not bare model id | high — AccessDenied/ValidationException |
| A3 | Cross-region profile routes us-east-1/us-east-2/us-west-2 | med — AccessDenied; confirm routed regions |
| A4 | `a.handler.function` + custom query auth shapes (per Phase 1 schema API) | med — surfaced by deploy |
| A5 | reservedConcurrentExecutions override path | low |
| A6 | DynamoDB atomic ADD for the counter | low — standard |
| A7 | 5s AbortController fits inside Lambda timeout + retries | med — tune |
| A8 | exact npm package names/versions | med — `npm view` |
| A9 | model-access + use-case form required | low — console step |
| A10 | tone/preview deploy now, wire Phase 7 | low — scope note |
| A11 | Budget (Phase 1) covers Bedrock spend already | low |
| A12 | `secret()` not needed this phase (IAM role, no API keys) | low |

## RESEARCH COMPLETE
**Phase:** 2 — AI Backend Infrastructure
**Confidence:** MEDIUM (safety/arch HIGH; versions + model ids [ASSUMED], confirm on first deploy)
**Ready for planning:** Yes — all 18 requirement IDs addressable; the first deploy must confirm A1–A4 (SDK/Converse shapes, inference-profile id, routed-region ARNs).
