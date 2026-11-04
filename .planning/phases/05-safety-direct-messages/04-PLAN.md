---
phase: 05-safety-direct-messages
plan: 04
type: execute
wave: 4
depends_on: [1, 2, 3]
files_modified:
  - app/scripts/verify-phase5.ts
autonomous: false
requirements: [DM-01, DM-02, DM-03, DM-04, DM-05, SAFE-01, SAFE-02, SAFE-03, SAFE-04, SAFE-05, SAFE-06, SAFE-07]

must_haves:
  truths:
    - "The sandbox deploys and a two-account harness proves DM hold/accept/deliver, unsafe+crisis classification, report/block, and the guardian help alert against real AWS"
    - "A non-contact first message is held (not delivered) and an unsafe one is flagged; crisis never delivers"
    - "'I need help' creates a Notification owned by the connected guardian (owner-bypass proven live)"
  artifacts:
    - path: "app/scripts/verify-phase5.ts"
      provides: "End-to-end two-account live harness for DM-01..05 + SAFE-01..07"
      contains: "verify-phase5"
  key_links:
    - from: "app/scripts/verify-phase5.ts"
      to: "live sandbox AppSync/DynamoDB/Lambda/Bedrock"
      via: "custom mutations + observeMessages as two signed-in test users"
      pattern: "mutations.sendDm"
---

<objective>
Prove Phase 5 end-to-end against real AWS: deploy, then run a two-account harness asserting the request hold + unsafe flag + crisis stop, accept→Contact+thread, DM delivery + history, the guardian help alert (Notification owner-bypass), and report/block. This is the gate DM-01…05 + SAFE-01…07 are signed off against (screens polished in Phase 6).

Purpose: the hold/accept routing, the cross-owner Notification write, and real classify labels can only be confirmed live (nothing simulated).
Output: `app/scripts/verify-phase5.ts` and a passing live run.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-safety-direct-messages/05-CONTEXT.md
@.planning/phases/05-safety-direct-messages/05-RESEARCH.md
@.planning/phases/05-safety-direct-messages/05-VALIDATION.md
@app/scripts/verify-phase4.ts
@app/src/lib/dm.ts
@app/src/lib/safety.ts

