// app/amplify/shared/config.ts
// Single source of truth for the one AWS region Bridge uses for everything
// (Cognito, AppSync/DynamoDB, Lambda, Bedrock, Budgets). D-01: us-east-1.
export const AWS_REGION = 'us-east-1' as const;

// Bedrock model id is resolved in Phase 2 via `aws bedrock list-inference-profiles`.
export const BEDROCK_MODEL_ID = 'TBD' as const;
