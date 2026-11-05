---
phase: 04-real-time-chat
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/amplify/data/resource.ts
  - app/scripts/seed/circles.ts
autonomous: true
requirements: [CHAT-01, CHAT-04, CHAT-07]

must_haves:
  truths:
    - "The 6 circles exist as real DynamoDB Group rows (no constant arrays), created by an idempotent seed script"
    - "Message is queryable/subscribable filtered by groupId with authenticated access, and a Topic model exists for cached daily topics"
    - "Messages can be ordered newest-first for the last-50 history query"
  artifacts:
    - path: "app/amplify/data/resource.ts"
      provides: "Group + Topic models, Message groupId required + explicit sort field + messagesByGroup GSI"
      contains: "Topic"
    - path: "app/scripts/seed/circles.ts"
      provides: "Idempotent, Cognito-authenticated seed of the 6 Group rows with made-up names"
      contains: "Group"
  key_links:
    - from: "app/scripts/seed/circles.ts"
      to: "live DynamoDB Group table"
      via: "generateClient + signIn as a test user"
      pattern: "generateClient"
---

<objective>
Add the data foundation for circle chat: a `Group` model (makes the 6 circles real data), a `Topic` model (cached daily topic, composite id `['groupId','date']`), and tighten `Message` so it can be queried/subscribed by `groupId` and ordered newest-first for the last-50 history load. Seed the 6 circles idempotently into real DynamoDB.

Purpose: the prototype used constant arrays for circles — the no-mock rule (§1.3) requires real rows. CHAT-04 needs groupId-scoped access; CHAT-07 needs newest-first ordering. The Topic model's composite id is the cost guard for the AI daily topic (one row per circle per day).
Output: updated `app/amplify/data/resource.ts` + `app/scripts/seed/circles.ts`.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-real-time-chat/04-CONTEXT.md
@.planning/phases/04-real-time-chat/04-RESEARCH.md
@app/amplify/data/resource.ts
@app/src/lib/data.ts
@app/scripts/verify-phase3.ts

