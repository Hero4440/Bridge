
# Phase 1: Foundation & Authentication - Research

**Researched:** 2026 (session date)
**Domain:** AWS Amplify Gen 2 (TypeScript), Cognito auth, AppSync/DynamoDB data modeling, AWS Budgets via CDK
**Confidence:** MEDIUM — strong domain knowledge of Amplify Gen 2 APIs, but NOT verified against live docs this session (no tool access). Treat all `[ASSUMED]` tags as "confirm on first deploy."

> **Provenance note:** No Context7/web/npm verification was possible this session. Claims are tagged `[ASSUMED]` (training knowledge of official Amplify Gen 2 docs) or `[CITED: <doc area>]` where I reference a known official doc location by name. There are **zero** `[VERIFIED]` claims because no tool confirmed them live. The planner should run `npm view @aws-amplify/backend version` and a throwaway `npx ampx sandbox` early (D-07) to convert the high-risk `[ASSUMED]` items to verified.

## Summary

Phase 1 stands up an Amplify Gen 2 backend rooted at `app/` with three resource definitions (`auth`, `data`, plus a pre-sign-up Lambda) wired together in `app/amplify/backend.ts`, deployed via a personal cloud sandbox (`npx ampx sandbox`). Cognito is configured for email/password login with a pre-sign-up trigger that auto-confirms and auto-verifies users (no verification email, per D-04). The 9-model schema is authored in `app/amplify/data/resource.ts` using `a.schema()` / `a.model()` with per-model authorization rules, then deployed immediately to surface the known **TS2590 "type instantiation is excessively deep"** risk on large schemas (D-07). AWS Budgets is added as code through a CDK `CfnBudget` construct inside `backend.ts` (a global/us-east-1 service), with email subscribers at 50/80/100% (D-06). Minimal frontend wiring (`Amplify.configure(outputs)` + the `aws-amplify/auth` functions) proves AUTH-01..05; full UI is deferred to Phase 6.

**Primary recommendation:** Scaffold with Vite React-TS inside `app/`, add Amplify via `npm create amplify@latest`, define all 9 models + auth + budget up front, and get a green `npx ampx sandbox` deploy on day one so TS2590 / IAM / token-config problems surface before any feature work. Configure the 30-day session via the **refresh-token validity** (Cognito's default is already 30 days — confirm, don't hand-build).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Email/password credential storage & token issuance | Cognito (managed auth) | — | Managed identity provider; never store passwords in app tables |
| Auto-confirm/verify on sign-up | Lambda (pre-sign-up trigger) | Cognito | Trigger runs inside Cognito's sign-up flow; only a Lambda can mutate `event.response` |
| Profile data (name, interests, trustedPerson, theme, comfort) | DynamoDB (User model) | AppSync | D-02/D-03: profile is app data, not identity data |
| Data persistence + GraphQL API | AppSync + DynamoDB | — | Amplify `defineData` generates resolvers; no hand-written API tier |
| Row-level authorization (owner/member) | AppSync auth rules | Lambda custom query (edge cases) | Schema auth rules cover owner/authenticated; rules the schema can't express → Lambda (D-08) |
| Cost guardrail | AWS Budgets (global svc) | CDK in backend.ts | Infra-as-code; Budgets is account-global, pinned via us-east-1 |
| Session persistence across refresh | Browser (Amplify localStorage) | Cognito refresh token | Amplify stores tokens client-side; refresh token (30d) rehydrates session |
| Frontend config | Browser/Vite client | `amplify_outputs.json` | `Amplify.configure(outputs)` at app bootstrap |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@aws-amplify/backend` | latest (confirm `npm view`) | `defineAuth`/`defineData`/`defineFunction`/`defineBackend`, `secret()` | Gen 2 backend authoring surface `[ASSUMED]` |
| `@aws-amplify/backend-cli` (`ampx`) | latest | `npx ampx sandbox`, `pipeline-deploy`, `generate` | Official Gen 2 CLI (replaces old `amplify` CLI) `[ASSUMED]` |
| `aws-amplify` | v6.x | Frontend: `Amplify.configure`, `aws-amplify/auth`, `generateClient` | Client library for Gen 2 `[ASSUMED]` |
| `aws-cdk-lib` | pinned by Amplify template | `CfnBudget`, CDK overrides in `backend.ts` | Budgets-as-code + token-validity overrides `[ASSUMED]` |
| `typescript` | strict mode | All `app/` code | SKILL.md §3.1 (strict, no `@ts-nocheck`, no `any`) |
| `vite` + `@vitejs/plugin-react` | latest | Dev server / build for React PWA | Matches SKILL.md §2.5 (React + Vite PWA) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | latest | Input validation in Lambdas (SKILL.md §1.3) | Pre-sign-up trigger is trivial; zod matters more in Phase 2 AI Lambdas. Install now for convention. |
| `aws-lambda` (`@types/aws-lambda`) | latest | `PreSignUpTriggerHandler` type | Typing the pre-sign-up handler |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CDK `CfnBudget` in backend.ts | AWS Console budget | Console is a manual one-time step, not reproducible; SKILL.md §1.4 says infra is code. Use CDK. |
| Pre-sign-up auto-confirm Lambda | Cognito "allow users to sign themselves up" + email code | D-04 forbids verification email; auto-confirm trigger is the documented no-verification pattern. |
| 9 models in one `a.schema()` | Split + `a.combine([...])` | Single schema is simpler; split only if TS2590 forces it (see Pitfalls). Start single. |

**Installation (indicative — confirm exact names on scaffold):**
```bash
# 1. Vite React-TS app at app/
npm create vite@latest app -- --template react-ts
cd app
# 2. Add Amplify Gen 2 backend
npm create amplify@latest           # scaffolds app/amplify/*
npm install aws-amplify             # frontend client
npm install -D @types/aws-lambda
npm install zod
```
> `[ASSUMED]` exact scaffold command and whether `npm create amplify@latest` must run before or after Vite. **Verify order on scaffold** — if `npm create amplify` refuses to run in a non-empty dir, create the Vite app first (as above) then add Amplify.

**Version verification (MUST run — I could not):**
```bash
npm view @aws-amplify/backend version
npm view @aws-amplify/backend-cli version
npm view aws-amplify version
```
Record the resolved versions in STACK.md.

## Architecture Patterns

### System Architecture Diagram

```
Browser (Vite React PWA, app/src)
   │  Amplify.configure(amplify_outputs.json)
   │
   ├── signUp(email,password) ─────────────┐
   │                                        ▼
   │                               Cognito User Pool
   │                                        │ (pre-sign-up trigger fires)
   │                                        ▼
   │                               Lambda preSignUp
   │                               autoConfirmUser=true
   │                               autoVerifyEmail=true
   │                                        │
   │   signIn → tokens (access 1h / id 1h / refresh 30d)
   │   ◀───────────────────────────────────┘
   │   tokens cached in browser localStorage (session persists across refresh)
   │
   └── generateClient<Schema>() ──▶ AppSync GraphQL API
                                        │  (Cognito userPool authorizer)
                                        │  per-model auth rules (owner / authenticated / custom)
                                        ▼
                                   DynamoDB (9 tables: User, Message, Event,
                                   RSVP, PracticeRun, Reflection, Contact,
                                   GuardianLink, Notification)

   [Account-global] AWS Budgets (CfnBudget via backend.ts CDK)
      → SNS/email to team at 50% / 80% / 100% of $50/mo
