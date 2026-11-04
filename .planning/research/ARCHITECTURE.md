# Architecture Research

**Domain:** AWS Amplify Gen 2 backend integration with React class component
**Researched:** 2026-11-03
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Component Layer                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Screen    │  │  Screen    │  │  Screen    │             │
│  │ Components │  │ Components │  │ Components │             │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘             │
│        │                │                │                    │
│        └────────────────┴────────────────┘                    │
│                         │                                     │
├─────────────────────────┼─────────────────────────────────────┤
│           Amplify Data Client (Type-safe GraphQL)            │
│                         │                                     │
├─────────────────────────┼─────────────────────────────────────┤
│                    AWS AppSync Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ GraphQL Query│  │ GraphQL      │  │ GraphQL      │        │
│  │ Resolvers    │  │ Mutation     │  │ Subscription │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                  │                │
├─────────┴─────────────────┴──────────────────┴────────────────┤
│              Lambda Functions (Custom Business Logic)         │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  Practice Turn   │  │  Tone Check      │                  │
│  │  (Bedrock call)  │  │  (Bedrock call)  │                  │
│  └────────┬─────────┘  └────────┬─────────┘                  │
│           │                     │                             │
├───────────┴─────────────────────┴─────────────────────────────┤
│                        Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  DynamoDB    │  │   Bedrock    │  │   Cognito    │        │
│  │  Tables      │  │   Runtime    │  │   User Pool  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| React Screens | UI rendering, user interaction, local UI state | Class components with `this.state` for UI-only state, calls to Data client in event handlers |
| Amplify Data Client | Type-safe GraphQL API client, real-time subscriptions | Generated from schema via `generateClient<Schema>()`, provides `client.models.*` and `client.queries.*` |
| AppSync | GraphQL endpoint, request authorization, resolver routing | Auto-generated from Amplify schema definition, enforces `allow.owner()`, `allow.authenticated()` |
| Lambda Functions | Custom business logic, AI endpoints, external API calls | TypeScript handlers with Bedrock SDK, zod validation, error handling |
| DynamoDB | Data persistence, automatic table creation | Auto-generated tables from schema `@model` types, with owner-based access control |
| Bedrock Runtime | AI model invocations | Converse API calls from Lambda with structured output via `toolConfig` |
| Cognito | Authentication, user identity | Email-based login, no groups/roles, every user equal |

## Recommended Project Structure

```
src/
├── screens/           # Screen components (Onboarding, CheckIn, Home, etc.)
│   ├── Home.tsx       # Home screen with event preview, practice cards
│   ├── Circles.tsx    # Circle list and live chat
│   ├── Practice.tsx   # Mo practice session with levels
│   └── ...            # Other screens per SKILL.md section 2.4
├── components/        # Reusable UI components
│   ├── Mo.tsx         # Mo character component (already exists)
│   ├── Card.tsx       # Reusable card wrapper
│   └── NavBar.tsx     # Bottom tab navigation
├── lib/               # API client, utilities
│   ├── client.ts      # Generated Amplify Data client instance
│   ├── types.ts       # Shared TypeScript types
│   └── validation.ts  # Input validation helpers
└── App.tsx            # Root component with Amplify.configure()

amplify/
├── auth/              # Cognito configuration
│   └── resource.ts    # Email login, no groups
├── data/              # GraphQL schema and custom operations
│   ├── resource.ts    # Schema: User, Message, Event, PracticeRun, etc.
│   └── queries.ts     # Custom queries/mutations (practiceTurn, toneCheck)
├── functions/         # Lambda handlers
│   ├── practice/      # Practice turn handler
│   │   ├── handler.ts # Main logic: validate → classify → Bedrock → save
│   │   └── prompts.ts # System prompts for practice scenarios
│   ├── tone/          # Tone check handler
│   │   ├── handler.ts # Keyword layer + LLM fallback
│   │   └── prompts.ts # Tone analysis prompt
│   ├── classify/      # Classification endpoint
│   │   ├── handler.ts # Safety/crisis/money labeling
│   │   └── prompts.ts # Classification prompt
│   └── preview/       # Event preview generation
│       ├── handler.ts # "What to expect" + prep checklist
│       └── prompts.ts # Preview prompt
├── shared/
│   └── config.ts      # Bedrock region, model ID, shared constants
└── backend.ts         # Infrastructure as code, IAM policies

scripts/
├── hooks/             # Git hooks (prompt logging, push guard)
│   └── bridge-hooks.mjs
└── seed/              # Idempotent seed scripts
    ├── seed-circles.ts
    └── seed-demo-users.ts

AI_PROMPTS/            # Team prompt logs
├── Tejas.md
├── Dhyey.md
├── Shreeya.md
└── Rishi.md
```

