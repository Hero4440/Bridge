---
plan: 05
title: Bedrock enablement, custom queries + IAM (exact ARNs), rate-limit table, deploy + integration verify
wave: 3
depends_on: [02, 03, 04]
autonomous: false
files_modified:
  - app/amplify/shared/config.ts
  - app/amplify/data/resource.ts
  - app/amplify/backend.ts
  - app/scripts/verify-phase2.ts
requirements: [LAMBDA-05, LAMBDA-08, BEDROCK-01, BEDROCK-02, AI-08]
must_haves:
  truths:
    - "The four AI Lambdas are reachable as allow.authenticated() custom queries behind AppSync/Cognito"
    - "Each Lambda's IAM grants bedrock:InvokeModel on exact inference-profile + foundation-model ARNs, never '*'"
    - "A DynamoDB rate-limit table with TTL is provisioned and bound to the three rate-limited functions"
    - "The sandbox deploys and verify-phase2.ts proves 7×3 strength+tip, crisis catch, forced-timeout fallback, and 101st-call rate limit while crisis still answers"
  artifacts:
    - path: "app/amplify/data/resource.ts"
      provides: "PracticeReply/ClassifyReply/ToneReply/PreviewReply customTypes + 4 custom queries + allow.resource(practice) for PracticeRun"
      contains: "practiceTurn"
    - path: "app/amplify/backend.ts"
      provides: "function registration, exact-ARN Bedrock IAM, reserved concurrency, rate-limit table + grants + env"
      contains: "bedrock:InvokeModel"
    - path: "app/scripts/verify-phase2.ts"
      provides: "signed-in integration run of all five success criteria"
      contains: "verify-phase2"
  key_links:
    - from: "app/amplify/data/resource.ts custom queries"
      to: "functions/*/resource.ts handlers"
      via: "a.handler.function(fn)"
      pattern: "a.handler.function"
    - from: "app/amplify/backend.ts IAM"
      to: "inference-profile + foundation-model ARNs"
      via: "addToRolePolicy PolicyStatement"
      pattern: "bedrock:InvokeModel"
---

<objective>
Finalize Phase 2: enable Bedrock model access + resolve the real inference-profile ids (D-01), wire all four Lambdas as `allow.authenticated()` custom queries with reply customTypes and `allow.resource(practice)` for PracticeRun, grant each function `bedrock:InvokeModel` on EXACT inference-profile + per-routed-region foundation-model ARNs (never `*`), provision the DynamoDB rate-limit table with TTL + env binding + reserved concurrency, deploy to the sandbox, and run the integration script against the live sandbox as a signed-in user.

Purpose: LAMBDA-05, LAMBDA-08 (table), BEDROCK-01 (model accessible), BEDROCK-02 (500 RPM quota — external human request), AI-08, and end-to-end proof of all 5 success criteria.
Output: wired data/backend, verify-phase2.ts, deployed sandbox, green integration run.