```

### Recommended Project Structure
```
app/
├── package.json            # Vite + Amplify deps, "type": "module"
├── tsconfig.json           # strict
├── vite.config.ts
├── index.html
├── amplify_outputs.json    # GENERATED by sandbox — .gitignore, do NOT commit
├── amplify/
│   ├── backend.ts          # defineBackend({auth,data,preSignUp}) + CfnBudget + token override
│   ├── auth/
│   │   └── resource.ts     # defineAuth (loginWith.email, preSignUp trigger)
│   ├── data/
│   │   └── resource.ts     # defineData, a.schema() with 9 models
│   ├── functions/
│   │   └── pre-sign-up/
│   │       ├── resource.ts # defineFunction
│   │       └── handler.ts  # autoConfirmUser
│   └── shared/
│       └── config.ts       # region=us-east-1, model id TBD (Phase 2)
└── src/
    ├── main.tsx            # Amplify.configure(outputs)
    └── lib/auth.ts         # thin wrappers over aws-amplify/auth (Phase 6 expands)
```
> `[ASSUMED]` default scaffold uses `amplify/backend.ts`, `amplify/auth/resource.ts`, `amplify/data/resource.ts`. Confirm folder names match current template.

### Pattern 1: defineAuth with pre-sign-up auto-confirm (D-04)
**What:** Email/password login, no verification email; a Lambda auto-confirms.
**When to use:** This phase, exactly.
```ts
// app/amplify/functions/pre-sign-up/resource.ts  [ASSUMED]
import { defineFunction } from '@aws-amplify/backend';
export const preSignUp = defineFunction({
  name: 'pre-sign-up',
});
```
```ts
// app/amplify/functions/pre-sign-up/handler.ts  [ASSUMED]
// Why: D-04 — auto-confirm so no verification email is sent; profile data lives in DynamoDB, not here.
import type { PreSignUpTriggerHandler } from 'aws-lambda';
export const handler: PreSignUpTriggerHandler = async (event) => {
  event.response.autoConfirmUser = true;
  // autoVerifyEmail only valid when email is an alias/attribute in the flow:
  if (event.request.userAttributes.email) {
    event.response.autoVerifyEmail = true;
  }
  return event;
};
```
```ts
// app/amplify/auth/resource.ts  [ASSUMED]
import { defineAuth } from '@aws-amplify/backend';
import { preSignUp } from '../functions/pre-sign-up/resource';
export const auth = defineAuth({
  loginWith: { email: true },           // email + password (password is implicit)
  triggers: { preSignUp },
  // NOTE: no groups (D-05, SKILL.md §1.4 "every account equal")
});
```
**Gotcha:** `event.response.autoVerifyEmail` is only honored when email is being verified in that flow; `autoConfirmUser` is the one that removes the confirmation-code step. Confirm both are needed for your sign-in UX. `[ASSUMED]`

### Pattern 2: 30-day session via refresh-token validity (D-05)
**What:** Cognito tokens — access & id tokens default 1h (max 24h); **refresh token default is 30 days** (max 10 years). D-05's "30-day session" maps to the refresh token, which is likely **already the default**.
**When to use:** Set explicitly for intent/documentation even if it matches the default.
```ts
// app/amplify/backend.ts (override block)  [ASSUMED — token-validity props are a known CDK override point]
import { Duration } from 'aws-cdk-lib';
const backend = defineBackend({ auth, data, preSignUp });
const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.refreshTokenValidity = 30;             // days
cfnUserPoolClient.tokenValidityUnits = {
  refreshToken: 'days',
  accessToken: 'hours',
  idToken: 'hours',
};
```
**Gotcha:** `defineAuth` high-level props historically do **not** expose token validity — it's a CDK override on the user-pool client. The exact property path (`backend.auth.resources.cfnResources.cfnUserPoolClient`) is `[ASSUMED]`; **verify against the "modify Cognito resources with CDK" doc**. Session persistence across browser refresh is automatic: Amplify v6 stores tokens in `localStorage` and silently refreshes — no extra code needed for AUTH (success criterion 1). `[ASSUMED: aws-amplify v6 default storage]`

### Pattern 3: defineData — 9 models, relationships, authorization (D-07, D-08)
```ts
// app/amplify/data/resource.ts  [ASSUMED shapes — current a.model() API]
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  User: a.model({
    email: a.string().required(),
    firstName: a.string(), lastName: a.string(),
    interests: a.string().array(),
    theme: a.string(),
    trustedPersonName: a.string(),
    trustedPersonRelation: a.string(),  // Parent|Sibling|Friend|Other
    comfortTextSize: a.string(), calmMode: a.boolean(), textFirst: a.boolean(),
  }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),
  //  ^ others see first name + photo only; enforce field exposure in Lambda/query if needed

  Message: a.model({
    body: a.string().required(),
    circleId: a.string(), dmThreadId: a.string(),
    senderId: a.string(),
  }).authorization(allow => [allow.authenticated()]), // see D-08 note below

  Event: a.model({
    title: a.string().required(), circleId: a.string(),
    startsAt: a.datetime(), durationMins: a.integer(),
    inPerson: a.boolean(), venue: a.string(),
    sound: a.string(), lighting: a.string(), size: a.integer(),
    rsvps: a.hasMany('RSVP', 'eventId'),
  }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),

  RSVP: a.model({
    eventId: a.string().required(),
    status: a.string(),                 // Going|Maybe|Can't go
    event: a.belongsTo('Event', 'eventId'),
  }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),

  PracticeRun: a.model({
    scenarioId: a.string(), level: a.integer(), goal: a.string(),
    hintsUsed: a.integer(), strength: a.string(), tip: a.string(),
    fallback: a.boolean(),              // NO raw transcript (SKILL.md §2.8)
  }).authorization(allow => [allow.owner()]),   // D-08 owner-only

  Reflection: a.model({
    eventId: a.string(), rating: a.string(), wins: a.string().array(),
    moReply: a.string(),
  }).authorization(allow => [allow.owner()]),   // D-08 owner-only

  Contact: a.model({
    ownerId: a.string(), contactUserId: a.string(),
    status: a.string(),                 // pending|accepted|declined|blocked
  }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),

  GuardianLink: a.model({
    personId: a.string(), guardianId: a.string(),
    status: a.string(),                 // pending|connected|declined
    visibility: a.string().array(),     // person-set: braveSteps|iNeedHelp|none
  }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),

  Notification: a.model({
    userId: a.string(), kind: a.string(), body: a.string(),
    read: a.boolean(),
  }).authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: 'userPool' },  // Cognito-first (SKILL.md §1.4)
});
```
> The field sets above are a **starting draft from SKILL.md §2.2–2.4 and the data-model list in §3**; the planner should reconcile exact fields with `tech design/index.html` (which I could not read). Owner/authenticated rules are deliberately conservative.

**D-08 "rules the schema can't express" (Message circle-member / DM-participant visibility):**
`allow.owner()` won't express "visible to all members of circle X" and `allow.authenticated()` is too broad. The Gen-2 pattern is a **custom query backed by a Lambda** that checks membership server-side, with the Lambda granted data access via `allow.resource(fn)`:
```ts
// sketch — custom query gated by a Lambda, NOT the client  [ASSUMED]
listCircleMessages: a.query()
  .arguments({ circleId: a.string().required() })
  .returns(a.ref('Message').array())
  .authorization(allow => [allow.authenticated()])
  .handler(a.handler.function(messagesFn)),
