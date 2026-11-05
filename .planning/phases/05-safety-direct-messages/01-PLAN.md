---
phase: 05-safety-direct-messages
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/amplify/data/resource.ts
autonomous: true
requirements: [DM-02, SAFE-04]

must_haves:
  truths:
    - "A first-contact message can be stored as a held request with a trustworthy unsafe flag, separate from delivered thread messages"
    - "A report can be persisted as an owner-scoped record for team review"
  artifacts:
    - path: "app/amplify/data/resource.ts"
      provides: "MessageRequest + Report models"
      contains: "MessageRequest"
  key_links:
    - from: "MessageRequest/Report models"
      to: "DynamoDB via Amplify Data"
      via: "a.model(...) in the schema"
      pattern: "MessageRequest: a"
---

<objective>
Add the two new models Phase 5 needs: `MessageRequest` (holds a first-contact message + classification flag + status) and `Report` (owner-scoped abuse report for team review). DMs themselves reuse the existing `Message` model with a `dm#` thread key, so no `Message` schema change.

Purpose: the request-hold (DM-02) and report record (SAFE-04) need persisted shapes before the safety Lambdas (Plan 02) and client (Plan 03) can use them.
Output: updated `app/amplify/data/resource.ts`.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-safety-direct-messages/05-CONTEXT.md
@.planning/phases/05-safety-direct-messages/05-RESEARCH.md
@app/amplify/data/resource.ts

<interfaces>
<!-- MessageRequest: allow.authenticated() read; writes happen only via the Plan 02 Lambdas (granted at schema level). -->
<!-- Report: allow.owner() by reporter; team reviews rows (no moderator role). -->
<!-- DMs reuse Message (groupId = dm#<sorted uid pair>) — do NOT add a DM model. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 5-01-01: Add MessageRequest + Report models</name>
  <files>app/amplify/data/resource.ts</files>
  <read_first>
    - Read app/amplify/data/resource.ts — match the a.model(...) style, the `allow.owner()` / `allow.authenticated()` conventions, the enum style, and where Group/Topic were added (Phase 4).
    - Read 05-RESEARCH.md "Models that exist vs new" + "Design" for the exact field lists and why writes are Lambda-only.
  </read_first>
  <action>
    In the schema object in `app/amplify/data/resource.ts`, after the Phase 4 Group/Topic models (before the Phase 2 custom-query section), add:
    1. `MessageRequest`: `{ fromUserId: a.string().required(), toUserId: a.string().required(), firstMessage: a.string().required(), status: a.enum(['pending','accepted','declined']), unsafe: a.boolean(), createdAt: a.datetime() }` with `.authorization((allow) => [allow.authenticated()])` and a why-comment (held first-contact message; writes via the Plan 02 sendDm/respondToRequest Lambdas; DM-02/SAFE-01).
    2. `Report`: `{ reporterId: a.string(), targetType: a.enum(['message','user']), targetId: a.string(), reason: a.string(), createdAt: a.datetime() }` with `.authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])])` and a why-comment (SAFE-04; team reviews, no moderator role).
    Do NOT register any custom mutation here (that is Plan 02). Do NOT modify Message.
  </action>
  <verify>
    <automated>cd app && grep -Eq "MessageRequest: a" amplify/data/resource.ts && grep -Eq "Report: a" amplify/data/resource.ts && grep -Eq "firstMessage" amplify/data/resource.ts && grep -Eq "targetType" amplify/data/resource.ts && npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep -v "node_modules" | head</automated>
  </verify>
  <acceptance_criteria>
    - `resource.ts` contains `MessageRequest: a` and `Report: a` (grep each ≥1)
    - MessageRequest has `fromUserId`, `toUserId`, `firstMessage`, `status`, `unsafe` (grep each ≥1)
    - Report has `targetType` and `reason` (grep each ≥1)
    - `Message` model is unchanged (no new field added): `grep -c "groupId: a.string().required()" amplify/data/resource.ts` = 1
    - `npx tsc --noEmit -p tsconfig.app.json` exit 0
  </acceptance_criteria>
  <done>MessageRequest + Report models added; Message untouched; app typechecks.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| Sender ↔ recipient | A held request is visible to both but actionable only by the recipient (enforced in Plan 02 Lambda) |
| Reporter ↔ reported | Report rows are owner-scoped to the reporter |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-05-07 | Tampering | Client forging an `unsafe:false` request | mitigate | Writes are Lambda-only (Plan 02 sets `unsafe` from classify); authenticated read only. |
| T-05-08 | Information Disclosure | Report contents leaking to the reported user | mitigate | Report is `allow.owner()` by the reporter. |
</threat_model>

<verification>
- MessageRequest + Report present with the specified fields (grep).
- Message unchanged.
- `npx tsc --noEmit -p tsconfig.app.json` exit 0.
</verification>

<success_criteria>
- MessageRequest (held first message + unsafe flag + status) and Report (owner-scoped) models exist.
- Message reused for DMs (no schema change); app typechecks.
</success_criteria>

<output>
After completion, create `.planning/phases/05-safety-direct-messages/05-01-SUMMARY.md`.
</output>
