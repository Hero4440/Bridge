---
plan: 02
title: Cognito auth + auto-confirm pre-sign-up trigger
wave: 2
depends_on: [1]
autonomous: true
files_modified:
  - app/amplify/auth/resource.ts
  - app/amplify/functions/pre-sign-up/resource.ts
  - app/amplify/functions/pre-sign-up/handler.ts
  - app/amplify/functions/pre-sign-up/handler.test.ts
requirements: [AUTH-01, AUTH-03, AUTH-04, INFRA-01]
must_haves:
  - "defineAuth logs in with email + password only, no Cognito custom attributes, no groups (D-02/D-03/D-05)"
  - "A pre-sign-up Lambda trigger sets autoConfirmUser=true (and autoVerifyEmail when email present) so there is NO confirmation-code step (D-04)"
  - "The pre-sign-up handler's auto-confirm logic is covered by a Vitest unit test"
---

<objective>
Define the Cognito user pool via `defineAuth` (email/password login only — all profile data lives in the User DynamoDB model, D-02/D-03), and a pre-sign-up Lambda trigger that auto-confirms every user so there is no email-verification / confirmation-code flow (D-04). Every account is equal — no Cognito groups (D-05). Unit-test the handler's pure logic. The 30-day refresh-token override lives in backend.ts (Plan 04) because it is a CDK override on the generated client.
</objective>

<threat_model>
- T-1-03 | No email verification (D-04 accepted tradeoff) lets anyone register any email address (spoofing / spam) | STRIDE:Spoofing | severity:med | mitigation: ACCEPTED for Phase 1 per D-04 — handler comment + README AI/architecture note record the tradeoff and flag a future rate-limit; not a Phase 1 blocker
- T-1-04 | Profile PII (names, interests, trusted person) stored in Cognito custom attributes would widen the PII blast radius | STRIDE:Information Disclosure | severity:med | mitigation: task 2-02-01 stores email+password ONLY in Cognito; profile goes to the owner-scoped User model (Plan 03), per D-02/D-03
- T-1-05 | Over-privileged auth trigger Lambda | STRIDE:Elevation of Privilege | severity:low | mitigation: pre-sign-up handler does no AWS calls and gets only its default execution role (no added IAM); no `*` policies
</threat_model>

<task id="2-02-01">
  <action>
Write `app/amplify/auth/resource.ts` with a file-header comment and email login + the pre-sign-up trigger wired in (RESEARCH Pattern 1). No custom attributes, no groups:
```ts
// app/amplify/auth/resource.ts
// Cognito user pool for Bridge. Email + password login only (D-02/D-03 — all
// profile data lives in the User DynamoDB model). Every account is equal: no
// groups (D-05). A pre-sign-up trigger auto-confirms users so there is no
// confirmation-code UI (D-04). 30-day refresh token is set in backend.ts.
import { defineAuth } from '@aws-amplify/backend';
import { preSignUp } from '../functions/pre-sign-up/resource';

export const auth = defineAuth({
  loginWith: { email: true },
  triggers: { preSignUp },
});
```
Confirm against the Amplify Gen 2 docs that `triggers.preSignUp` is the correct key (RESEARCH tags Pattern 1 [ASSUMED]); if the installed version differs, use the documented key and note it in the file comment.
  </action>
  <read_first>app/amplify/auth/resource.ts; 01-CONTEXT.md (D-02, D-03, D-04, D-05); 01-RESEARCH.md (Pattern 1); .claude/skills/bridge/SKILL.md (§1.4 auth)</read_first>
  <acceptance_criteria>
- `grep -q 'loginWith: { email: true }' app/amplify/auth/resource.ts`
- `grep -q 'triggers:' app/amplify/auth/resource.ts` and `grep -q 'preSignUp' app/amplify/auth/resource.ts`
- `grep -vq 'customAttributes\|userAttributes\|groups' app/amplify/auth/resource.ts` (no custom attributes / groups)
- `head -1 app/amplify/auth/resource.ts` begins with `//`
  </acceptance_criteria>
</task>

<task id="2-02-02">
  <action>
