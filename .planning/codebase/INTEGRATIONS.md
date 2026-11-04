# External Integrations

**Analysis Date:** 2026-11-03

## APIs & External Services

**AI Model:**
- Amazon Bedrock - Claude model for practice feedback, tone checks, reply ideas, safety classification
  - SDK/Client: `@aws-sdk/client-bedrock-runtime` (Converse API)
  - Auth: IAM role (no API key in app code)
  - Used by Lambda functions: `/practice`, `/preview`, `/tone`, `classify()`

**Messaging & Communication:**
- Web Push (stretch feature) - Browser notifications for quiet check-ins
  - VAPID keys stored in Amplify Secrets
  - Implementation: Lambda + browser push API

## Data Storage

**Databases:**
- AWS DynamoDB - Primary data store
  - Connection: AppSync GraphQL (Amplify Data client)
  - Tables: User, Contact, Group, Message, Event, Rsvp, GuardianLink, Reflection, PracticeRun, CheckIn, BraveStep, Badge, EventPrep, Topic, Invite, Notification, Report
  - Access: Cognito authorization via AppSync (allow.owner(), allow.member(), etc.)
  - TTL: enabled for ephemeral items
  - Point-in-time recovery: via CDK override in `backend.ts`
  - No raw transcripts stored (hints used, level, feedback only)

**File Storage:**
- AWS S3 (implied for photo uploads)
  - Purpose: User profile photos
  - Client: likely S3 presigned URLs via Lambda

**Caching:**
- None deployed; local browser state only (resets on page reload in prototype)

## Authentication & Identity

**Auth Provider:**
- AWS Cognito - Email-based sign-up and login
  - Implementation: `@aws-amplify/auth` via Amplify
  - Every account is a plain user (no roles, no groups, no coach/admin)
  - Guardian link: pending/connected/declined + person-set permissions (owner sees what person shares)
  - Session: JWT token (standard Cognito)

**Authorization Rules:**
- AppSync authorization via Amplify Data
  - owner: data is user-only (Reflection, PracticeRun)
  - member: circle messages visible to members
  - person-controlled: guardian link permissions set by the person
  - Lambda custom query: `allow.resource(fn)` for AI endpoint access

## Monitoring & Observability

**Error Tracking:**
- AWS CloudWatch Logs
  - Lambda logs: request id, scenario, level, latency, labels, fallback flag only (never message content)
  - Tail command: `aws logs tail /aws/lambda/<fn> --follow`

**Email Alerts:**
- AWS Budgets - Monthly spend alerts at 50%, 80%, 100% thresholds to whole team
- CloudWatch alarms (stretch) - Lambda errors and Bedrock throttle events

**Logs:**
- CloudWatch Logs only (no external log aggregation)
- Privacy: logs hold no user message content, no names, no emails

## Cost Management

**Budgets:**
- AWS Budgets configured before first Bedrock call
- Thresholds: 50%, 80%, 100% of monthly limit
- Notifications: email to team
- Enforcement: alerts only (no hard stops, but budget should limit request volume)

**Bedrock Cost Controls:**
- Model: small Claude (lower per-token cost)
- Max tokens: capped per endpoint (practice ~500 tokens, tone ~200 tokens)
- Temperature: low (deterministic, shorter output)
- Input length: capped per function (practice scenario + user message only, ~500 chars)
- Rate limit: per-user counter in DynamoDB with TTL, checked before calling Bedrock

**Lambda Cost Controls:**
- Reserved concurrency: set on AI functions to prevent runaway scaling
- Timeout: 30 seconds per call (typical; exact value in Amplify config)

## CI/CD & Deployment

**Hosting:**
- AWS Amplify Hosting (frontend + backend)
- CloudFront CDN
- GitHub webhook: push to `main` triggers build

**CI Pipeline:**
- Amplify Hosting: runs `amplify.yml` on every push
- Build command: `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`
- Environment: `AWS_BRANCH=main`, `AWS_APP_ID=<app-id>` (set in Amplify console)
- Protection: `main` branch requires PR + one reviewer before merge

**Deployment Flow:**
1. Push to GitHub `main`
2. Amplify Hosting webhook fires
3. Build runs: typecheck (`npx tsc --noEmit`), build (`npx ampx pipeline-deploy`)
4. CloudFront cache invalidated
5. Deployed to all regions

## Environment Configuration

**Required env vars (AWS side):**
- `AWS_BRANCH=main` (production)
- `AWS_APP_ID=<app-id>` (set in Amplify console)
- `AWS_REGION=<region>` (chosen once, recorded in `amplify/shared/config.ts`)

**Non-AWS Secrets (Amplify Secrets):**
- Web Push VAPID keys (for stretch feature)
- Set locally: `npx ampx sandbox secret set VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`
- Set in prod: Amplify console → Environment → Secrets

**Local Development Secrets:**
- AWS credentials: via `aws sso login`
- Never: `.env`, `.env.local`, credentials in files or code

**Secrets Location:**
- AWS Systems Manager Parameter Store / Secrets Manager (backend)
- Amplify Secrets for non-AWS secrets
- Never committed to repo
- `git` hook checks for `.env`, `.env.*` and blocks push if found

## Webhooks & Callbacks

**Incoming:**
- Amplify Hosting: GitHub push webhook (not an app-level webhook)
- None from external services (app receives no inbound webhooks)

**Outgoing:**
- Bedrock: HTTP requests (SDK handles)
- DynamoDB: no webhooks (subscriptions via AppSync instead)
- EventBridge (stretch): scheduled Lambda for quiet check-ins
- Web Push (stretch): browser push from Lambda

## Guardian / Trusted Person Link

**Data Model:**
- GuardianLink table: pending / connected / declined
- Person-set permissions: what the linked guardian sees (brave steps, "I need help" texts, or nothing yet)
- No SMS or email forwarding; in-app notification only
- Not a coaching relationship; just a linked user

## Safety & Moderation

**Report Handling:**
- Report table: user files report, team reviews later
- No auto-moderation; human review required
- Message goes: user → Report record → team email alert (via CloudWatch alarm or manual check)

**Block & Report:**
- User can block another user
- User can report a message
- No public moderator role; team reviews privately

**Unsafe Message Detection:**
- classify() function: keyword rules + Bedrock LLM for tone/safety
- Money/address requests: fixed rules + private warning to user
- Crisis keywords: fixed rules + show 988 + trusted-person prompt
- Harsh tone: keyword rules first, then `/tone` API call only if needed

## Notification System

**Push Notifications (stretch):**
- Web Push API via browser
- VAPID keys from Amplify Secrets
- Lambda generates and sends
- Types: message, event reminder (1 hour before), guardian request, daily topic, badge earned

**In-App Only (MVP):**
- Notification table: New / Earlier
- Pause for 1 hour: user control
- No SMS or external push in MVP

## Restricted Data (Never Sent to Bedrock)

- Real participant data (First Place members)
- Phone numbers, addresses, financial info
- Raw practice transcripts (send only scenario + user goal + current message)
- Photo content or detailed user profiles
- Last 3 chat messages only (for tone check context, no names)

## Third-Party Libraries (React Prototype)

**Current (prototype only):**
- React (MIT) - UI framework
- Outfit font (Google Fonts, libre) - Design system

**Pending (for full implementation):**
- Check INTEGRATIONS.md in codebase for updates as dependencies are added

---

*Integration audit: 2026-11-03*
