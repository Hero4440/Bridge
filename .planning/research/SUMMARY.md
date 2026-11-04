# Project Research Summary

**Project:** Bridge (Preview. Practice. Go.) — AWS Amplify Gen 2 Backend Integration
**Domain:** Social app backend with AI-powered mental health support
**Researched:** 2026-11-03
**Confidence:** HIGH

## Executive Summary

Bridge is a neurodivergent-friendly social app requiring production-grade AWS integration (Amplify Gen 2, Cognito, AppSync, DynamoDB, Bedrock) with no mocked services. The product combines standard social features (real-time chat, events, RSVPs) with AI-powered practice scenarios and safety tools. The team faces a 2-day deadline (Nov 4 demo) with no prior Amplify Gen 2 experience, requiring ruthless prioritization.

The recommended approach: Build infrastructure first (auth, data models, AI endpoints) before extracting screens from the existing 2190-line monolithic React component. Use AppSync subscriptions for live chat (never polling), Lambda-backed custom queries for all Bedrock calls, and owner-based authorization for private data. Critical success factor: Implement cost guards (AWS Budgets, rate limiting, maxTokens caps) BEFORE first Bedrock call to prevent budget overruns.

Key risks include Bedrock cost explosions (teams report $30k bills with no warning), TypeScript type generation failures on complex schemas, AppSync subscription disconnects, and cross-region inference profile IAM misconfigurations. Mitigation: Set budget alerts first, test deploys early, use simple authorization rules, and implement fallback responses when AI endpoints timeout.

## Key Findings

### Recommended Stack

Amplify Gen 2 provides code-first TypeScript backend definitions replacing Gen 1's CLI-based approach (EOL May 2027). Core architecture: React frontend → Amplify Data client → AppSync GraphQL → Lambda functions (for AI) → DynamoDB + Bedrock.

**Core technologies:**
- **AWS Amplify Gen 2 (6.20.0+):** Full-stack framework with native AWS integration, personal cloud sandboxes for isolated dev
- **Amazon Cognito:** Email/password auth with session persistence (30-day refresh tokens), no groups/roles needed
- **AWS AppSync:** Managed GraphQL API with WebSocket subscriptions for real-time chat, deny-by-default authorization
- **Amazon DynamoDB:** Serverless persistence with owner-based access control, TTL for ephemeral data
- **AWS Lambda (Node.js 20+):** Serverless functions for Bedrock calls, business logic, custom queries/mutations
- **Amazon Bedrock (Claude 3.5 Sonnet v2):** Managed LLM via Converse API with native structured outputs (GA Feb 2026)
- **TanStack React Query:** Required for Amplify Gen 2 data operations (useQuery, useMutation)

**Critical version requirements:**
- `aws-amplify@6.20.0+` (Gen 2 minimum)
- Node.js 18+ locally, 20+ for Lambda runtime
- TypeScript strict mode for backend definitions in `amplify/` directory

**What NOT to use:**
- Amplify Gen 1 (maintenance mode, no type safety)
- DataStore (not supported in Gen 2)
- Mocked backends (violates SKILL.md requirement for real AWS services)
- Polling for real-time updates (use AppSync subscriptions)

### Expected Features

**Must have (table stakes):**
- Email/password authentication — standard sign-up flow, users won't trust passwordless for sensitive data
- Real-time chat delivery — messages appear instantly without refresh (WhatsApp/Messenger set expectation)
- Message history persistence — chat apps that lose history feel broken
- Profile creation/editing — users need identity (name, photo, bio) to participate
- RSVP tracking — events need yes/maybe/no counts visible to host and attendees
- Message filtering — first message from stranger held for accept/decline (prevents spam/harassment)
- Basic moderation — report + block always available; users expect protection from abuse
- Notifications — users need pings for messages, RSVPs, alerts; without this they miss critical updates