### Structure Rationale

- **screens/:** Each screen is a React component matching the prototype flow (onboarding → check-in → home → circles/events/practice/me). Initially class components to minimize migration risk, can convert to functional incrementally.
- **components/:** Extract reusable pieces (Mo, Card, NavBar) from the monolithic `App.tsx`. Mo already exists; Card and NavBar are next priorities.
- **lib/:** Centralize the Data client instance (`client.ts`) to avoid repeated `generateClient()` calls. Types extracted from schema for reuse.
- **amplify/functions/:** One folder per Lambda, each with `handler.ts` (business logic) and `prompts.ts` (AI prompts). Keeps AI attribution clear per SKILL.md 4.
- **amplify/shared/:** Shared constants like Bedrock model ARN, region, rate limit configs. Single source of truth.

## Architectural Patterns

### Pattern 1: Screen-Level Data Client Calls

**What:** Generate the Data client once at module level, invoke queries/mutations/subscriptions directly in event handlers or lifecycle methods.

**When to use:** For all API operations. Avoids intermediate service layers that add no value.

**Trade-offs:** Simple and direct, but duplicates client setup across screens. For a prototype with 10-12 screens, this is fine. If duplication becomes painful, extract a hooks layer.

**Example:**
```typescript
// src/screens/Circles.tsx
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

class CircleChat extends React.Component {
  state = { messages: [], newMessage: '' }

  componentDidMount() {
    // Real-time subscription for live chat
    this.sub = client.models.Message
      .observeQuery({ filter: { groupId: { eq: this.props.circleId } } })
      .subscribe({
        next: ({ items }) => this.setState({ messages: [...items] })
      })
  }

  componentWillUnmount() {
    this.sub?.unsubscribe()
  }

  sendMessage = async () => {
    await client.models.Message.create({
      groupId: this.props.circleId,
      content: this.state.newMessage,
      sender: this.currentUserId
    })
    this.setState({ newMessage: '' })
  }

  // ... render
}
```

### Pattern 2: Lambda-Backed Custom Queries for AI

**What:** Define custom queries/mutations in the schema with `.handler(a.handler.function(lambdaRef))`. Lambda validates input, calls Bedrock, returns structured output.

**When to use:** For any Bedrock call (practice, tone check, classify, preview). AppSync authorizes the request via Cognito, then routes to Lambda.

**Trade-offs:** Small cold start (100-500ms) on first call, then warm. More infra than custom resolvers, but necessary for Bedrock SDK calls. No choice here—Bedrock requires Lambda.

**Example:**
```typescript
// amplify/data/resource.ts
import { type ClientSchema, a } from '@aws-amplify/backend'
import { practice } from '../functions/practice/resource'

const schema = a.schema({
  PracticeReply: a.customType({
    strength: a.string().required(),
    tip: a.string().required(),
    fallback: a.boolean()
  }),

  practiceTurn: a.query()
    .arguments({
      scenarioId: a.string().required(),
      level: a.integer().required(),
      goal: a.string().required(),
      message: a.string().required()
    })
    .returns(a.ref('PracticeReply'))
    .authorization(allow => [allow.authenticated()])
    .handler(a.handler.function(practice))
})

export type Schema = ClientSchema<typeof schema>

// amplify/functions/practice/handler.ts
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'
import { z } from 'zod'
import { PRACTICE_PROMPT } from './prompts'

const bedrock = new BedrockRuntimeClient({ region: 'us-west-2' })

export const handler = async (event) => {
  const input = z.object({
    scenarioId: z.string(),
    level: z.number().int().min(1).max(3),
    goal: z.string().max(500),
    message: z.string().max(1000)
  }).parse(event.arguments)

  // Call Bedrock Converse API with structured output
  const result = await bedrock.send(new ConverseCommand({
    modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    messages: [{ role: 'user', content: [{ text: input.message }] }],
    system: [{ text: PRACTICE_PROMPT(input.scenarioId, input.level, input.goal) }],
    toolConfig: { /* JSON schema for structured output */ }
  }))

  // Save PracticeRun to DynamoDB via Data client
  // Return { strength, tip, fallback: false }
}
```

