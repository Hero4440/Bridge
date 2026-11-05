# Phase 2: AI Backend Infrastructure - Discussion Log

> **Audit trail only.** Decisions are captured in CONTEXT.md.

**Date:** 2026-11-03
**Phase:** 2-ai-backend-infrastructure
**Areas presented:** Model choice, Crisis classification conservativeness, Fallback content/tone, Rate-limit UX
**User response:** "none" — accepted all recommended defaults; go straight to CONTEXT.md.

---

## Model choice
| Option | Description | Selected |
|--------|-------------|----------|
| Split (Haiku for classify/tone/preview, Sonnet for practice) | Cost/latency for short calls, quality for core practice feedback | ✓ (recommended) |
| One small model everywhere | Cheapest, lower feedback quality | |
| Sonnet v2 everywhere (literal REQUIREMENTS) | Best quality, highest cost | |
**Choice:** recommended split. Resolves the REQUIREMENTS-vs-cost conflict.

## Crisis classification conservativeness
| Option | Description | Selected |
|--------|-------------|----------|
| Over-flag crisis; keyword net first | Safer for vulnerable users; deterministic crisis catch | ✓ (recommended) |
| Balanced LLM-only threshold | Fewer false alarms, riskier misses | |
**Choice:** recommended — bias to over-flag; keyword layer guarantees crisis catch.

## Fallback content & tone
| Option | Description | Selected |
|--------|-------------|----------|
| Short warm feature-specific scripted replies | On-brand Mo voice, never dead-ends | ✓ (recommended) |
| Generic "try again" message | Simpler, colder | |
**Choice:** recommended — warm, feature-specific, `fallback: true` logged.

## Rate-limit-hit UX
| Option | Description | Selected |
|--------|-------------|----------|
| Gentle Mo message; never block safety | Low-pressure, safe | ✓ (recommended) |
| Hard error at 100/hr | Blunt | |
**Choice:** recommended — gentle message; crisis/safety never rate-limited.

## Claude's Discretion
- Rate-limit counter shape, zod schemas, toolConfig schemas, retry timings, reserved concurrency.

## Deferred Ideas
- AI-04/05/06 feature wiring + bias probe (Phase 7); BEDROCK-02 quota request (AWS Support); EventBridge check-ins (stretch).
