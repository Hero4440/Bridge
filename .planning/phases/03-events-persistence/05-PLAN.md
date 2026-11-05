---
phase: 03-events-persistence
plan: 05
type: execute
wave: 3
depends_on: [2, 3, 4]
files_modified:
  - app/scripts/verify-phase3.ts
autonomous: false
requirements: [EVENT-01, EVENT-02, EVENT-03, EVENT-04, EVENT-05, EVENT-06, EVENT-07]

must_haves:
  truths:
    - "The sandbox deploys and an end-to-end harness proves create→list→RSVP→counts→reflection→PracticeRun against real AWS"
    - "A PracticeRun is persisted with no transcript field present"
    - "Two-account isolation holds: B reads A's Event but cannot read A's Reflection/PracticeRun and cannot update A's Event"
  artifacts:
    - path: "app/scripts/verify-phase3.ts"
      provides: "End-to-end integration harness against the live sandbox + two-account isolation assertions"
      contains: "verify-phase3"
  key_links:
    - from: "app/scripts/verify-phase3.ts"
      to: "live sandbox AppSync/DynamoDB/Lambda/Bedrock"
      via: "generateClient + custom queries as a signed-in test user"
      pattern: "generateClient"
---

<objective>
Prove Phase 3 end-to-end against real AWS: deploy the sandbox, then run an integration harness that creates an event, lists/gets it, sets and re-reads RSVP, computes counts, saves a reflection with a warm reply, confirms PracticeRun persistence with no transcript, and validates two-account isolation. This is the verification harness EVENT-01…EVENT-07 are signed off against (screens polished in Phase 6).

Purpose: Unit tests cover pure logic; nothing is mocked, so durability, the `$amplify/env` practice persistence, owner-only isolation, and the warm/fallback reply can only be confirmed live. This plan is the gate.
Output: `app/scripts/verify-phase3.ts` and a passing live run.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-events-persistence/03-CONTEXT.md
@app/src/lib/data.ts
@app/src/lib/rsvp.ts
@app/src/lib/reflection.ts
@app/src/lib/prep.ts

