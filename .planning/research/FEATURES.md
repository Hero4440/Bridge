# Feature Research

**Domain:** Production social app backends
**Researched:** 2026-11-03
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email/password authentication | Standard sign-up flow for all social apps; users won't trust passwordless-only for sensitive data | LOW | Cognito handles this OOTB with session tokens, refresh flow automatic via Amplify |
| Session persistence | Users expect to stay logged in across browser closes, not re-auth every visit | LOW | Cognito refresh tokens last 30 days by default; Amplify auto-refreshes |
| Real-time chat delivery | Messages appear instantly without refresh; table stakes since 2015+ (WhatsApp, Messenger set expectation) | MEDIUM | AppSync subscriptions tied to mutations; filter by conversationId to avoid fan-out |
| Message history persistence | Chat apps that lose history feel broken; users re-read threads constantly | LOW | DynamoDB with GSI on conversationId; no expiry unless TTL explicitly set |
| Profile creation/editing | Users need identity (name, photo, bio) to participate in social spaces | LOW | S3 for photos via Amplify Storage; DynamoDB for metadata |
| Group/circle membership | Join/leave groups without admin approval (unless private); see member list | LOW | DynamoDB Group + Membership tables; owner can set private=true |
| RSVP tracking | Events need yes/maybe/no counts visible to host and attendees | LOW | DynamoDB RSVP table with GSI on eventId |
| Message filtering | First message from stranger held for accept/decline (prevents spam/harassment) | MEDIUM | Lambda pre-mutation check: if sender not in recipient's contacts → create MessageRequest |
| Basic moderation | Report + block always available; users expect protection from abuse | LOW | Write Report record to DynamoDB; block prevents future messages (enforced in Lambda) |
| Notifications | Users need pings for messages, RSVPs, alerts; without this they miss critical updates | MEDIUM | In-app banners sufficient for MVP; push via SNS+VAPID for production post-launch |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable for Bridge's mission.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI practice scenarios | Core Bridge value: rehearse hard conversations before real ones; reduces anxiety | HIGH | Bedrock Claude with scenario-specific prompts, 3 difficulty levels, structured feedback (strength + tip) |
| Tone check (pre-send) | Catches harsh words before sending; prevents regret, teaches kinder phrasing | MEDIUM | Keyword layer first (whatever, stupid, shut up) → Bedrock `/tone` only if needed; user always decides final send |
| AI reply suggestions | Helps when stuck ("what do I say?"); lowers barrier to participation in circles | MEDIUM | Bedrock with conversation context (last 3 messages) → 2-3 reply options; user picks or writes own |
| Proactive safety (Mo intercepts) | AI flags requests for money/address before they reach recipient; warning is private | HIGH | `classify()` Lambda on every DM; unsafe messages held, sender sees "Mo is reviewing" |
| Event prep checklists | Walks user through logistics (travel, exit plan, tell trusted person); reduces overwhelm | LOW | Static checklist based on event type (in-person vs online); no AI needed |
| Calm-down tools | 1-minute breather, "I need help" button to trusted person; crisis support without leaving app | MEDIUM | Timer UI + breathing animation (LOW); trusted-person alert via notification system (MEDIUM) |
| Reflection after events | 3-tap feedback (hard/okay/good + what went well); builds self-awareness over time | LOW | DynamoDB Reflection table; Mo replies with encouragement based on response |
| Fading support (L1→L3) | Hints fade as user improves; scaffolding that removes itself | MEDIUM | Practice level stored per scenario per user; promote to next level after 3 successful runs |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for tight deadlines or user trust.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Auto-rewrite messages | "Fix my tone automatically" | Removes agency, risks misrepresenting user intent, feels patronizing | Tone check shows why + suggests alternative; user decides |
| Real-time typing indicators | "Show when someone is typing" | AppSync subscription fan-out expensive; creates pressure to reply fast | Omit for MVP; add post-launch if users request |
| Read receipts | "Did they see my message?" | Adds social pressure; neurodivergent users often prefer async communication | Omit entirely; goes against app's low-pressure philosophy |
| Leaderboard/streaks | "Gamify practice completion" | Creates comparison anxiety, pressure to perform; contradicts "fade support" goal | Gentle badges only (First Hello, Kind Words); no public rankings |
| Open-ended AI role-play | "Let users practice any scenario" | Hard to evaluate, no clear end state, risk of harmful role-play requests | 7 scripted scenarios only; bounded interactions with clear goals |
| Admin moderation dashboard | "Review flagged content" | No moderator role per SKILL.md 2.2; team can query DynamoDB directly for reports | Write Report records; manual DB review for competition timeline |
| SMS notifications | "Ping users via text" | Costs add up fast; requires phone number collection (privacy concern) | In-app only for MVP; web push (free) for post-launch |
| Multi-account login | "Test with multiple users easily" | Adds SSO complexity; Cognito default is one account per email | Use separate browsers/profiles for testing; defer social login |

