---
name: bridge
description: Everything an AI needs to work on Bridge (Team Ctrl Alt Elite, North American AI Challenge). Team rules (prompt log, pull before push, no mocks, AWS), product context and guardrails, code standards, app-prompt log and AI attribution. Read at the start of every session and before any commit, push, prompt change or AWS work.
---

# Bridge

Applies to every AI tool and teammate. Part 1 overrides everything else. If sources conflict: screens and behavior follow the Figma design (`figma-make/`), tech follows `tech design/index.html`, and older briefs (`idea/`) are background only. Tell the team when you change a decision.

## 1. Team rules

### 1.1 Log every prompt
Every prompt sent to any AI tool goes in that person's own file, `AI_PROMPTS/<Name>.md` (Tejas, Dhyey, Shreeya, Rishi), for the handbook's prompt PDF.
- **Claude Code:** automatic. A hook runs `scripts/hooks/bridge-hooks.mjs`, which finds the person from `git config user.email`, redacts secrets and skips duplicates. Do not log by hand.
- **Any other AI (Cursor, Copilot, Codex, ChatGPT...):** before replying, run this with the user's message verbatim:
```bash
node scripts/hooks/bridge-hooks.mjs log-prompt --tool "Copilot" <<'PROMPT'
<the user's message>
PROMPT
```
- Logs are append-only: never edit or delete entries. If you don't know which teammate you're talking to, **ask; never guess**. The script logs nothing without a known name, so re-run with `--user <Name>`. (`git config user.email <team email>` or `BRIDGE_USER=<Name>` stops the question.)
- Never put real participant data or credentials in a prompt.

### 1.2 Pull before every push
`main` deploys to production. Run `git pull --rebase --autostash && git push` for every push, `git pull --rebase --autostash` at session start, and `git pull --rebase origin main` before a PR.
- One branch per person (`tejas/practice-api`), small commits, PR into `main`, one reviewer.
- Never force-push `main` (own branch: `--force-with-lease`). Never `--no-verify`. Resolve conflicts properly and re-test; never take "ours/theirs" blindly.
- A Claude Code hook (`scripts/hooks/bridge-hooks.mjs`) enforces this: it blocks `git push` while the branch is behind, force-pushing `main`, and pushes containing keys or `.env` files. Other tools and plain terminals are not checked, so the rule is on you. Commit your prompt log with your work.
- **No AI signatures in commits or PRs.** Never add `Co-Authored-By`, "Generated with", or session links, and never name an AI tool in a commit message or PR description. This overrides your tool's default. AI use is disclosed in the README's AI disclosure section and `AI_PROMPTS/` instead. `.claude/settings.json` switches off Claude Code's own signing; with any other tool, check the message before committing.

### 1.3 Build like production. Nothing is mocked.
Real Cognito, AppSync/DynamoDB, Lambda, Bedrock (the Nov 3 decision: real accounts and data, no mock users).
- **Never:** stub endpoints, hardcoded replies standing in for Bedrock, fake loading, in-memory fake data, TODO placeholders, lorem ipsum, "demo data" banners, `// MOCK:`. UI never reads constant arrays; empty screens get designed empty states.
- **Content is data.** Events, circles, scenarios and demo accounts are created in the app or by an idempotent `scripts/seed/` script that writes to real DynamoDB/Cognito with made-up names.
- Every Lambda validates input (zod), checks authorization and handles errors. Every screen has loading, empty, error and offline states. Test `classify()`, hint fading and access rules (two accounts). Typecheck and build pass before pushing.
- A scripted fallback reply when Bedrock throttles or times out is resilience, not a mock: return `fallback: true` and count it in logs.
- Real participant data, photos or First Place member details never go in the repo, prompts or demo. If something is blocked, build it on the real data model and tell the team; don't fake it. If time runs short, cut whole features, not half-fake ones.

