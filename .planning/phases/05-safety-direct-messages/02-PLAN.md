---
phase: 05-safety-direct-messages
plan: 02
type: execute
wave: 2
depends_on: [1]
files_modified:
  - app/amplify/functions/sendDm/resource.ts
  - app/amplify/functions/sendDm/handler.ts
  - app/amplify/functions/respondToRequest/resource.ts
  - app/amplify/functions/respondToRequest/handler.ts
  - app/amplify/functions/sendHelpAlert/resource.ts
  - app/amplify/functions/sendHelpAlert/handler.ts
  - app/amplify/data/resource.ts
  - app/amplify/backend.ts
autonomous: true
requirements: [DM-01, DM-02, DM-03, DM-04, SAFE-01, SAFE-02, SAFE-03, SAFE-06, SAFE-07]

must_haves:
  truths:
    - "A first message from a non-contact is held as a pending MessageRequest with a classify-derived unsafe flag, never delivered to the thread"
    - "Crisis text in an outgoing DM stops delivery and signals 988 + trusted person"
    - "Only the recipient can accept a request, and accepting creates a Contact and seeds the thread"
    - "'I need help' creates a Notification owned by the connected guardian (server-side, bypassing owner auth)"
  artifacts:
    - path: "app/amplify/functions/sendDm/handler.ts"
      provides: "classify + route (deliver to thread if contacts, else hold request); crisis stop"
      contains: "classify"
    - path: "app/amplify/functions/sendHelpAlert/handler.ts"
      provides: "Notification to the connected GuardianLink (owner-bypass via Lambda Data client)"
      contains: "Notification.create"
    - path: "app/amplify/data/resource.ts"
      provides: "sendDm / respondToRequest / sendHelpAlert custom mutations + schema Data grants"
      contains: "sendDm"
  key_links:
    - from: "app/src/lib (Plan 03)"
      to: "safety Lambdas"
      via: "client.mutations.sendDm / respondToRequest / sendHelpAlert"
      pattern: "mutation()"
---

<objective>
Add the three server-side safety Lambdas that enforce rules the schema and client can't: `sendDm` (classify + hold-or-deliver + crisis stop), `respondToRequest` (recipient-only accept → Contact + seed thread), and `sendHelpAlert` (Notification to the connected guardian — impossible from the client because Notification is owner-only). Register them as custom mutations and grant Data access.

Purpose: SKILL §1.4 — a rule the schema can't express is enforced in a Lambda custom query, never the client. The unsafe flag (DM-03/SAFE-03), the request hold (DM-02/SAFE-01), crisis stop (SAFE-02), contact creation on accept (DM-04), and cross-owner help notifications (SAFE-06/07) all require server authority.
Output: three `functions/*` Lambdas + custom mutations + backend wiring.
</objective>

<execution_context>
@$HOME/.kiro/get-shit-done/workflows/execute-plan.md
@$HOME/.kiro/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-safety-direct-messages/05-CONTEXT.md
@.planning/phases/05-safety-direct-messages/05-RESEARCH.md
@app/amplify/functions/practice/handler.ts
@app/amplify/functions/dailyTopic/handler.ts
@app/amplify/functions/shared/classify.ts
@app/amplify/functions/shared/log.ts
@app/amplify/data/resource.ts
@app/amplify/backend.ts

