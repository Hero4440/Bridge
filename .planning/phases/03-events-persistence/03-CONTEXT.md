# Phase 3: Events & Persistence - Context

**Gathered:** 2026-11-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Persist the event lifecycle to DynamoDB via the Amplify Data client:
- Create event — 3-step wizard (what/when → format → comfort settings) → DynamoDB
- RSVP Going/Maybe/Can't go — persists across navigation + refresh; detail shows counts
- "What to expect" + prep checklist screen (sensory expectations from host-set fields)
- Post-event reflection — feeling (hard/okay/good) + wins → DynamoDB
- Fold in the deferred PracticeRun persistence from Phase 2

Builds on Phase 1's Event/RSVP/Reflection/PracticeRun models. **Not in this phase:**
circles/live chat (Phase 4), DMs/safety (Phase 5), full frontend integration polish &
loading/error states everywhere (Phase 6).
**Depends on:** Phase 1 (schema), Phase 2 (preview/practice endpoints for openers + reflection reply).
</domain>

<decisions>
## Implementation Decisions

### D-01 In-person venue entry
- Host enters a **free-text venue name** + the sensory comfort fields (sound/lighting/size) and a
  host-set **"usually quiet?"** flag. **No maps/places API, no distance** (that would be its own phase).
  SKILL 2.4's "venue suggestions with distance" is descoped to host-entered fields for now.

### D-02 Prep checklist source
- **Static template keyed by event format** (not AI):
  - In person: plan travel, pick an exit line, pack headphones, share plan with trusted person.
  - Online: test mic / text-only, set a log-off time.
- The **"pick an opener with Mo"** item calls the Phase 2 `previewReplies` endpoint (AI only for openers).
- "What to expect" is rendered from **host-set fields** (people, sound, lighting, break/exit), not AI (SKILL 2.4).

### D-03 Reflection → Mo reply
- Save the reflection (feeling hard/okay/good + wins array) to DynamoDB, AND return a **short warm Mo reply**
  via a Phase 2 Bedrock endpoint (completes the Preview→Practice→Go→**Reflect** loop). Warm fallback if Bedrock is down.
- No raw reflection text sent beyond what the reply needs; Reflection stays owner-only (SKILL 2.8).

### D-04 PracticeRun persistence (folded in from Phase 2)
- Wire the **practice Lambda's `$amplify/env` Data client** so a PracticeRun is actually saved
  (scenarioId/level/strength/tip/fallback — **no raw transcript**, SKILL 2.8). Grant the function
  data access at the **schema level** (`a.schema(...).authorization(allow => [allow.resource(practice)...])`),
  since per-model `allow.resource` isn't valid (learned in Phase 2).

### D-05 Circle-linked events (Phase 4 dependency)
- Build events **standalone-capable now**: store `circleId` when present, but circle-scoped listing/creation
  "inside a circle" lights up in Phase 4. Do not block Phase 3 on circles.

### Claude's Discretion
- Exact Data client query/mutation calls, RSVP upsert vs create, optimistic UI vs refetch, the reflection
  reply endpoint choice (reuse `practice`/`preview` vs a thin new query).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product flows
- `.claude/skills/bridge/SKILL.md` §2.4 — create-event 3-step wizard, RSVP, prep checklist, reflection, "what to expect".
- `.claude/skills/bridge/SKILL.md` §2.2 — events (circle vs outside, comfort fields, trusted person).
- `.claude/skills/bridge/SKILL.md` §2.8 — privacy (Reflection owner-only, no raw transcripts).

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — EVENT-01..07.
- `.planning/ROADMAP.md` §"Phase 3" — goal + 5 success criteria.

### Schema + prior phases
- `app/amplify/data/resource.ts` — Event, RSVP, Reflection, PracticeRun models (Phase 1) + the Phase 2 custom queries.
- `.planning/phases/01-foundation-authentication/01-CONTEXT.md` — schema/auth decisions.
- `.planning/phases/02-ai-backend-infrastructure/02-CONTEXT.md` — `previewReplies`/`practiceTurn` endpoints reused here.
- `figma-make/src/App.tsx` — prototype event wizard, RSVP, prep, reflection UI (behavior reference).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/amplify/data/resource.ts` — Event/RSVP/Reflection models already defined + deployed; this phase wires the client.
- Phase 2 `previewReplies` (openers) + a practice/preview endpoint (reflection reply) — reuse, don't rebuild.
- `app/src/lib/` — where the Data-client event/RSVP/reflection helpers go (alongside `auth.ts`).
- `generateClient<Schema>()` pattern proven in `verify-phase2.ts`.

### Established Patterns
- Amplify Data client create/list/update; owner auth enforced server-side (proven in Phase 1 two-account test).
- Lambda `$amplify/env` Data client is the mechanism for D-04 (PracticeRun save).

### Integration Points
- Event create/list/get, RSVP upsert + count aggregation, Reflection create — `app/src/lib/` + screens (screens polished in Phase 6).
- Reflection reply + prep opener → Phase 2 Bedrock endpoints.
</code_context>

<specifics>
## Specific Ideas
- Prototype `figma-make/src/App.tsx` already models the 3-step wizard, RSVP (Going/Maybe/Can't with "x of y spots"),
  prep checklists, and the reflection (hard/okay/good + wins: said hi / asked a question / stayed / left kindly) —
  match that shape.
</specifics>

<deferred>
## Deferred Ideas
- Circle-scoped event creation/listing "inside a circle" — Phase 4 (circles).
- Real venue/places suggestions with distance + "usually quiet" data — post-competition (needs a maps integration).
- Event/reflection screen loading/empty/error polish everywhere — Phase 6 (frontend integration).

Discussion stayed within the events/persistence boundary.
</deferred>

---

*Phase: 03-events-persistence*
*Context gathered: 2026-11-04*
