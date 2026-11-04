# Phase 5: Safety & Direct Messages - Context

**Gathered:** 2026-11-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver direct messages and the safety layer — DM-01…05, SAFE-01…07:
- DM messages persist and load full thread history (DM-01, DM-05).
- A first message from a non-contact is **held** for accept/decline; accept adds the sender as a contact (DM-02, DM-04, SAFE-01).
- Unsafe first messages (money / address / meet-alone) are **flagged by `classify()`** with Report/Block shown (DM-03, SAFE-03).
- Crisis language in the user's own outgoing text is detected by `classify()` → 988 + trusted-person prompt (SAFE-02).
- "I need help" writes a **Notification** to the connected trusted person, and it actually delivers in-app (SAFE-06, SAFE-07).
- Report any message (creates a `Report` record) and block any contact (`Contact.status='blocked'`) (SAFE-04, SAFE-05).

Builds on Phase 1 (`Contact`, `GuardianLink`, `Notification`), Phase 2 (`classifyText` Lambda), and Phase 4 (`Message` real-time path reused for DM threads). **Not in this phase:** guardian-link creation UX + profile/settings (Phase 6/7), web push (Phase 8 stretch), tone-check rewrite UI polish (Phase 6). The keyword→LLM tone path (`toneCheck`) already exists from Phase 2.
**Depends on:** Phase 1 (Contact/GuardianLink/Notification), Phase 2 (classify), Phase 4 (Message subscription/history).
</domain>

<decisions>
## Implementation Decisions