<interfaces>
<!-- Data client via $amplify/env/<fn> + getAmplifyDataClientConfig + generateClient<Schema>() (copy practice/dailyTopic). IAM auth bypasses owner rules. -->
<!-- threadId = dm#<sorted(fromUserId,toUserId)>. Use a shared helper (also used by the client lib). -->
<!-- sendDm imports shared/classify (Bedrock) → add to aiFunctions IAM loop. respondToRequest/sendHelpAlert = Data only. -->
<!-- All three use a.mutation(); logTurn logs labels/fallback only — never message text. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 5-02-01: sendDm Lambda (classify + hold-or-deliver + crisis stop)</name>
  <files>app/amplify/functions/sendDm/resource.ts, app/amplify/functions/sendDm/handler.ts</files>
  <read_first>
    - Read app/amplify/functions/practice/handler.ts + dailyTopic/handler.ts for the `$amplify/env` Data client setup and the defineFunction resource shape.
    - Read app/amplify/functions/shared/classify.ts (label set crisis/money/address/unsafe/bias/safe) and shared/log.ts (logTurn).
  </read_first>
  <action>
    Create `functions/sendDm/resource.ts` (`defineFunction({ name:'sendDm', entry:'./handler.ts', timeoutSeconds: 29, memoryMB: 512 })`) and `handler.ts`:
    - Args `{ toUserId: string, text: string }`, `fromUserId = event.identity.sub`. zod-validate; non-empty text.
    - `threadId = 'dm#' + [fromUserId,toUserId].sort().join('#')`.
    - `const label = await classify(text)`. If `label.label === 'crisis'` → logTurn(labels:['crisis']) and return `{ crisis:true, held:false, delivered:false }` (do NOT deliver).
    - Look up an accepted `Contact` between the two users via the Data client. If contacts → `Message.create({ groupId: threadId, content:text, senderId: fromUserId, createdAtMs: Date.now(), timestamp: new Date().toISOString() })` → return `{ delivered:true, held:false, crisis:false }`.
    - Else → `MessageRequest.create({ fromUserId, toUserId, firstMessage:text, status:'pending', unsafe: ['money','address','unsafe'].includes(label.label), createdAt: new Date().toISOString() })` → return `{ held:true, unsafe, crisis:false }`.
    - `logTurn({ fn:'sendDm', labels:[label.label], fallback: label.fallback })` — never log `text`.
  </action>
  <verify>
    <automated>cd app && test -f amplify/functions/sendDm/handler.ts && grep -Eq "classify" amplify/functions/sendDm/handler.ts && grep -Eq "MessageRequest.create" amplify/functions/sendDm/handler.ts && grep -Eq "Message.create" amplify/functions/sendDm/handler.ts && grep -Eq "crisis" amplify/functions/sendDm/handler.ts && grep -Eq "dm#" amplify/functions/sendDm/handler.ts && grep -Eq "defineFunction" amplify/functions/sendDm/resource.ts</automated>
  </verify>
  <acceptance_criteria>
    - sendDm handler references `classify`, `MessageRequest.create`, `Message.create`, a `crisis` stop branch, and the `dm#` threadId (grep each ≥1)
    - classify runs BEFORE the deliver/hold branch (crisis stop precedes any create in file order)
    - logTurn logs `labels`/`fallback`, not the `text` variable (grep: no `text` inside the logTurn call)
  </acceptance_criteria>
  <done>sendDm holds non-contact first messages with an unsafe flag, delivers for contacts, and stops on crisis.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 5-02-02: respondToRequest + sendHelpAlert Lambdas</name>
  <files>app/amplify/functions/respondToRequest/resource.ts, app/amplify/functions/respondToRequest/handler.ts, app/amplify/functions/sendHelpAlert/resource.ts, app/amplify/functions/sendHelpAlert/handler.ts</files>
  <read_first>
    - Read app/amplify/functions/dailyTopic/handler.ts again for the Data-client-only Lambda pattern (no Bedrock import).
    - Read 05-RESEARCH.md "respondToRequest" + "sendHelpAlert" design and the Notification owner-bypass note.
  </read_first>
  <action>
    1. `functions/respondToRequest/{resource,handler}.ts` (Data only): args `{ requestId: string, accept: boolean }`, `me = identity.sub`. Load the `MessageRequest`; if `me !== request.toUserId` return `{ ok:false, reason:'forbidden' }` (only the recipient may respond). If `accept`: `Contact.create({ userId: toUserId, contactId: fromUserId, status:'accepted' })` AND the reciprocal `Contact.create({ userId: fromUserId, contactId: toUserId, status:'accepted' })`; seed the thread `Message.create({ groupId: 'dm#'+[fromUserId,toUserId].sort().join('#'), content: request.firstMessage, senderId: fromUserId, createdAtMs: Date.now(), timestamp: ... })`; set request `status:'accepted'`. Else set `status:'declined'` (create nothing). Return `{ ok:true, accepted }`.
    2. `functions/sendHelpAlert/{resource,handler}.ts` (Data only): `me = identity.sub`, optional arg `{ note?: string }`. List `GuardianLink` where `userId === me` AND `status === 'connected'`; for each, `Notification.create({ userId: guardianId, type:'help', message: 'Someone you support asked for help.', read:false, timestamp: ... })`. Return `{ notified: n }`. (Owner-bypass: the Lambda Data client runs under IAM, so it can write a Notification owned by the guardian.) logTurn labels only.
  </action>
  <verify>
    <automated>cd app && grep -Eq "request.toUserId|toUserId" amplify/functions/respondToRequest/handler.ts && grep -Eq "Contact.create" amplify/functions/respondToRequest/handler.ts && grep -Eq "forbidden" amplify/functions/respondToRequest/handler.ts && grep -Eq "Notification.create" amplify/functions/sendHelpAlert/handler.ts && grep -Eq "connected" amplify/functions/sendHelpAlert/handler.ts</automated>
  </verify>
  <acceptance_criteria>
    - respondToRequest checks the caller is the recipient (grep `forbidden` ≥1) and creates a `Contact` on accept (grep ≥1)
    - sendHelpAlert creates a `Notification` for a `connected` GuardianLink (grep each ≥1)
    - Neither Lambda imports Bedrock/classify (grep -c "shared/bedrock\|shared/classify" = 0 in both handlers)
  </acceptance_criteria>
  <done>respondToRequest (recipient-only accept → Contact + thread) and sendHelpAlert (Notification to connected guardian) implemented.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 5-02-03: Register custom mutations + Data grants + Bedrock IAM</name>
  <files>app/amplify/data/resource.ts, app/amplify/backend.ts</files>
  <read_first>
    - Read app/amplify/data/resource.ts — the getDailyTopic custom-query block + the schema-level `.authorization((allow) => [allow.resource(practice), allow.resource(dailyTopic)])`.
    - Read app/amplify/backend.ts — defineBackend list + the aiFunctions Bedrock IAM loop.
  </read_first>
  <action>
    1. `data/resource.ts`: import the three functions from `../functions/*/resource`. Add customTypes + mutations:
       - `SendDmReply: a.customType({ delivered:a.boolean(), held:a.boolean(), unsafe:a.boolean(), crisis:a.boolean() })` and `sendDm: a.mutation().arguments({ toUserId:a.string().required(), text:a.string().required() }).returns(a.ref('SendDmReply')).authorization((allow)=>[allow.authenticated()]).handler(a.handler.function(sendDm))`.
       - `RespondReply: a.customType({ ok:a.boolean(), accepted:a.boolean(), reason:a.string() })` and `respondToRequest: a.mutation().arguments({ requestId:a.string().required(), accept:a.boolean().required() }).returns(a.ref('RespondReply')).authorization((allow)=>[allow.authenticated()]).handler(a.handler.function(respondToRequest))`.
       - `HelpReply: a.customType({ notified:a.integer() })` and `sendHelpAlert: a.mutation().arguments({ note:a.string() }).returns(a.ref('HelpReply')).authorization((allow)=>[allow.authenticated()]).handler(a.handler.function(sendHelpAlert))`.
       - Extend the schema-level auth to `[allow.resource(practice), allow.resource(dailyTopic), allow.resource(sendDm), allow.resource(respondToRequest), allow.resource(sendHelpAlert)]`.
    2. `backend.ts`: import the three, add to `defineBackend({ ... sendDm, respondToRequest, sendHelpAlert })`, and add ONLY `backend.sendDm` to the `aiFunctions` Bedrock IAM loop (it calls classify; the other two are Data-only). No wildcard; no reserved concurrency.
  </action>
  <verify>
    <automated>cd app && grep -Eq "sendDm: a" amplify/data/resource.ts && grep -Eq "respondToRequest: a" amplify/data/resource.ts && grep -Eq "sendHelpAlert: a" amplify/data/resource.ts && grep -Eq "allow.resource\(sendDm\)" amplify/data/resource.ts && grep -Eq "allow.resource\(sendHelpAlert\)" amplify/data/resource.ts && grep -c "sendDm" amplify/backend.ts && [ "$(grep -Eic "resources: \['\*'\]" amplify/backend.ts)" = "0" ]</automated>
  </verify>
  <acceptance_criteria>
    - Three `a.mutation()` endpoints registered (grep `sendDm: a`, `respondToRequest: a`, `sendHelpAlert: a` each ≥1)
    - Schema-level auth grants all three Lambdas Data access (grep `allow.resource(sendDm)` and `allow.resource(sendHelpAlert)` each ≥1)
    - backend.ts registers all three and adds ONLY sendDm to the Bedrock loop; no wildcard IAM
    - Pre-deploy `tsc -p amplify/tsconfig.json` errors limited to `$amplify/env/*` module-not-found (resolved by the Plan 04 deploy)
  </acceptance_criteria>
  <done>Three custom mutations registered with Data grants; sendDm has least-privilege Bedrock IAM.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