<interfaces>
<!-- Keep Message on allow.authenticated() — owner-auth would break group subscription delivery (RESEARCH pitfall). -->
<!-- Topic identifier(['groupId','date']) makes get() a point read and create race-safe → one Bedrock call/circle/day. -->
<!-- Group read by all authenticated users; seeded, not user-created. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 4-01-01: Add Group + Topic models and tighten Message in the schema</name>
  <files>app/amplify/data/resource.ts</files>
  <read_first>
    - Read app/amplify/data/resource.ts in full — match the existing a.model(...) style, the `allow.authenticated()` / `allow.owner()` conventions, and the schema-level `.authorization((allow) => [allow.resource(practice)])` at the end.
    - Read 04-RESEARCH.md "New models" + "Current Message model" + "Secondary index on Message" for exact syntax.
  </read_first>
  <action>
    In the schema object in `app/amplify/data/resource.ts`:
    1. Change `Message` so `groupId` is `a.string().required()`, add `createdAtMs: a.integer()` (explicit sort value — implicit createdAt can't be a GSI sort key), KEEP `allow.authenticated()`, and add a secondary index:
       `.secondaryIndexes((index) => [index('groupId').sortKeys(['createdAtMs']).queryField('messagesByGroup')])`.
       Keep the existing `TODO(phase-chat)` comment but update it to say member-only visibility (D-08) is DEFERRED TO PHASE 5.
    2. Add a `Group` model: `{ name: a.string().required(), slug: a.string(), description: a.string(), emoji: a.string() }` with `.authorization((allow) => [allow.authenticated()])` and a one-line why-comment (DATA: the 6 circles as real data).
    3. Add a `Topic` model: `{ groupId: a.string().required(), date: a.string().required(), text: a.string().required(), fallback: a.boolean() }` with `.identifier(['groupId','date'])` and `.authorization((allow) => [allow.authenticated()])` and a why-comment (cached daily topic, one row/circle/day).
    Do NOT register the getDailyTopic query here — that lands in Plan 02 with its Lambda.
  </action>
  <verify>
    <automated>cd app && grep -Eq "Group: a" amplify/data/resource.ts && grep -Eq "Topic: a" amplify/data/resource.ts && grep -Eq "identifier\(\['groupId', ?'date'\]\)" amplify/data/resource.ts && grep -Eq "messagesByGroup" amplify/data/resource.ts && grep -Eq "createdAtMs" amplify/data/resource.ts</automated>
  </verify>
  <acceptance_criteria>
    - `resource.ts` contains `Group: a` and `Topic: a` model definitions (grep each ≥1)
    - `resource.ts` contains `identifier(['groupId','date'])` on Topic (grep ≥1)
    - `resource.ts` contains `messagesByGroup` and `createdAtMs` for the Message GSI (grep each ≥1)
    - Message authorization still contains `allow.authenticated()` (grep ≥1) — NOT switched to owner
    - `npx tsc --noEmit -p amplify/tsconfig.json` shows no NEW errors other than the documented `$amplify/env` caveat (which this plan does not touch)
  </acceptance_criteria>
  <done>Group + Topic models added; Message groupId required + GSI + explicit sort field; Message stays authenticated.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4-01-02: Idempotent seed script for the 6 circles</name>
  <files>app/scripts/seed/circles.ts</files>
  <read_first>
    - Read app/scripts/verify-phase3.ts for the `Amplify.configure(outputs)` + `generateClient<Schema>()` + signIn(`Passw0rd!Test`) pattern (schema is Cognito-only, so the seed must authenticate).
    - Read 04-RESEARCH.md "Seeding" and SKILL §2.2 for the 6 circle names (Gaming, Music, Anime, Cooking, Art, Tech).
  </read_first>
  <action>
    Create `app/scripts/seed/circles.ts` with a why-comment. It must:
    1. `Amplify.configure(outputs)`, `generateClient<Schema>()`, sign in as the made-up test account `sam@example.com` / `Passw0rd!Test` (same creds as the verify harness).
    2. Define the 6 circles with made-up names + emoji + a short description: Gaming, Music, Anime, Cooking, Art, Tech.
    3. For each: `list` Groups filtered by `slug`; `create` only if absent (idempotent upsert — safe to re-run). Never duplicate rows.
    4. Log a one-line summary (created vs already-present counts). Exit 0 on success, non-zero on error.
    5. No hardcoded secrets; made-up names only (§1.3 / §4). Run with `cd app && npx tsx scripts/seed/circles.ts` after deploy.
  </action>
  <verify>
    <automated>cd app && test -f scripts/seed/circles.ts && grep -Eq "generateClient" scripts/seed/circles.ts && grep -Eq "Gaming|Music|Anime|Cooking|Art|Tech" scripts/seed/circles.ts && grep -Eq "models.Group" scripts/seed/circles.ts && grep -Eiqv "AKIA|secret" scripts/seed/circles.ts</automated>
  </verify>
  <acceptance_criteria>
    - `app/scripts/seed/circles.ts` exists and references `generateClient`, `models.Group`, and the 6 circle names (grep each ≥1)
    - Script is idempotent: contains a list/exists check before create (grep for `list` ≥1)
    - No secrets/keys literal in the file (`grep -Eic "AKIA|aws_secret" scripts/seed/circles.ts` = 0)
    - `npx tsc --noEmit -p tsconfig.app.json` type-checks the file (no new errors)
  </acceptance_criteria>
  <done>Idempotent, authenticated seed creates the 6 real Group rows; safe to re-run.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| Signed-in user ↔ Message/Group/Topic tables | All authenticated users share circles (open circles, D-01) |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-05 | Spoofing | Seed script credentials / real data in repo | mitigate | Seed authenticates via a made-up test account; no keys in the file; made-up circle names only (§1.3/§4). |
| T-04-06 | Tampering | Unbounded message read exposing other circles | mitigate | groupId-required + GSI scope queries to one circle; CHAT-04 isolation verified live in Plan 04. |
</threat_model>

<verification>
- `npx tsc --noEmit -p amplify/tsconfig.json` and `-p tsconfig.app.json` show no new errors (beyond the documented `$amplify/env` caveat, untouched here).
- Group + Topic models and the Message GSI present (grep).
- Seed script idempotent and secret-free (grep).
- Live seed run is exercised in Plan 04 after deploy.
</verification>

<success_criteria>
- Group + Topic models and the groupId/createdAtMs Message GSI exist; Message stays `allow.authenticated()`.
- The 6 circles seed idempotently into real DynamoDB with made-up names.
- No secrets; schema type-checks.
</success_criteria>

<output>
After completion, create `.planning/phases/04-real-time-chat/04-01-SUMMARY.md`.
</output>
