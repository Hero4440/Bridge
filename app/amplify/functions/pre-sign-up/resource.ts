// app/amplify/functions/pre-sign-up/resource.ts
// Registers the pre-sign-up trigger Lambda so Cognito auto-confirms new users
// (D-04 — no email verification / confirmation-code UI in Phase 1).
import { defineFunction } from '@aws-amplify/backend';

export const preSignUp = defineFunction({
  name: 'pre-sign-up',
});