## Feature Dependencies

```
Authentication (Cognito)
    ├──requires──> Session management (refresh tokens)
    └──enables──> All authenticated features below

Real-time chat (AppSync subscriptions)
    ├──requires──> Message persistence (DynamoDB)
    └──requires──> Authentication (Cognito tokens authorize subscriptions)

Message filtering
    ├──requires──> Contact/friend system (DynamoDB Contact table)
    └──requires──> AI classification (Lambda classify())
    └──enables──> Message requests (accept/decline flow)

AI tone check
    ├──requires──> Bedrock access (IAM role on Lambda)
    └──requires──> Classification (crisis/unsafe detection first)
    └──enhances──> Real-time chat (catches harsh words before send)

Practice scenarios
    ├──requires──> Bedrock access (IAM role on Lambda)
    ├──requires──> User progress tracking (DynamoDB PracticeRun table)
    └──enables──> Fading support (L1→L2→L3 promotion logic)

Notifications
    ├──requires──> Event system (DynamoDB Event, RSVP tables)
    ├──requires──> Message system (DynamoDB Message table)
    └──enables──> "I need help" alerts (notification to trusted person)

Guardian link
    ├──requires──> Contact system (DynamoDB Contact table)
    └──requires──> Permission model (person chooses what guardian sees)
    └──conflicts──> Auto-share data (user must explicitly grant visibility)
```

### Dependency Notes

- **Authentication gates everything:** No Cognito = no AppSync authorization = app doesn't work
- **Real-time requires persistence:** AppSync subscriptions publish mutation results; DynamoDB stores messages
- **AI features share infrastructure:** All Bedrock calls use same IAM role, `classify()` Lambda, budget alerts
- **Message filtering needs contact system:** Can't filter "first message from stranger" without Contact table tracking relationships
- **Fading support needs progress tracking:** Can't promote L1→L2 without PracticeRun history per user per scenario

## MVP Definition (2-Day Deadline)

### Launch With (Nov 4 Night)

Minimum viable product for competition demo — what judges must see working.

- [x] **Authentication (Cognito)** — Sign-up, login, session persistence; without this nothing else works
- [x] **Real-time circle chat (AppSync)** — Live messages in groups; core social feature
- [x] **Event create + RSVP** — Host sets details, others respond Going/Maybe/Can't; tracks attendance
- [x] **Practice scenarios with AI** — 1-2 scenarios working end-to-end (user input → Bedrock → feedback); core value prop
- [x] **AI classification** — Crisis detection, unsafe message filtering; required for safety guardrails
- [x] **Message requests** — First DM held for accept/decline; prevents harassment
- [x] **Profile persistence** — Name, photo, interests saved to DynamoDB
- [x] **"I need help" alert** — Button sends notification to trusted person; crisis support

**Rationale:** These prove the core loop (Preview → Practice → Go → Reflect) and safety features work with real AWS services. Judges penalize mocked backends, so real Cognito + AppSync + Bedrock is non-negotiable.

### Add After Validation (Post-Competition)

Features to add once core is working and competition submitted.

