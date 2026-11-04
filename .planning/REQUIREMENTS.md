# Requirements: Bridge Production Backend

**Defined:** 2026-11-03
**Core Value:** Practice scenarios with real AI feedback must work reliably. Users get immediate, supportive coaching on conversation skills before facing real social situations.

## v1 Requirements

Requirements for Nov 4 competition demo. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Amplify Gen 2 project scaffolded with auth, data, functions, hosting directories
- [ ] **INFRA-02**: AWS account configured with Bedrock access enabled in chosen region
- [ ] **INFRA-03**: AWS Budgets configured with alerts at 50%, 80%, 100% thresholds
- [ ] **INFRA-04**: Amplify sandbox running locally for all team members
- [ ] **INFRA-05**: First test deploy successful (validates TypeScript types, IAM, schema)

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password via Cognito
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User session persists across browser refresh (30-day token)
- [ ] **AUTH-04**: User can log out from any screen
- [ ] **AUTH-05**: Frontend auth state synchronized with Cognito (Amplify Auth client)

### Data Schema

- [ ] **DATA-01**: User model defined in schema (name, email, interests, trustedPerson, theme, comfort settings)
- [ ] **DATA-02**: Message model defined (content, groupId, senderId, timestamp, owner-based access)
- [ ] **DATA-03**: Event model defined (what, when, where, format, comfort settings, creator, RSVPs)
- [ ] **DATA-04**: RSVP model defined (eventId, userId, status: going/maybe/cant, timestamp)
- [ ] **DATA-05**: PracticeRun model defined (scenarioId, level, userResponse, feedback, owner-based access)
- [ ] **DATA-06**: Reflection model defined (eventId, feeling, wins, timestamp, owner-based access)
- [ ] **DATA-07**: Contact model defined (userId, contactId, status: pending/accepted/blocked)
- [ ] **DATA-08**: GuardianLink model defined (userId, guardianId, status, permissions)
- [ ] **DATA-09**: Notification model defined (userId, type, message, read, timestamp)
- [ ] **DATA-10**: Schema deployed to AppSync with correct authorization rules (owner vs authenticated)

### Lambda Functions

- [ ] **LAMBDA-01**: classify() function deployed (detects crisis, unsafe, money, address, bias labels via Bedrock)
- [ ] **LAMBDA-02**: practice() function deployed (generates strength + tip feedback based on scenario/level/goal)
- [ ] **LAMBDA-03**: tone() function deployed (detects harsh words, suggests gentle rewrites)
- [ ] **LAMBDA-04**: preview() function deployed (generates Mo reply suggestions for circles/DMs)
- [ ] **LAMBDA-05**: All Lambda functions have IAM permissions for Bedrock (inference profile + foundation model ARNs)
- [ ] **LAMBDA-06**: All Lambda functions validate input with zod schemas
- [ ] **LAMBDA-07**: All Lambda functions implement fallback responses when Bedrock times out (>5s)
- [ ] **LAMBDA-08**: All Lambda functions enforce per-user rate limiting (100 requests/hour via DynamoDB counter)

### Bedrock Integration

- [ ] **BEDROCK-01**: Claude 3.5 Sonnet v2 model accessible in chosen region
- [ ] **BEDROCK-02**: Bedrock quota increased to 500 RPM (requested via AWS Support)
- [ ] **BEDROCK-03**: Converse API integrated with structured outputs (toolConfig for classify, outputConfig for practice)
- [ ] **BEDROCK-04**: All Bedrock calls capped at maxTokens: 500 for cost control
- [ ] **BEDROCK-05**: Bedrock responses validated with zod schemas before returning to client

### AI Features