**Should have (competitive advantage):**
- AI practice scenarios — core Bridge value: rehearse hard conversations before real ones; reduces anxiety
- Tone check (pre-send) — catches harsh words before sending; prevents regret, teaches kinder phrasing
- AI reply suggestions — helps when stuck ("what do I say?"); lowers barrier to participation
- Proactive safety (Mo intercepts) — AI flags requests for money/address before they reach recipient
- Event prep checklists — walks user through logistics (travel, exit plan, tell trusted person); reduces overwhelm
- Calm-down tools — 1-minute breather, "I need help" button to trusted person; crisis support without leaving app
- Reflection after events — 3-tap feedback (hard/okay/good + what went well); builds self-awareness over time
- Fading support (L1→L3) — hints fade as user improves; scaffolding that removes itself

**Defer (v2+):**
- Typing indicators — AppSync subscription fan-out expensive, creates pressure to reply fast
- Read receipts — adds social pressure; contradicts app's low-pressure philosophy
- Voice messages — requires S3 storage + player UI; defer until text messaging validated
- Multi-language support — add when English version validated
- Analytics dashboard — defer until data model stable

**Anti-features (commonly requested, problematic):**
- Auto-rewrite messages — removes agency, risks misrepresenting user intent; show suggestion instead
- Leaderboard/streaks — creates comparison anxiety; contradicts "fade support" goal
- Open-ended AI role-play — hard to evaluate, risk of harmful requests; use 7 scripted scenarios only
- SMS notifications — costs add up fast, requires phone numbers; use in-app + web push instead

### Architecture Approach

Standard Amplify Gen 2 architecture: React components call type-safe Data client (`generateClient<Schema>()`) which talks to AppSync GraphQL API. AppSync routes to DynamoDB for models or Lambda for custom queries. Lambda functions validate input with zod, call Bedrock Converse API, save results to DynamoDB.

**Major components:**
1. **React screens** — UI rendering, local state for forms/modals; class components initially to minimize migration risk from monolithic App.tsx
2. **Amplify Data client** — Type-safe GraphQL operations; `client.models.Message.create()`, `client.queries.practiceTurn()`, `observeQuery()` for subscriptions
3. **AppSync** — GraphQL endpoint with deny-by-default authorization; enforces `allow.owner()` for private data, `allow.authenticated()` for shared
4. **Lambda functions** — One function per AI endpoint (practice, tone, classify); validates input, calls Bedrock, returns structured output
5. **DynamoDB** — Auto-generated tables from schema models; owner field for access control, GSI on groupId for chat, TTL for ephemeral data