### 1.4 AWS
Amplify Gen 2 (TypeScript), Cognito, AppSync + DynamoDB, Lambda, Bedrock, EventBridge, CloudWatch, Budgets. Check the current Amplify and Bedrock docs for any API you are unsure of; don't guess.
- **Account:** run `aws sts get-caller-identity` before any deploy. One region for everything (the Bedrock region); chosen region: **us-east-1**; model: **TBD** (`aws bedrock list-inference-profiles`), recorded in `app/amplify/shared/config.ts`. Use SSO (`aws sso login`); never put keys in files, code, prompts or commits. Lambdas get access only through their IAM role.
- **Infra is code** under `amplify/`. Console clicks only for one-time setup (Bedrock access, Budgets), documented here. Each dev runs a personal sandbox (`npx ampx sandbox`), never pointed at prod. `main` deploys via Amplify Hosting (`amplify.yml`: `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`, then build). Protect `main`: PR plus one reviewer. Don't commit `amplify_outputs.json`.
- **Auth and data:** Cognito email login, every account equal (no groups). Access is owner / participant / member / person-controlled. `Reflection` and `PracticeRun` use `allow.owner()`; messages are visible to circle members or DM participants; a guardian sees only what the person shares. A rule the schema can't express is enforced in a Lambda custom query, never in the client. `allow.resource(fn)` lets a Lambda use the Data client. Live chat uses AppSync subscriptions, never polling. No raw transcripts anywhere (tables or logs). Use TTL for ephemeral items and enable point-in-time recovery via a CDK override in `backend.ts` (check the docs for the property name).
- **AI endpoints** are Lambdas behind Amplify custom queries (AppSync authorizes via Cognito first):
```ts
practiceTurn: a.query()
  .arguments({ scenarioId: a.string().required(), level: a.integer().required(),
               goal: a.string().required(), message: a.string().required() })
  .returns(a.ref('PracticeReply'))
  .authorization((allow) => [allow.authenticated()])
  .handler(a.handler.function(practice)),
// backend.ts: least privilege, exact ARNs, never "*"
backend.practice.resources.lambda.addToRolePolicy(new PolicyStatement({
  actions: ['bedrock:InvokeModel'], resources: [/* model / inference-profile ARNs */] }));
```
- **Bedrock:** use the Converse API (`@aws-sdk/client-bedrock-runtime`). For structured output force a tool via `toolConfig` with a JSON schema and validate with zod; set `maxTokens` and a low `temperature`. Never guess the model ID: `aws bedrock list-inference-profiles --region <r>`. A cross-region inference profile needs IAM for the profile ARN plus the foundation-model ARNs in every region it routes to. Anthropic models may need a one-time use-case form in the console.
- **Each turn:** validate, `classify()` the input (crisis, money/address), call the model with the `prompts.ts` system prompt, `classify()` the output, save the `PracticeRun`, reply. Send Bedrock only the text the feature needs, and keep the in-app wording about what Mo can see. On throttle or timeout: SDK retries, then the fallback.
- **Logs and alarms:** log request id, scenario, level, latency, labels and `fallback` only, never message content. Tail with `aws logs tail /aws/lambda/<fn> --follow`. Email alarms on Lambda errors and Bedrock throttles.
- **Cost guards** (set before the first Bedrock call): a **$50/month** budget with alerts at 50/80/100% to the whole team, small model, capped `maxTokens` and input length, per-user rate limit (DynamoDB counter with TTL), reserved concurrency on AI functions.
- **Secrets:** non-AWS secrets use `secret('NAME')` from `@aws-amplify/backend`, set with `npx ampx sandbox secret set NAME` locally and in the Amplify console for prod. Deployed secrets never live in `.env`. A **local, gitignored `.env`** is allowed for local-only dev values (commit a `.env.example` template, never a real `.env`); AWS credentials stay in `~/.aws` (SSO or `aws configure`), not in the repo.
- **Scheduled work (stretch):** `defineFunction({ schedule: 'every week' })` for quiet check-ins, which go to the person first. Web push via VAPID from a Lambda, keys in secrets.
- **Done:** `npx tsc --noEmit` passes; the sandbox deploys; you called the endpoint as a signed-in test user; logs hold no message content; IAM has no `*`; cost guards exist; prompt logged; AI code attributed.

## 2. Product context

