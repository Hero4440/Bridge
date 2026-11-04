// app/amplify/shared/config.ts
// Single source of truth for region + Bedrock model ids (D-01). One region: us-east-1.
export const AWS_REGION = 'us-east-1' as const;
export const REGION = AWS_REGION;

// Confirmed cross-region inference-profile ids (aws bedrock list-inference-profiles, 2026-11-03):
// Haiku-class for classify/tone/preview (cheap/fast); Sonnet-class for practice (quality).
// Env overrides let the deploy swap models without a code change.
export const CLASSIFY_MODEL_ID = process.env.CLASSIFY_MODEL_ID ?? 'us.anthropic.claude-haiku-4-5-20251001-v1:0';
export const PRACTICE_MODEL_ID = process.env.PRACTICE_MODEL_ID ?? 'us.anthropic.claude-sonnet-4-5-20250929-v1:0';

// Legacy alias (Phase 1 placeholder) — kept for back-compat.
export const BEDROCK_MODEL_ID = PRACTICE_MODEL_ID;