**Key patterns:**
- Screen-level Data client calls (no intermediate service layer for prototype)
- Lambda-backed custom queries for all Bedrock calls (AppSync can't call Bedrock directly)
- Incremental migration from monolithic App.tsx (extract screens one at a time, starting with simplest)
- Manual loading/error state in component state (avoid new libraries under deadline pressure)

**Migration strategy:**
Parallel construction then cutover. Define schema in `amplify/data/resource.ts` matching current state shape. Build Lambda functions for AI. Extract simplest screen first (Reflect), then core screens (Home, CircleChat, Practice, EventDetail). Keep old monolithic component as fallback with feature flag during transition.

### Critical Pitfalls

1. **Budget overruns from Bedrock calls** — Teams report $30k bills with no warning. Default quotas low (25 RPM for Opus, ~100 for Sonnet) but costs accumulate silently. Prevention: Set AWS Budgets with 50/80/100% alerts FIRST, cap maxTokens (500 for feedback), implement per-user rate limiting (DynamoDB counter with TTL), use reserved Lambda concurrency. Never test with Opus (10x cost of Haiku).

2. **Cross-region inference profile IAM permissions** — `AccessDeniedException` despite having model permissions. Inference profiles route to multiple regions, requiring IAM for BOTH profile ARN AND foundation-model ARNs in all destination regions. Prevention: Grant `arn:aws:bedrock:*::foundation-model/anthropic.claude-*` in addition to inference profile ARN.

3. **TypeScript type generation failures on large schemas** — `TS2590: union type too complex` errors block deployment. Since @aws-amplify/backend-deployer 2.3.1, deploys type-check with TypeScript 5.8. Prevention: Run `npx ampx generate graphql-client-code` after EVERY schema change, clear TS cache (`npx tsc --build --clean`), keep schema flat (denormalize vs deep nesting), test deploy early.

4. **AppSync subscription disconnects** — Live chat stops updating after 2-3 minutes of inactivity. Prevention: Test with 2 accounts simultaneously, add reconnection logic + "reconnecting..." UI, use simple filters (single-field equality), avoid mixing `allow.owner()` + `allow.groups()` without understanding precedence.

5. **Bedrock structured output mistakes** — `classify()` returns unparseable JSON. Prevention: Use `toolConfig` with `toolChoice: { tool: { name: 'classify' } }` for forced tool use, validate output with zod, implement fallback for validation failures, test with all label categories.

6. **Lambda cold starts with Bedrock latency spikes** — First AI call after idle takes 10+ seconds (Lambda cold start + Bedrock spin-up). Prevention: Implement fallback replies when Bedrock > 5s, show realistic loading UI ("this takes a few seconds the first time"), test after 1+ hour inactivity.

7. **Wrong authorization rules** — Frontend can't access data, or wrong users see private data. Amplify is deny-by-default. Prevention: Use `allow.owner()` for Reflection/PracticeRun, `allow.authenticated()` for shared data (Events, circles), test with 2 accounts (owner and non-owner), add `allow.resource(lambdaFn)` for Lambda Data client access.

## Implications for Roadmap

Based on research, suggested phase structure for 2-day deadline:

### Phase 1: Infrastructure & Authentication
**Rationale:** Nothing works without auth and data models. Amplify sandbox setup is prerequisite for all features. Early deploy test catches TypeScript type errors before deadline pressure.

**Delivers:**
- Amplify Gen 2 backend scaffolded (`amplify/` directory structure)
- Cognito email/password auth (sign-up, login, session persistence)
- Schema definition for all models (User, Message, Event, PracticeRun, Reflection, Contact)
- AWS Budgets configured with alerts (prevents cost overruns)
- IAM policies for Bedrock access (inference profile + foundation model ARNs)
- First test deploy (validates TypeScript types, IAM, schema)

**Addresses:**
- Authentication (table stakes from FEATURES.md)
- Message/event persistence (table stakes from FEATURES.md)

**Avoids:**
- Budget overruns (Pitfall #1 — set budgets BEFORE first Bedrock call)
- IAM permission errors (Pitfall #2 — grant both ARN types)
- Type generation failures (Pitfall #3 — test deploy early)

**Research flag:** Standard pattern — follow official Amplify Gen 2 quickstart, no additional research needed.

### Phase 2: AI Endpoints (Lambda + Bedrock)
**Rationale:** AI practice scenarios are core value prop for judges. Building Lambda functions early uncovers Bedrock integration issues with time to fix. `classify()` is shared by practice and tone check, so it must come first.

**Delivers:**
- `classify` Lambda (detects crisis, unsafe, money, address labels with Bedrock)
- `practice` Lambda (generates strength + tip feedback based on scenario/level/user goal)
- Bedrock Converse API integration with structured outputs (toolConfig + zod validation)
- Fallback responses when Bedrock times out or throttles (scripted replies)
- Per-user rate limiting (DynamoDB counter with TTL, 100 requests/hour cap)
- AppSync custom queries wired to Lambdas (`practiceTurn`, `classify`)

**Uses:**
- Lambda (Node.js 20) from STACK.md
- Bedrock Converse API from STACK.md
- zod validation from STACK.md

**Implements:**
- AI practice scenarios (differentiator from FEATURES.md)
- AI classification for safety (table stakes from FEATURES.md)

**Avoids:**
- Bedrock structured output mistakes (Pitfall #5 — use toolConfig, validate with zod)
- Cold start timeouts (Pitfall #6 — implement fallback, show loading UI)
- Budget overruns (Pitfall #1 — rate limiting implemented here)

**Research flag:** Standard pattern — follow Bedrock Converse API docs, but test structured output schema carefully.

### Phase 3: Real-Time Chat & Subscriptions
**Rationale:** Live messaging is table stakes for social apps. AppSync subscriptions have tricky authorization and reconnection logic. Must work flawlessly for demo, so needs dedicated testing with 2 accounts.

**Delivers:**
- Circle chat with real-time message delivery (AppSync `observeQuery()` subscription)
- Message history persistence (DynamoDB with GSI on groupId)
- Subscription reconnection logic (auto-reconnect on disconnect)
- Message filtering (first DM held for accept/decline if sender not in contacts)
- Contact system (DynamoDB Contact table, accept/decline flow)

**Uses:**
- AppSync subscriptions from STACK.md
- DynamoDB GSI from STACK.md

**Implements:**
- Real-time chat delivery (table stakes from FEATURES.md)
- Message filtering (table stakes from FEATURES.md)

**Avoids:**
- Subscription disconnects (Pitfall #4 — reconnection logic + UI, test with 2 accounts)
- Wrong authorization (Pitfall #7 — `allow.authenticated()` for messages, filter by groupId in query)

**Research flag:** Moderate — AppSync subscription filters and authorization rules can be tricky, but well-documented.

### Phase 4: Events & Core Screens
**Rationale:** Events are simpler than chat (no subscriptions), so extract Event screens from monolith while chat is being tested. Builds user-facing value while unblocking parallel work.

**Delivers:**
- Event create + detail screens (extracted from App.tsx)
- RSVP tracking (DynamoDB RSVP table with GSI on eventId)
- Event prep checklists (static checklist based on event type)
- Home screen (extracted from App.tsx, loads events and practice cards)
- Profile screen (extracted from App.tsx, name/photo/interests)

**Implements:**
- RSVP tracking (table stakes from FEATURES.md)
- Event prep checklists (differentiator from FEATURES.md)
- Profile persistence (table stakes from FEATURES.md)

**Avoids:**
- Screen extraction complexity (ARCHITECTURE.md pattern: extract simplest first, test before next)

**Research flag:** No research needed — standard CRUD operations.

### Phase 5: Practice & Safety Features
**Rationale:** Wires AI endpoints (from Phase 2) to Practice screen UI. Includes crisis detection and "I need help" alert (safety requirement). Builds on working Lambda + Bedrock infrastructure.

**Delivers:**
- Practice screen (extracted from App.tsx, calls `practiceTurn` custom query)
- Scenario selection UI (7 scripted scenarios: join chat, start convo, disagree kindly, etc.)
- Feedback display (strength + tip from Bedrock, or fallback if timeout)
- Crisis detection (classify flags "I want to hurt myself" → shows 988 + trusted person)
- "I need help" alert (sends notification to trusted person via Notification system)

**Implements:**
- AI practice scenarios (differentiator from FEATURES.md)
- "I need help" alert (table stakes from FEATURES.md)
- Crisis detection (safety requirement from PITFALLS.md security section)

**Avoids:**
- Input validation bypass (ARCHITECTURE.md anti-pattern: always validate in Lambda with zod)
- Raw transcript storage (privacy violation per PITFALLS.md — store only hints/level/feedback)

**Research flag:** Moderate — practice prompts need bias probe testing before demo (SKILL.md 4.3 requirement).

### Phase 6: Polish & Deployment
**Rationale:** Final 24 hours for production deployment, testing with 2 accounts, and demo rehearsal. Sandbox works but production has different IAM/secrets/deployment timing.

**Delivers:**
- Production deployment (main branch via Amplify Hosting)
- Secrets configured in Amplify console (not just sandbox)
- 2-account testing (message requests, circle chat, guardian link, practice)
- Demo script rehearsal with real accounts
- AI prompt export to PDF (pandoc AI_PROMPTS/*.md → ai-prompts.pdf)
- README AI disclosure updated

**Avoids:**
- Sandbox vs production differences (Pitfall #6 — set secrets in console, deploy 24h before demo)
- Last-minute IAM issues (verified in Phase 1 deploy test)

**Research flag:** No research — follows standard deployment checklist.

### Phase Ordering Rationale

- **Infrastructure first** because auth/data models gate all features. Early deploy test catches type errors with time to fix.
- **AI endpoints second** because they're core value prop and have most unknowns (Bedrock latency, structured output, cost control). Build when time budget allows iteration.
- **Real-time chat third** because it's table stakes but complex (subscriptions, authorization). Needs dedicated testing time.
- **Events fourth** because simpler than chat (no subscriptions), can parallelize with chat testing.
- **Practice screens fifth** because they wire AI endpoints (Phase 2) to UI. Requires working Lambda infrastructure.
- **Polish last** because production deploy reveals environment-specific issues. 24h buffer allows debugging.

**Grouping logic:**
- Phase 1-2: Backend infrastructure (no UI changes)
- Phase 3-5: Screen extraction + integration (wiring backend to frontend)
- Phase 6: Production validation (deployment, testing, rehearsal)

**Deadline fit:**
- Day 1 (Nov 3): Phases 1-2 (8-10 hours)
- Day 2 (Nov 4 morning): Phases 3-4 (6-8 hours)
- Day 2 (Nov 4 afternoon): Phases 5-6 (4-6 hours + testing/rehearsal)

**Parallel work opportunities:**
- Phase 3 (chat implementation) + Phase 4 (screen extraction) — different team members
- Phase 2 (Lambda dev) + Phase 1 (schema finalization) — backend vs frontend work

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (AI endpoints):** Bedrock prompt engineering for practice scenarios needs bias probe validation (run Python script on prompts, check for stereotypes per SKILL.md 4.3). Structured output schema for `classify()` needs testing with all label categories (crisis, unsafe, money, address, bias).
- **Phase 3 (real-time chat):** AppSync subscription filters and authorization rule precedence (`allow.owner()` vs `allow.authenticated()` vs `allow.groups()`) — read official docs carefully, test with 2 accounts.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (infrastructure):** Amplify Gen 2 setup follows official quickstart, Cognito email auth is OOTB, schema definition has clear examples.
- **Phase 4 (events):** Standard CRUD operations with DynamoDB, well-documented GSI patterns.
- **Phase 6 (deployment):** Branch-based deployment via Amplify Hosting is documented, secrets setup is straightforward.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Official Amplify Gen 2 docs, recent practitioner reports (Feb 2026), npm package versions verified. Gen 1 EOL May 2027 confirmed. Bedrock Converse API GA with structured outputs (Feb 2026). |
| Features | **MEDIUM** | WebSearch for social app patterns verified with multiple sources. AI moderation trends well-documented. Some Bridge-specific features (fading support, practice scenarios) are unique, so no external validation. MVP definition aligns with 2-day deadline. |
| Architecture | **HIGH** | Official Amplify Gen 2 architecture docs, real-world migration guides (OneUpTime, Raft Labs), established patterns for Lambda-backed custom queries. Monolithic component migration strategy validated by practitioner articles. |
| Pitfalls | **HIGH** | All critical pitfalls sourced from official AWS docs, GitHub issues, recent practitioner reviews (2026). Budget overrun warnings from multiple sources (Jamf, AiForAutomation). IAM cross-region inference profile issues confirmed in AWS Re:Post. TypeScript type errors from active GitHub issues. |

**Overall confidence:** **HIGH**

Research is based on official AWS documentation (Amplify Gen 2, AppSync, Bedrock), verified with recent practitioner reports (Feb-May 2026), and cross-referenced with active GitHub issues. Stack recommendations align with SKILL.md requirements (real AWS services, no mocks, production-grade). Pitfalls are well-documented with concrete prevention strategies.

### Gaps to Address

**Amplify Gen 2 learning curve:**
Research shows Gen 2 is "code-first" with steeper initial learning than Gen 1's visual Studio UI. Team has no prior Gen 2 experience. Mitigation: Follow official quickstart step-by-step, use `npx ampx sandbox` for fast iteration, expect slower initial velocity (productivity improves after structure is understood). Budget 3-4 hours for Phase 1 setup vs 1-2 hours if team already knew Gen 2.

**Bedrock quota limits:**
Default quotas for Claude Sonnet are ~100 RPM (requests per minute). For 4-person team testing heavily, this can hit limits. Mitigation: Request quota increase to 500 RPM before team starts testing (via AWS Support). Use Haiku for development ($0.25/MTok vs $3/MTok for Sonnet). Implement per-user rate limiting (100 requests/hour) so one user can't exhaust quota.

**Practice prompt bias validation:**
SKILL.md 4.3 requires running bias probe on practice prompts. Research found no off-the-shelf tool for this specific use case. Mitigation: Manual review of prompts for stereotypes (Guardian as female, scenarios assuming neurotypical behaviors), use Python script provided by instructors, document findings in AI_PROMPTS/bias-probe-results.md.

**TypeScript type complexity:**
Bridge schema has 9+ models (User, Message, Event, RSVP, PracticeRun, Reflection, Contact, GuardianLink, Notification) with relationships. Research shows schemas this large can trigger TS2590 "union too complex" errors. Mitigation: Keep schema flat (denormalize vs deep nesting), simplify authorization rules (fewer `allow.*` combos), test deploy after defining first 5 models (User, Message, Event, PracticeRun, Contact) to catch type errors early.

**AppSync subscription authorization:**
Research shows mixing `allow.owner()` + `allow.groups()` has precedence rules that aren't obvious. Bridge doesn't use groups, but does use owner-based access for Reflections. Mitigation: Use `allow.owner()` ONLY for Reflection/PracticeRun, use `allow.authenticated()` for Messages (filter by groupId in query), test with 2 accounts (owner and non-owner) before declaring subscription complete.

## Sources

### Primary (HIGH confidence)

**Official AWS Documentation:**
- [Amplify Gen 2 Quickstart](https://docs.amplify.aws/react/start/quickstart/)
- [Amplify Gen 2 Manual Installation](https://docs.amplify.aws/react/start/manual-installation/)
- [Amplify Gen 2 Sandbox Environments](https://docs.amplify.aws/react/deploy-and-host/sandbox-environments/setup/)
- [Custom Queries and Mutations](https://docs.amplify.aws/react/build-a-backend/data/custom-business-logic/)
- [Per-User/Per-Owner Data Access](https://docs.amplify.aws/react/build-a-backend/data/customize-authz/per-user-per-owner-data-access/)
- [AppSync Real-Time Subscriptions](https://docs.aws.amazon.com/appsync/latest/devguide/aws-appsync-real-time-data.html)
- [AWS Amplify Gen 2 GA Announcement (May 2024)](https://aws.amazon.com/about-aws/whats-new/2024/05/aws-amplify-gen-2-available/)
- [Structured Outputs on Amazon Bedrock (GA Feb 2026)](https://aws.amazon.com/blogs/machine-learning/structured-outputs-on-amazon-bedrock-schema-compliant-ai-responses/)
- [Bedrock Converse API Reference](https://docs.aws.amazon.com/sdk-for-python/v1/reference/clients/bedrock-runtime/operations/converse/)

**AWS Re:Post (verified solutions):**
- [Governing Amazon Bedrock Costs](https://repost.aws/articles/AR5rBgrAyQStqFOiBYu88PDg/governing-amazon-bedrock-costs-team-and-user-level-tracking-budgets-and-hard-spend-controls-for-claude-code)
- [Resolve AccessDeniedException in Amazon Bedrock](https://repost.aws/knowledge-center/bedrock-access-denied-exception)

**GitHub Issues (active, recent):**
- [Amplify Gen 2 Schema Complexity TS2590 Error (#424)](https://github.com/aws-amplify/amplify-data/issues/424)
- [backend-deployer type-checks with TypeScript 5.8 (#3373)](https://github.com/aws-amplify/amplify-backend/issues/3373)
- [AppSync Subscription Disconnects (#3976)](https://github.com/aws-amplify/amplify-swift/issues/3976)

### Secondary (MEDIUM confidence)

**Practitioner Reviews (2026):**
- [How to Build a Full-Stack App with Amplify Gen 2 (OneUpTime, Feb 2026)](https://oneuptime.com/blog/post/2026-02-12-build-a-full-stack-app-with-amplify-gen-2/view)
- [AWS Amplify Gen 2 in Practice: Lessons on Speed and Scalability (Raft Labs)](https://medium.com/@raftlabs/aws-amplify-gen-2-in-practice-lessons-on-speed-and-scalability-6ee4cc8615ef)
- [Amazon Bedrock Review (2026): Is It Production Ready? (TrueFoundry)](https://www.truefoundry.com/blog/our-honest-review-of-amazon-bedrock-2026-edition)
- [AWS Bedrock Claude: $30,000 Invoice With No Warning (AiForAutomation)](https://aiforautomation.io/news/2026-05-16-aws-claude-30k-invoice-bedrock-cost-guardrails)

**Community Guides:**
- [Create a Virtual Assistant Using Amplify Gen 2 and AWS Bedrock (Cevo)](https://cevo.com.au/post/create-a-virtual-assistant-using-amplify-gen-2-and-aws-bedrock-2/)
- [Reliable JSON Output with Bedrock Tools (AWS Builder)](https://builder.aws.com/content/329F2PHP3mpovBBJNPVBcVNCKmO/reliable-json-output-with-bedrock-tools)
- [Cross-Region Inference with Amazon Bedrock (AWS Builder)](https://builder.aws.com/content/38ctvPLdCipntZ9Q2BmnZwDYihA/cross-region-inference-with-amazon-bedrock-optimizing-performance-cost-and-compliance)

**Social App Best Practices:**
- [Chat SDK Guide: Real-Time In-App Chat (TRTC.io)](https://trtc.io/blog/details/chat-sdk-guide-real-time-in-app-chat)
- [How to Build a Social Media App in 2026: The AI-First Complete Guide (GroovyWeb)](https://www.groovyweb.co/blog/how-to-build-social-media-app-2026)
- [AI Content Moderation Trends for 2026 (Conectys)](https://www.conectys.com/blog/posts/ai-content-moderation-trends-for-2026/)

### Tertiary (LOW confidence, needs validation)

**Migration Patterns:**
- [React Class to Functional Component Migration (CodeZup)](https://codezup.com/migrating-from-class-components-to-react-hooks-guide/) — general React patterns, not Bridge-specific
- [Breaking Down Monolithic Components (Kiyo-n-Zane)](https://zane-portfolio.kiyo-n-zane.com/blog/by/developer/from_monolithic_to_react_compound_pattern/) — conceptual, not tested with Amplify

**Performance:**
- [AWS Lambda Still Matters in 2026 (Danilo Falcão)](https://falcao.org/posts/aws-lambda-still-matters/) — cold start numbers for 2026, but may vary by workload
- [Benchmarking serverless cold start times for AWS Lambda 2026 runtimes (Johal)](https://www.johal.in/benchmarking-serverless-cold-start-times-for-aws-lambda-2026-runtimes) — third-party benchmark, not official AWS data

---
*Research completed: 2026-11-03*
*Ready for roadmap: YES*
