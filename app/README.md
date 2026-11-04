# app/ — Bridge production build

This is the production application root (Amplify Gen 2 + Vite), kept separate from
`figma-make/` (the design prototype). All code the North American AI Challenge
reviews for the real build lives here.

Decided in Phase 1 (see `.planning/phases/01-foundation-authentication/01-CONTEXT.md`):

- **Region:** us-east-1 (single region for all AWS services + Bedrock).
- **Auth:** Cognito email + password only, no email verification (pre-sign-up
  Lambda auto-confirms test accounts). Profile data lives in the User DynamoDB model.
- **Schema:** all 9 models defined together (User, Message, Event, RSVP, PracticeRun,
  Reflection, Contact, GuardianLink, Notification).
- **Budget:** $50/month, alerts at 50/80/100%.

## Planned layout

```
app/
├── amplify/
│   ├── auth/            # Cognito (no groups), pre-sign-up auto-confirm trigger
│   ├── data/            # 9-model schema + authorization rules
│   ├── functions/       # Lambda endpoints (practice, tone, preview, classify) — Phase 2
│   ├── shared/
│   │   └── config.ts    # region (us-east-1) + model id constants
│   └── backend.ts       # IAM least-privilege, Budgets, CDK overrides
└── src/
    ├── components/       # reusable UI
    ├── screens/          # Onboarding, CheckIn, Home, ...
    └── lib/              # Amplify Data client, types
```

SKILL.md's `amplify/...` and `src/...` paths are rooted here (prefix with `app/`).

> Scaffolding happens during Phase 1 execution (`/gsd-plan-phase 1` → `/gsd-execute-phase 1`).
> This folder is a placeholder until then.