<interfaces>
<!-- Reuse the Plan 01-03 libraries (data.ts, rsvp.ts, reflection.ts, prep.ts) and the Plan 04 reflectReply query. -->
<!-- The harness authenticates two seeded test users (made-up names per team rule) via the Phase 1/2 auth path. -->
<!-- No mock users, no mock data: it writes to the real sandbox DynamoDB/Cognito and calls real Bedrock. -->
```typescript
// Assertion shape (exit non-zero on any failure so CI/grep can gate):
function assert(cond: boolean, msg: string): void;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 3-05-01: Write end-to-end verify-phase3.ts harness</name>
  <files>app/scripts/verify-phase3.ts</files>
  <read_first>
    - Read app/src/lib/data.ts, rsvp.ts, reflection.ts (from Plans 01-03) and the reflectReply/practice contracts (Plan 04) so the harness calls the real helpers, not re-implementations.
    - Read app/src/lib/auth.ts and any Phase 2 integration/seed script to copy how a test user signs in programmatically (Cognito). Use made-up names only (e.g. Sam, Jordan) per team rules — never real participant data or credentials in the file.
    - Read scripts/seed/ if present for the idempotent seed pattern to create the two test accounts.
  </read_first>
  <action>
    Create `app/scripts/verify-phase3.ts` with a why-comment. As signed-in test user A (created idempotently, made-up name), run the happy path and assert each step, exiting non-zero on the first failure:
    1. EVENT-01/02: `createEvent(...)` with full wizard fields → `getEvent(id)` returns the same fields (persistence/refresh survival).
    2. EVENT-03/04: `setRsvp(eventId,'going')`, re-read; `setRsvp(eventId,'maybe')` again and assert the RSVP record count for A on that event is exactly 1 (no duplicate — the in-memory bug fix) and status is now 'maybe'.
    3. EVENT-05: `countRsvps(listRsvpsForEvent(eventId))` returns the expected `{going,maybe,cant}`.
    4. EVENT-06: assert `prepFor(event.format)` and `whatToExpect(event)` return non-empty host-derived content (no AI call made).
    5. EVENT-07: `saveReflection({feeling:'good', wins:[...]})` persists owner-only and returns a reply; assert the reflection is saved AND either a warm reply or `fallback:true` is returned.
    6. D-04: call the practice query as A, then assert a PracticeRun row exists for A with scenarioId/level/strength/tip/fallback and assert the returned/persisted object has NO transcript-like field (fail if any `transcript`/raw message field is populated).
    Then two-account isolation as signed-in test user B (second made-up account):
    7. Assert B CAN read A's Event (authenticated read).
    8. Assert B CANNOT read A's Reflection (owner-only → empty/denied).
    9. Assert B CANNOT read A's PracticeRun (owner-only → empty/denied).
    10. Assert B CANNOT update A's Event (owner-write → error/denied).
    Print a final `PHASE3 VERIFY: PASS` line only when all assertions pass; otherwise exit non-zero with the failing assertion message. No mocks anywhere.
  </action>
  <verify>
    <automated>cd app && grep -Eq "createEvent|getEvent" scripts/verify-phase3.ts && grep -Eq "setRsvp" scripts/verify-phase3.ts && grep -Eq "countRsvps" scripts/verify-phase3.ts && grep -Eq "saveReflection" scripts/verify-phase3.ts && grep -Eq "PracticeRun" scripts/verify-phase3.ts && grep -Eq "PHASE3 VERIFY: PASS" scripts/verify-phase3.ts && grep -Eiq "transcript" scripts/verify-phase3.ts</automated>
  </verify>
  <acceptance_criteria>
    - Harness references `createEvent`/`getEvent`, `setRsvp`, `countRsvps`, `saveReflection`, `PracticeRun`, and the two-account isolation steps (grep each ≥1)
    - File contains the literal success marker `PHASE3 VERIFY: PASS`
    - File asserts transcript absence (grep -i "transcript" ≥1, used in a negative assertion)
    - No mock/stub of AWS services present: `grep -Ec "mock|stub|fake" app/scripts/verify-phase3.ts` = 0
  </acceptance_criteria>
  <done>Integration harness written: happy path + no-transcript + two-account isolation, exits non-zero on failure.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3-05-02: Deploy sandbox and run the live verification</name>
  <what-built>
    Phase 3 data layer (Event fields + typed client, RSVP upsert + reducer, prep template, reflection save, reflectReply query, PracticeRun persistence) plus the `verify-phase3.ts` end-to-end harness. This checkpoint deploys to the real sandbox and runs the harness — it cannot be fully automated because `npx ampx sandbox` requires live AWS SSO credentials, and the `$amplify/env/practice` import only resolves after deploy.
  </what-built>
  <how-to-verify>
    1. Authenticate to AWS: `aws sso login` then confirm `aws sts get-caller-identity` shows the correct account and region (us-east-1).
    2. Deploy your personal sandbox: `cd app && npx ampx sandbox` and wait for it to finish (this is where the `$amplify/env/practice` import in the practice handler is resolved — a successful deploy IS the tsc gate for that handler).
    3. Confirm `amplify_outputs.json` was generated locally (do NOT commit it).
    4. Run the Vitest units once more against the tree: `cd app && npx vitest run` → all green.
    5. Run the harness as the signed-in test users: `cd app && npx tsx scripts/verify-phase3.ts` (or the repo's configured runner). Expect the final line `PHASE3 VERIFY: PASS` and exit code 0.
    6. Tail the practice/reflectReply logs and confirm NO message content is logged: `aws logs tail /aws/lambda/<practice-fn> --since 5m` shows only request id / labels / fallback.
    7. Confirm the two-account isolation assertions passed inside the harness output (B read A's Event; B denied A's Reflection and PracticeRun; B denied updating A's Event).
  </how-to-verify>
  <resume-signal>Type "approved" once `PHASE3 VERIFY: PASS` prints with exit 0, logs show no message content, and isolation assertions pass — or paste the failing assertion/log output.</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Test user A ↔ test user B | Cross-user access attempts against owner-only data |
| Lambda logs → operators | Logs must not carry message content |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-14 | Information Disclosure | Cross-user read of Reflection / PracticeRun | mitigate | Harness asserts B cannot read A's Reflection or PracticeRun (owner-only auth). Failure exits non-zero and blocks sign-off. |
| T-03-15 | Tampering | Non-owner updates another user's Event | mitigate | Harness asserts B cannot update A's Event (owner-write auth). |
| T-03-16 | Information Disclosure | Transcript / message content in DynamoDB or logs | mitigate | Harness asserts PracticeRun has no transcript field; checkpoint step 6 confirms logs carry only request id / labels / fallback. |
| T-03-17 | Spoofing | Credentials or real participant data in the repo | mitigate | Test accounts are seeded idempotently with made-up names; no keys/`.env`/`amplify_outputs.json` committed; AWS access via SSO/`~/.aws` only. |
</threat_model>

<verification>
- `cd app && npx ampx sandbox` deploys cleanly (this resolves and type-checks the `$amplify/env/practice` import in the practice handler).
- `cd app && npx vitest run` all green.
- `cd app && npx tsx scripts/verify-phase3.ts` prints `PHASE3 VERIFY: PASS`, exit 0.
- Logs for practice/reflectReply contain no message content.
- All four isolation assertions (T-03-14, T-03-15) pass inside the harness.
</verification>

<success_criteria>
- Sandbox deploys; end-to-end harness passes against real AWS (no mocks).
- PracticeRun persists with no transcript; reflection reply warm or fallback.
- Two-account isolation holds (B reads A's Event; denied A's Reflection/PracticeRun; cannot update A's Event).
- All seven EVENT requirements verified live.
</success_criteria>

<output>
After completion, create `.planning/phases/03-events-persistence/03-05-SUMMARY.md`.
</output>
