// app/amplify/functions/pre-sign-up/handler.ts
// D-04: auto-confirm every signup so there is no confirmation-code step, and
// auto-verify email when Cognito supplied one. Does NO AWS calls — pure response
// mutation, so the function needs no extra IAM. ACCEPTED TRADEOFF: skipping
// verification means anyone can register any email (documented in README; a
// sign-up rate limit is a possible future requirement, not a Phase 1 blocker).
import type { PreSignUpTriggerHandler } from 'aws-lambda';

export const handler: PreSignUpTriggerHandler = async (event) => {
  event.response.autoConfirmUser = true;
  if (event.request.userAttributes?.email) {
    event.response.autoVerifyEmail = true;
  }
  return event;
};