NOT autonomous: requires a human to enable Bedrock model access in the console (one-time, BEDROCK-01/INFRA-02 residual), read `aws bedrock list-inference-profiles`, submit the 500 RPM AWS Support request (BEDROCK-02), and confirm the live run.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-ai-backend-infrastructure/02-CONTEXT.md
@.planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md
@.claude/skills/bridge/SKILL.md
@app/amplify/data/resource.ts
@app/amplify/backend.ts
@app/amplify/functions/classify/resource.ts
@app/amplify/functions/practice/resource.ts
@app/amplify/functions/tone/resource.ts
@app/amplify/functions/preview/resource.ts
</context>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| Cognito → AppSync custom query | only authenticated users may invoke AI |
| Lambda IAM role → Bedrock | least-privilege model invocation |
| Lambda → rate-limit table | atomic counter writes |
| account → Bedrock spend | $50 budget guard |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-20 | Elevation (over-privilege) | backend.ts IAM | mitigate | PolicyStatement resources = exact inference-profile ARN + each routed-region foundation-model ARN; assert no `'*'` (task 2-05-02) |
| T-02-21 | Spoofing (unauth access) | data/resource.ts | mitigate | every custom query `allow.authenticated()`; AppSync authorizes via Cognito first (task 2-05-01) |
| T-02-22 | DoS (cost) | backend.ts | mitigate | reservedConcurrentExecutions on AI fns + rate-limit table + existing $50 budget (task 2-05-02) |
| T-02-23 | Info disclosure (profile routing) | IAM | mitigate | cross-region profile needs foundation-model ARNs in every routed region or AccessDenied (research pitfall #1) (task 2-05-02) |
| T-02-24 | Repudiation | CloudWatch | accept | per-turn logs carry reqId/labels; content excluded by design |
</threat_model>

<tasks>

<task type="checkpoint:human-action" id="2-05-01" gate="blocking">
  <name>Enable Bedrock model access, resolve inference-profile ids, request 500 RPM</name>
  <read_first>app/amplify/shared/config.ts, .claude/skills/bridge/SKILL.md, .planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md</read_first>
  <what-built>Phase-1 account is deployed; model access + quota are console/support actions no CLI can self-serve.</what-built>
  <how-to-verify>
1. `aws sts get-caller-identity` — confirm the correct Bridge account + us-east-1 (SSO: `aws sso login` first).
2. In the Bedrock console (us-east-1) enable model access for the Haiku-class and Sonnet-class Anthropic models (submit the one-time Anthropic use-case form if prompted). This closes BEDROCK-01 / INFRA-02.
3. Run `aws bedrock list-inference-profiles --region us-east-1` and copy the `us.`-prefixed inference-profile ids for the chosen Haiku and Sonnet models. Note every region each profile routes to (for the foundation-model ARNs in task 2-05-02).
4. Edit `app/amplify/shared/config.ts`: set `CLASSIFY_MODEL_ID` (Haiku profile) and `PRACTICE_MODEL_ID` (Sonnet profile) to the real `us.` ids.
5. Submit an AWS Support quota-increase request to raise Bedrock InvokeModel to 500 RPM for the chosen models (BEDROCK-02) — record the case id in the SUMMARY. Pending approval is acceptable for the deploy; note it as pending.
  </how-to-verify>
  <acceptance_criteria>
- `grep -q "us\\." app/amplify/shared/config.ts` with real profile ids (not the placeholder comment)
- `aws bedrock list-inference-profiles --region us-east-1` lists the two chosen profiles
- SUMMARY records the BEDROCK-02 support case id (or "pending")
  </acceptance_criteria>
  <resume-signal>Type "model access enabled, ids set, 500 RPM case &lt;id|pending&gt;" to continue.</resume-signal>
</task>

<task type="auto" id="2-05-02">
  <name>Wire custom queries + reply types, exact-ARN Bedrock IAM, rate-limit table, reserved concurrency</name>
  <read_first>app/amplify/data/resource.ts, app/amplify/backend.ts, app/amplify/functions/*/resource.ts, app/amplify/functions/shared/rateLimit.ts, .planning/phases/02-ai-backend-infrastructure/02-RESEARCH.md</read_first>
  <files>app/amplify/data/resource.ts, app/amplify/backend.ts</files>
  <action>
In `app/amplify/data/resource.ts`: define reply customTypes and the four custom queries, and grant practice write access to PracticeRun.
```ts
// Reply types (each has fallback:boolean):
PracticeReply: a.customType({ partnerReply: a.string(), strength: a.string(), tip: a.string(), fallback: a.boolean(), crisis: a.boolean() }),
ClassifyReply: a.customType({ label: a.string(), confidence: a.float(), fallback: a.boolean() }),
ToneReply: a.customType({ gentle: a.string(), flaggedWords: a.string().array(), fallback: a.boolean() }),
PreviewReply: a.customType({ suggestions: a.string().array(), fallback: a.boolean() }),
// Custom queries (AppSync authorizes via Cognito first):
practiceTurn: a.query().arguments({ scenarioId: a.string().required(), level: a.integer().required(), goal: a.string().required(), message: a.string().required() }).returns(a.ref('PracticeReply')).authorization((allow) => [allow.authenticated()]).handler(a.handler.function(practice)),
classifyText: a.query().arguments({ text: a.string().required() }).returns(a.ref('ClassifyReply')).authorization((allow) => [allow.authenticated()]).handler(a.handler.function(classify)),
toneCheck: a.query().arguments({ text: a.string().required() }).returns(a.ref('ToneReply')).authorization((allow) => [allow.authenticated()]).handler(a.handler.function(tone)),
previewReplies: a.query().arguments({ context: a.string().required() }).returns(a.ref('PreviewReply')).authorization((allow) => [allow.authenticated()]).handler(a.handler.function(preview)),
```
Add `allow.resource(practice)` to the PracticeRun model so the practice function's env Data client can create records; wire the env Data client import in `practice/handler.ts` (uncomment the generateClient/$amplify/env block) to persist scenario/level/strength/tip/fallback only.

In `app/amplify/backend.ts`: register the four functions in `defineBackend`, then loop exact-ARN Bedrock IAM (research Pattern 5) — NEVER `'*'`:
```ts
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
const ACCOUNT = /* from Stack */; const PROFILE_REGIONS = ['us-east-1','us-east-2','us-west-2']; // regions the chosen profiles route to (from task 2-05-01)
const modelArns = [
  // inference-profile ARNs:
  `arn:aws:bedrock:us-east-1:${ACCOUNT}:inference-profile/${HAIKU_PROFILE}`,
  `arn:aws:bedrock:us-east-1:${ACCOUNT}:inference-profile/${SONNET_PROFILE}`,
  // foundation-model ARNs in EVERY routed region (pitfall #1):
  ...PROFILE_REGIONS.flatMap((r) => [`arn:aws:bedrock:${r}::foundation-model/${HAIKU_MODEL}`, `arn:aws:bedrock:${r}::foundation-model/${SONNET_MODEL}`]),
];
for (const fn of [backend.classify, backend.practice, backend.tone, backend.preview]) {
  fn.resources.lambda.addToRolePolicy(new PolicyStatement({ actions: ['bedrock:InvokeModel'], resources: modelArns }));
}
```
Provision a DynamoDB rate-limit table via CDK (partition key `pk` string, TTL attribute `ttl`, PAY_PER_REQUEST), grant `UpdateItem` to classify? no — grant to practice/tone/preview only (classify is never rate-limited), set `RATE_LIMIT_TABLE` env on those three, and set `reservedConcurrentExecutions` on all four AI functions (cost guard). Pass `CLASSIFY_MODEL_ID`/`PRACTICE_MODEL_ID` env from config to the functions.
  </action>
  <acceptance_criteria>
- `grep -q "practiceTurn: a.query()" app/amplify/data/resource.ts` and `grep -c "allow.authenticated()" app/amplify/data/resource.ts` ≥ 4
- `grep -q "allow.resource(practice)" app/amplify/data/resource.ts`
- `grep -q "bedrock:InvokeModel" app/amplify/backend.ts`
- `grep -q "inference-profile/" app/amplify/backend.ts` and `grep -q "foundation-model/" app/amplify/backend.ts`
- `! grep -Eq "resources: \[['\"]\\*['\"]\]" app/amplify/backend.ts` (no wildcard resource)
- `grep -q "reservedConcurrentExecutions" app/amplify/backend.ts` and `grep -q "RATE_LIMIT_TABLE" app/amplify/backend.ts`
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
  </acceptance_criteria>
  <done>Four custom queries authenticated; practice writes PracticeRun; IAM uses exact profile+foundation ARNs with no wildcard; rate-limit table + env + reserved concurrency set; typecheck passes.</done>
</task>

<task type="checkpoint:human-verify" id="2-05-03" gate="blocking">
  <name>Deploy sandbox + run integration verify-phase2.ts</name>
  <read_first>app/amplify/data/resource.ts, app/amplify/backend.ts, .planning/phases/02-ai-backend-infrastructure/02-VALIDATION.md, .claude/skills/bridge/SKILL.md</read_first>
  <what-built>Write `app/scripts/verify-phase2.ts`: authenticate as a seeded test user (real Cognito), then call the four custom queries and assert the five success criteria.</what-built>
  <how-to-verify>
Author `app/scripts/verify-phase2.ts` asserting:
1. practiceTurn returns non-empty strength AND tip for the full 7 scenarios × 3 levels matrix (21 calls).
2. classifyText flags a crisis phrase (label 'crisis'), a money ask, an address ask; a benign phrase is 'safe'.
3. A forced slow/garbled input path returns `fallback:true` with a non-empty reply (never a raw error) — simulate by pointing at an unreachable model id or asserting the fallback shape.
4. The 101st practiceTurn in an hour for one user returns `rateLimited:true`/gentle message, while a crisis classifyText/practiceTurn STILL answers (crisis never rate-limited).
5. Every practiceTurn response omits raw transcript fields; spot-check CloudWatch (`aws logs tail /aws/lambda/<fn> --follow`) shows no message content.
Then deploy + run:
- `cd app && npx ampx sandbox` (deploy; confirm all four functions + table created).
- `cd app && npx tsx scripts/verify-phase2.ts` → exits 0 with all assertions passing.
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0.
  </how-to-verify>
  <acceptance_criteria>
- `test -f app/scripts/verify-phase2.ts` and `grep -q "scenarioId" app/scripts/verify-phase2.ts`
- sandbox deploy succeeds (four functions + rate-limit table present)
- `cd app && npx tsx scripts/verify-phase2.ts` exits 0 (7×3 matrix, crisis, fallback, rate-limit-while-crisis-answers all pass)
- `aws logs tail` sample shows reqId/labels/fallback and NO message text
  </acceptance_criteria>
  <resume-signal>Type "verified" (or describe failing assertions) once the sandbox run is green.</resume-signal>
</task>

</tasks>

<verification>
- `cd app && npx tsc --noEmit -p amplify/tsconfig.json` exits 0
- `cd app && npx tsx scripts/verify-phase2.ts` exits 0 against the live sandbox
- `! grep -Eq "resources: \[['\"]\\*['\"]\]" app/amplify/backend.ts`
- all 7×3 practice combinations return strength+tip; crisis answered even when rate-limited
</verification>

<success_criteria>
Bedrock enabled with real inference-profile ids; four authenticated custom queries live; IAM least-privilege with exact ARNs (no wildcard); rate-limit table enforcing 100/hr with crisis bypass; maxTokens≤500 confirmed; integration script proves all five phase success criteria on the real sandbox; BEDROCK-02 quota request filed.
</success_criteria>

<output>
After completion, create `.planning/phases/02-ai-backend-infrastructure/02-05-SUMMARY.md`.
</output>
