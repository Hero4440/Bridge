---
plan: 03
title: Define all 9 data models with authorization rules
wave: 2
depends_on: [1]
autonomous: true
files_modified:
  - app/amplify/data/resource.ts
requirements: [DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10]
must_haves:
  - "All 9 models exist in one schema: User, Message, Event, RSVP, PracticeRun, Reflection, Contact, GuardianLink, Notification (D-07)"
  - "Authorization per D-08: Reflection/PracticeRun/Notification = owner only; Event/RSVP/Contact/GuardianLink/User = owner + authenticated read; Message = authenticated with a deferred-membership TODO marker"
  - "Relationships kept shallow (only Event↔RSVP via hasMany/belongsTo) to limit TS2590 type-depth risk"
  - "PracticeRun/Reflection store NO raw transcript — feedback/level/hints only (SKILL §2.8)"
---

<objective>
Define all nine DynamoDB-backed data models at once in a single `a.schema({...})` (D-07, so the TS2590 "type instantiation excessively deep" risk surfaces on the very next deploy in Plan 04, not after feature code). Apply the exact authorization matrix from D-08. Keep relationships shallow — only Event↔RSVP as a modeled hasMany/belongsTo, every other cross-reference is a plain id string field — to hold type depth down. Honor SKILL §2.8: no raw practice transcripts stored. Default authorization mode is `userPool`.
</objective>

<threat_model>
- T-1-06 | Over-broad data authorization lets any signed-in user read another user's private Reflection / PracticeRun / Notification | STRIDE:Information Disclosure | severity:high | mitigation: task 3-03-02 sets `allow.owner()` ONLY on Reflection, PracticeRun, Notification; proven by the two-account test in Plan 05 (DATA-10)
- T-1-07 | Client-side-only enforcement of Message member-visibility can be bypassed | STRIDE:Elevation of Privilege | severity:med | mitigation: Message uses `allow.authenticated()` for Phase 1 with an explicit `// TODO(phase-chat): custom-query membership check (D-08)` marker; the real rule is a server-side Lambda custom query DEFERRED to the chat phase (never the client), so Phase 1 deploys clean without a false client-side guard
- T-1-08 | Raw practice/reflection transcripts stored in DynamoDB become a sensitive-data liability | STRIDE:Information Disclosure | severity:med | mitigation: task 3-03-01 stores only scenarioId/level/feedback/hintsUsed on PracticeRun (no raw userResponse text) per SKILL §2.8, with a code comment
</threat_model>

<task id="3-03-01">
  <action>
Write `app/amplify/data/resource.ts` defining all 9 models in one schema. Reconcile each field list against `tech design/index.html` and `01-CONTEXT.md` before finalizing — the lists below are the baseline from REQUIREMENTS + SKILL §2; if tech design specifies additional fields, include them.
Field baselines:
- **User** (DATA-01): firstName, lastName, email, interests (a.string().array()), trustedPersonName, trustedPersonRelation, theme (enum dawn/sage/mist/sand), comfortTextSize, comfortCalmMode (boolean), comfortTextFirst (boolean).
- **Message** (DATA-02): content, groupId, senderId, timestamp (a.datetime()).
- **Event** (DATA-03): what, whenAt (a.datetime()), whereText, format (enum inPerson/online), comfortSound, comfortLighting, comfortSize, creatorId, plus `rsvps: a.hasMany('RSVP','eventId')`.
- **RSVP** (DATA-04): eventId, userId, status (enum going/maybe/cant), timestamp, plus `event: a.belongsTo('Event','eventId')`.
- **PracticeRun** (DATA-05): scenarioId, level (a.integer()), feedback, hintsUsed (a.integer()). `// SKILL §2.8: NO raw transcript — userResponse text is NOT stored, feedback/level/hints only.`
- **Reflection** (DATA-06): eventId, feeling, wins (a.string().array()), timestamp.
- **Contact** (DATA-07): userId, contactId, status (enum pending/accepted/blocked).
- **GuardianLink** (DATA-08): userId, guardianId, status (enum pending/connected/declined), permissions (a.string().array()).
- **Notification** (DATA-09): userId, type, message, read (a.boolean()), timestamp.
Start the file with a header comment. Keep ALL cross-model references except Event↔RSVP as plain `a.id()`/`a.string()` fields (RESEARCH Pattern 3 — shallow to limit TS2590). Export the schema and client type:
```ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
// ...schema...
export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema, authorizationModes: { defaultAuthorizationMode: 'userPool' } });
```
  </action>
  <read_first>app/amplify/data/resource.ts; tech design/index.html; 01-CONTEXT.md; 01-RESEARCH.md (Pattern 3); .claude/skills/bridge/SKILL.md (§2.2-§2.4, §2.8)</read_first>
  <acceptance_criteria>
- Exactly these 9 model names appear as schema keys: `for m in User Message Event RSVP PracticeRun Reflection Contact GuardianLink Notification; do grep -q "$m:" app/amplify/data/resource.ts || echo "MISSING $m"; done` prints nothing
- `grep -q "a.hasMany('RSVP'" app/amplify/data/resource.ts` and `grep -q "a.belongsTo('Event'" app/amplify/data/resource.ts`
- `grep -q "defaultAuthorizationMode: 'userPool'" app/amplify/data/resource.ts`
- `grep -q 'export type Schema' app/amplify/data/resource.ts`
- PracticeRun block does NOT contain `userResponse`: `grep -A6 'PracticeRun:' app/amplify/data/resource.ts | grep -vq userResponse`
- `grep -q 'SKILL §2.8' app/amplify/data/resource.ts`
  </acceptance_criteria>
</task>

<task id="3-03-02">
  <action>
Apply the D-08 authorization matrix to each model's `.authorization(...)` builder. Exact rules:
- `Reflection`, `PracticeRun`, `Notification` → `.authorization((allow) => [allow.owner()])`
- `Event`, `RSVP`, `Contact`, `GuardianLink`, `User` → `.authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])])`
- `Message` → `.authorization((allow) => [allow.authenticated()])` with the line directly above it: `// TODO(phase-chat): custom-query membership check (D-08) — member visibility is a server-side Lambda, deferred to the chat phase, never a client-side guard.`
Do not add any `allow.groups` (D-05 — no groups).
  </action>
  <read_first>app/amplify/data/resource.ts; 01-CONTEXT.md (D-08, D-05); .claude/skills/bridge/SKILL.md (§1.4 auth/data)</read_first>
  <acceptance_criteria>
- `grep -c 'allow.owner()' app/amplify/data/resource.ts` returns 8 (3 owner-only + 5 owner+read)
- `grep -c "allow.authenticated().to(\['read'\])" app/amplify/data/resource.ts` returns 5
- Message authorization is exactly authenticated: `grep -A1 'Message:' ...` region contains `allow.authenticated()` (not `.to(['read'])`)
- `grep -q 'TODO(phase-chat): custom-query membership check (D-08)' app/amplify/data/resource.ts`
- `grep -cq 'allow.groups' app/amplify/data/resource.ts` returns 0 (no groups)
  </acceptance_criteria>
</task>

<verification>
`cd app && npx tsc --noEmit`. Expected exit 0 (watch specifically for TS2590 — if it fires, apply RESEARCH mitigation: confirm skipLibCheck, flatten any accidental deep relationships, or `a.combine()` split). Model/authorization counts verified by the grep checks above. Deployment to AppSync + the live two-account authorization proof (DATA-10) happen in Plans 04 and 05.
</verification>