- [ ] **Tone check** — Flag harsh words before send; add when practice scenarios stable
- [ ] **Reply suggestions** — AI offers 2-3 response options; add when Bedrock quota permits
- [ ] **Reflection flow** — 3-tap feedback after events; add when Event system fully tested
- [ ] **Fading support (L1→L3)** — Promote users to harder levels; add when progress tracking implemented
- [ ] **Web push notifications** — VAPID + service worker for browser pings; add when in-app notifications working
- [ ] **Guardian link** — Connect to trusted person with permission controls; add when Contact system stable
- [ ] **Calm-down tools** — 1-minute breather + breathing animation; add when "I need help" working

**Trigger for adding:** Competition submitted Nov 4 → team reviews judges' feedback → prioritize based on user testing with First Place AZ residents (real neurodivergent users).

### Future Consideration (Post-Launch)

Features to defer until product-market fit is established.

- [ ] **Voice messages** — Record/play audio in circles/DMs; requires S3 storage + player UI
- [ ] **Quiet check-ins** — Weekly "How are you?" from Mo via scheduled Lambda; needs EventBridge cron
- [ ] **Bias probe integration** — Run Python script, display results in app; research task, not user-facing
- [ ] **Multi-language support** — Spanish, French translations; add when English version validated
- [ ] **Social login** — Google, Apple sign-in; add when email/password flow proven
- [ ] **Analytics dashboard** — Track practice completion, event attendance; add when data model stable

**Why defer:** 2-day deadline requires ruthless focus on core value (AI practice + safety). These add complexity without proving the hypothesis ("practice reduces anxiety before real interactions").

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Authentication (Cognito) | HIGH | LOW | P1 |
| Real-time chat (AppSync) | HIGH | MEDIUM | P1 |
| Practice scenarios (Bedrock) | HIGH | HIGH | P1 |
| AI classification (safety) | HIGH | MEDIUM | P1 |
| Message requests (moderation) | HIGH | MEDIUM | P1 |
| Event create + RSVP | HIGH | LOW | P1 |
| "I need help" alert | HIGH | MEDIUM | P1 |
| Profile persistence | MEDIUM | LOW | P1 |
| Tone check | MEDIUM | MEDIUM | P2 |
| Reply suggestions | MEDIUM | MEDIUM | P2 |
| Reflection flow | MEDIUM | LOW | P2 |
| Fading support (L1→L3) | MEDIUM | MEDIUM | P2 |
| Web push notifications | MEDIUM | MEDIUM | P2 |
| Guardian link | MEDIUM | HIGH | P2 |
| Calm-down tools | MEDIUM | LOW | P2 |
| Voice messages | LOW | HIGH | P3 |
| Quiet check-ins | LOW | MEDIUM | P3 |
| Bias probe UI | LOW | MEDIUM | P3 |
| Multi-language | LOW | HIGH | P3 |
| Social login | LOW | MEDIUM | P3 |
| Analytics dashboard | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for Nov 4 competition demo (core loop + safety)
- P2: Should have post-competition (enhances core, deferred for deadline)
- P3: Nice to have post-launch (validation needed first)

## Deadline-Appropriate Scoping

### What to Cut First (If Behind Schedule)

**Day 1 (Nov 3) end:**
- If practice scenarios not working → cut to 1 scenario (most common: "join a chat") instead of 7
- If message requests complex → simplify to "all DMs allowed" (remove filtering), focus on report/block
- If "I need help" alert failing → replace with mailto: link to trusted person email

**Day 2 (Nov 4) morning:**
- If tone check not working → cut entirely (keyword list in UI only, no Bedrock call)
- If reflection flow incomplete → cut (nice-to-have, not core value)
- If guardian link not done → cut (defer to post-competition)

**Day 2 (Nov 4) afternoon:**
- If real-time chat subscriptions failing → fall back to polling every 3s (works for demo, fix later)
- If Bedrock throttling → show fallback message ("Mo is thinking, try again") instead of hard error

### What Never Gets Cut

- Authentication (Cognito) — app doesn't work without it
- Practice scenario with AI feedback — core value prop, judges expect to see it
- AI classification for safety — required per challenge rules (no unsafe content in demo)
- Message persistence — chat app without history is broken

### Sequential Execution for 2-Day Timeline