### 2.1 What it is
WhatsApp-style app (web + phone PWA) for neurodivergent young adults (16-30), with **Mo**, a soft-blob AI buddy. People join interest groups ("circles"), chat, create and join events, and use Mo to practice hard conversations, get reply ideas and stay calm. Tagline: Preview. Practice. Go. Built with First Place AZ for the North American AI Challenge for Neurodiverse Learning (ASU Spark Center). Team Ctrl Alt Elite: Tejas Shah, Dhyey Patel, Shreeya Bohra, Rishi Kataria. Scottsdale Launchpad Fri Nov 6, 4-8 p.m. (5-min pitch + demo, required 5-slide template); finale Nov 21, Phoenix; code review Nov 7-9.

**Core insight:** the gap is showing up, not knowing what to say. Attending is an executive-function chain (decide, plan, start, travel, arrive, stay, leave, reflect) and Bridge supports each step. It is NOT a standalone focus app or generic productivity tool (judges penalize those).

**Loop:** Preview (what to expect, exit route) -> Practice (scripted AI role-play, user-set goal, one strength + one tip) -> Go (one-minute Reset) -> Reflect (3 taps). Support fades: L1 hints, L2 no hints + "I'm stuck", L3 realistic surprises. Success = the user needs Bridge less and attends more.

### 2.2 Users: no roles, no coach, no admin view, no mock users
- Everyone is an equal user. The owner's `User` row is the setup-complete flag: new users see Welcome -> name -> interests -> trusted contact -> theme/comfort/safety, while returning users skip setup. Profile, interests and comfort settings live on `User`.
- **Contacts** are real: message request (accept or decline) or same circle. Block and report always available.
- **Circles:** Gaming, Music, Anime, Cooking, Art, Tech. Join, or "just read". Live chat; members see only first name and photo.
- **Events:** anyone creates one inside a circle or outside (what, when, where, sound, lighting, size, invites); others RSVP. Each has "what to expect" and a prep practice with Mo. In person adds a safety tip and "Tell <trusted person> where I'll be".
- **Guardian / trusted person:** a linked guardian is an ordinary user with no special powers; never describe them as controlling a profile. Build that connection as `GuardianLink`: pending / connected / declined plus person-set permissions. The onboarding contact is separate: store name, phone, optional email and relationship in owner-only `TrustedContact`, never on the authenticated-readable `User` profile. Saving it does not send an SMS.
- **DMs:** a first message to a non-contact is a request. Mo holds unsafe requests (e.g. asking for money) and warns privately.

### 2.3 Mo (kind, short, never judgmental)
1. **Practice:** 7 scenarios (join a chat, left on read, friend cancels, leave when tired, repair after something harsh, invite someone, disagree kindly), levels L1/L2/L3, one strength + one tip judged against the user's own goal.
2. **Reply ideas, tone check, pause-before-send.** Mo explains which word triggered a warning and why; the user decides ("Say it gently" / "Send anyway", which always works).
3. **Calm and help:** one-minute breather; "I need help" (trusted person or 988).

The Figma design reopens things the earlier brief removed (tone check, reply ideas, groups, badges First Hello / Kind Words / Breather, brave steps with a weekly journey chart). Keep the protections: the user sets their own goal, nothing is auto-sent or auto-rewritten, Mo explains why, "Send anyway" works (masking risk), badges stay gentle (no leaderboards or streak pressure), and practice stays scripted and bounded (no open-ended role-play).

