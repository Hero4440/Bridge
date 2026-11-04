# Phase 1: Foundation & Authentication - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-03
**Phase:** 1-foundation-authentication
**Areas discussed:** AWS Region, Sign-up Data Split, Email Verification, Monthly Budget Cap, Schema Build Order

---

## AWS Region

| Option | Description | Selected |
|--------|-------------|----------|
| us-east-1 | Widest Bedrock model availability, highest default quotas, lowest cost | ✓ |
| us-west-2 | Strong Bedrock support, common alternative | |

**User's choice:** "any works" → recommended default locked (us-east-1)
**Notes:** Anchors Budgets + every service + the Phase 2 Bedrock model.

---

## Sign-up Data Split

| Option | Description | Selected |
|--------|-------------|----------|
| Cognito email+password only; profile in User model | Thin auth, onboarding owns the User DynamoDB record | ✓ |
| Collect profile fields as Cognito custom attributes | Fewer tables, but rigid and duplicates data | |

**User's choice:** "we could just use dynamo db then for now right?" → yes, confirmed
**Notes:** User model is the single home for name, interests, trusted person, theme, comfort.

---

## Email Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-confirm via pre-sign-up Lambda trigger | Test accounts work instantly, no real inbox needed | ✓ |
| Cognito default email confirmation code | Production-correct, but needs a real inbox per account | |

**User's choice:** "no need for email verification" → auto-confirm
**Notes:** Matches the made-up-test-data rule; production verification deferred.

---

## Monthly Budget Cap

| Option | Description | Selected |
|--------|-------------|----------|
| $50/month | Generous for a 2-day demo on a small model; alerts fire early | ✓ |
| Higher cap | Unnecessary for competition scope | |

**User's choice:** "any works" → recommended default locked ($50/month)
**Notes:** Alerts at 50/80/100% to the whole team, set before first Bedrock call.

---

## Schema Build Order

| Option | Description | Selected |
|--------|-------------|----------|
| Define all 9 models at once | Complete schema up front; test deploy catches TS2590 early | ✓ |
| Deploy ~5 core models first, then add rest | Lower type-explosion risk, more steps | |

**User's choice:** "we can define all the models at once"
**Notes:** Planner should run the INFRA-05 test deploy right after the schema compiles.

## Claude's Discretion

- Amplify scaffolding layout under `app/`, pre-sign-up trigger internals, deploy/verify checkpoints.

## Deferred Ideas

- Production email verification, S3 photo upload (Phase 6), strict mode on prototype App.tsx (Phase 7).