**Day 1 (Nov 3):**
1. Amplify setup (auth, data schema, hosting) — 3-4 hours
2. Cognito integration (sign-up, login, session) — 2-3 hours
3. DynamoDB schema + AppSync API (tables, queries, mutations) — 2-3 hours
4. Real-time chat (AppSync subscriptions) — 2-3 hours
5. End-of-day: auth + chat working, can send/receive messages live

**Day 2 (Nov 4):**
1. Practice scenario Lambda + Bedrock (1 scenario end-to-end) — 3-4 hours
2. AI classification Lambda (crisis, unsafe messages) — 2 hours
3. Message requests (accept/decline flow) — 2 hours
4. "I need help" alert (notification to trusted person) — 1-2 hours
5. Testing + bug fixes — 2-3 hours
6. Final demo recording + submission — 1 hour

**Parallel work (if team splits):**
- Person A: Amplify infra + Cognito + AppSync
- Person B: Lambda functions + Bedrock integration
- Person C: Frontend integration (replace mock state with Amplify Data client)
- Person D: Testing + prompt logging + budget alerts

## Competitor Feature Analysis

| Feature | Discord | Slack | WhatsApp | Bridge Approach |
|---------|---------|-------|----------|-----------------|
| Real-time chat | WebSockets, unlimited history | WebSockets, 90-day free history | E2E encrypted, local storage | AppSync subscriptions, DynamoDB unlimited (within budget) |
| Message filtering | Keyword filters, AutoMod AI | Enterprise-only moderation | Report only, no pre-send filter | AI pre-send check for unsafe requests (money, address) |
| AI features | None native (bots via API) | Slack AI summaries, search | None | Practice scenarios, tone check, reply suggestions (core differentiator) |
| Authentication | Email, phone, social login | Email, SSO (enterprise) | Phone number only | Email/password via Cognito (social login deferred) |
| Notifications | Desktop push, mobile push, email | Desktop, mobile, email, SMS | Mobile push, desktop | In-app for MVP, web push post-launch |
| Moderation | User reports → Trust & Safety team | Admin controls, message deletion | User reports → WhatsApp review | User reports → DynamoDB (no admin dashboard) |
| Group membership | Public, private, invite-only roles | Public, private channels | Group admin controls | Public circles (Gaming, Music, etc.), private events (invite-only) |
| Event planning | Voice channels, scheduled events | Huddles, Slack Connect | Group calls (no RSVP) | Event wizard (what/when/where), RSVP tracking, prep checklist (differentiator) |

**Our differentiator:** AI coaching before real interactions (practice scenarios, tone check, reply suggestions). Competitors have post-hoc AI (summaries, search) or no AI. Bridge's "Preview → Practice → Go" is unique.

## Complexity Analysis

### High Complexity (3-4 hours per feature)

- **Practice scenarios with AI:** System prompt per scenario, 3 difficulty levels, structured output (strength + tip), fallback handling, prompt logging
- **AI tone check:** Keyword layer + Bedrock call, explain why word flagged, suggest alternatives, user decides final send
- **Proactive safety (Mo intercepts):** Classify every DM, hold unsafe messages, private warning to sender, recipient never sees original
- **Guardian link with permissions:** Contact request flow, person chooses visibility (brave steps, help alerts, nothing), guardian sees only allowed data

### Medium Complexity (2-3 hours per feature)

- **Real-time chat (AppSync):** Subscriptions tied to mutations, filter by conversationId, handle reconnects, loading states
- **Message filtering:** Check sender in recipient's contacts, create MessageRequest if not, accept/decline flow updates Contact table
- **AI classification:** Single `classify()` Lambda for all labels (crisis, unsafe, bias), JSON output validated with zod, confidence scores
- **Notifications:** DynamoDB Notification table, create on events (message, RSVP, alert), mark read, clear all
- **Fading support (L1→L3):** Track PracticeRun history, calculate success rate, promote to next level after 3 good runs

### Low Complexity (1-2 hours per feature)

