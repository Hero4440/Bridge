---
phase: 04-real-time-chat
plan: 04
type: execute
wave: 3
depends_on: [1, 2, 3]
files_modified:
  - app/scripts/verify-phase4.ts
autonomous: false
requirements: [CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07]

must_haves:
  truths:
    - "The sandbox deploys and a live harness proves real-time delivery, groupId isolation, last-50, cached daily topic, and chips against real AWS"
    - "Account A's observeQuery receives a message posted by account B with no polling (CHAT-02)"
    - "A second getDailyTopic call returns the same cached row — one Bedrock call per circle per day (CHAT-05 cost guard)"
  artifacts:
    - path: "app/scripts/verify-phase4.ts"
      provides: "End-to-end two-account live harness for CHAT-01..07"
      contains: "verify-phase4"
  key_links:
    - from: "app/scripts/verify-phase4.ts"
      to: "live sandbox AppSync/DynamoDB/Lambda/Bedrock"
      via: "observeQuery + custom queries as two signed-in test users"
      pattern: "observeQuery"
---

<objective>
Prove Phase 4 end-to-end against real AWS: deploy the sandbox, seed the circles, then run a harness that asserts message persistence, real-time cross-account delivery via observeQuery (no polling), groupId filter isolation, last-50 history, the cached AI daily topic (same row on the second call = cost guard), starter-chip suggestions, and an observable AppSync connection state. This is the gate CHAT-01…CHAT-07 are signed off against (screens polished in Phase 6).

Purpose: unit tests cover pure logic; durability, real-time subscription delivery, the Topic cache, and the Bedrock daily topic can only be confirmed live (nothing mocked).
Output: `app/scripts/verify-phase4.ts` and a passing live run.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-real-time-chat/04-CONTEXT.md
@.planning/phases/04-real-time-chat/04-RESEARCH.md
@.planning/phases/04-real-time-chat/04-VALIDATION.md
@app/scripts/verify-phase3.ts
@app/src/lib/messages.ts
@app/src/lib/topics.ts
@app/src/lib/chips.ts
@app/scripts/seed/circles.ts