// data/resource.ts grants the fn access: a.model(...).authorization(allow => [allow.resource(messagesFn)])
```
> This Message-visibility Lambda is **likely deferred to the chat phase**, not Phase 1. For Phase 1, keep `Message` at `allow.authenticated()` so the schema deploys, and leave a `// TODO(phase-chat): replace with custom-query membership check (D-08)` marker. That marker is a design note, not a mock, so it does not violate SKILL.md §1.3. Confirm with planner.

### Pattern 4: AWS Budgets as code (D-06)
```ts
// app/amplify/backend.ts  [ASSUMED construct name/props from aws-cdk-lib/aws-budgets]
import { CfnBudget } from 'aws-cdk-lib/aws-budgets';

const budgetStack = backend.createStack('BudgetStack');
const subscribers = ['team-alerts@EXAMPLE.invalid']; // real team list set at deploy; no secrets
new CfnBudget(budgetStack, 'BridgeMonthlyBudget', {
  budget: {
    budgetName: 'bridge-monthly',
    budgetType: 'COST',
    timeUnit: 'MONTHLY',
    budgetLimit: { amount: 50, unit: 'USD' },
  },
  notificationsWithSubscribers: [50, 80, 100].map(threshold => ({
    notification: {
      notificationType: 'ACTUAL',
      comparisonOperator: 'GREATER_THAN',
      threshold,
      thresholdType: 'PERCENTAGE',
    },
    subscribers: subscribers.map(address => ({ subscriptionType: 'EMAIL', address })),
  })),
});
```
**Gotchas:**
- Budgets is a **global** service exposed through the **us-east-1** endpoint — consistent with D-01, no region conflict. `[ASSUMED]`
- Email subscribers receive an **SNS/Budgets confirmation** only for SNS topics; plain `EMAIL` subscription type does not require confirmation but the address must be valid. Use a real team alias (not a secret, not a participant). `[ASSUMED]`
- Consider adding a `notificationType: 'FORECASTED'` at 100% as a stretch; D-06 specifies ACTUAL at 50/80/100, so stick to ACTUAL.
- Put the real team email list in code at deploy time — it is **not a secret** (SKILL.md §1.4 reserves `secret()` for non-AWS secrets). Do not invent participant addresses.

