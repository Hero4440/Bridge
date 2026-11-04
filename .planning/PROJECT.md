# Bridge: Production Backend Integration

## What This Is

Bridge is a social-emotional practice app for autistic young adults, built in partnership with First Place AZ. Users preview social situations (events, group chats, conversations), practice responses with AI feedback from Mo (companion avatar), and build confidence before real interactions. Competition submission for North American AI Challenge, deadline Nov 4 night.

## Core Value

Practice scenarios with real AI feedback must work reliably. Users get immediate, supportive coaching on conversation skills (joining groups, handling conflict, reading tone) before facing real social situations. If the AI feedback is slow, generic, or breaks, the core value disappears.

## Requirements

### Validated

*Shipped in prototype and confirmed working (React app in Figma Make):*

- ✓ Onboarding flow (interests, trusted person, comfort settings) — prototype
- ✓ Daily check-in (feeling, what's coming up, what's hard) — prototype
- ✓ Practice scenarios (7 scenarios × 3 levels: Guided, Light help, On your own) — prototype
- ✓ Circle group chats (daily topics, starter prompts, message display) — prototype
- ✓ Events (create 3-step wizard, RSVP, prep checklist, reflection) — prototype
- ✓ Direct messages (composer, conversation threads) — prototype
- ✓ Profile settings (theme, interests, trusted person, calm mode) — prototype
- ✓ Mo companion avatar (mood states, animations, warm replies) — prototype
- ✓ UI/UX design (animations, CSS variables, accessibility labels) — prototype

### Active

*Current scope — building toward Nov 4 deadline:*

**Infrastructure (must-have):**
- [ ] AWS Amplify Gen 2 project setup (auth, data, functions, hosting)
- [ ] Cognito authentication (email/password sign-up, login, session management)
- [ ] AppSync GraphQL API (queries, mutations, subscriptions for real-time chat)
- [ ] DynamoDB schema (User, Event, Circle, Message, RSVP, Profile, Notification tables)
- [ ] Lambda functions (practice feedback, tone check, classify helper)
- [ ] Bedrock access (IAM roles, Claude model selection, budget alerts)
- [ ] Frontend API integration (replace mock state with Amplify Data client)

**AI Features (must-have):**
- [ ] Practice feedback via Bedrock (scenario-specific coaching, 3 difficulty levels)
- [ ] Tone check via Bedrock (harsh word detection → gentle rewrites for circles/DMs)
- [ ] Classification Lambda (crisis detection, bias probe, unsafe message filtering)
- [ ] Mo reply suggestions (warm, supportive responses in circles and DMs)

**Core Features (must-have):**
- [ ] Events persist to DynamoDB (create, RSVP tracking, prep, reflection saved)
- [ ] Circles persist to DynamoDB (messages saved, real-time subscriptions via AppSync)
- [ ] Message requests moderation (first DM from non-contact held by Mo, flagged if unsafe)
- [ ] "I need help" notifications (alert trusted person via push or SMS fallback)
- [ ] Profile and settings persistence (theme, interests, trusted person saved to DynamoDB)

**Bug Fixes (must-have):**
- [ ] RSVP state persists across navigation (fix state loss on quick back navigation)
- [ ] Message requests accept/decline flow (add buttons to request modal)
- [ ] Help notifications actually send (implement notification creation + delivery)

**Testing & Compliance (must-have):**
- [ ] Type safety enabled (remove `@ts-nocheck`, add strict TypeScript)
- [ ] Accessibility audit (Lighthouse, VoiceOver, keyboard nav, calm mode verification)
- [ ] AI prompt logging (all Bedrock calls logged to AI_PROMPTS/ per challenge rules)
- [ ] Budget alerts configured (AWS Budgets at 50%, 80%, 100% thresholds)

### Out of Scope

*Deferred to post-competition or explicitly excluded:*

- Component refactoring (split 2190-line App.tsx) — works as-is for deadline
- Unit/integration tests — manual testing sufficient for competition
- Web push notifications (VAPID, service worker) — use in-app toasts for demo
- Moderation admin dashboard — flag reports but no queue UI for Nov 4
- Offline support (AppSync offline client) — assume always-online for demo
- Date/time helper extraction — inline logic works, optimize later
- Pagination (circles, DMs, events) — small demo dataset, not needed
- Real participant data — use made-up test data only per challenge rules

## Context

**Team:** Ctrl Alt Elite (4 members: Tejas, Dhyey, Shreeya, Rishi)
**Partner:** First Place AZ (autism support organization for young adults)
**Challenge:** North American AI Challenge, deadline Nov 4 night
**Codebase:** 2190-line React prototype in Figma Make (no backend, no persistence)
**Tech Stack Decision:** AWS Amplify Gen 2 (Cognito, AppSync, DynamoDB, Lambda, Bedrock)
**AI Model:** Small Claude model via Bedrock (exact ID from `aws bedrock list-inference-profiles`)
**Team Experience:** Never used Amplify Gen 2 before (learning curve applies)
**Competition Rules:** Real AWS services only (no mocks), prompt logging required, no participant data in repo

**Critical Constraints from SKILL.md:**
- All AI calls must log to `AI_PROMPTS/` (automatic via hook for Claude Code, manual for other tools)
- Budget alerts mandatory before first Bedrock call
- No mocked users or data (real Cognito, DynamoDB required)
- Secrets via `secret()` helper or AWS Secrets Manager (never in code or env vars)
- Pull before push, never force-push main, no `--no-verify` on commits
- TypeScript strict mode required (currently disabled with `@ts-nocheck`)

## Constraints

- **Timeline**: 2 days (Nov 4 night deadline) — aggressive scope, sequential execution required
- **Tech Stack**: AWS Amplify Gen 2 mandatory (challenge requirement: no mocks, real services)
- **Team Experience**: No prior Amplify Gen 2 experience (learning curve for setup, data client, Lambda patterns)
- **Codebase**: Monolithic 2190-line file (refactoring deferred; integrate backend into existing structure)
- **Budget**: AWS costs must be tracked (Bedrock calls, Lambda invocations, DynamoDB reads/writes)
- **Security**: Least-privilege IAM roles, no secrets in repo, input validation on all Lambdas
- **Accessibility**: Required for mission (First Place AZ residents are neurodivergent users)
- **Competition Rules**: Prompt logging, no participant data, AI disclosure in README

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Amplify Gen 2 over custom CDK | Challenge requires real AWS services; Amplify Gen 2 fastest path to Cognito + AppSync + DynamoDB with TypeScript IaC | — Pending |
| Small Claude via Bedrock | Cost control + low latency for practice feedback and tone check; larger model overkill for short responses | — Pending |
| Defer component refactoring | 2-day deadline; monolithic file works for prototype; split post-competition | — Pending |
| Skip unit tests for deadline | Manual testing sufficient for competition demo; automated tests add 1-2 days | — Pending |
| In-app notifications only | Web push requires VAPID setup + service worker; toasts + banners sufficient for Nov 4 demo | — Pending |
| TypeScript strict mode | Enable during backend integration (fixes type safety, IDE autocomplete); remove `@ts-nocheck` as first step | — Pending |
| Made-up test data only | Challenge rules prohibit real participant data; seed DynamoDB with fictional names/scenarios | — Pending |

---
*Last updated: 2026-11-03 after initialization*
