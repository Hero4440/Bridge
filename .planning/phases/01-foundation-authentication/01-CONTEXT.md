# Phase 1: Foundation & Authentication - Context

**Gathered:** 2026-11-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the AWS backend skeleton so a signed-in user and a deployable schema
exist:

- Amplify Gen 2 project scaffolded (auth, data, functions, hosting dirs)
- Cognito email/password auth: sign up, log in, log out, session persistence
- Full data schema defined (9 models) and deployed to AppSync with auth rules
- Cost guardrails (AWS Budgets) configured before any Bedrock work

**Not in this phase:** AI/Bedrock calls (Phase 2), events/chat/DM logic
(Phases 3-5), frontend wiring of real data (Phase 6). This phase delivers the
foundation those build on.
</domain>

<decisions>
## Implementation Decisions

### AWS Region
- **D-01:** Single region for everything = **us-east-1** (widest Bedrock model
  availability, highest default quotas, lowest cost). All services, Budgets, and
  the Phase 2 Bedrock model live here. Record in `app/amplify/shared/config.ts`.

### Authentication & Profile Split
- **D-02:** Cognito stores **email + password only**. No custom Cognito user
  attributes for profile data.
- **D-03:** All profile/preference data (first + last name, interests, trusted
  person, theme, comfort settings) is written to the **User DynamoDB model** via
  the existing in-app onboarding flow — not collected at Cognito sign-up. Keeps
  auth thin; onboarding stays flexible and owns the User record.
- **D-04:** **No email verification.** A pre-sign-up Lambda trigger auto-confirms
  accounts so the team and judges can create test accounts instantly (matches the
  "made-up test data" rule). Production-grade verification is a deferred toggle,
  not needed for the Nov 4 demo.
- **D-05:** Session persists across refresh via a **30-day token** (per AUTH-03),
  every account equal (no Cognito groups — locked in SKILL.md 2.2).

### Cost Guardrails
- **D-06:** Monthly budget cap = **$50/month**, with AWS Budgets alerts emailed to
  the whole team at 50% / 80% / 100%. Configured in Phase 1, before Phase 2's
  first Bedrock call (INFRA-03).

### Data Schema
- **D-07:** Define **all 9 models at once** (User, Message, Event, RSVP,
  PracticeRun, Reflection, Contact, GuardianLink, Notification) rather than
  incrementally. Accepted risk: large Amplify schemas can hit TS2590 type-explosion
  errors — the planner should run a test deploy (INFRA-05) immediately after the
  schema is defined so any type error surfaces before more code is layered on.
- **D-08:** Authorization rules follow SKILL.md 1.4: `Reflection` and `PracticeRun`
  are `allow.owner()`; `Message` visible to circle members / DM participants;
  rules the schema can't express go in a Lambda custom query, never the client.

### Code Location
- **D-09:** Production code lives in a **new top-level `app/` folder** (the Amplify
  Gen 2 + Vite project root), kept separate from `figma-make/` (the prototype).
  SKILL.md's `src/...` and `amplify/...` paths are therefore rooted at `app/`
  (e.g. `app/amplify/shared/config.ts`, `app/src/screens/`). `figma-make/` stays
  untouched as the design reference.

### Claude's Discretion
- Exact Amplify directory scaffolding commands and file layout under `app/`.
- Pre-sign-up trigger implementation details (D-04).
- Build order / sequencing within "define all 9 models at once" — models are all
  defined, but the planner chooses the deploy-and-verify checkpoints.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Build rules & AWS conventions
- `.claude/skills/bridge/SKILL.md` §1.4 — AWS conventions: Amplify Gen 2, Cognito
  (no groups), one region, SSO, IAM least-privilege, Budgets, secrets via
  `secret()`, no `amplify_outputs.json` commits.
- `.claude/skills/bridge/SKILL.md` §2.2 — User/access model (equal accounts,
  owner / participant / member / person-controlled; GuardianLink).
- `.claude/skills/bridge/SKILL.md` §3 — Code standards (TypeScript strict target,
  file-header comments, no secrets, no mock users/data).

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — INFRA-01..05, AUTH-01..05, DATA-01..10 (the
  acceptance criteria this phase must satisfy).
- `.planning/ROADMAP.md` §"Phase 1" — goal and 5 success criteria.

### Architecture & schema design
- `tech design/index.html` — AWS stack decisions and database schema design.
- `figma-make/src/App.tsx` — onboarding flow; the source of the User profile fields
  that D-03 routes into the User DynamoDB model.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/hooks/bridge-hooks.mjs` — already enforces pull-before-push, secret
  scanning, and prompt logging; works unchanged against the real repo.
- `figma-make/src/App.tsx` onboarding — defines the exact profile fields (name,
  interests, trusted person, theme, comfort) that the User model (DATA-01) must hold.
- `figma-make/src/index.css` — theme system via CSS variables; the `theme` field on
  the User model drives it (PROFILE-02, later phase).

### Established Patterns
- No backend exists yet — Phase 1 creates it from scratch in `app/`.
- Prototype is a monolithic 2190-line `App.tsx` with `@ts-nocheck`; strict mode is
  deferred to Phase 7, so the new `app/` code is written strict from the start but
  the prototype is not touched.

### Integration Points
- `app/amplify/auth/` → Cognito (D-02, D-04).
- `app/amplify/data/` → the 9-model schema (D-07, D-08).
- `app/amplify/shared/config.ts` → region + model constants (D-01).
- Frontend wiring of these into real screens is Phase 6, not here.
</code_context>

<specifics>
## Specific Ideas

- User confirmed the profile should "just use DynamoDB for now" — i.e. the User
  model is the single home for profile data, Cognito stays minimal (D-02/D-03).
- Region and budget were "any works" → recommended defaults locked (us-east-1, $50).
</specifics>

<deferred>
## Deferred Ideas

- Production email verification flow (re-enable Cognito verification) — post-demo.
- Profile photo upload to S3 (PROFILE-04) — Phase 6.
- TypeScript strict mode on the prototype `App.tsx` (remove `@ts-nocheck`) — Phase 7.

None of these are in Phase 1 scope — discussion stayed within the foundation boundary.
</deferred>

---

*Phase: 01-foundation-authentication*
*Context gathered: 2026-11-03*