### Pattern 3: Incremental Migration from Monolithic Component

**What:** Extract screens one at a time from `App.tsx`, starting with simplest (static screens like Reflect) before complex (live chat, practice). Coexist class and functional components during migration.

**When to use:** When refactoring a 2190-line monolithic component. Doing it all at once risks breaking everything. Incremental extraction allows testing each screen.

**Trade-offs:** Temporary duplication (shared state lives in both old and new components). Need a transition plan for shared state (theme, current user). Worth it to ship safely.

**Example:**
```typescript
// Step 1: Extract Reflect screen (static, no API calls)
// src/screens/Reflect.tsx
class Reflect extends React.Component {
  // Move just the Reflect rendering logic from App.tsx
}

// Step 2: Update App.tsx to conditionally render
class Bridge extends React.Component {
  render() {
    if (this.state.view === 'reflect') {
      return <Reflect onBack={() => this.setState({ view: 'home' })} />
    }
    // ... rest of monolithic component
  }
}

// Step 3: Extract Home screen (reads data, no writes)
// Step 4: Extract CircleChat (subscriptions, writes)
// Step 5: Extract Practice (complex state, Bedrock calls)
```

### Pattern 4: Loading/Error States with Local State

**What:** Store `loading` and `error` in component state, set during async operations, render conditional UI.

**When to use:** For every API call. Required per SKILL.md 1.3 (never hardcoded replies, no TODO placeholders).

**Trade-offs:** Manual state management vs TanStack Query (which provides `isLoading`, `error` automatically). For a Nov 6 deadline, manual state is faster to implement—no new library to learn.

**Example:**
```typescript
class EventList extends React.Component {
  state = { events: [], loading: true, error: null }

  async componentDidMount() {
    try {
      const { data } = await client.models.Event.list()
      this.setState({ events: data, loading: false })
    } catch (error) {
      this.setState({ error: error.message, loading: false })
    }
  }

  render() {
    if (this.state.loading) {
      return <div>Loading events...</div>
    }
    if (this.state.error) {
      return <div>Error: {this.state.error}</div>
    }
    if (this.state.events.length === 0) {
      return <EmptyState message="No events yet. Create one!" />
    }
    return this.state.events.map(e => <EventCard key={e.id} event={e} />)
  }
}
```

## Data Flow

### Request Flow

```
[User Action: Send message]
    ↓
[Screen: CircleChat.sendMessage()]
    ↓
[Data Client: client.models.Message.create()]
    ↓
[AppSync: Authorize via Cognito, validate schema]
    ↓
[DynamoDB: Write Message record with owner field]
    ↓
[AppSync Subscription: Notify all subscribers]
    ↓
[Data Client: observeQuery callback fires]
    ↓
[Screen: setState with new messages array]
    ↓
[React: Re-render with new message]
```

### AI Endpoint Flow

```
[User Action: Send practice reply]
    ↓
[Screen: Practice.sendReply()]
    ↓
[Data Client: client.queries.practiceTurn({ scenarioId, level, goal, message })]
    ↓
[AppSync: Authorize user, route to Lambda]
    ↓
[Lambda: Validate input with zod]
    ↓
[Lambda: classify(message) → check for crisis/money]
    ↓
[Lambda: Bedrock.converse() with PRACTICE_PROMPT]
    ↓
[Lambda: classify(output) → ensure safe]
    ↓
[Lambda: client.models.PracticeRun.create({ userId, scenarioId, level, hints, feedback })]
    ↓
[Lambda: Return { strength, tip, fallback }]
    ↓
[Data Client: Resolve promise with reply]
    ↓
[Screen: setState({ feedback: reply, view: 'feedback' })]
    ↓
[React: Render feedback screen]
```

### State Management

```
┌─────────────────────────────────────────────┐
│         Component Local State                │
│  - UI state (input values, modal open)       │
│  - Loading/error states                      │
│  - Temporary data (form draft)               │
└───────────────┬─────────────────────────────┘
                │
                ↓ (read/write via Data client)
┌─────────────────────────────────────────────┐
│        Amplify Data (Backend State)          │
│  - User profile, contacts, messages          │
│  - Events, RSVPs, circles                    │
│  - PracticeRuns, Reflections                 │
│  - Synchronized via observeQuery             │
└─────────────────────────────────────────────┘
```

