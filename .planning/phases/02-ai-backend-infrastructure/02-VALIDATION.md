---
phase: 2
slug: ai-backend-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-03
---

# Phase 2 — Validation Strategy

> Authoritative validation is live against the real deployed sandbox (real Bedrock + Cognito,
> no mocks — SKILL §1.3). Unit tests cover pure logic: the keyword safety layer, zod schemas,
> and the fallback shape.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (installed Phase 1) |
| **Quick run** | `cd app && npx tsc --noEmit -p amplify/tsconfig.json` |
| **Unit** | `cd app && npx vitest run` (keyword layer, zod, fallback) |
| **Integration** | `cd app && npx tsx scripts/verify-phase2.ts` (signed-in user, real Bedrock) |
| **Deploy check** | `cd app && npx ampx sandbox --once` |

---

## Sampling Rate
- **Per task commit:** `npx tsc --noEmit -p amplify/tsconfig.json`
- **Per wave:** `npx vitest run` + sandbox deploy if function/IAM files changed
- **Phase gate:** green deploy (no Bedrock AccessDenied), classify crisis-catch verified, practiceTurn returns strength+tip for a sample scenario, forced-timeout → `fallback:true`, 101st call rate-limited while crisis still answered

---

## Per-Task Verification Map

| Req | Behavior | Threat Ref | Secure Behavior | Test Type | Automated Command | File | Status |
|-----|----------|------------|-----------------|-----------|-------------------|------|--------|
| LAMBDA-01 | classify labels crisis/unsafe/money/address | T-2-02 | crisis over-flagged, keyword-first | unit+integration | vitest keywordLabel; verify-phase2 classify | ❌ W0 | ⬜ |
| LAMBDA-02 | practice strength+tip | — | judged vs user goal only | integration | verify-phase2 practiceTurn | ❌ W0 | ⬜ |
| LAMBDA-03/04 | tone/preview deployed+callable | — | authenticated only | integration | query returns typed reply | ❌ W0 | ⬜ |
| LAMBDA-05 | exact Bedrock IAM ARNs | T-2-01 | no `*` | review+deploy | grep backend.ts for `'*'`=0; deploy no AccessDenied | ❌ W0 | ⬜ |
| LAMBDA-06 | zod input validation | T-2-03 | reject malformed | unit | vitest invalid args rejected | ❌ W0 | ⬜ |
| LAMBDA-07 | >5s → fallback:true | — | never dead-end | unit+integration | forced-timeout path returns fallback | ❌ W0 | ⬜ |
| LAMBDA-08 | 100/hr; crisis exempt | T-2-04 | crisis never limited | integration | 101st gentle msg; crisis answered | ❌ W0 | ⬜ |
| BEDROCK-01 | Claude reachable us-east-1 | — | — | integration | real Converse succeeds | ❌ W0 | ⬜ |
| BEDROCK-03 | forced-tool structured output | — | — | unit+integration | zod parse tool input | ❌ W0 | ⬜ |
| BEDROCK-04 | maxTokens ≤ 500 | T-2-01 | cost cap | review | inferenceConfig maxTokens=500 | ❌ W0 | ⬜ |
| BEDROCK-05 | zod-validate before return | — | — | unit | ❌ W0 | ⬜ |
| AI-01/02/03 | 7 scenarios × 3 levels, strength+tip | — | parity, no "sound neurotypical" | integration | scenario matrix via verify-phase2 | ❌ W0 | ⬜ |
| AI-07 | scripted fallback replies | — | warm, not raw error | unit+integration | fallback copy present | ❌ W0 | ⬜ |
| AI-08 | prompt/latency + limit UX | — | — | integration | returns promptly; gentle limit msg | ❌ W0 | ⬜ |

*Status: ⬜ pending · ✅ green · ❌ red*

---

## Wave 0 Requirements
- [ ] `cd app && npm i @aws-sdk/client-bedrock-runtime @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb`
- [ ] `app/amplify/functions/shared/bedrock.ts` + unit tests (fallback + tool-parse, pure)
- [ ] keyword-layer unit tests — crisis catch is a safety gate (non-negotiable)
- [ ] `app/scripts/verify-phase2.ts` integration harness (signed-in user, real Bedrock, made-up data)
- [ ] Bedrock model/inference-profile ids confirmed + recorded in `app/amplify/shared/config.ts`

---

## Manual-Only Verifications
| Behavior | Requirement | Why Manual | Instructions |
|----------|-------------|------------|--------------|
| Bedrock model access enabled | INFRA-02/BEDROCK-01 | console state | Bedrock console (us-east-1) → Model access → Anthropic enabled |
| 500 RPM quota | BEDROCK-02 | AWS Support ticket | request increase; external, non-code |
| Feedback quality across 7×3 | AI-01/02/03 | human judgement | spot-check tone/usefulness, parity when diagnosis mentioned |

---

## Validation Sign-Off
- [ ] Every task has an automated verify or a Wave 0 dep
- [ ] Keyword crisis-catch unit test exists and passes
- [ ] Fallback path unit-tested (forced timeout)
- [ ] Rate-limit integration test (100 + crisis-exempt)
- [ ] No `'*'` in Bedrock IAM
- [ ] `nyquist_compliant: true` once task ids bound

**Approval:** pending
