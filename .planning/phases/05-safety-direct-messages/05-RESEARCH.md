# Phase 5: Safety & Direct Messages - Research

**Researched:** 2026-11-04
**Status:** Ready for planning
**Note:** All codebase paths/signatures below are VERIFIED (read directly). Amplify Gen 2 custom-mutation + function-data-access syntax verified against the existing Phase 2/3/4 code (aws-amplify v6.22).

<summary>
Phase 5 adds DMs (reusing the Phase 4 `Message` real-time path with a `dm#` thread key) and a safety layer. The core realization is that three behaviors can't be enforced in the client and need **server-side Lambda custom mutations** with schema Data access (SKILL §1.4): holding a first-contact message as a `MessageRequest` with a trustworthy `unsafe` flag, accepting a request (creating a `Contact` for the recipient), and the "I need help" alert (creating a `Notification` owned by the *guardian* — impossible from the client because `Notification` is `allow.owner()`). Report and block are owner-scoped client writes. Classification reuses the ONE `classify()` labeler (keyword-first, Haiku fallback to `unsafe`).
</summary>

<verified_codebase_facts>
## Verified codebase facts

### The ONE classify() labeler (reuse — do NOT add a classifier)
- `app/amplify/functions/shared/classify.ts` → `classify(text): Promise<{label, confidence, fallback}>`. Keyword layer first (`shared/keywords.ts`: `keywordLabel` catches `crisis` / `money` / `address` instantly, confidence 1, no model call), then Haiku structured output; on model failure returns the SAFER `unsafe` label (`FALLBACKS.classify`, `fallback:true`).
- Label set (`shared/schemas.ts` `classifyOutput`): `'crisis' | 'money' | 'address' | 'unsafe' | 'bias' | 'safe'`.
- Already exposed as the `classifyText` custom query (`data/resource.ts`, `allow.authenticated()`), handler `functions/classify/handler.ts`.
- **For Phase 5:** "unsafe first message" = label ∈ {`money`, `address`, `unsafe`, `crisis`}; a Lambda can import `classify` directly (it then needs Bedrock IAM via the `aiFunctions` loop in `backend.ts`).

### Models that exist (reuse) vs new
- Reuse: `Message` (`content`, `groupId` required, `senderId`, `createdAtMs` float, `timestamp`; `allow.authenticated()`; GSI `messagesByGroup`) — DMs set `groupId = dm#<sorted uid pair>`, so Phase 4's `sendMessage`/`observeMessages`/`lastN` work unchanged (no Message schema change).
- Reuse: `Contact` (`userId`, `contactId`, `status enum[pending,accepted,blocked]`, `allow.owner()+authenticated read`), `GuardianLink` (`userId`, `guardianId`, `status[pending,connected,declined]`, `permissions[]`), `Notification` (`userId`, `type`, `message`, `read`, `timestamp`, **`allow.owner()`**).
- New this phase: `MessageRequest` and `Report`.

### Custom query/mutation + function-data-access pattern (`data/resource.ts`, `backend.ts`)
- Custom endpoints: `a.query()/a.mutation().arguments({...}).returns(a.ref('X')).authorization(allow => [allow.authenticated()]).handler(a.handler.function(fn))`. Writes should use `a.mutation()`.
- Grant a Lambda the Data client at the SCHEMA level (per-model `allow.resource` is invalid — learned Phase 2/3): the schema already ends `.authorization((allow) => [allow.resource(practice), allow.resource(dailyTopic)])` → append the Phase 5 Lambdas.
- A function's Data client (`$amplify/env/<fn>` + `getAmplifyDataClientConfig` + `generateClient<Schema>()`, exactly as `functions/practice/handler.ts` and `functions/dailyTopic/handler.ts` do) runs under **IAM auth**, which bypasses model owner rules — this is why a Lambda can create a `Notification` owned by the guardian and a `Contact` owned by the recipient. Pre-deploy `tsc -p amplify` throws the documented `$amplify/env/<fn>` error until redeploy — expected.
- Bedrock IAM: add any Lambda that calls `classify` (Bedrock) to the `aiFunctions` array in `backend.ts` (exact ARNs already cover Haiku; no wildcard). Lambdas that only touch Data (respondToRequest, sendHelpAlert) are NOT added to the Bedrock loop.

### Client libs + harness
- `app/src/lib/messages.ts` — reuse `sendMessage`/`observeMessages`/`lastN` for DM threads (pass the `dm#` groupId). New Phase 5 libs (`dm.ts`, `safety.ts`) call the new custom mutations via `client.mutations.*` and own-model writes via `client.models.*`.
- `app/src/lib/data.ts` pattern (generateClient + throw-on-errors) for new helpers.
- `app/scripts/verify-phase{3,4}.ts` — two-account harness pattern (made-up `sam`/`jordan`, `Passw0rd!Test`, `assert`, `PHASEn VERIFY: PASS`, `process.exit`). Phase 4 harness needed `process.exit` because an open subscription keeps Node alive — Phase 5 reuses subscriptions for DM threads, so include `process.exit`.
</verified_codebase_facts>

<design>
## Design: server-side where the schema can't enforce it (SKILL §1.4)

### `sendDm(toUserId, text)` — custom mutation Lambda (DM-01/02/03, SAFE-01/02/03)
1. `fromUserId = identity.sub`. Compute `threadId = dm#<sorted(fromUserId,toUserId)>`.
2. `classify(text)`: if `crisis` → return `{ crisis:true, held:false, delivered:false }` (client shows 988 + trusted-person; message NOT sent).
3. Look up `Contact` (accepted) between the two users OR a shared circle. **If already contacts** → `Message.create({ groupId: threadId, content, senderId })` → `{ delivered:true, held:false }`.
4. **If NOT contacts** → `MessageRequest.create({ fromUserId, toUserId, firstMessage:text, status:'pending', unsafe: label ∈ {money,address,unsafe} })` → `{ held:true, unsafe }`. The message is NOT delivered to the thread (fixes the auto-deliver bug).
5. Needs Bedrock IAM (calls classify) + Data access.