**Key Insight:** No global state manager (Redux/Zustand) needed. Backend state lives in DynamoDB and syncs via subscriptions. UI state lives in component state. Theme/settings can live in `localStorage` with initial load in root component.

### Key Data Flows

1. **Real-time chat:** `observeQuery()` subscription on Message model filtered by groupId. New messages appear instantly for all participants.
2. **Practice session:** User types reply → screen calls `practiceTurn` custom query → Lambda validates, calls Bedrock, saves run → returns feedback → screen renders.
3. **Event RSVP:** User taps "Going" → screen calls `client.models.Rsvp.create({ eventId, status: 'going' })` → DynamoDB write → host sees updated count via subscription.
4. **Guardian link:** Guardian sends request → `GuardianLink` record created with `status: 'pending'` → person sees notification → accepts → update `status: 'connected'` + set permissions field → both users see updated link.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users (demo) | Monolithic component OK, no optimization needed. Single DynamoDB table per model, on-demand billing, default Lambda concurrency. |
| 100-1k users (pilot) | Extract screens into separate components to improve maintainability. Add indexes for common queries (messages by groupId). Set reserved concurrency on AI Lambdas (5-10) to cap Bedrock costs. |
| 1k-10k users (production) | Migrate class components to functional with hooks for better performance (no `this` binding overhead). Use DynamoDB TTL for ephemeral data (old notifications). Add CloudWatch alarms for Lambda errors and Bedrock throttles. Implement per-user rate limiting (DynamoDB counter with TTL). |

### Scaling Priorities

1. **First bottleneck:** Bedrock invocation costs. Fix: Per-user rate limit (5 practice turns/hour), cap `maxTokens` at 500, use keyword layer before LLM for tone checks.
2. **Second bottleneck:** Lambda cold starts during practice sessions. Fix: Provisioned concurrency on `practice` function during demo hours (4-8pm), or migrate simple custom queries (like event preview) to AppSync JavaScript resolvers (no cold start).

## Anti-Patterns

### Anti-Pattern 1: Mock State Mixed with Real API

**What people do:** Start with hardcoded arrays in component state, then add API calls that populate the same state, but leave fallback to mock data.

**Why it's wrong:** Creates confusion about data source. Hides API errors. Violates SKILL.md 1.3 (nothing mocked). Hard to test real auth/access rules.

**Do this instead:** Build real API first (even with empty DB), render empty states when no data. Use `loading: true` during fetch, `error` state on failure. Delete all mock arrays.

### Anti-Pattern 2: Calling Bedrock from React Component

**What people do:** Import Bedrock SDK in React component, call `converse()` directly from event handler with hardcoded credentials.

**Why it's wrong:** Exposes AWS credentials in client bundle. Bypasses AppSync authorization. No server-side validation or safety checks. Violates SKILL.md 1.4 (Lambdas get access via IAM role).

**Do this instead:** Define custom query in schema, implement Lambda handler with Bedrock SDK, call via Data client: `client.queries.practiceTurn()`. AppSync authorizes user before routing to Lambda.

### Anti-Pattern 3: Polling for Real-Time Data

**What people do:** Use `setInterval()` to call `client.models.Message.list()` every 2 seconds to check for new messages.

**Why it's wrong:** Wastes API quota, drains battery, delayed updates (2s lag), still misses messages if sent between polls. Violates SKILL.md 3 rule 7 (use subscriptions).

**Do this instead:** Use `observeQuery()` subscription—automatic, instant, efficient:
```typescript
client.models.Message.observeQuery({ filter: { groupId: { eq: id } } })
  .subscribe({ next: ({ items }) => this.setState({ messages: items }) })
```

### Anti-Pattern 4: One Monolithic Lambda for All AI Endpoints

**What people do:** Create `ai-handler.ts` with switch statement on `operation` field: `case 'practice': ... case 'tone': ... case 'classify': ...`

**Why it's wrong:** Tight coupling, hard to test individual endpoints, shared dependencies bloat cold start, unclear IAM (one function needs Bedrock + DynamoDB + S3). Muddles prompt attribution (all prompts in one file).

**Do this instead:** One Lambda per custom query/mutation. `practice/handler.ts`, `tone/handler.ts`, `classify/handler.ts`. Each has its own `prompts.ts` for attribution. Minimal IAM (practice needs Bedrock + DynamoDB Message write, tone only needs Bedrock).