Create the pre-sign-up function resource and handler (RESEARCH Pattern 1, D-04).
`app/amplify/functions/pre-sign-up/resource.ts`:
```ts
// app/amplify/functions/pre-sign-up/resource.ts
// Registers the pre-sign-up trigger Lambda so Cognito auto-confirms new users
// (D-04 — no email verification / confirmation-code UI in Phase 1).
import { defineFunction } from '@aws-amplify/backend';
export const preSignUp = defineFunction({ name: 'pre-sign-up' });
```
`app/amplify/functions/pre-sign-up/handler.ts`:
```ts
// app/amplify/functions/pre-sign-up/handler.ts
// D-04: auto-confirm every signup so there is no confirmation-code step.
// Also auto-verify email when Cognito supplied one. Does NO AWS calls — pure
// response mutation, so the function needs no extra IAM. ACCEPTED TRADEOFF:
// skipping verification means anyone can register any email (see README).
import type { PreSignUpTriggerHandler } from 'aws-lambda';
export const handler: PreSignUpTriggerHandler = async (event) => {
  event.response.autoConfirmUser = true;
  if (event.request.userAttributes?.email) {
    event.response.autoVerifyEmail = true;
  }
  return event;
};
```
  </action>
  <read_first>01-CONTEXT.md (D-04); 01-RESEARCH.md (Pattern 1); app/amplify/functions/pre-sign-up/</read_first>
  <acceptance_criteria>
- `test -f app/amplify/functions/pre-sign-up/resource.ts` and `test -f app/amplify/functions/pre-sign-up/handler.ts`
- `grep -q 'autoConfirmUser = true' app/amplify/functions/pre-sign-up/handler.ts`
- `grep -q 'autoVerifyEmail = true' app/amplify/functions/pre-sign-up/handler.ts`
- `grep -q 'PreSignUpTriggerHandler' app/amplify/functions/pre-sign-up/handler.ts`
- both files start with a `//` header comment
  </acceptance_criteria>
</task>

<task id="2-02-03" tdd="true">
  <action>
Write a Vitest unit test for the handler's pure logic (validation Wave 0). Build a minimal event, invoke the handler, assert the response.
<behavior>
- Given an event with `request.userAttributes.email` set, response has `autoConfirmUser === true` AND `autoVerifyEmail === true`.
- Given an event with NO email attribute, response has `autoConfirmUser === true` and `autoVerifyEmail` left falsy/undefined.
</behavior>
`app/amplify/functions/pre-sign-up/handler.test.ts`:
```ts
// Unit test for the pre-sign-up trigger: proves D-04 auto-confirm behavior.
import { describe, it, expect } from 'vitest';
import { handler } from './handler';
const base = (email?: string) => ({
  response: {} as Record<string, unknown>,
  request: { userAttributes: email ? { email } : {} },
}) as unknown as Parameters<typeof handler>[0];
describe('pre-sign-up', () => {
  it('auto-confirms and verifies when email present', async () => {
    const e = await handler(base('sam@example.com'), {} as never, () => {});
    expect((e as any).response.autoConfirmUser).toBe(true);
    expect((e as any).response.autoVerifyEmail).toBe(true);
  });
  it('auto-confirms without email, no verify', async () => {
    const e = await handler(base(), {} as never, () => {});
    expect((e as any).response.autoConfirmUser).toBe(true);
    expect((e as any).response.autoVerifyEmail).toBeFalsy();
  });
});
```
Use the made-up name `sam@example.com` (SKILL §4 — no real participant data).
  </action>
  <read_first>app/amplify/functions/pre-sign-up/handler.ts; app/vitest.config.ts</read_first>
  <acceptance_criteria>
- `cd app && npx vitest run amplify/functions/pre-sign-up/handler.test.ts` exits 0 with 2 passing tests
- `grep -q 'sam@example.com' app/amplify/functions/pre-sign-up/handler.test.ts` (no real emails)
  </acceptance_criteria>
</task>

<verification>
`cd app && npx vitest run amplify/functions/pre-sign-up/handler.test.ts && npx tsc --noEmit`. Expected: 2 tests pass, tsc exits 0. `grep -c 'loginWith: { email: true }' amplify/auth/resource.ts` returns 1. Full auth round-trip against real Cognito is proven in Plan 05 after deploy.
</verification>