### Pattern 5: Frontend auth wiring (AUTH-01..05, minimal)
```ts
// app/src/main.tsx  [ASSUMED aws-amplify v6 API]
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
Amplify.configure(outputs);
```
```ts
// app/src/lib/auth.ts  — thin wrappers; Phase 6 builds real UI
import { signUp, signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export async function register(email: string, password: string) {
  // With pre-sign-up auto-confirm, nextStep should be DONE (no code). Verify on first run.
  const res = await signUp({ username: email, password, options: { userAttributes: { email } } });
  return res; // expect isSignUpComplete true / nextStep 'DONE'
}
export const login  = (email: string, password: string) => signIn({ username: email, password });
export const logout = () => signOut();
export const current = () => getCurrentUser();
export const session = () => fetchAuthSession();
```
**Gotcha:** Even with `autoConfirmUser`, `signUp` may return a `nextStep` of `CONFIRM_SIGN_UP` in some SDK versions if autoconfirm is applied asynchronously — **test the actual `nextStep` on first run** and branch accordingly (if it ever returns a confirm step, that's a signal the trigger didn't fire). `confirmSignUp` should NOT be needed; do not build a code-entry UI. `[ASSUMED]`

### Anti-Patterns to Avoid
- **Committing `amplify_outputs.json`** — SKILL.md §1.4 + §3.3. Gitignore it.
- **Cognito groups / roles** — D-05, SKILL.md §2.2: every account equal. Do not add groups.
- **Storing profile fields in Cognito custom attributes** — D-02/D-03: profile lives in the `User` DynamoDB model. Cognito holds email + password only.
- **`"*"` in IAM policy resources/actions** — SKILL.md §1.4 forbids. No Bedrock policy yet (Phase 2).
- **Client-side enforcement of member visibility** — D-08: put it in a Lambda custom query.
- **`@ts-nocheck` / `any` in `app/`** — SKILL.md §3.1. The Figma `App.tsx` is exempt and frozen.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email/password auth, token refresh, session persistence | Custom auth server, JWT handling | Cognito via `defineAuth` + `aws-amplify/auth` | Managed, secure, refresh handled client-side |
| GraphQL API + resolvers for 9 models | Hand-written AppSync resolvers | `defineData` / `a.model()` | Amplify generates CRUD + subscriptions |
| Row-level authorization | Manual checks in client | `allow.owner()` / `allow.authenticated()` + custom-query Lambda for edge cases | Enforced at AppSync, not bypassable |
| Cost alerting | Cron that polls Cost Explorer | `CfnBudget` | Native, reliable, declarative |
| Auto-confirm users | Admin API call after sign-up | Pre-sign-up trigger | Runs atomically inside the sign-up flow |

