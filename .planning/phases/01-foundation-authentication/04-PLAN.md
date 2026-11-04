---
plan: 04
title: Backend wiring, 30-day session, Budget, first test deploy
wave: 3
depends_on: [2, 3]
autonomous: false
files_modified:
  - app/amplify/backend.ts
requirements: [INFRA-02, INFRA-03, INFRA-04, INFRA-05, AUTH-03, DATA-10]
must_haves:
  - "backend.ts composes auth + data + pre-sign-up function into one defineBackend"
  - "Cognito user-pool client refresh token set explicitly to 30 days (D-05, AUTH-03)"
  - "A $50/month COST budget with EMAIL alerts at 50/80/100% ACTUAL exists as code via CfnBudget BEFORE any Bedrock call (D-06, INFRA-03)"
  - "First `npx ampx sandbox` deploy succeeds and `tsc --noEmit` is clean, validating TS types + IAM + schema on real AWS (INFRA-05, D-07)"
  - "Bedrock model access enabled in us-east-1 console for Phase 2 (INFRA-02) and the budget alert email confirmed"
---

<objective>
Wire the backend together and run the first real deploy — the moment D-07 is designed to catch the TS2590 risk against real AWS. `backend.ts` combines auth, data, and the pre-sign-up function, sets the 30-day refresh token via CDK override (D-05/AUTH-03), and creates the $50/month AWS Budget with 50/80/100% email alerts as code (D-06) so cost guards exist before Phase 2's Bedrock calls. Then a human runs SSO login + sandbox deploy. This plan is `autonomous: false`: SSO auth, the one-time Bedrock console enablement (INFRA-02), and confirming the budget subscription email are human-only steps.
</objective>

<threat_model>
- T-1-09 | IAM policy with `*` actions/resources creeps into the deploy | STRIDE:Elevation of Privilege | severity:high | mitigation: this plan adds NO custom IAM; Amplify-generated roles are least-privilege by default, and task 4-04-03 greps the plan's own code for `'*'` policy strings; any Bedrock IAM is deferred to Phase 2 with exact ARNs
- T-1-10 | Runaway AWS/Bedrock cost | STRIDE:Denial of Service (budget) | severity:high | mitigation: task 4-04-02 creates the $50 CfnBudget with 50/80/100% alerts BEFORE any Bedrock invocation path exists (D-06)
- T-1-11 | Team alert email treated as a secret / hardcoded wrong | STRIDE:Information Disclosure | severity:low | mitigation: the alias is a plain team distribution email (not participant data, not a credential); it is config in backend.ts, not a `secret()`, per RESEARCH Pattern 4
- T-1-12 | Deploying into the wrong AWS account/region | STRIDE:Tampering | severity:med | mitigation: task 4-04-03 requires `aws sts get-caller-identity` before `ampx sandbox`, and region is pinned to AWS_REGION/us-east-1
</threat_model>

<task id="4-04-01">
  <action>
Write `app/amplify/backend.ts` (header comment) composing the backend and applying the 30-day refresh-token CDK override (RESEARCH Pattern 2, D-05):
```ts
// app/amplify/backend.ts
// Composes Bridge's Amplify Gen 2 backend (auth + data + pre-sign-up trigger),
// sets a 30-day refresh token (D-05/AUTH-03) and the $50/mo cost budget (D-06).
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { preSignUp } from './functions/pre-sign-up/resource';

const backend = defineBackend({ auth, data, preSignUp });

// D-05 / AUTH-03: 30-day refresh token so sessions survive browser refresh.
const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.refreshTokenValidity = 30;
cfnUserPoolClient.tokenValidityUnits = { refreshToken: 'days' };
```
Confirm the exact CDK property path against the installed Amplify version (RESEARCH tags Pattern 2 [ASSUMED]); adjust and comment if it differs. Budget code is added in the next task.
  </action>
  <read_first>app/amplify/backend.ts; app/amplify/auth/resource.ts; app/amplify/data/resource.ts; 01-CONTEXT.md (D-05); 01-RESEARCH.md (Pattern 2)</read_first>
  <acceptance_criteria>
- `grep -q "defineBackend({ auth, data, preSignUp })" app/amplify/backend.ts`
- `grep -q 'refreshTokenValidity = 30' app/amplify/backend.ts`
- `grep -q "refreshToken: 'days'" app/amplify/backend.ts`
- `head -1 app/amplify/backend.ts` begins with `//`
  </acceptance_criteria>
</task>

<task id="4-04-02">
  <action>
