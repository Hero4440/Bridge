# Roadmap: Bridge Production Backend Integration

## Overview

Bridge transforms from a working prototype to a production-ready AWS-backed app over 8 phases. Phase 1-2 build infrastructure (auth, data models, AI endpoints). Phase 3-5 integrate core features (events, real-time chat, safety). Phase 6-7 complete frontend integration and quality validation. Phase 8 deploys to production with 24-hour testing buffer before Nov 4 demo. Each phase delivers verifiable user-facing capability, building toward a functional social-emotional practice app with real AI feedback.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Authentication** - Amplify project, Cognito auth, schema definition, budget safeguards (completed 2026-11-04)
- [x] **Phase 2: AI Backend Infrastructure** - Lambda functions, Bedrock integration, structured outputs, rate limiting (completed 2026-11-04)
- [x] **Phase 3: Events & Persistence** - Event CRUD, RSVP tracking, prep checklists, reflections (completed 2026-11-04)
- [x] **Phase 4: Real-Time Chat** - Circle subscriptions, message history, reconnection logic, contact system (completed 2026-11-04)
- [ ] **Phase 5: Safety & Direct Messages** - Classification, message requests, crisis detection, help notifications
- [ ] **Phase 6: Profile & Frontend Integration** - Profile persistence, frontend API client, loading/error states
- [ ] **Phase 7: Quality & Testing** - TypeScript strict mode, accessibility audit, bias probe, 2-account testing
- [ ] **Phase 8: Production Deployment** - Production app, secrets config, deploy rehearsal, demo prep

## Phase Details

### Phase 1: Foundation & Authentication
**Goal**: Backend infrastructure exists with working authentication and deployable schema
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10
**Success Criteria** (what must be TRUE):
  1. User can sign up with email/password via Cognito and session persists across browser refresh
  2. User can log in and log out from any screen
  3. Amplify sandbox runs locally with all data models defined (User, Message, Event, RSVP, PracticeRun, Reflection, Contact, GuardianLink, Notification)
  4. AWS Budgets configured with alerts at 50%, 80%, 100% thresholds before any Bedrock calls
  5. First test deploy completes successfully, validating TypeScript types and IAM permissions
**Plans**: TBD

Plans:
- TBD (populated during plan-phase)

### Phase 2: AI Backend Infrastructure
**Goal**: AI features work end-to-end with Bedrock integration, fallback responses, and cost controls
**Depends on**: Phase 1
**Requirements**: LAMBDA-01, LAMBDA-02, LAMBDA-03, LAMBDA-04, LAMBDA-05, LAMBDA-06, LAMBDA-07, LAMBDA-08, BEDROCK-01, BEDROCK-02, BEDROCK-03, BEDROCK-04, BEDROCK-05, AI-01, AI-02, AI-03, AI-07, AI-08
**Success Criteria** (what must be TRUE):
  1. Practice scenarios deliver AI feedback with strength + tip for all 7 scenarios at all 3 difficulty levels
  2. Classification detects crisis/unsafe/money/address labels correctly via Bedrock structured outputs
  3. All Lambda functions validate input with zod and return fallback responses when Bedrock times out (>5s)
  4. Per-user rate limiting enforced at 100 requests/hour via DynamoDB counter
  5. All Bedrock calls capped at maxTokens: 500 and show loading UI "this takes a few seconds the first time"
**Plans**: TBD

Plans:
- TBD (populated during plan-phase)