**Key insight:** Phase 1 is almost entirely declarative configuration of managed services. The only hand-written code is a ~5-line Lambda and a CDK budget block. Resist adding anything else.

## Runtime State Inventory

Not a rename/refactor/migration phase (greenfield backend). Section omitted as not applicable — **None: this is greenfield infrastructure creation; no existing runtime state to migrate.**

## Common Pitfalls

### Pitfall 1: TS2590 "Type instantiation is excessively deep and possibly infinite"
**What goes wrong:** Large `a.schema()` with many models (9 here, plus relationships) can blow TypeScript's instantiation depth when `ClientSchema<typeof schema>` or `generateClient<Schema>()` is resolved, producing TS2590 at build/typecheck time. This is the specific risk D-07 wants surfaced on day one.
**Why it happens:** The generated recursive conditional types for relationships compound with each model. `[ASSUMED — known Amplify Gen 2 community issue]`
**How to avoid / mitigate (in order):**
1. Ensure `tsconfig.json` has `"strict": true` but you may need `"skipLibCheck": true` (Vite template usually sets this). `[ASSUMED]`
2. Keep relationship chains shallow; only `Event↔RSVP` needs `hasMany/belongsTo` in Phase 1. Model Contact/GuardianLink as plain id fields rather than deep relations to reduce type depth.
3. If TS2590 still fires, split the schema and recombine with `a.combine([schemaA, schemaB])`, which Amplify documents as the large-schema escape hatch. `[ASSUMED]`
4. As a last resort, isolate the client type: `const client = generateClient<Schema>()` in one module and export typed helpers, limiting where the deep type is instantiated.
**Warning signs:** `tsc --noEmit` errors referencing `node_modules/@aws-amplify/data-schema`, or the IDE hanging on `resource.ts`.
> **This pitfall is the single most important reason D-07 mandates an immediate test deploy + typecheck.** Do it before adding frontend code.

### Pitfall 2: Token-validity props aren't on `defineAuth`
**What goes wrong:** Planner tries to set 30-day session in `defineAuth({...})` and finds no prop.
**How to avoid:** Use the CDK override on the user-pool client (Pattern 2). Verify the exact `backend.auth.resources.cfnResources` path against the "modify auth with CDK" doc. Also confirm 30 days isn't already the default (it likely is) to avoid over-engineering.

### Pitfall 3: Pre-sign-up trigger doesn't auto-confirm as expected
**What goes wrong:** After `signUp`, the SDK returns a confirm step and the user can't sign in.
**How to avoid:** Confirm both `autoConfirmUser` and (if email) `autoVerifyEmail`. Check the handler is actually wired in `triggers: { preSignUp }` AND exported in `defineBackend`. Test by signing up a throwaway address and immediately `signIn`.
**Warning signs:** `UserNotConfirmedException` on sign-in.

### Pitfall 4: `amplify_outputs.json` gets committed / is missing at build
**What goes wrong:** Committing it leaks environment config; or CI build fails because it's gitignored and never generated.
**How to avoid:** Gitignore it (SKILL.md §1.4). In sandbox/dev it's generated by `npx ampx sandbox`; in `main` CI it's generated by `npx ampx pipeline-deploy` before the Vite build (amplify.yml). Frontend `import outputs from '../amplify_outputs.json'` must tolerate its absence in a fresh clone (document the "run sandbox first" step in `app/README.md`).

### Pitfall 5: Budgets region / confirmation
**What goes wrong:** Confusion about which region Budgets deploys to, or expecting email confirmation.
**How to avoid:** Budgets is account-global via us-east-1 (matches D-01). Plain EMAIL subscribers need no SNS confirmation but the address must be deliverable. `[ASSUMED]`

### Pitfall 6: Sandbox vs production account
**What goes wrong:** Deploying a sandbox into the shared prod account, or `pipeline-deploy` pointed at a personal sandbox.
**How to avoid:** `aws sts get-caller-identity` before any deploy (SKILL.md §1.4). Each dev runs `npx ampx sandbox` (personal, auto-named stack); `main` deploys via Amplify Hosting pipeline. Never point sandbox at prod.