| Boundary | Description |
|----------|-------------|
| Client ↔ safety Lambdas | AppSync authorizes via Cognito; Lambdas use identity.sub, not client-supplied sender |
| Lambda ↔ Data (IAM) | IAM Data client bypasses owner rules — used deliberately for cross-owner Contact/Notification writes |
| Lambda logs → operators | labels/fallback only, never message text |

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-05-01 | Spoofing | Client forging the sender | mitigate | sendDm uses `identity.sub` as fromUserId, never a client arg. |
| T-05-02 | Information Disclosure | Unsafe first message delivered before review | mitigate | Non-contact first message held as a pending request; classify sets `unsafe`; crisis never delivered. |
| T-05-03 | Elevation of Privilege | Non-recipient accepting a request | mitigate | respondToRequest returns `forbidden` unless `identity.sub === request.toUserId`. |
| T-05-04 | Elevation of Privilege | Writing a Notification for another user | mitigate | Only sendHelpAlert (server, connected-guardian check) does this; client cannot (owner auth). |
| T-05-06 | Information Disclosure | Message text in logs | mitigate | logTurn logs labels/fallback; verified via `aws logs tail` in Plan 04. |
</threat_model>

<verification>
- Three Lambdas exist; sendDm classifies before routing + crisis stop; respondToRequest recipient-only + Contact; sendHelpAlert writes a guardian Notification (grep).
- Mutations + Data grants in schema; sendDm in Bedrock loop only; no wildcard IAM.
- Pre-deploy tsc limited to `$amplify/env/*`; resolved on the Plan 04 deploy.
- Live behavior proven in Plan 04.
</verification>

<success_criteria>
- Non-contact first message held with classify-derived unsafe flag; crisis stops delivery.
- Only the recipient accepts; accept creates a Contact + seeds the thread.
- "I need help" writes a Notification owned by the connected guardian.
- Least-privilege IAM; no message content logged.
</success_criteria>

<output>
After completion, create `.planning/phases/05-safety-direct-messages/05-02-SUMMARY.md`.
</output>