### Phase 3: Events & Persistence
**Goal**: Users can create events, RSVP, view prep checklists, and save reflections
**Depends on**: Phase 1
**Requirements**: EVENT-01, EVENT-02, EVENT-03, EVENT-04, EVENT-05, EVENT-06, EVENT-07
**Success Criteria** (what must be TRUE):
  1. User can create event with 3-step wizard (what/when, format, comfort settings) and it persists to DynamoDB
  2. User can RSVP Going/Maybe/Can't go and choice persists across navigation and page refresh
  3. Event detail screen shows RSVP counts (X going, Y maybe, Z can't)
  4. Event prep screen displays sensory expectations (people, sound, lighting) and checklist based on event type
  5. After event, reflection screen saves to DynamoDB (hard/okay/good feeling + wins)
**Plans**: TBD

Plans:
- TBD (populated during plan-phase)

### Phase 4: Real-Time Chat
**Goal**: Circle chat delivers messages in real-time via AppSync subscriptions with reconnection handling
**Depends on**: Phase 1
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07
**Success Criteria** (what must be TRUE):
  1. Circle messages persist to DynamoDB and appear in real-time for all circle members without polling
  2. Subscription reconnects automatically after disconnect with "reconnecting..." UI shown to user
  3. Circle chat loads last 50 messages on open, filtered by groupId with authenticated access
  4. Daily topic displays at top of circle chat
  5. Starter chips (ask question, share story) generate suggested messages when tapped
**Plans**: 4 (planned 2026-11-04)

Plans:
- 01: Chat schema — Group + Topic models, Message groupId/createdAtMs GSI, seed 6 circles (CHAT-01/04/07)
- 02: dailyTopic Lambda + getDailyTopic query + topic client, AI daily topic cached one row/circle/day (CHAT-05)
- 03: Client libs — messages (observeQuery, last-50), connection-state mapper, starter chips + unit tests (CHAT-01/02/03/04/06/07)
- 04: Live two-account verify harness — real-time delivery, isolation, cache, chips (CHAT-01..07)

### Phase 5: Safety & Direct Messages
**Goal**: Message moderation protects users with AI classification and trusted person alerts
**Depends on**: Phase 2 (needs classify Lambda), Phase 1 (needs Contact model)
**Requirements**: DM-01, DM-02, DM-03, DM-04, DM-05, SAFE-01, SAFE-02, SAFE-03, SAFE-04, SAFE-05, SAFE-06, SAFE-07
**Success Criteria** (what must be TRUE):
  1. First message from non-contact held by Mo with accept/decline buttons in message request modal
  2. Unsafe first messages (money, address, meet alone requests) flagged by classify() with Report/Block shown
  3. Crisis keywords ("hurt myself", "end it") detected by classify() and show 988 hotline + trusted person alert
  4. "I need help" button creates Notification for trusted person and actually sends (in-app notification minimum)
  5. User can report any message (creates Report record) and block any contact (updates Contact status to blocked)
**Plans**: 4 (planned 2026-11-04)

Plans:
- 01: Schema — MessageRequest + Report models (DM-02, SAFE-04)
- 02: Safety Lambdas — sendDm (classify+hold/deliver+crisis), respondToRequest, sendHelpAlert + mutations (DM-01..04, SAFE-01/02/03/06/07)
- 03: Client libs — dm (threadId, send/observe/respond) + safety (report/block/help) + units (DM-01..05, SAFE-02/04/05/06)
- 04: Live two-account verify harness — hold/accept/deliver, unsafe+crisis, guardian alert, report/block (DM-01..05, SAFE-01..07)

### Phase 6: Profile & Frontend Integration
**Goal**: Frontend uses Amplify Data client for all features with proper loading/error states
**Depends on**: Phase 1 (needs schema), Phase 3 (events), Phase 4 (chat), Phase 5 (DMs)
**Requirements**: PROFILE-01, PROFILE-02, PROFILE-03, PROFILE-04, FRONTEND-01, FRONTEND-02, FRONTEND-03, FRONTEND-04, FRONTEND-05, FRONTEND-06, FRONTEND-07, FRONTEND-08
**Success Criteria** (what must be TRUE):
  1. User profile (name, interests, trusted person) persists to DynamoDB and survives page refresh
  2. Theme choice and comfort settings persist across sessions
  3. Profile photo upload saves to S3 with size/MIME validation
  4. Frontend shows loading states during all API calls (spinner, skeleton, "loading...")
  5. Frontend shows error states on API failures with retry button and clear error message
**Plans**: TBD

Plans:
- TBD (populated during plan-phase)

### Phase 7: Quality & Testing
**Goal**: App meets accessibility standards, TypeScript strict mode enabled, and bias validation complete
**Depends on**: Phase 6 (all features integrated)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07, TEST-08, TEST-09, AI-04, AI-05, AI-06
**Success Criteria** (what must be TRUE):
  1. TypeScript strict mode enabled (remove @ts-nocheck from App.tsx) and all type errors resolved
  2. Lighthouse accessibility audit scores 90+ on all screens (onboarding, practice, chat, events)
  3. VoiceOver screen reader tested on key flows (onboarding, practice, chat) and keyboard navigation works (Tab, Enter, Escape)
  4. Calm mode verified (animations disabled, reduced motion respected)
  5. Bias probe run on practice prompts and results documented in AI_PROMPTS/
  6. 2-account testing completed (owner vs member access, subscriptions work, message requests flow)
  7. Tone check detects harsh words and suggests gentle rewrites, Mo reply suggestions generate contextual responses
**Plans**: TBD

Plans:
- TBD (populated during plan-phase)

### Phase 8: Production Deployment
**Goal**: Production app deployed 24 hours before demo with rehearsal completed
**Depends on**: Phase 7 (all features validated)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05
**Success Criteria** (what must be TRUE):
  1. Production Amplify app created, connected to GitHub repo, and secrets configured in Amplify console
  2. amplify.yml configured for branch-based deployment
  3. Production deploy successful 24 hours before demo (Nov 3 EOD)
  4. Demo rehearsal completed with two real accounts testing full flow (sign-up, practice, event, circle chat, DM)
  5. All Bedrock calls logged to AI_PROMPTS/ (verified via hook)
**Plans**: TBD

Plans:
- TBD (populated during plan-phase)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Authentication | 5/5 | Complete   | 2026-11-04 |
| 2. AI Backend Infrastructure | 5/5 | Complete   | 2026-11-04 |
| 3. Events & Persistence | 5/5 | Complete   | 2026-11-04 |
| 4. Real-Time Chat | 4/4 | Complete   | 2026-11-04 |
| 5. Safety & Direct Messages | 0/4 | Planned | - |
| 6. Profile & Frontend Integration | 0/0 | Not started | - |
| 7. Quality & Testing | 0/0 | Not started | - |
| 8. Production Deployment | 0/0 | Not started | - |