## Code Examples

All examples are in "Architecture Patterns" above (Patterns 1–5). They are drafts tagged `[ASSUMED]` pending first-deploy verification.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Amplify CLI (`amplify add auth`, Gen 1) | Amplify Gen 2 code-first (`defineAuth`, `ampx`) | 2024 GA | All config is TypeScript; ignore Gen 1 tutorials |
| `aws-amplify` v5 `Auth.signIn` | v6 modular `import { signIn } from 'aws-amplify/auth'` | 2023–24 | Function imports, not `Auth.*` namespace |
| `amplifyconfiguration.json` | `amplify_outputs.json` | Gen 2 | Different filename; gitignore the new one |

**Deprecated/outdated — do NOT follow:**
- Any `amplify push` / `amplify add` CLI instructions (Gen 1).
- `Auth.currentAuthenticatedUser()` (v5) → use `getCurrentUser()` (v6).
- `withAuthenticator` is fine for Phase 6 UI but not required here.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `npm create amplify@latest` scaffolds `amplify/` with `auth/data` resources and works inside a Vite `app/` dir | Stack / Structure | Scaffold path differs; folder layout in STRUCTURE.md wrong — low risk, self-correcting on scaffold |
| A2 | Pre-sign-up handler shape (`event.response.autoConfirmUser/autoVerifyEmail`) | Pattern 1 | Wrong field → users stuck unconfirmed; high impact, easy to test |
| A3 | Token validity set via `backend.auth.resources.cfnResources.cfnUserPoolClient` CDK override; refresh default already 30d | Pattern 2 | Property path wrong → 30d session not applied; medium |
| A4 | `a.model()` / `a.hasMany('RSVP','eventId')` / `allow.owner()`/`allow.resource()` current API | Pattern 3 | API drift → schema won't compile; surfaced by D-07 deploy |
| A5 | `CfnBudget` from `aws-cdk-lib/aws-budgets` with `notificationsWithSubscribers` works in backend.ts via `createStack` | Pattern 4 | Budget not created before Bedrock (Phase 2) — but Phase 2 gated on this, medium |
| A6 | `aws-amplify` v6 persists tokens to localStorage automatically (session survives refresh) | Pattern 5 | If not, need explicit storage config; medium — testable |
| A7 | TS2590 is a real risk for 9-model schemas and `a.combine()` is the mitigation | Pitfall 1 | If no TS2590, mitigation unused — harmless |
| A8 | Message exact fields and whether its visibility Lambda belongs in Phase 1 | Pattern 3 / D-08 | Scope creep into chat phase; planner should confirm deferral |
| A9 | Default authorizationMode `userPool` and `authorizationModes` prop name | Pattern 3 | Deploy error, surfaced immediately |

**This table is non-empty because no live doc/tool verification was possible. The planner should treat A2, A3, A4, A9 as "verify on first `ampx sandbox` run" — which D-07 already schedules.**

## Open Questions

1. **Does `npm create amplify` run cleanly inside an existing Vite `app/` dir, or must Amplify be scaffolded first?**
   - Known: both tools target the same dir; order sometimes matters.
   - Unclear: current template's behavior in a non-empty dir.
   - Recommendation: create Vite app first, then add Amplify; if it refuses, scaffold Amplify into an empty `app/` then add Vite config. Resolve in the first scaffolding task.
2. **Is the 30-day session already Cognito's default refresh-token validity?**
   - Recommendation: set it explicitly anyway (documents intent) but don't treat it as risky work.
3. **Does the Message-visibility custom-query Lambda belong in Phase 1 or the chat phase?**
   - Recommendation: defer the Lambda; keep `Message` at `allow.authenticated()` with a TODO marker so the schema deploys now. Confirm with planner against ROADMAP.
4. **Exact field lists for all 9 models** — I could not read `tech design/index.html`. The drafts above come from SKILL.md §2. Planner must reconcile.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite + ampx | unknown (could not probe) | — | — |
| npm | package install | unknown | — | — |
| AWS CLI + SSO | `aws sts get-caller-identity`, deploy | unknown | — | none — required |
| AWS account access (us-east-1) | sandbox + Budgets | unknown | — | none — required |

> I could not run availability probes (no Bash). **The planner/executor MUST verify:** `node --version` (Amplify Gen 2 needs a current LTS, ~Node 18+/20+ `[ASSUMED]`), `npm --version`, `aws --version`, and `aws sts get-caller-identity` (SKILL.md §1.4) before any deploy. SSO login via `aws sso login`. No keys in files.