Append the AWS Budget as code to `app/amplify/backend.ts` (RESEARCH Pattern 4, D-06). Put it in its own stack:
```ts
import { CfnBudget } from 'aws-cdk-lib/aws-budgets';
// D-06: $50/month cost guard with email alerts at 50/80/100% ACTUAL spend.
// Must exist before Phase 2's first Bedrock call. The alias below is a plain
// team distribution email — config, not a secret, not participant data.
const budgetStack = backend.createStack('BudgetStack');
const TEAM_ALERT_EMAIL = 'REPLACE_WITH_TEAM_ALIAS@example.com'; // set to real team alias
new CfnBudget(budgetStack, 'BridgeMonthlyBudget', {
  budget: {
    budgetName: 'bridge-monthly',
    budgetType: 'COST',
    timeUnit: 'MONTHLY',
    budgetLimit: { amount: 50, unit: 'USD' },
  },
  notificationsWithSubscribers: [50, 80, 100].map((threshold) => ({
    notification: { notificationType: 'ACTUAL', comparisonOperator: 'GREATER_THAN', threshold, thresholdType: 'PERCENTAGE' },
    subscribers: [{ subscriptionType: 'EMAIL', address: TEAM_ALERT_EMAIL }],
  })),
});
```
Replace the placeholder with the real team alias before deploy. Do NOT store the email via `secret()` — it is not a credential.
  </action>
  <read_first>app/amplify/backend.ts; 01-CONTEXT.md (D-06); 01-RESEARCH.md (Pattern 4); .claude/skills/bridge/SKILL.md (§1.4 cost guards)</read_first>
  <acceptance_criteria>
- `grep -q 'CfnBudget' app/amplify/backend.ts` and `grep -q "aws-cdk-lib/aws-budgets" app/amplify/backend.ts`
- `grep -q "amount: 50" app/amplify/backend.ts` and `grep -q "'MONTHLY'" app/amplify/backend.ts` and `grep -q "'COST'" app/amplify/backend.ts`
- `grep -q "\[50, 80, 100\]" app/amplify/backend.ts` and `grep -q "'ACTUAL'" app/amplify/backend.ts` and `grep -q "'PERCENTAGE'" app/amplify/backend.ts`
- `grep -q "'EMAIL'" app/amplify/backend.ts`
- `grep -cq "secret(" app/amplify/backend.ts` returns 0 (email not a secret)
  </acceptance_criteria>
</task>

<task id="4-04-03" type="checkpoint:human-action" gate="blocking">
  <action>
HUMAN steps (SSO + console are not automatable by Claude). Claude prepares and the human executes:
1. Confirm identity/account: `aws sts get-caller-identity` (SSO login first if needed: `aws sso login`). Verify it is the Bridge team account, region us-east-1.
2. Local type gate BEFORE deploy: `cd app && npx tsc --noEmit` — MUST exit 0 (D-07; if TS2590 fires, stop and apply the Plan 03 mitigation, do not deploy).
3. First test deploy (INFRA-04/INFRA-05): `cd app && npx ampx sandbox` — wait for "Deployed" / watch mode green. This validates TypeScript types, IAM, and the 9-model schema against real AWS. Confirm `amplify_outputs.json` was generated and is gitignored (`git check-ignore amplify_outputs.json`).
4. Verify the Budget exists in the AWS console (Billing → Budgets → `bridge-monthly`) and CONFIRM the budget alert subscription email that AWS sends to the team alias (INFRA-03).
5. One-time Bedrock enablement for Phase 2 (INFRA-02): AWS console → Bedrock (us-east-1) → Model access → request/enable the Anthropic model(s); complete the use-case form if prompted. Record the chosen model/inference-profile id so Phase 2 can set BEDROCK_MODEL_ID. (No Bedrock IAM is added this phase.)
No `*` IAM policies were introduced by this plan — grep the backend to confirm.
  </action>
  <read_first>app/amplify/backend.ts; 01-RESEARCH.md (Deploy discipline); .claude/skills/bridge/SKILL.md (§1.4 Account, Bedrock)</read_first>
  <acceptance_criteria>
- `aws sts get-caller-identity` prints the expected team account id (human confirms)
- `cd app && npx tsc --noEmit` exits 0
- `npx ampx sandbox` reaches a successful deployed state (human confirms watch output green / CloudFormation complete)
- `cd app && git check-ignore amplify_outputs.json` prints the path
- `grep -cq "'\\*'" app/amplify/backend.ts` returns 0 (no wildcard IAM in this plan)
- Human confirms: budget visible in console, alert email confirmed, Bedrock model access enabled in us-east-1
  </acceptance_criteria>
  <resume-signal>Type "approved — deploy green, budget + email confirmed, Bedrock enabled, model id recorded" or describe what failed.</resume-signal>
</task>

<verification>
Deploy is authoritative: `cd app && npx tsc --noEmit` exits 0, `npx ampx sandbox` completes a green deploy generating `amplify_outputs.json` (gitignored), the `bridge-monthly` $50 budget is visible in the console with a confirmed email subscription, and Bedrock model access shows enabled in us-east-1. This proves INFRA-02/03/04/05 and that the AppSync schema (DATA-10) deployed. The two-account authorization proof runs in Plan 05.
</verification>
