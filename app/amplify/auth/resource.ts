// app/amplify/auth/resource.ts
// Cognito user pool for Bridge. Email + password login only (D-02/D-03 — all
// profile data lives in the User DynamoDB model, not Cognito). Every account is
// equal: no group tiers (D-05). A pre-sign-up trigger auto-confirms users so there is
// no confirmation-code UI (D-04). The 30-day refresh token is set in backend.ts.
import { defineAuth } from '@aws-amplify/backend';
import { preSignUp } from '../functions/pre-sign-up/resource';

export const auth = defineAuth({
  loginWith: { email: true },
  triggers: { preSignUp },
});