**Missing dependencies with no fallback:** AWS account + SSO access is mandatory; a signed-in test user is needed for success criterion 5.

## Validation Architecture

> `.planning/config.json` not readable this session; assuming `nyquist_validation` enabled (absent/true default).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (Vite-native) — **confirm/install in Wave 0** `[ASSUMED choice]` |
| Config file | none yet — add `vitest.config.ts` (or reuse `vite.config.ts`) |
| Quick run command | `cd app && npx vitest run` |
| Full suite command | `cd app && npx tsc --noEmit && npx vitest run` |

> Much of Phase 1 is infra that is validated by **deploy + live auth calls**, not unit tests. The authoritative validation is a green `npx ampx sandbox` and a scripted/manual auth round-trip against real Cognito (SKILL.md §1.3 — nothing mocked). Pure unit tests apply mainly to the pre-sign-up handler.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Amplify Gen 2 project scaffolds under `app/` | smoke | `cd app && npx ampx sandbox --once` succeeds | ❌ Wave 0 |
| INFRA-02 | Single region us-east-1 everywhere | manual/config | assert `shared/config.ts` region === 'us-east-1' (unit) | ❌ Wave 0 |
| INFRA-03 | `npx ampx sandbox` runs locally | smoke | sandbox deploy exits 0 | ❌ Wave 0 |
| INFRA-04 | First test deploy succeeds (types + IAM) | smoke | `tsc --noEmit` green AND sandbox deploy green | ❌ Wave 0 |
| INFRA-05 | `amplify_outputs.json` gitignored, not committed | unit/CI | `git check-ignore app/amplify_outputs.json` returns the path | ❌ Wave 0 |
| AUTH-01 | Sign up with email/password | integration (real Cognito) | scripted signUp against sandbox user pool | ❌ Wave 0 |
| AUTH-02 | Auto-confirm (no verification email) | integration | after signUp, `signIn` succeeds with no confirm step | ❌ Wave 0 |
| AUTH-03 | Log in | integration | `signIn` returns `isSignedIn` | ❌ Wave 0 |
| AUTH-04 | Log out | integration | `signOut` then `getCurrentUser` throws | ❌ Wave 0 |
| AUTH-05 | Session persists across refresh (30d refresh token) | manual + unit | `fetchAuthSession` returns tokens; assert refreshTokenValidity=30 in template | ❌ Wave 0 |
| DATA-01..09 | Each of 9 models deploys & is queryable | integration | `generateClient<Schema>()` create/get on each model against sandbox | ❌ Wave 0 |
| DATA-10 | Authorization rules enforced (owner-only Reflection/PracticeRun) | integration (TWO accounts) | account A creates Reflection; account B cannot read it | ❌ Wave 0 |

> SKILL.md §1.3 + §3 "Done =" explicitly require the **two-account access-rule test** and a **signed-in test-user API call** — DATA-10 and the AUTH integration tests are non-negotiable gates.

### Sampling Rate
- **Per task commit:** `cd app && npx tsc --noEmit` (catches TS2590 and schema errors fast).
- **Per wave merge:** `npx tsc --noEmit && npx vitest run` + a sandbox deploy if backend files changed.
- **Phase gate:** green sandbox deploy, AUTH round-trip against real Cognito, two-account authorization test pass, Budget visible in AWS console, `amplify_outputs.json` confirmed gitignored — before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] Install/choose test runner: `cd app && npm i -D vitest` (+ config).
- [ ] `app/amplify/functions/pre-sign-up/handler.test.ts` — unit test autoConfirm logic (pure, no AWS).
- [ ] `app/scripts/` or test harness for integration auth round-trip against the sandbox (uses real Cognito; made-up throwaway email, never participant data).
- [ ] Two-account authorization test harness (DATA-10) — seed two Cognito users via sandbox.
- [ ] `tsc --noEmit` wired into the per-commit check (primary TS2590 detector).

## Security Domain