### 2.4 Prototype behavior (from `figma-make/src/App.tsx`)
- **First run:** show Welcome once, then four setup steps: (1) required first and last name; (2) interests, including a custom option; (3) trusted contact; (4) theme, comfort and safety acknowledgement. Email comes from Cognito; photo and gender stay optional in Me. Creating the `User` profile completes setup, so never ask again. Then continue to check-in and Home.
- **"What to expect"** comes from host-set fields (people, sound, lighting, break/exit plan), not AI. AI only adds openers and a prep checklist (Should).
- **Create event, 3 steps:** (1) host: outside circles (invite contacts) or inside a circle, and what; (2) date, time, duration, in person (venue suggestions with distance and "usually quiet") or online (voice / video / text), group size; (3) comfort: sound Quiet / Soft music / Loud music, lighting Soft / Bright / Dim, reminder 1 hour / 1 day / both, tell trusted person; then preview and create.
- **RSVP:** Going / Maybe / Can't go, with "x of y spots". Past events open a reflection (hard / okay / good + wins: said hi, asked a question, stayed as long as I wanted, left kindly), Mo replies, then "Stay in touch": Message or Say hi (sends a request).
- **Prep checklist** per event and person: in person (plan travel, pick exit line, pack headphones, share plan); online (test mic or text only, pick opener with Mo, set a log-off time).
- **Circles:** filters For you / All / Quiet ones, daily topic, "n here now"; chat starter chips (ask a question, share mine, write my own).
- **Practice UI:** the prototype shows two reply choices (good / vague), then "You did it well / Good start" with a star and a spark. The real build keeps that shape: L1 hint chips, the user can type their own reply, the AI plays the partner and returns one strength + one tip.
- **Tone check:** keyword layer first (whatever, stupid, shut up, annoying, hate, overrated, dumb; a reason per word), then the LLM `/tone` call only if needed. "Say it gently" is user-initiated. The pause screen offers a breather.
- **Reports/blocks:** the UI says "a moderator will check this chat", but there is no moderator role. Write a `Report` record the team reviews and promise no more.
- **"I need help":** pick a linked app user or call/text 988. A saved onboarding contact is not messaged automatically; no SMS without a separately reviewed, user-confirmed send flow.
- **Profile:** names, email, optional gender (include "Prefer not to say"), photo upload (S3); others see only first name and photo. Themes are Dawn, Sage, Mist, Sand, Berry and Honey. Apply the selected theme and comfort classes at `.bridge-app` so every screen inherits them.
- **Account actions:** place Log out and Delete profile in an Account section after Me settings. Delete profile requires confirmation, removes the `User`, owner-only `TrustedContact` and profile photo, then logs out. It does not delete the Cognito login, messages or events.
- **Notifications:** message, event reminder ("Mo will remind you 1 hour before"), guardian request, daily topic, badge earned; New / Earlier; pause for 1 hour.

### 2.5 Tech
The current frontend is a React + Vite PWA. The planned native direction is one Expo + React Native app targeting iOS and web: migrate screen by screen, share Amplify/domain modules, and retire Vite only after feature parity. Do not add SwiftUI or maintain two permanent UI implementations. Backend: Amplify Gen 2, Cognito (all accounts equal), AppSync subscriptions, DynamoDB, TypeScript Lambdas and Bedrock via IAM. ONE `classify()` function does all labeling. Details: `tech design/index.html`.

### 2.6 Priorities for Fri Nov 6
- **Must work live:** sign up/login, circle chat, create event + RSVP, event preview, Mo practice, safety flag, Reflect.
- **Should:** DMs + requests, tone check + reply ideas, guardian link, Reset + help.
- **Stretch:** web push, quiet check-in, voice, bias-probe results on a slide (run Wed).

### 2.7 AI guardrails (every system prompt)
Stay in role, plain friendly short language. Judge only against the user's chosen goal, never "sound more neurotypical". Parity: advice must not change when the user mentions a diagnosis. No medical, legal or financial advice ("I'm not sure, ask a person"). Never ask for or store ID, medication, financial or SSN data. No romantic, sexual or abusive role-play; never imitate real people. Crisis: stop the role-play, show 988 and a trusted-person prompt. Flag requests for money or addresses. Not a therapist.

### 2.8 Privacy
Messages sent to Mo (tone check, reply ideas, practice) go to Amazon Bedrock; tell users plainly what Mo can see. No raw practice transcripts (hints used, level, feedback only). `Reflection` and `PracticeRun` are owner-only. A guardian sees only what the person chose. Quiet check-ins go to the person first. Report + block on every message; unsafe-request warnings are private.

### 2.9 Design
Calm, soft, rounded. Tap targets 44px+. Safety warnings are private ("Only you can see this"). Avoid childish or loud styling and clutter. Look: Outfit font and themes applied at the app root. The current Figma navigation is a fixed-width dark pill with Home, Circles and Me; only the active label is shown, Messages live inside Circles, and Mo is a separate floating button beside the pill. Events open from Home and Practice opens from Mo. Don't invent features without saying so, and keep Figma flows in sync with the prototype.

