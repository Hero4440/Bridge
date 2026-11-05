---
phase: 4
slug: real-time-chat
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-04
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (unit) + tsx live harness (integration) — already used in Phases 2/3 |
| **Config file** | `app/vitest.config.ts` (existing) |
| **Quick run command** | `cd app && npx vitest run` |
| **Full suite command** | `cd app && npx vitest run && npx tsx scripts/verify-phase4.ts` |
| **Estimated runtime** | ~20s unit; ~60-90s live harness (deploy required) |

---

## Sampling Rate

- **After every task commit:** Run `cd app && npx vitest run`
- **After every plan wave:** Run the full suite (unit + live harness once deployed)
- **Before `/gsd-verify-work`:** `npx tsx scripts/verify-phase4.ts` prints `PHASE4 VERIFY: PASS`, exit 0
- **Max feedback latency:** ~20s (unit); live harness gated on sandbox deploy

---

## Per-Task Verification Map

| Task | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|------|-------------|------------|-----------------|-----------|-------------------|--------|
| messages lib (last-50 sort/slice) | CHAT-07 | — | caps at 50 newest | unit | `cd app && npx vitest run src/lib/messages.test.ts` | ⬜ pending |
| connection-state mapper | CHAT-03 | — | disrupted→reconnecting | unit | `cd app && npx vitest run` | ⬜ pending |
| Message persist + read | CHAT-01 | — | authenticated write | integration | `npx tsx scripts/verify-phase4.ts` | ⬜ pending |
| observeQuery real-time delivery | CHAT-02 | T-04-01 | no polling; A sees B's msg | integration | `npx tsx scripts/verify-phase4.ts` | ⬜ pending |
| groupId filter isolation | CHAT-04 | T-04-02 | only that circle's msgs | integration | `npx tsx scripts/verify-phase4.ts` | ⬜ pending |
| daily topic cached (1 row/day) | CHAT-05 | T-04-03 | one Bedrock call/circle/day | integration | `npx tsx scripts/verify-phase4.ts` | ⬜ pending |
| starter chips suggestions | CHAT-06 | — | editable, never auto-sent | integration | `npx tsx scripts/verify-phase4.ts` | ⬜ pending |
| logs carry no content | CHAT-05 | T-04-04 | labels/fallback only | manual | `aws logs tail .../dailyTopic` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `app/src/lib/messages.test.ts` — last-50 sort/slice + connection-state mapper unit stubs
- [ ] `app/scripts/verify-phase4.ts` — live two-account harness (created in the verification wave)

*Existing vitest + tsx infrastructure (Phases 2/3) covers the framework; no new install.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Reconnect banner UX | CHAT-03 | UI polish is Phase 6; Phase 4 only exposes observable ConnectionState | Harness asserts a ConnectionState transition is received via Hub |
| No message/topic content in logs | CHAT-05 | Requires reading CloudWatch | `aws logs tail /aws/lambda/<dailyTopic-fn> --since 5m` → labels/fallback only |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s (unit)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