<interfaces>
<!-- Mirror verify-phase4.ts: Amplify.configure(outputs), two accounts, assert(), PHASE5 VERIFY: PASS, process.exit. -->
<!-- The harness must capture each account's sub (getCurrentUser) to build threadId and GuardianLink/Notification assertions. -->
<!-- Nothing simulated — avoid the literal tokens mock/stub/fake in the file. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 5-04-01: Write verify-phase5.ts end-to-end harness</name>
  <files>app/scripts/verify-phase5.ts</files>
  <read_first>
    - Read app/scripts/verify-phase4.ts for the harness shape (two accounts, assert, PASS marker, process.exit) and how it captures identity.
    - Read app/src/lib/dm.ts + safety.ts for the exact helper signatures to call.
  </read_first>
  <action>
    Create `app/scripts/verify-phase5.ts` with a why-comment, mirroring verify-phase4.ts. Capture each account's `sub` via `getCurrentUser`/`fetchAuthSession`. As the two accounts, assert each step, exit non-zero on first failure:
    1. Clean start: ensure sam and jordan are NOT contacts (or use fresh thread ids).
    2. DM-02/SAFE-01: as jordan, `sendDm(samSub, 'hi can we talk')` → `{ held:true }`; assert a pending `MessageRequest` (from jordan,to sam) exists AND sam's thread has NO message yet.
    3. DM-03/SAFE-03: as jordan, `sendDm(samSub, 'can you send me money to cashapp')` → `{ held:true, unsafe:true }` (keyword layer).
    4. SAFE-02: as jordan, `sendDm(samSub, 'i want to hurt myself')` → `{ crisis:true, delivered:false }` (not delivered).
    5. DM-04: as sam, `respondToRequest(requestId, true)` for jordan's first request → `{ ok:true, accepted:true }`; assert a `Contact` (accepted) exists between them AND the held first message now appears in the thread (observeThread).
    6. Authorization: as jordan, `respondToRequest(sameRequestId, true)` again → `{ ok:false }` / forbidden (only the recipient accepts; jordan is the sender).
    7. DM-01/DM-05: as sam (now a contact), `sendDm(jordanSub, 'glad we connected')` → `{ delivered:true }`; observeThread(sam,jordan) history includes it.
    8. SAFE-06/07: create a connected GuardianLink (sam.userId→jordan.guardianId, status 'connected'); as sam `sendHelpAlert()` → `{ notified >= 1 }`; assert a `Notification` with `userId === jordanSub` and `type === 'help'` exists (owner-bypass proven).
    9. SAFE-04: `reportMessage(someId, 'spam')` → a `Report` row exists. SAFE-05: `blockContact(contactRowId)` → that Contact `status === 'blocked'`.
    Print `PHASE5 VERIFY: PASS` only when all pass; else exit non-zero. Call `process.exit` at the end (open subscriptions keep Node alive). No simulated services.
  </action>
  <verify>
    <automated>cd app && grep -Eq "mutations.sendDm|sendDm\(" scripts/verify-phase5.ts && grep -Eq "respondToRequest" scripts/verify-phase5.ts && grep -Eq "sendHelpAlert" scripts/verify-phase5.ts && grep -Eq "MessageRequest" scripts/verify-phase5.ts && grep -Eq "type === 'help'|type: 'help'|'help'" scripts/verify-phase5.ts && grep -Eq "PHASE5 VERIFY: PASS" scripts/verify-phase5.ts && grep -Eq "process.exit" scripts/verify-phase5.ts && [ "$(grep -Eic 'mock|stub|fake' scripts/verify-phase5.ts)" = "0" ]</automated>
  </verify>
  <acceptance_criteria>
    - Harness references sendDm, respondToRequest, sendHelpAlert, MessageRequest, the guardian Notification (`'help'`), report + block, and the PASS marker (grep each ≥1)
    - Asserts the request HOLD (held:true + no thread message) and the crisis non-delivery (grep for `held` and `crisis`)
    - Calls `process.exit`; no simulated services: `grep -Eic "mock|stub|fake" scripts/verify-phase5.ts` = 0
  </acceptance_criteria>
  <done>Live harness written: hold/accept/deliver, unsafe+crisis, guardian alert (owner-bypass), report/block; exits non-zero on failure.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 5-04-02: Deploy and run the live verification</name>
  <what-built>
    Phase 5 DM + safety layer (MessageRequest/Report models, sendDm/respondToRequest/sendHelpAlert Lambdas + mutations, dm/safety client libs) plus the verify-phase5.ts harness. This checkpoint deploys to the real sandbox and runs the harness — it can't be fully automated because `npx ampx sandbox` needs live AWS SSO credentials and the `$amplify/env/<fn>` imports only resolve after deploy.
  </what-built>
  <how-to-verify>
    1. `aws sts get-caller-identity` shows the correct account + region (us-east-1).
    2. `cd app && npx ampx sandbox --once` deploys cleanly (resolves `$amplify/env/sendDm|respondToRequest|sendHelpAlert`) and regenerates `amplify_outputs.json` (do NOT commit it).
    3. `cd app && npx vitest run` → all green (except the pre-existing `practice/handler.test.ts` `$amplify/env` collection failure, flagged in STATE).
    4. `cd app && npx tsx scripts/verify-phase5.ts` → final line `PHASE5 VERIFY: PASS`, exit 0.
    5. `aws logs tail /aws/lambda/<sendDm-fn> --since 10m` shows only labels/fallback — NO message content.
  </how-to-verify>
  <resume-signal>Type "approved" once `PHASE5 VERIFY: PASS` prints with exit 0, the guardian Notification exists, and logs carry no content — or paste the failing assertion/log output.</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| Test user A ↔ test user B | Request hold, recipient-only accept, cross-owner notification |
| Lambda logs → operators | Logs must not carry message content |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-05-01 | Information Disclosure | Non-contact message auto-delivered | mitigate | Harness asserts held:true + empty thread before accept. |
| T-05-02 | Safety | Crisis text delivered instead of support | mitigate | Harness asserts crisis:true + delivered:false. |
| T-05-03 | Elevation of Privilege | Non-recipient accepting | mitigate | Harness asserts jordan (sender) cannot accept (forbidden). |
| T-05-04 | Elevation of Privilege | Cross-owner Notification write | mitigate | Harness asserts the guardian Notification exists only via sendHelpAlert. |
| T-05-06 | Information Disclosure | Message content in logs | mitigate | Checkpoint step 5 confirms labels/fallback only. |
</threat_model>

<verification>
- `npx ampx sandbox --once` deploys cleanly (resolves `$amplify/env/*`).
- `npx vitest run` green (modulo the pre-existing practice collection failure).
- `npx tsx scripts/verify-phase5.ts` prints `PHASE5 VERIFY: PASS`, exit 0.
- sendDm logs carry no message content; all DM/SAFE assertions pass live.
</verification>

<success_criteria>
- Sandbox deploys; end-to-end harness passes against real AWS (nothing simulated).
- Request hold + unsafe flag + crisis stop; accept→Contact+thread; DM deliver + history.
- Guardian help Notification created (owner-bypass); report + block persist.
- All DM + SAFE requirements verified live.
</success_criteria>

<output>
After completion, create `.planning/phases/05-safety-direct-messages/05-04-SUMMARY.md`.
</output>