<interfaces>
<!-- Mirror verify-phase3.ts: Amplify.configure(outputs), two made-up accounts, assert() counter, PHASE4 VERIFY: PASS, exit non-zero on failure. -->
<!-- Real-time test: A subscribes via observeMessages; B sends; assert A's callback receives B's message within a timeout. -->
<!-- Cache test: call getDailyTopic twice; assert identical text AND exactly one Topic row for groupId+date. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 4-04-01: Write verify-phase4.ts end-to-end harness</name>
  <files>app/scripts/verify-phase4.ts</files>
  <read_first>
    - Read app/scripts/verify-phase3.ts for the auth/assert/exit harness pattern (two accounts, PASS marker).
    - Read app/src/lib/messages.ts, topics.ts, chips.ts for the helper signatures to call (not re-implement).
    - Read app/scripts/seed/circles.ts for the seeded groupIds/slugs to target.
  </read_first>
  <action>
    Create `app/scripts/verify-phase4.ts` with a why-comment, mirroring verify-phase3.ts. As two made-up accounts, assert each step and exit non-zero on first failure:
    1. CHAT-01: `sendMessage({ groupId, content, senderId })` as A persists; the row reads back.
    2. CHAT-02 (real-time, no polling): A opens `observeMessages(groupId, cb)`; B sends a message to the same groupId; assert A's callback receives B's message within a bounded wait (e.g. 10s). Unsubscribe after.
    3. CHAT-04: post to two different groupIds; assert A's observeMessages(groupId1) snapshot contains only group1 messages (filter isolation).
    4. CHAT-07: ensure >50 messages exist in a test circle (send in a loop if needed); assert the observed snapshot length is exactly 50 and they are the newest.
    5. CHAT-05: `getDailyTopic(groupId)` returns a topic; call it AGAIN and assert identical `text`; scan the Topic table for groupId+today and assert exactly ONE row (cost guard); assert `fallback === false` (Bedrock up).
    6. CHAT-06: `suggestForChip('ask', circleName, topic)` returns ≥1 suggestion with `fallback === false`; `suggestForChip('own', ...)` returns an empty suggestions array (blank composer).
    7. CHAT-03: register `onConnectionChange` (or Hub.listen) and assert at least one connection-state event (e.g. reaching 'online') is received during the run.
    Print `PHASE4 VERIFY: PASS` only when all assertions pass; else exit non-zero with the failing message. No mocks.
  </action>
  <verify>
    <automated>cd app && grep -Eq "sendMessage" scripts/verify-phase4.ts && grep -Eq "observeMessages|observeQuery" scripts/verify-phase4.ts && grep -Eq "getDailyTopic" scripts/verify-phase4.ts && grep -Eq "suggestForChip|previewReplies" scripts/verify-phase4.ts && grep -Eq "PHASE4 VERIFY: PASS" scripts/verify-phase4.ts && grep -Eic "mock|stub|fake" scripts/verify-phase4.ts | grep -q '^0$'</automated>
  </verify>
  <acceptance_criteria>
    - Harness references `sendMessage`, `observeMessages`/`observeQuery`, `getDailyTopic`, and the chip/preview call, plus the groupId-isolation and cache steps (grep each ≥1)
    - Contains the literal success marker `PHASE4 VERIFY: PASS`
    - Asserts the daily-topic cache: a comment/assert that the second call returns the same row / exactly one Topic row (grep for a count/`length` assertion near the Topic scan)
    - No mock/stub/fake of AWS services: `grep -Eic "mock|stub|fake" scripts/verify-phase4.ts` = 0
  </acceptance_criteria>
  <done>Live harness written: real-time delivery + filter isolation + last-50 + cached topic + chips + connection state; exits non-zero on failure.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4-04-02: Deploy, seed, and run the live verification</name>
  <what-built>
    Phase 4 chat data layer (Group/Topic models + Message GSI, dailyTopic Lambda + getDailyTopic query, messages/connection/chips/topics client libs) plus the verify-phase4.ts harness. This checkpoint deploys to the real sandbox, seeds the circles, and runs the harness — it can't be fully automated because `npx ampx sandbox` needs live AWS SSO credentials and the `$amplify/env/dailyTopic` import only resolves after deploy.
  </what-built>
  <how-to-verify>
    1. `aws sts get-caller-identity` shows the correct account + region (us-east-1).
    2. `cd app && npx ampx sandbox --once` deploys cleanly (resolves the `$amplify/env/dailyTopic` import) and regenerates `amplify_outputs.json` (do NOT commit it).
    3. `cd app && npx tsx scripts/seed/circles.ts` creates the 6 circles (idempotent — safe to re-run).
    4. `cd app && npx vitest run` → all green.
    5. `cd app && npx tsx scripts/verify-phase4.ts` → final line `PHASE4 VERIFY: PASS`, exit 0.
    6. `aws logs tail /aws/lambda/<dailyTopic-fn> --since 10m` shows only labels/fallback — NO topic or message content.
  </how-to-verify>
  <resume-signal>Type "approved" once `PHASE4 VERIFY: PASS` prints with exit 0, the daily-topic cache shows one row/circle/day, and logs carry no content — or paste the failing assertion/log output.</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| Test user A ↔ test user B | Cross-account real-time delivery + groupId isolation |
| Lambda logs → operators | Logs must not carry topic/message content |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-01 | Information Disclosure | Polling instead of subscriptions | mitigate | Harness asserts A receives B's message via observeQuery (push), not a poll loop. |
| T-04-02 | Information Disclosure | Cross-circle message leakage | mitigate | Harness asserts groupId filter returns only that circle's messages. |
| T-04-03 | Cost / DoS | Daily topic regenerating per open | mitigate | Harness asserts the 2nd getDailyTopic returns the same row and exactly one Topic row exists for groupId+date. |
| T-04-04 | Information Disclosure | Topic/message content in logs | mitigate | Checkpoint step 6 confirms logs carry labels/fallback only. |
</threat_model>

<verification>
- `npx ampx sandbox --once` deploys cleanly (resolves `$amplify/env/dailyTopic`).
- `npx tsx scripts/seed/circles.ts` seeds the 6 circles idempotently.
- `npx vitest run` all green.
- `npx tsx scripts/verify-phase4.ts` prints `PHASE4 VERIFY: PASS`, exit 0.
- dailyTopic logs carry no content; CHAT-02/04/05/07 assertions pass live.
</verification>

<success_criteria>
- Sandbox deploys; end-to-end harness passes against real AWS (no mocks).
- Real-time cross-account delivery (no polling), groupId isolation, last-50 history all hold live.
- Daily topic AI-generated and cached (one row/circle/day); chips return editable suggestions.
- All seven CHAT requirements verified live.
</success_criteria>

<output>
After completion, create `.planning/phases/04-real-time-chat/04-04-SUMMARY.md`.
</output>