### 2.10 Evidence
Mostly autism, mostly 2007-2015; no ADHD/dyslexia outcome data. Pitch Bridge as a testable hypothesis. Safe to cite: loneliness g=0.89 and depression r=0.48 (autistic adults); PEERS knowledge g=2.15 vs real get-togethers ~0.55-0.60. Do NOT quote "60-90% unemployed", "1 in 3 ADHD unemployed" or "four times more likely lonely".

## 3. Code standards

The repo is public and code-reviewed (Nov 7-9) for authenticity, structure, comments and attribution. Write code a stranger can read.

```
src/components/   reusable UI (Mo, Card, NavBar...)
src/screens/      Onboarding, CheckIn, Home, Circles, CircleChat, DMs, Events, Practice, Reset, Reflect, Me, Notifications
src/lib/          api client, types
amplify/          auth/ (Cognito, no roles/groups) · data/ (User, Contact, Group, Message, Event, Rsvp, GuardianLink,
                  Reflection, PracticeRun, CheckIn, BraveStep, Badge, EventPrep, Topic, Invite, Notification, Report)
                  functions/ practice, preview, tone, classify (each with prompts.ts) · shared/config.ts
scripts/          hooks/ (team hooks) · seed/ (real seed data) · bias_probe.py
AI_PROMPTS/       one prompt log per teammate
```
Production code lives under `app/` (so the paths above are `app/src/...`, `app/amplify/...`); `figma-make/` stays the prototype.

The Figma Make `App.tsx` (167 KB, `@ts-nocheck`) is being split into components. Add no new code to it.

1. TypeScript, strict. No `@ts-nocheck`; no `any` in new code unless commented why.
2. Every file starts with a short comment: what it does and why it exists. Comment the why.
3. No secrets in the repo, ever: no keys or tokens in committed files, and never commit a `.env` — a **local, gitignored `.env`** is fine for local-only values, commit only `.env.example`. AWS access is via IAM roles / `~/.aws`. Check before every commit.
4. All labeling (safety, crisis, bias) goes through `classify(text, labels)` returning `{label, confidence 0..1}`. Never call the model for labels anywhere else.
5. Prompts live in `prompts.ts` beside their function as named constants, each logged (Part 4).
6. No roles, no coach/admin screens, no mock users. Access is owner / participant / member / person-controlled (guardian link). Seed accounts and circles with `scripts/seed/`, made-up names only.
7. Live chat uses AppSync subscriptions, never polling. If Bedrock errors or rate-limits, return the scripted fallback so the app never dead-ends.
8. Run the tone keyword layer first and `/tone` only if needed. Store no raw practice transcripts (hints used, level, feedback only).
9. Accessibility: 44px tap targets, labels on all controls, visible focus, respect calm mode (no animation) and the text-size setting.
10. Follow the guardrails (2.7) in every system prompt.

**Done =** works on phone width and laptop; typed; commented; no secrets; access rules tested with two accounts; fallback tested; prompt logged; AI-generated code attributed.

## 4. App prompts and attribution

The challenge requires a PDF of all primary AI prompts (system prompts, personas, guardrails, templates, chains, safety/format rules) and citation of libraries, borrowed snippets and AI-generated code. Be complete and honest; never hide AI use.

**When you add or change a prompt:** keep it in `prompts.ts`, then add or update an entry in `AI_PROMPTS/<YourName>.md`:
```
## <ID>: <short title>
Purpose · Type (system | persona | template | classifier | feedback | probe) · Model · Used in (path)
Variables: {scenario} {level} {userGoal} · Guardrails included · Last changed YYYY-MM-DD by <name>, why
<full prompt text in a fenced block>
```
Note what testing changed it (e.g. "bias probe showed X, added parity rule").

**Attribution (handbook requirement):** the README's "AI disclosure" section names each AI tool and what it helped with; update it when a tool starts on a new kind of work. Any third-party library or borrowed snippet is listed in the README ("How we built it") with its license. A person reviews and can explain every line.

**Before submission:** every prompt in code has a log entry; export with `pandoc AI_PROMPTS/*.md -o ai-prompts.pdf`. Use made-up names (Sam, Jordan) in examples.