- **Authentication (Cognito):** Amplify handles sign-up, login, session refresh automatically
- **Session persistence:** Cognito refresh tokens OOTB, Amplify auto-refreshes before expiry
- **Message history persistence:** DynamoDB Message table with GSI on conversationId, query last 50
- **Profile create/edit:** DynamoDB User table, S3 for photo upload via Amplify Storage
- **Group membership:** DynamoDB Membership table, join/leave mutations, query members
- **RSVP tracking:** DynamoDB RSVP table with GSI on eventId, count yes/maybe/no
- **Event prep checklists:** Static checklist based on event type (in-person: plan travel, pack headphones; online: test mic)
- **Reflection after events:** DynamoDB Reflection table, 3-tap UI (hard/okay/good), Mo reply based on response
- **Basic moderation (report/block):** Write Report record, update User blockedUsers list, Lambda checks blockedBy before delivering messages

## Sources

**Architecture & Real-Time:**
- [Chat SDK Guide: Real-Time In-App Chat](https://trtc.io/blog/details/chat-sdk-guide-real-time-in-app-chat)
- [How to Build a Social Media App in 2026: The AI-First Complete Guide](https://www.groovyweb.co/blog/how-to-build-social-media-app-2026)
- [GetStream Chat Documentation](https://getstream.io/chat/docs.md)

**AWS AppSync & Real-Time:**
- [Use AppSync Real-Time Subscriptions](https://oneuptime.com/blog/post/2026-02-12-appsync-real-time-subscriptions/view)
- [AWS AppSync Real-Time Data](https://docs.aws.amazon.com/appsync/latest/devguide/aws-appsync-real-time-data.md)
- [Building A Real-Time Chat Feature With AWS AppSync Events API](https://urielbitton.substack.com/p/building-a-real-time-chat-feature)
- [5 Powerful Ways to Use AWS Amplify Real-Time for Subscriptions & Live Chat](https://compileinfy.com/building-aws-amplify-real-time-applications/)
- [Real-Time Chat Architecture with AWS AppSync and Lambda](https://knowledge.businesscompassllc.com/real-time-chat-architecture-with-aws-appsync-and-lambda-core-infrastructure-guide/)

**AI Moderation & Safety:**
- [Best Automated Content Moderation Tools in 2026](https://www.cometchat.com/blog/automated-content-moderation-tools)
- [AI Content Moderation Trends for 2026](https://www.conectys.com/blog/posts/ai-content-moderation-trends-for-2026/)
- [2026 Content Moderation Trends Shaping the Future](https://getstream.io/blog/content-moderation-trends/)
- [Mastering Real-Time AI Chat Moderation: The 2026 Guide](https://www.nexconn.ai/blog/real-time-ai-chat-moderation-guide-2026)
- [Content Moderation for Social Networking Apps](https://www.foiwe.com/content-moderation-for-social-networking-apps-building-safer-digital-communities/)

**Push Notifications:**
- [AWS SNS: The Complete Guide to Real-Time Notifications](https://www.datacamp.com/tutorial/aws-sns)
- [Send Push Notifications with SNS](https://oneuptime.com/blog/post/2026-02-12-send-push-notifications-with-sns/view)
- [How to Build a Notification System on AWS](https://oneuptime.com/blog/post/2026-02-12-build-notification-system-on-aws/view)
- [Deep Dive: How AWS SNS's New Topic Architecture Improves Push Notification Throughput](https://www.johal.in/deep-dive-aws-snss-new-topic-architecture-improves)

**Authentication & Session Management:**
- [AWS Cognito + React: The 2026 Guide to Seamless Authentication](https://medium.com/@obecker1154/aws-cognito-react-the-2026-guide-to-seamless-authentication-74313adc17d1)
- [Mastering User Authentication with AWS Cognito](https://mihirpopat.medium.com/mastering-user-authentication-with-aws-cognito-a-guide-to-secure-scalable-login-for-your-apps-bbfa22235d4e)
- [Amazon Cognito: Securing User Authentication in Your Apps](https://builder.aws.com/content/3Jii935ZcogiIBCeg41R68FVxBM/amazon-cognito-securing-user-authentication-in-your-apps)
- [Everything You Need to Know About AWS Cognito](https://www.cloudoptimo.com/blog/everything-you-need-to-know-about-aws-cognito/)

---
*Feature research for: Production social app backends*
*Researched: 2026-11-03*
*Confidence: MEDIUM (WebSearch verified with official AWS docs; social app patterns from multiple sources)*