### D-01 DM data model — reuse Message with a threadId (recommended)
- DMs reuse the existing `Message` model with a deterministic **`threadId = dm#<sorted uid pair>`** (set `groupId = threadId` so Phase 4's `observeMessages`, last-50 window, and the subscription work unchanged). No separate DirectMessage model.
- DM-05 history = the Phase 4 last-50/observeQuery path filtered by the DM `threadId`.

### D-02 Message-request hold — a MessageRequest model (recommended)
- New **`MessageRequest`** model: `fromUserId, toUserId, firstMessage, status (pending|accepted|declined), unsafe (boolean), createdAt`.
- A first message from a **non-contact** is written as a pending `MessageRequest`, NOT into the thread (fixes the prototype's auto-deliver bug, DM-02 / SAFE-01).
- **Accept** → create a `Contact` (status `accepted`, DM-04) + seed the DM thread with the first message. **Decline** → mark declined; the sender is NOT told why (private).
- "Already a contact or same circle" → message goes straight to the thread (no request).

### D-03 Classification — keyword-first classify(), scoped (recommended)
- Reuse the ONE `classify()` path (keyword layer first, LLM only if needed — SKILL §2.5). No new classifier.
- **First-contact requests** are classified for **unsafe** labels (money / address / meet-alone) → set `MessageRequest.unsafe` and show Report/Block (DM-03 / SAFE-03). The warning is private ("Only you can see this").
- The user's **own outgoing DM text** is classified for **crisis** on the pause-before-send path → stop and show **988 + a trusted-person prompt** (SAFE-02).
- Do NOT classify every incoming/outgoing message (cost + privacy); classification is scoped to first-requests (unsafe) and the sender's composed text (crisis).

### D-04 Trusted-person alert — in-app Notification (recommended)
- "I need help" (and a crisis stop) writes a **`Notification`** to the **connected `GuardianLink`** trusted person (`status='connected'`), delivered in-app via the existing `Notification` model (SAFE-06 / SAFE-07). No SMS (SKILL §2.4).
- 988 is shown to the user as a link/number, not a notification. Web push is the Phase 8 stretch.
- The guardian sees only what the person shares (SKILL §2.2/§2.8); the help alert is an explicit share.

### D-05 Report & Block — add a Report model; block via Contact (recommended)
- New **`Report`** model: `reporterId, targetType (message|user), targetId, reason, createdAt` (SAFE-04). **No moderator role** — the team reviews records; the UI just promises "a moderator will check this chat" (SKILL §2.4).
- **Block** sets `Contact.status='blocked'` (SAFE-05) and the client hides that contact's messages/threads.

### Claude's Discretion
- Exact `threadId` derivation helper, owner/authorization rules per new model (MessageRequest/Report owner + recipient visibility), optimistic UI vs refetch, whether crisis classification reuses the `toneCheck` pause path or calls `classifyText` directly, and where the DM thread list query lives.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product flows
- `.claude/skills/bridge/SKILL.md` §2.2 — contacts (message request accept/decline, block/report always available), guardian/trusted person.
- `.claude/skills/bridge/SKILL.md` §2.3 — Mo holds unsafe requests; crisis stops role-play, shows 988 + trusted person.
- `.claude/skills/bridge/SKILL.md` §2.4 — DMs (first message = request), reports/blocks ("a moderator will check" but no moderator role), "I need help" (trusted person or 988, in-app notification, no SMS).
- `.claude/skills/bridge/SKILL.md` §2.5 — ONE classify() (keyword first, LLM if needed); live chat via subscriptions.
- `.claude/skills/bridge/SKILL.md` §2.7/§2.8 — guardrails (crisis→988, flag money/address, parity, not a therapist); privacy (unsafe-request warnings private, guardian sees only what's shared, no raw transcripts).

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — DM-01..05, SAFE-01..07 (and DATA-07 Contact, DATA-08 GuardianLink, DATA-09 Notification, Report model).
- `.planning/ROADMAP.md` §"Phase 5" — goal + 5 success criteria.

### Schema + prior phases
- `app/amplify/data/resource.ts` — `Message` (reused for DM threads), `Contact`, `GuardianLink`, `Notification` models; `classifyText` custom query (Phase 2).
- `app/amplify/functions/classify/` + `app/amplify/functions/shared/{classify,keywords}.ts` — the keyword-first classify path reused here.
- `app/src/lib/messages.ts` — `sendMessage`/`observeMessages`/`lastN` reused for DM threads (threadId filter).
- `.planning/phases/04-real-time-chat/04-CONTEXT.md` — Message/subscription decisions this reuses.
- `.planning/phases/02-ai-backend-infrastructure/02-CONTEXT.md` — classify/tone endpoints + fallback.
- `figma-make/src/App.tsx` — prototype DM request modal, report/block, "I need help", pause-before-send (behavior reference).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/lib/messages.ts` (Phase 4) — DM threads reuse `sendMessage`/`observeMessages`/`lastN` with a `threadId` filter; no new subscription code.
- `app/amplify/functions/classify/` + `shared/classify.ts`/`keywords.ts` — the keyword-first `classify()` for unsafe + crisis labels; `classifyText` custom query already wired.
- `Contact` / `GuardianLink` / `Notification` models already deployed (Phase 1) — accept→Contact, help→Notification, block→Contact.status.
- `generateClient<Schema>()` + two-account verify harness pattern (`verify-phase3/4.ts`) for the Phase 5 live gate.

### New models this phase
- `MessageRequest` (held first message + unsafe flag + status) and `Report` (reporterId/targetType/targetId/reason). Both authored in `app/amplify/data/resource.ts`.

### Integration Points
- New client libs in `app/src/lib/` (e.g. `dm.ts` for threadId + request accept/decline, `safety.ts` for report/block/help) alongside `messages.ts`.
- classify on first-request (unsafe) + outgoing text (crisis); help → Notification to the connected GuardianLink.
</code_context>

<specifics>
## Specific Ideas
- Prototype `figma-make/src/App.tsx`: first DM from a non-contact opens a **request modal** (accept/decline); unsafe requests show a private warning + Report/Block; "I need help" picks a trusted person or 988; pause-before-send offers a breather. Match that shape (screens polished in Phase 6).
- Unsafe/crisis warnings are **private** ("Only you can see this"); "Send anyway" always works (masking risk) — nothing is auto-blocked or auto-rewritten.
</specifics>

<deferred>
## Deferred Ideas
- Guardian-link creation flow ("Coach Maria wants to connect") + permission picker UI — Phase 6 (profile/trusted-person onboarding).
- Web push for help alerts / quiet check-ins — Phase 8 (stretch).
- Tone-check rewrite ("Say it gently") UI polish — Phase 6 (the `toneCheck` endpoint already exists from Phase 2).
- DM pagination beyond last-50 (FEAT-04), typing indicators (FEAT-06) — post-competition.

Discussion stayed within the DM + safety boundary. User selected all five recommended decisions.
</deferred>

---

*Phase: 05-safety-direct-messages*
*Context gathered: 2026-11-04*