### `respondToRequest(requestId, accept)` — custom mutation Lambda (DM-04)
- Authorize: only the request's `toUserId` (== identity.sub) may respond (enforced in the Lambda).
- Accept → `Contact.create({ userId:toUserId, contactId:fromUserId, status:'accepted' })` (+ reciprocal) and seed the thread with the held `firstMessage`; set request `accepted`.
- Decline → set request `declined`; create nothing; sender is NOT told why. Data access only (no Bedrock).

### `sendHelpAlert()` — custom mutation Lambda (SAFE-06/07)
- Find the caller's **connected** `GuardianLink`; for each, `Notification.create({ userId: guardianId, type:'help', message:'<name> asked for help', read:false })`. Returns `{ notified:n }`.
- MUST be a Lambda: `Notification` is `allow.owner()`, so the client cannot create a row owned by the guardian. Data access only (no Bedrock). No SMS; 988 is a client-side link.

### Report + Block — owner-scoped client writes (SAFE-04/05)
- `Report` (new model, `allow.owner()` by reporter): `client.models.Report.create({ reporterId, targetType, targetId, reason })`. No moderator role.
- Block: `client.models.Contact.update({ id, status:'blocked' })` (user owns their Contact row); client hides that contact's threads/messages.
</design>

<pitfalls>
## Pitfalls
- **`Notification` is `allow.owner()`** — the help alert CANNOT be a client write; it must be a Lambda with Data access (IAM auth bypasses owner). Same for creating the recipient's `Contact` on accept.
- **Don't classify every message** (cost + privacy, §2.8): classify only the first-contact request text (unsafe) and outgoing DM text (crisis), inside `sendDm`. Circle sends stay the Phase 4 direct write.
- **Warn, don't block** (§2.3): unsafe is a private flag + Report/Block affordance; "Send anyway" still works. Crisis is the only hard stop (don't deliver), and it shows support, not a block.
- **No raw transcripts in logs** (§1.4/§2.8): `logTurn` logs labels/fallback only; `MessageRequest.firstMessage` is the actual message (needed to deliver on accept) — that's data, not a log, and is fine in the table.
- **`$amplify/env/<fn>` pre-deploy tsc error** is expected for each new Data-using Lambda; resolved on deploy.
- **DM subscription keeps Node alive** — the verify harness needs `process.exit` (as Phase 4).
- **threadId must be deterministic + symmetric** — sort the two uids so A→B and B→A map to the same thread.

## STRIDE-relevant
- Spoofing/EoP: respondToRequest must verify `identity.sub === request.toUserId` (only the recipient accepts); sendHelpAlert uses `identity.sub` as the caller (no arbitrary sender). Enforced in the Lambda, not the client.
- Information disclosure: decline reason stays private; unsafe warning is private; guardian sees only the explicit help alert.
</pitfalls>

<validation_architecture>
## Validation Architecture

Live two-account harness (`app/scripts/verify-phase5.ts`) + pure unit tests, nothing simulated.

**Unit-testable (vitest):**
- `threadId(a,b)` deterministic + symmetric (`dm#` sorted pair).
- "unsafe label" predicate (label ∈ {money,address,unsafe,crisis} → flag).

**Live integration (sam + jordan, real classify/Bedrock/DynamoDB):**
- DM-02/SAFE-01: jordan (non-contact) `sendDm` to sam → a pending `MessageRequest`, and NOTHING in sam's thread.
- DM-03/SAFE-03: a "send me money / what's your address" first message → `MessageRequest.unsafe === true` (keyword layer, fallback:false).
- SAFE-02: `sendDm` with crisis text → `crisis:true`, message NOT delivered.
- DM-04: sam `respondToRequest(accept)` → a `Contact` (accepted) exists + the held message now in the thread.
- DM-01/DM-05: subsequent `sendDm` between contacts delivers to the thread; history loads via observeMessages(threadId).
- SAFE-06/07: GuardianLink(sam→jordan, connected) + sam `sendHelpAlert()` → a `Notification` with `userId=jordan`, `type='help'` exists (asserts the owner-bypass works).
- SAFE-04: `Report.create` persists. SAFE-05: `Contact.update(status:'blocked')` persists.
- Authorization: jordan cannot `respondToRequest` on a request where jordan is the sender (only the recipient accepts).
- Logs: `aws logs tail` on sendDm shows labels/fallback only, no message content.

**Success marker:** `PHASE5 VERIFY: PASS`, exit 0.
</validation_architecture>

<open_questions>
## Open questions (all have a recommended default)
- Crisis classification scope: `sendDm` only (recommend) vs also circle sends? **Recommend sendDm only** — circle crisis hardening is a later/stretch concern; keeps Phase 4's open-circle direct write intact.
- `MessageRequest` read auth: `allow.authenticated()` + Lambda-enforced writes (recommend, simplest) vs `ownerDefinedIn`. **Recommend authenticated read**, writes only via the Lambdas.
- Reciprocal Contact on accept: create both directions (recommend) vs one. **Recommend both** so either user sees the other as a contact.
</open_questions>

---

*Phase: 05-safety-direct-messages*
*Research completed: 2026-11-04 (codebase-verified)*
