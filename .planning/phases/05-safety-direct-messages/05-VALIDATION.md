---
phase: 5
slug: safety-direct-messages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-04
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (unit) + tsx live harness (integration) — existing from Phases 2-4 |
| **Config file** | `app/vitest.config.ts` (existing) |
| **Quick run command** | `cd app && npx vitest run` |
| **Full suite command** | `cd app && npx vitest run && npx tsx scripts/verify-phase5.ts` |
| **Estimated runtime** | ~20s unit; ~60-120s live harness (deploy required) |

---

## Sampling Rate

- **After every task commit:** `cd app && npx vitest run`
- **After every plan wave:** full suite (unit + live harness once deployed)
- **Before `/gsd-verify-work`:** `npx tsx scripts/verify-phase5.ts` prints `PHASE5 VERIFY: PASS`, exit 0
- **Max feedback latency:** ~20s (unit)

---

## Per-Task Verification Map

| Task | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|------|-------------|------------|-----------------|-----------|-------------------|--------|
| threadId helper | DM-01/05 | — | symmetric, deterministic | unit | `cd app && npx vitest run src/lib/dm.test.ts` | ⬜ pending |
| unsafe-label predicate | DM-03/SAFE-03 | — | flags money/address/unsafe/crisis | unit | `cd app && npx vitest run` | ⬜ pending |
| sendDm hold + classify | DM-02/03, SAFE-01/02/03 | T-05-01/02 | non-contact held; unsafe flagged; crisis stops | integration | `npx tsx scripts/verify-phase5.ts` | ⬜ pending |
| respondToRequest | DM-04 | T-05-03 | only recipient accepts; creates Contact | integration | `npx tsx scripts/verify-phase5.ts` | ⬜ pending |
| DM thread deliver + history | DM-01/05 | — | contacts deliver to thread | integration | `npx tsx scripts/verify-phase5.ts` | ⬜ pending |
| sendHelpAlert | SAFE-06/07 | T-05-04 | Notification to connected guardian | integration | `npx tsx scripts/verify-phase5.ts` | ⬜ pending |
| report + block | SAFE-04/05 | T-05-05 | Report row; Contact blocked | integration | `npx tsx scripts/verify-phase5.ts` | ⬜ pending |
| logs carry no content | SAFE-02/03 | T-05-06 | labels/fallback only | manual | `aws logs tail .../sendDm` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `app/src/lib/dm.test.ts` — threadId + unsafe-predicate unit stubs
- [ ] `app/scripts/verify-phase5.ts` — live two-account harness (created in the verification wave)

*Existing vitest + tsx infrastructure (Phases 2-4) covers the framework; no new install.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No message content in logs | SAFE-02/03 | Requires reading CloudWatch | `aws logs tail /aws/lambda/<sendDm-fn> --since 5m` → labels/fallback only |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s (unit)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
