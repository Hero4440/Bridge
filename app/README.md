# app/ — Bridge production build

This is the production application root (Amplify Gen 2 + Vite), kept separate from
`figma-make/` (the design prototype). All code the North American AI Challenge
reviews for the real build lives here.

## Runtime and services

- **Region:** AWS resources and the Bedrock client use `us-east-1`; the configured US inference profiles can route model inference across regions.
- **Auth:** Cognito email + password, with no user groups. The pre-sign-up Lambda
  auto-confirms every signup and marks supplied email addresses verified without a
  confirmation code. This does not prove email ownership. Profile data lives in DynamoDB.
- **Schema:** the production data models are defined together in one Amplify schema,
  including profiles, circles, messages, events, RSVPs, practice memory, reflections,
  contacts, guardian links, notifications, and safety records.
- **Budget:** $50/month, alerts at 50/80/100%.

## Code layout

```
app/
├── amplify/
│   ├── auth/            # Cognito (no groups), pre-sign-up auto-confirm trigger
│   ├── data/            # production schema + authorization rules
│   ├── functions/       # Lambda endpoints for practice, safety, community, events and Mo
│   ├── storage/         # profile-photo storage
│   ├── shared/
│   │   └── config.ts    # region (us-east-1) + model id constants
│   └── backend.ts       # IAM least-privilege, Budgets, CDK overrides
├── src/
│   ├── components/       # reusable UI
│   ├── screens/          # Onboarding, CheckIn, Home, ...
│   └── lib/              # Amplify Data client, types
└── scripts/              # seeding, live verification, and migration tools
```

SKILL.md's `amplify/...` and `src/...` paths are rooted here (prefix with `app/`).

The production build is implemented under this directory. The Figma Make export remains
the clickable design prototype; it is not the production runtime.

## Local setup and checks

Use Node.js 22.12 or newer and npm. Backend setup also needs AWS credentials for
an authorized development account and access to the configured Bedrock inference
profiles. Keep credentials in your local AWS profile, outside this repository.
Dependencies and locked versions are in [package.json](package.json) and
[package-lock.json](package-lock.json).

From the repository root:

```sh
cd app
npm ci
npx ampx sandbox --identifier <your-name> --once
npm run dev
```

The sandbox command deploys real AWS resources and generates the ignored
`app/amplify_outputs.json` consumed by the frontend. Use your own sandbox identifier;
it has separate Cognito accounts and data. Sign up in the app, complete onboarding,
and create content through the app. To populate interest circles in that sandbox,
set `BRIDGE_SEED_EMAIL` and `BRIDGE_SEED_PASSWORD` to an existing fictional
sandbox account in your local environment (or ignored `app/.env`), then run
`npx tsx scripts/seed/circles.ts` from `app/` after backend outputs exist.
Run `npx ampx sandbox --identifier <your-name>` without `--once` when you want
backend changes watched and redeployed during development.

From `app/`, run the local checks:

```sh
npm test
npm run lint
npm run build
```

Unit tests use isolated test doubles; the running app calls the real AWS backend.
Live verification commands below create fictional accounts and write to the
configured backend, so run them only against your development sandbox. Passing
local checks alone does not verify a deployed environment or the final demo.

For Hosting configuration and the deployment workflow, see
[the deployment runbook](../docs/DEPLOYMENT.md). For model calls, prompts, context,
and persistence, see [AI integration](../docs/AI_INTEGRATION.md).

## Daily check-in and Home

After onboarding, a three-question daily check-in saves to the owner-only `CheckIn`
model. The Home practice card uses those answers to choose a supported scenario and
hint level. The local calendar day controls when a new check-in is shown.

Weekly intentions are owner-only `WeeklyGoal` rows, grouped by the local Monday.
Home counts completed practices, reflections, and checked intentions for that week.
Circles come from `Group` records. Activity counts use AppSync subscriptions to actual
circle heartbeats, expire from the UI after 90 seconds, and are removed by DynamoDB
TTL. Check-ins, goals, and presence tables have point-in-time recovery enabled.

Home also connects to real notifications, practice, circles, comfort preferences,
breathing/grounding tools, and the existing help-alert Lambda. An unconnected trusted
person is never reported as notified. New accounts start with an empty weekly plan.

Run `npm test`, `npm run lint`, and `npm run build` from this directory. After deploying
the development sandbox and generating `amplify_outputs.json`, run
`npx tsx scripts/verify-dashboard.ts` for live persistence and two-account access checks.
It creates fictional accounts and deletes their records and accounts afterward.

## Circles, Events, and private messages

Circles and Messages share the Make segmented header and three-tab navigation.
Circle membership, mute preferences, and read markers are stored in DynamoDB.
Reading mode does not send or join automatically. All chat streams use AppSync
subscriptions, and Mo suggestions stay editable until the person taps Send.

`Message` now contains open-circle chat only. `DirectMessage` is readable only by
its two participants. Message requests and contacts have participant/owner-only
reads, and trusted Lambdas enforce acceptance, blocks, sender identity, retry
IDs, and event capacity. Profile emails, last names, interests, and comfort
preferences have field-level owner authorization; public lookups select only
first names and photo references.

Events include a three-step creator, real meeting details/links, calendar export,
RSVPs, private saved preparation, and private reflection. The RSVP action uses a
DynamoDB transaction so two people cannot take the last place. EventBridge runs
an idempotent reminder Lambda each minute. Invitations and chosen event sharing
create real private notifications; no SMS or meeting links are fabricated.

Use a personal sandbox, for example `npx ampx sandbox --identifier dhyey --once`.
The local `amplify_outputs.json` selects that sandbox's real backend and is never
committed. Personal sandboxes have independent Cognito users and data; accounts
from the shared sandbox are not copied. Budget names are unique per backend,
while the original `hero4440` sandbox keeps its existing `bridge-monthly` guard.

Live verification (from `app/`, with generated outputs):

```sh
BRIDGE_VERIFICATION_CLEANUP=/tmp/bridge-community-cleanup.json npx tsx scripts/verify-community.ts
python3 scripts/cleanup-community-verification.py /tmp/bridge-community-cleanup.json
```

The first command creates three fictional accounts and checks requests,
participant isolation, blocks, trusted circle sends, invitations, concurrent
last-place RSVPs, and real scheduled reminders. Cleanup needs maintainer AWS
credentials because read-only client models intentionally cannot delete server
records. It deletes only records owned by the listed fictional accounts.

The legacy migration is reviewable without writes:
`npx tsx scripts/migrate-community.ts --api-id <development-api-id>`.
Add `--apply` only with the matching schema deployed: it transactionally copies
DM history into private storage before removing public copies, and aligns old
circle slugs with actual Group IDs. It prints counts, never message bodies.

During this change, another deployment repeatedly removed the shared sandbox's
new models. The five legacy DMs were recovered from DynamoDB's automatic backup
into `BridgeCommunityDmRecovery20261105` in `us-east-1`. Their count was verified;
the recovery table has deletion protection and point-in-time recovery enabled.
It is an IAM-only recovery copy, outside the changing shared stack. Preserve it
until the team restores the matching private-message schema and reconciles the
history under the original Cognito identities.
