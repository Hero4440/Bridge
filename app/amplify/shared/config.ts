// app/amplify/shared/config.ts
// Single source of truth for region + Bedrock model ids (Phase 1 D-01 + Phase 2 D-01).
// All AWS services + Bedrock live in one region: us-east-1.
export const AWS_REGION = 'us-east-1' as const;
export const REGION = AWS_REGION;

// Cross-region inference-profile ids — use the `us.` prefix, NOT the bare model id
// (research pitfall). Finalized in plan 05 after `aws bedrock list-inference-profiles`.
// Env overrides let the deploy inject the confirmed ids without a code change.
export const CLASSIFY_MODEL_ID = process.env.CLASSIFY_MODEL_ID ?? 'us.anthropic.claude-3-5-haiku-20241022-v1:0';
export const PRACTICE_MODEL_ID = process.env.PRACTICE_MODEL_ID ?? 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';

// Legacy alias (Phase 1 placeholder) — kept for back-compat; prefer the split ids above.
export const BEDROCK_MODEL_ID = PRACTICE_MODEL_ID;