### Anti-Pattern 5: Frontend Validation Only

**What people do:** Check input length and content in React component, assume Lambda receives valid data.

**Why it's wrong:** Malicious client can bypass frontend validation. Lambda crashes on unexpected input. Violates SKILL.md 1.4 (every Lambda validates input with zod).

**Do this instead:** Always validate in Lambda with zod schema, even if frontend also validates. Frontend validation is UX; backend validation is security:
```typescript
const input = z.object({
  message: z.string().min(1).max(1000),
  scenarioId: z.string().uuid()
}).parse(event.arguments) // Throws if invalid
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Bedrock Runtime | Lambda → `@aws-sdk/client-bedrock-runtime` → Converse API | Use cross-region inference profile ARN for redundancy. Set `maxTokens: 500`, `temperature: 0.3` for structured output. Retry on throttle (SDK auto-retry), fallback after 3 failures. |
| Cognito | Amplify Auth → email/password login | `Amplify.configure(outputs)` in `App.tsx`, call `signIn(email, password)`. No groups, all users equal. Owner-based access via `allow.owner()` in schema. |
| S3 | Future (profile photos) | Use Amplify Storage category, `uploadData()` with `accessLevel: 'protected'`. Store URL in User model photo field. Not needed for Nov 6 demo. |
| EventBridge | Future (scheduled check-ins) | `defineFunction({ schedule: 'every week' })` in `amplify/functions/weekly-checkin/`. Not needed for Nov 6 demo. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Screen ↔ Data Client | Direct method calls | `client.models.Todo.create()`, `client.queries.practiceTurn()`. Type-safe via Schema generic. |
| Data Client ↔ AppSync | GraphQL over HTTPS | Auto-configured via `amplify_outputs.json`. Auth header from Cognito session. |
| AppSync ↔ Lambda | Event payload | AppSync passes `{ arguments, identity }`. Lambda returns JSON. Timeout: 30s (adjust if Bedrock slow). |
| Lambda ↔ Bedrock | AWS SDK | IAM role for auth, no keys. Use `us.` inference profile for multi-region. Log request ID + latency, never message content. |
| Lambda ↔ DynamoDB | Amplify Data client in Lambda | `allow.resource(functionName)` in schema grants Lambda access. Use `client.models.PracticeRun.create()` for type safety. |

## Migration Path: Mock State → Real Data

**Current state:** Monolithic `App.tsx` with all data in `this.state` (circles, messages, events, practice sessions). No persistence, resets on refresh.

**Goal:** Replace mock state with DynamoDB-backed models via Amplify Data client, while minimizing changes to rendering logic.

**Strategy:** Parallel construction then cutover.

### Step 1: Define Schema (Week 1)
Create `amplify/data/resource.ts` with models matching current state shape:
- `User` (name, email, photo, interests, theme)
- `Group` (circles: Gaming, Music, Anime, etc.)
- `Message` (groupId, sender, content, timestamp)
- `Event` (title, date, hostId, groupId, comfort settings)
- `Rsvp` (eventId, userId, status)
- `PracticeRun` (scenarioId, level, userGoal, hints, feedback)
- `Reflection` (eventId, rating, wins)

Authorization: `allow.owner()` for Reflection/PracticeRun, `allow.authenticated()` for Message (filtered by groupId in query).

### Step 2: Build Lambda Functions (Week 1)
Implement `practice`, `tone`, `classify` handlers with Bedrock calls. Start with practice (highest priority for demo). Use scripted fallback when Bedrock unavailable (per SKILL.md 1.3).

### Step 3: Extract First Screen (Week 2)
Pick simplest screen: **Reflect**. Create `src/screens/Reflect.tsx`, move rendering logic, add API call to load past reflections:
```typescript
componentDidMount() {
  const { data } = await client.models.Reflection.list({ filter: { owner: { eq: userId } } })
  this.setState({ reflections: data })
}
```
Update `App.tsx` to render `<Reflect />` when `this.state.view === 'reflect'`. Test with real account.

### Step 4: Extract Core Screens (Week 2)
Priority order (aligns with demo flow):
1. **Home** (read events, practice cards)
2. **CircleChat** (real-time subscriptions critical)
3. **Practice** (Bedrock integration, complex state)
4. **EventDetail** (RSVP, preview)

For each: Create screen file, move rendering, replace `this.state.circles` with `client.models.Group.list()`, replace hardcoded arrays with API calls.

### Step 5: Seed Real Data (Week 2)
Write `scripts/seed/seed-circles.ts` to create 6 circles (Gaming, Music, Anime, Cooking, Art, Tech) with made-up members. Run once: `tsx scripts/seed/seed-circles.ts`.

Create 2 test accounts (user1@test.com, user2@test.com) via Cognito console. Test messaging between them.

### Step 6: Parallel Testing (Week 2)
Keep old monolithic `App.tsx` as `AppOld.tsx`. Feature flag in `main.tsx`:
```typescript
const USE_NEW_SCREENS = true
root.render(USE_NEW_SCREENS ? <App /> : <AppOld />)
```
Test new screens against real backend. Compare rendering with old mock UI. Fix gaps.

### Step 7: Cutover (Week 3)
Once Home, CircleChat, Practice, EventDetail work with real data: delete `AppOld.tsx`, remove feature flag, extract remaining screens (Me, Onboarding, CheckIn). Ship to production.

## Build Order (Dependencies)

### Phase 1: Foundation (Days 1-2)
1. Amplify backend setup (`npx ampx sandbox`)
2. Define schema in `amplify/data/resource.ts` (all models)
3. Generate client, configure in `App.tsx`
4. Test auth: sign up, login, `getCurrentUser()`

**Blocker:** Need AWS account, Bedrock access approved. **Parallel work:** Extract Mo, Card, NavBar components from `App.tsx` (no backend needed).

### Phase 2: Lambda Functions (Days 3-4)
1. `classify` function (shared by practice and tone)
2. `practice` function (depends on classify)
3. `tone` function (depends on classify)
4. `preview` function (independent, can parallelize)

**Blocker:** Bedrock model access (fill out use-case form if needed). **Parallel work:** Build loading/error/empty states for screens.

### Phase 3: Screen Migration (Days 5-7)
1. Reflect (simplest, no subscriptions)
2. Home (reads events and practice cards)
3. EventDetail (RSVP writes, preview reads)
4. CircleChat (subscriptions, message writes)
5. Practice (complex: calls custom query, multi-step state)

**Blocker:** Practice depends on `practiceTurn` Lambda working. **Parallel work:** Seed scripts for circles and events.

### Phase 4: Polish (Days 8-10)
1. Guardian link flow (request, accept, permissions)
2. Tone check + reply ideas (keyword layer + LLM)
3. Calm down screen (breather, help)
4. Notifications (in-app only, no web push for demo)

**Blocker:** None. **Parallel work:** Test with 2 accounts (message request, circle chat, guardian link).

### Phase 5: Pre-Demo (Days 11-12)
1. Run bias probe on practice prompts (Wed before Fri demo)
2. Export AI prompts to PDF (`pandoc AI_PROMPTS/*.md -o ai-prompts.pdf`)
3. Update README AI disclosure and attribution
4. Rehearse demo script with real accounts

## Sources

- [AWS Amplify Gen 2 Data Setup](https://docs.amplify.aws/react/build-a-backend/data/set-up-data/)
- [AWS Amplify Gen 2 Custom Business Logic](https://docs.amplify.aws/react/build-a-backend/data/custom-business-logic/)
- [Amplify Gen 2 Full-Stack App Tutorial (OneUpTime, Feb 2026)](https://oneuptime.com/blog/post/2026-02-12-build-a-full-stack-app-with-amplify-gen-2/view)
- [Amplify Gen 2 GraphQL AppSync Integration (OneUpTime, Feb 2026)](https://oneuptime.com/blog/post/2026-02-12-amplify-api-graphql-appsync/view)
- [AWS Amplify Gen 2 Optimistic UI Patterns](https://docs.amplify.aws/react/frontend/data/optimistic-ui/)
- [React Class to Functional Component Migration (CodeZup)](https://codezup.com/migrating-from-class-components-to-react-hooks-guide/)
- [Separation of Concerns in React (FreeCodeCamp)](https://www.freecodecamp.org/news/separation-of-concerns-react-container-and-presentational-components/)
- [Breaking Down Monolithic Components (Kiyo-n-Zane)](https://zane-portfolio.kiyo-n-zane.com/blog/by/developer/from_monolithic_to_react_compound_pattern/)

---
*Architecture research for: AWS Amplify Gen 2 backend integration with Bridge React app*
*Researched: 2026-11-03*