> `security_enforcement` assumed enabled (config not readable).

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Cognito (managed); password policy = Cognito defaults; no custom auth |
| V3 Session Management | yes | Cognito tokens; 30d refresh (D-05); Amplify-managed storage; `signOut` revokes |
| V4 Access Control | yes | AppSync per-model auth rules (`allow.owner()`, `allow.authenticated()`), custom-query Lambda for member visibility (D-08); IAM least-privilege, no `"*"` |
| V5 Input Validation | partial | Pre-sign-up handler validates event; zod reserved for Phase 2 AI Lambdas |
| V6 Cryptography | no (this phase) | Cognito handles password hashing/token signing; do not hand-roll |
| V7 Error/Logging | yes | Log no message content / no PII (SKILL.md §1.4, §2.8); CloudWatch for Lambda |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Over-broad data authorization (any authed user reads another's Reflection) | Information disclosure | `allow.owner()` on Reflection/PracticeRun/Notification; two-account test (DATA-10) |
| Client-side auth bypass of member visibility | Elevation of privilege | Enforce in AppSync rules / Lambda custom query, never client (D-08) |
| Leaked secrets in repo | Information disclosure | No `.env`, no keys; `secret()` + SSO; `amplify_outputs.json` gitignored; push hook blocks keys |
| IAM privilege creep (`"*"`) | Elevation of privilege | Exact ARNs only; no Bedrock policy yet (Phase 2) |
| PII/profile in Cognito or logs | Information disclosure | Profile in DynamoDB owner-scoped; log no content |
| Account spoofing via unverified email (D-04 tradeoff) | Spoofing | Accepted risk per D-04 (no verification); note: anyone can register any email. Flag to team that abuse mitigation (rate limit / later verification) may be a future requirement. |

> **Security flag for the team:** D-04 (no email verification + auto-confirm) means users can register with email addresses they don't own. This is an accepted hackathon tradeoff, but document it in the README AI/privacy disclosure and consider a sign-up rate limit later. Not a Phase 1 blocker.

## Sources

### Primary (HIGH confidence)
- None verified live this session (no tool access).

### Secondary (MEDIUM confidence)
- `[CITED: docs.amplify.aws]` Amplify Gen 2 "Build a backend" (auth, data, functions, CDK overrides) — referenced from knowledge, **not fetched this session**.
- `[CITED: AWS Cognito token docs]` refresh-token default 30d / access-id default 1h, max 24h — from knowledge.

### Tertiary (LOW confidence)
- All `[ASSUMED]` code shapes above — training knowledge, must be validated on first `ampx sandbox` + `tsc` run (D-07).

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — correct libraries, versions unverified (couldn't run `npm view`).
- Architecture / patterns: MEDIUM — API shapes from training, not confirmed against current docs.
- Pitfalls (esp. TS2590, token override, auto-confirm): MEDIUM-HIGH — these are well-established Amplify Gen 2 gotchas.
- Budgets CDK: MEDIUM — construct exists; exact props unverified.

**Research date:** 2026 session
**Valid until:** 7 days (Amplify Gen 2 moves fast; re-verify APIs if planning is delayed)

---

## RESEARCH COMPLETE

**Phase:** 1 - Foundation & Authentication
**Confidence:** MEDIUM (strong domain knowledge; NOT live-verified — no tool access this session)

### Key Findings
- Phase 1 is almost entirely declarative Amplify Gen 2 config: `defineAuth` (email/password + pre-sign-up auto-confirm Lambda for D-04), `defineData` (9 models with owner/authenticated rules), one `CfnBudget` CDK block, and ~10 lines of frontend wiring. The only hand-written code is a 5-line Lambda + the budget block.
- The 30-day session (D-05) maps to Cognito's **refresh-token validity**, which is likely already the 30-day default; set it explicitly via a CDK override on the user-pool client (not a `defineAuth` prop).
- **TS2590 "type instantiation excessively deep"** is the headline risk for a 9-model schema and is exactly why D-07 mandates an immediate deploy + `tsc --noEmit`; mitigation is shallow relationships, `skipLibCheck`, and `a.combine()` if needed.
- D-08's "rules the schema can't express" (Message circle-member visibility) → custom-query Lambda with `allow.resource()`; recommend **deferring that Lambda to the chat phase** and keeping `Message` at `allow.authenticated()` with a TODO so Phase 1 deploys clean.
- Validation hinges on live checks against real AWS (SKILL.md §1.3): green `ampx sandbox`, auth round-trip against real Cognito, a **two-account authorization test** (DATA-10), and a visible Budget — not unit tests.

### File NOT Created (tooling limitation)
I had **no Write tool**. The complete `01-RESEARCH.md` content is in this response above the "RESEARCH COMPLETE" line — **please write it to `.planning/phases/01-foundation-authentication/01-RESEARCH.md`.** I also had no Read tool, so field-level model details should be reconciled against `tech design/index.html` and `01-CONTEXT.md` by the planner.

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | MEDIUM | Right libs; versions unverified (no `npm view`) |
| Architecture | MEDIUM | API shapes from training, not live docs |
| Pitfalls | MEDIUM-HIGH | TS2590/token/auto-confirm are established gotchas |

### Open Questions
- Scaffold order (Vite-first vs Amplify-first) in `app/`.
- Exact 9-model field lists (needs `tech design/index.html`, unreadable this session).
- Whether the Message-visibility Lambda is in Phase 1 or the chat phase (recommend defer).

### Ready for Planning
Yes, with the caveat that all `[ASSUMED]` API shapes (9 of them, logged in the Assumptions table) must be confirmed on the first `npx ampx sandbox` + `tsc --noEmit` run — which D-07 already schedules as the first task.
