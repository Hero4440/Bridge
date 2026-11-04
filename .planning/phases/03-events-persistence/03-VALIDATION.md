---
phase: 3
slug: events-persistence
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-04
---

# Phase 3 — Validation Strategy

> Persistence is validated against the REAL sandbox (Data client CRUD, no mocks — SKILL §1.3).
> Unit tests cover pure logic: RSVP count reducer, prep template, reflection fallback.

## Test Infrastructure
| Property | Value |
|----------|-------|
| **Framework** | Vitest (installed Phase 1) |
| **Quick run** | `cd app && npx tsc --noEmit -p tsconfig.app.json` (+ `-p amplify/tsconfig.json`) |
| **Unit** | `cd app && npx vitest run` (count reducer, prep template, reflect fallback) |
| **Integration** | `cd app && npx tsx scripts/verify-phase3.ts` (signed-in user, real DynamoDB) |

## Sampling Rate
- **Per task commit:** `npx tsc --noEmit` + the touched unit test
- **Per wave:** `npx vitest run` + sandbox integration for touched requirements
- **Phase gate:** full suite green + integration scripts pass + two-account isolation passes before `/gsd-verify-work`

## Per-Task Verification Map
| Req | Behavior | Threat | Test Type | Command | File | Status |
|-----|----------|--------|-----------|---------|------|--------|
| EVENT-01 | create event → DynamoDB | — | integration | verify-phase3 create | ❌ W0 | ⬜ |
| EVENT-02 | events survive refresh (list) | — | integration | verify-phase3 list | ❌ W0 | ⬜ |
| EVENT-03 | RSVP going/maybe/cant persists | T-3-04 (spoof) | integration | verify-phase3 rsvp | ❌ W0 | ⬜ |
| EVENT-04 | RSVP survives re-list (no in-memory loss) | — | integration | verify-phase3 rsvp reread | ❌ W0 | ⬜ |
| EVENT-05 | counts X/Y/Z correct | — | unit + integration | vitest count reducer | ❌ W0 | ⬜ |
| EVENT-06 | prep template by format + host "what to expect" | — | unit | vitest prep template | ❌ W0 | ⬜ |
| EVENT-07 | reflection saves feeling+wins; warm fallback | T-3-05 (injection) | unit + integration | vitest reflect fallback + verify-phase3 reflect | ❌ W0 | ⬜ |
| D-04 | practice Lambda creates PracticeRun, no transcript | T-3-03 (leak) | integration | verify-phase3 practice-run | ❌ W0 | ⬜ |
| Owner isolation | B cannot read A's Reflection/PracticeRun; B cannot update A's Event | T-3-01 | integration (2 accounts) | verify-phase3 isolation | ❌ W0 | ⬜ |

*Status: ⬜ pending · ✅ green · ❌ red*

## Wave 0 Requirements
- [ ] `app/src/lib/data.ts` + `data.count.test.ts` — Data client helpers + RSVP count reducer + deterministic RSVP id (EVENT-03/05)
- [ ] `app/src/lib/prep.ts` + `prep.test.ts` — static prep template by format (EVENT-06)
- [ ] `app/src/lib/reflect.ts` + fallback unit test (EVENT-07)
- [ ] `app/scripts/verify-phase3.ts` — integration harness (events/rsvp/reflect/practice-run/isolation), reusing the Phase 2 verify scaffolding
- [ ] Two real Cognito test accounts (made-up names) for the isolation check

## Manual-Only Verifications
| Behavior | Requirement | Why Manual | Instructions |
|----------|-------------|------------|--------------|
| RSVP survives a real browser refresh | EVENT-04 | needs a real tab reload | set RSVP, hard-refresh, confirm it persists (data-client source of truth) |
| Wizard UX across 3 steps | EVENT-01 | visual flow | spot-check in `npm run dev` (full polish is Phase 6) |

## Validation Sign-Off
- [ ] Every task has an automated verify or Wave 0 dep
- [ ] RSVP count reducer unit-tested
- [ ] Reflection fallback unit-tested
- [ ] Two-account isolation integration test passes (Event readable, Reflection/PracticeRun not)
- [ ] PracticeRun persisted with NO transcript field
- [ ] `nyquist_compliant: true` once task ids bound

**Approval:** pending
