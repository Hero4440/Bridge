---
phase: 1
slug: foundation-authentication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-03
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Phase 1 is mostly declarative infrastructure — the authoritative validation is a
> green `npx ampx sandbox` deploy plus live auth round-trips against **real Cognito**
> (SKILL.md §1.3, nothing mocked). Unit tests apply mainly to the pre-sign-up handler.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (Vite-native) — installed in Wave 0 |
| **Config file** | none yet — add `app/vitest.config.ts` (or reuse `vite.config.ts`) in Wave 0 |
| **Quick run command** | `cd app && npx tsc --noEmit` (primary TS2590 / schema-compile detector) |
| **Full suite command** | `cd app && npx tsc --noEmit && npx vitest run` |
| **Deploy check** | `cd app && npx ampx sandbox --once` (backend changes) |
| **Estimated runtime** | ~5–15s typecheck+unit; sandbox deploy 1–3 min |

---

## Sampling Rate

- **After every task commit:** `cd app && npx tsc --noEmit` (fast — catches TS2590 and schema errors)
- **After every plan wave:** `cd app && npx tsc --noEmit && npx vitest run` + a sandbox deploy if backend files changed
- **Before `/gsd-verify-work`:** green sandbox deploy, AUTH round-trip against real Cognito, two-account authorization test pass, Budget visible in AWS console, `amplify_outputs.json` confirmed gitignored
- **Max feedback latency:** ~15s for typecheck+unit; deploy gated per wave

---

## Per-Task Verification Map

> Task IDs are assigned once plans exist; rows below are requirement-level and will be
> bound to task IDs during planning. Derived from RESEARCH.md "Phase Requirements → Test Map".

| Req | Behavior | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|-----|----------|------------|-----------------|-----------|-------------------|-------------|--------|
| INFRA-01 | Amplify Gen 2 scaffolds under `app/` | — | — | smoke | `cd app && npx ampx sandbox --once` exits 0 | ❌ W0 | ⬜ pending |
| INFRA-02 | Bedrock access region = us-east-1 (console one-time, Phase 2 uses it) | — | — | manual | AWS console: Bedrock model access enabled in us-east-1 | ❌ W0 | ⬜ pending |
| INFRA-03 | $50/mo Budget with 50/80/100% alerts | T-1-05 | alerts reach team before spend | manual+unit | AWS console shows `bridge-monthly`; unit asserts CfnBudget amount=50 | ❌ W0 | ⬜ pending |
| INFRA-04 | `npx ampx sandbox` runs locally | — | — | smoke | sandbox deploy exits 0 | ❌ W0 | ⬜ pending |
| INFRA-05 | First test deploy validates types + IAM | — | no `"*"` IAM | smoke | `tsc --noEmit` green AND sandbox deploy green | ❌ W0 | ⬜ pending |
| AUTH-01 | Sign up with email/password | T-1-06 | password = Cognito policy | integration | scripted `signUp` against sandbox user pool succeeds | ❌ W0 | ⬜ pending |
| AUTH-02 | Auto-confirm (no verification email) | T-1-06 | accepted D-04 tradeoff | integration | after `signUp`, `signIn` succeeds with no confirm step | ❌ W0 | ⬜ pending |
| AUTH-03 | Log in | T-1-06 | — | integration | `signIn` returns `isSignedIn: true` | ❌ W0 | ⬜ pending |
| AUTH-04 | Log out | T-1-03 | session revoked | integration | `signOut` then `getCurrentUser` throws | ❌ W0 | ⬜ pending |
| AUTH-05 | Session persists across refresh (30d refresh token) | T-1-03 | token in managed storage | manual+unit | `fetchAuthSession` returns tokens; unit asserts `refreshTokenValidity=30` | ❌ W0 | ⬜ pending |
| DATA-01..09 | Each of 9 models deploys & is queryable | T-1-04 | per-model auth rule set | integration | `generateClient<Schema>()` create/get on each model against sandbox | ❌ W0 | ⬜ pending |
| DATA-10 | Authorization enforced (owner-only Reflection/PracticeRun) | T-1-04 | B cannot read A's row | integration (TWO accounts) | account A creates Reflection; account B read returns empty/denied | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `cd app && npm i -D vitest` (+ `app/vitest.config.ts`) — no test framework exists yet
- [ ] `app/amplify/functions/pre-sign-up/handler.test.ts` — unit test autoConfirm logic (pure, no AWS)
- [ ] Integration auth round-trip harness against the sandbox (real Cognito, throwaway made-up email, never participant data)
- [ ] Two-account authorization harness (DATA-10) — seed two Cognito users via sandbox
- [ ] Wire `tsc --noEmit` into the per-commit check (primary TS2590 detector)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Session survives browser refresh | AUTH-05 | Needs a real browser reload; token storage is client-managed | Sign in, hard-refresh the tab, confirm still signed in |
| Budget exists + alerts configured | INFRA-03 | AWS console state, not code-assertable end-to-end | Console → Billing → Budgets shows `bridge-monthly` $50 with 50/80/100% email alerts |
| Bedrock model access in us-east-1 | INFRA-02 | One-time console enablement (consumed in Phase 2) | Console → Bedrock → Model access enabled in us-east-1 |
| Caller identity before deploy | INFRA-04/05 | Human must confirm sandbox vs prod account | `aws sts get-caller-identity` before any deploy (SKILL.md §1.4) |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (vitest install, auth/2-account harness)
- [ ] No watch-mode flags (use `vitest run`, not `vitest`)
- [ ] Feedback latency < 15s for typecheck+unit
- [ ] `nyquist_compliant: true` set in frontmatter once task IDs are bound

**Approval:** pending