- [ ] **AI-01**: Practice scenarios deliver AI feedback for all 7 scenarios (join, left on read, cancel, leave, repair, invite, disagree)
- [ ] **AI-02**: Practice feedback works at all 3 levels (Guided, Light help, On your own)
- [ ] **AI-03**: Practice feedback includes strength (what user did well) + tip (specific improvement)
- [ ] **AI-04**: Tone check detects harsh words in circles/DMs and suggests gentle rewrites
- [ ] **AI-05**: Classification labels messages correctly (crisis: 988 shown, unsafe: blocked, money/address: flagged)
- [ ] **AI-06**: Mo reply suggestions generate contextual warm responses for circles
- [ ] **AI-07**: All AI features show fallback responses when Bedrock unavailable (scripted replies)
- [ ] **AI-08**: All AI features show loading UI ("this takes a few seconds the first time")

### Events & RSVPs

- [ ] **EVENT-01**: User can create event with 3-step wizard (what/when, format, comfort settings)
- [ ] **EVENT-02**: Events persist to DynamoDB and survive page refresh
- [ ] **EVENT-03**: User can RSVP Going/Maybe/Can't go to any event
- [ ] **EVENT-04**: RSVP choice persists across navigation (fixes current bug)
- [ ] **EVENT-05**: Event detail screen shows RSVP counts (X going, Y maybe, Z can't)
- [ ] **EVENT-06**: Event prep screen shows sensory expectations (people, sound, lighting) + checklist
- [ ] **EVENT-07**: After event, reflection screen saves to DynamoDB (hard/okay/good + wins)

### Circles & Real-Time Chat

- [ ] **CHAT-01**: Circle messages persist to DynamoDB
- [ ] **CHAT-02**: Circle chat updates in real-time via AppSync subscriptions (no polling)
- [ ] **CHAT-03**: Subscription reconnects automatically after disconnect (with "reconnecting..." UI)
- [ ] **CHAT-04**: Circle messages filtered by groupId with authenticated access
- [ ] **CHAT-05**: Daily topic displays at top of circle chat
- [ ] **CHAT-06**: Starter chips (ask question, share story) generate suggested messages
- [ ] **CHAT-07**: Message history loads on circle open (last 50 messages)

### Direct Messages

- [ ] **DM-01**: DM messages persist to DynamoDB
- [ ] **DM-02**: First message from non-contact held for accept/decline (fixes current bug)
- [ ] **DM-03**: Unsafe first messages flagged by classify() with Report/Block buttons shown
- [ ] **DM-04**: Accept button on message request adds sender to contacts
- [ ] **DM-05**: DM conversation threads load full history

### Safety & Moderation

- [ ] **SAFE-01**: Message requests from strangers held by Mo before delivery
- [ ] **SAFE-02**: classify() detects crisis keywords ("hurt myself", "end it") and shows 988 + trusted person
- [ ] **SAFE-03**: classify() detects unsafe requests (money, address, meet alone) and flags message
- [ ] **SAFE-04**: User can report any message (creates Report record in DynamoDB)
- [ ] **SAFE-05**: User can block any contact (updates Contact status to blocked)
- [ ] **SAFE-06**: "I need help" button creates Notification for trusted person (fixes current bug)
- [ ] **SAFE-07**: Help notification actually sends (in-app notification minimum, push stretch)

### Profile & Settings

- [ ] **PROFILE-01**: User profile persists to DynamoDB (name, interests, trusted person)
- [ ] **PROFILE-02**: Theme choice persists across sessions (DynamoDB or localStorage)
- [ ] **PROFILE-03**: Comfort settings persist (calm mode, animation preferences)
- [ ] **PROFILE-04**: Profile photo upload saves to S3 with size/MIME validation

### Frontend Integration

- [ ] **FRONTEND-01**: Amplify Data client initialized in React app (generateClient<Schema>())
- [ ] **FRONTEND-02**: Auth UI replaced with Amplify signIn/signOut/getCurrentUser
- [ ] **FRONTEND-03**: Mock state replaced with Data client queries/mutations for events
- [ ] **FRONTEND-04**: Mock state replaced with Data client for circles (observeQuery for subscriptions)
- [ ] **FRONTEND-05**: Mock state replaced with Data client for DMs
- [ ] **FRONTEND-06**: Mock state replaced with Data client for profile/settings
- [ ] **FRONTEND-07**: Loading states shown during API calls (spinner, skeleton, "loading...")
- [ ] **FRONTEND-08**: Error states shown on API failures (retry button, error message)

### Quality & Testing

- [ ] **TEST-01**: TypeScript strict mode enabled (remove @ts-nocheck from App.tsx)
- [ ] **TEST-02**: Type errors resolved after strict mode enabled
- [ ] **TEST-03**: Lighthouse accessibility audit run on all screens (score 90+)
- [ ] **TEST-04**: VoiceOver screen reader tested on key flows (onboarding, practice, chat)
- [ ] **TEST-05**: Keyboard navigation tested (Tab, Enter, Escape work)
- [ ] **TEST-06**: Calm mode verified (animations disabled, reduced motion respected)
- [ ] **TEST-07**: All Bedrock calls logged to AI_PROMPTS/ (automatic via hook for Claude Code)
- [ ] **TEST-08**: Bias probe run on practice prompts (Python script, results documented)
- [ ] **TEST-09**: 2-account testing completed (owner vs member access, subscriptions, message requests)

### Deployment

- [ ] **DEPLOY-01**: Production Amplify app created and connected to GitHub repo
- [ ] **DEPLOY-02**: Secrets configured in Amplify console (not just sandbox)
- [ ] **DEPLOY-03**: amplify.yml configured for branch-based deployment
- [ ] **DEPLOY-04**: Production deploy successful 24 hours before demo (Nov 3 EOD)
- [ ] **DEPLOY-05**: Demo rehearsal completed with two real accounts

## v2 Requirements

Deferred to post-competition. Tracked but not in current roadmap.

### Component Architecture

- **ARCH-01**: Extract screens from monolithic App.tsx into separate components
- **ARCH-02**: Convert class components to functional components with hooks
- **ARCH-03**: Implement state management (Redux/Zustand) for shared state

### Testing Infrastructure

- **TEST-10**: Jest or Vitest configured for unit tests
- **TEST-11**: Test date helpers (extracted from inline logic)
- **TEST-12**: Test tone-check word matching with edge cases
- **TEST-13**: Test event creation workflow (step transitions, validation)
- **TEST-14**: Integration tests for Lambda functions with real DynamoDB

### Advanced Features

- **FEAT-01**: Web push notifications (VAPID, service worker)
- **FEAT-02**: Admin moderation dashboard (review reports queue)
- **FEAT-03**: Offline support (AppSync offline client, sync queue)
- **FEAT-04**: Message pagination (load more, infinite scroll)
- **FEAT-05**: Event pagination (archive old events >1 year)
- **FEAT-06**: Typing indicators in circles/DMs
- **FEAT-07**: Read receipts (opt-in per user preferences)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Auto-rewrite messages | Removes user agency; show suggestion instead (AI design principle) |
| Leaderboards/streaks | Creates comparison anxiety; contradicts low-pressure philosophy |
| Open-ended AI role-play | Hard to bound, safety risk; use 7 scripted scenarios only |
| SMS notifications | High cost, requires phone numbers; in-app + web push sufficient |
| Voice messages | Requires S3 + player UI; defer until text validated |
| Multi-language support | Add when English version validated with users |
| Analytics dashboard | Defer until data model stable and validated |
| Real participant data | Challenge rules: no First Place AZ resident data in repo |
| Amplify Gen 1 | Maintenance mode, EOL May 2027; Gen 2 only |
| DataStore | Not supported in Gen 2; use AppSync directly |
| Mocked backends | Challenge requirement: real AWS services only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (Populated during roadmap creation) | | |

**Coverage:**
- v1 requirements: 72 total
- Mapped to phases: (pending roadmap)
- Unmapped: (pending roadmap)

---
*Requirements defined: 2026-11-03*
*Last updated: 2026-11-03 after initial definition*
