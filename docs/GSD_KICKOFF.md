# GSD kickoff for Bridge

Written Tue Nov 3, 2026, 6 p.m. Deadline: Scottsdale Launchpad, Fri Nov 6, 4 p.m. (about 46 hours, sleep included).
This file feeds the GSD interview. It does not replace `.claude/skills/bridge/SKILL.md`, which wins on any conflict
(SKILL.md part 1 first, then Figma for screens, then `tech design/index.html` for tech).

## Before you run anything

1. `git pull --rebase --autostash`, then `git switch -c <yourname>/gsd-build`. GSD commits as it goes, and `main` deploys to production. Never run it on `main`.
2. Cost: Claude Code showed API billing. GSD fans out parallel sub-agents, so a full run is not cheap. Run `/gsd:help` to find the model profile setting and pick the cheaper profile for planning and verification.
3. Decide who drives GSD. `.planning/STATE.md` changes constantly and will conflict if four people commit it. Either one person runs GSD, or add `.planning/` to `.gitignore`.

## Run order

1. `/gsd:map-codebase` first. This is a brownfield repo: a 2,190-line `figma-make/src/App.tsx` that is being split up, hooks in `scripts/hooks/`, and docs.
2. `/gsd:new-project`. Paste the "Project description" block below at the first question and answer follow-ups from the sections after it.
3. For each phase N, in order: `/gsd:plan-phase N`, then `/gsd:execute-phase N`, then `/gsd:verify-work N`.
   Skip `/gsd:discuss-phase`: the decisions are already made below. If the planner offers to skip research, say yes for Phases 1 to 4.
4. For small fixes after Phase 3, use `/gsd:quick` instead of a full phase.

## Project description (paste at the first question)

Bridge is a WhatsApp-style web and phone PWA for neurodivergent young adults (16 to 30), built with First Place AZ for the
North American AI Challenge. People join interest circles, chat, create and join events, and use Mo, a soft-blob AI buddy,
to practice hard conversations (scripted, bounded role-play with hint levels L1 to L3, one strength and one tip), get reply
ideas and a tone check, and stay calm. Loop: Preview (what to expect at an event) -> Practice -> Go (one-minute Reset) ->
Reflect (3 taps). Support fades as confidence grows. The screens already exist in `figma-make/src/App.tsx`; the work is
splitting that file into components and replacing every scripted behavior with a real backend. It is not a standalone
focus app. Judges reward executive-function transitions, ethics and technical feasibility.

## Constraints (answer these in the interview)

- Stack: React + Vite PWA, TypeScript strict. AWS Amplify Gen 2, Cognito, AppSync subscriptions, DynamoDB, S3 (photos),
  Lambda (TypeScript, zod validation), Amazon Bedrock (small Claude model, Converse API, forced-tool JSON output) via IAM role.
- Nothing is mocked. No stubbed endpoints, no constant arrays for UI data, no fake users. Content comes from the app or an
  idempotent `scripts/seed/` script that writes to real DynamoDB and Cognito with made-up names.
- Every account is equal: no roles, no coach or admin screens. A guardian is an ordinary user linked through `GuardianLink`
  and sees only what the person chose.
- All labeling (crisis, money or address requests, bias) goes through one `classify(text, labels)` function.
- No secrets in the repo. Use SSO and IAM roles, `secret()` for anything else. No raw practice transcripts stored or logged.
- Every file starts with a comment saying what it does and why. No `@ts-nocheck`, no new code in `App.tsx`.
- Commit messages and PR text never name an AI tool and never include `Co-Authored-By`. Small commits, PR into `main`, one reviewer.
- Pull before every push: `git pull --rebase --autostash && git push`. Never force-push `main`, never `--no-verify`.
- Done for any phase: `npx tsc --noEmit` passes, the sandbox deploys, the endpoint was called as a signed-in test user,
  access rules tested with two accounts, fallback path tested, empty/loading/error states exist.

## Requirements

**Must work live (Fri demo):** sign up and log in; live circle chat; create an event and RSVP; "what to expect" on an event;
Mo practice with hint fading and one strength + one tip; safety flag (money or address requests); Reflect.

**Should:** DMs with message requests; tone check (keyword layer first, then LLM) and reply ideas; guardian link; Reset card
and "I need help" (trusted person or 988); daily check-in; brave steps and badges; in-app notifications; profile and photo.

**Stretch:** event reminders and web push; disclosure-bias probe (run Wed, result on a slide); voice.

**Out of scope:** open-ended AI role-play, stranger matching, tone grading that pushes masking, leaderboards or streak
pressure, SMS, any real First Place participant data, coach or admin views.

## Roadmap to propose (4 code phases, then pitch work tracked by hand)

| Phase | When | Goal | Done when |
|---|---|---|---|
| 1. Foundation | Tue night | Amplify backend, Cognito, all data models, Bedrock access and Budgets alerts, `App.tsx` split into `src/screens` and `src/components`, seed script | Sign up and log in works in a sandbox; models deployed; app builds and typechecks from split components |
| 2. Live core | Wed | Profile, live circle chat over subscriptions, create event, RSVP, event "what to expect" | Two accounts chat live in a circle; one creates an event, the other RSVPs |
| 3. Mo | Wed night to Thu am | `/practice` Lambda with hint fading, `classify()`, safety flag, Reflect, fallback on Bedrock throttle | A signed-in user completes a practice run with feedback; a money request is flagged privately; reflection saves owner-only |
| 4. Should-haves | Thu | Cut from the bottom of the Should list as time runs out | Whatever is finished passes the Done checklist; unfinished items are removed from the UI, not faked |
| Pitch (not GSD) | Thu night | Backup demo video, 5-slide template, Business Model Canvas, AI_PROMPTS PDF, bias probe slide, rehearse twice | Two full out-loud run-throughs |

## External blockers (tell GSD, don't let it guess)

- Bedrock Claude access, model ID and region are not confirmed. Phase 3 depends on this. Get it approved tonight, then
  record region and model in `amplify/shared/config.ts`.
- Who creates circles, and who reviews `Report` records, is undecided. Assume circles are seeded and the team reviews reports.
- Venue suggestions in the event wizard are a seeded list, not a places API.

## After every phase

1. `git log --format=%B -n 20 | grep -iE "claude|co-authored|generated|anthropic"` should print nothing. Fix with an amend before pushing.
2. `git diff --stat` and a quick scan for keys, `.env` files and `amplify_outputs.json`.
3. Pull, then push to your branch and open the PR.
