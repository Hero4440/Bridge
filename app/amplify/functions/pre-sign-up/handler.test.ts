// Unit test for the pre-sign-up trigger: proves D-04 auto-confirm behavior.
// Pure logic, no AWS. Uses a made-up email (SKILL §4 — no real participant data).
import { describe, it, expect } from 'vitest';
import type { PreSignUpTriggerEvent } from 'aws-lambda';
import { handler } from './handler';

// The handler is async and returns the mutated event; context/callback are unused.
const run = (email?: string): Promise<PreSignUpTriggerEvent> => {
  const event = {
    response: {},
    request: { userAttributes: email ? { email } : {} },
  } as unknown as PreSignUpTriggerEvent;
  return (handler as unknown as (e: PreSignUpTriggerEvent) => Promise<PreSignUpTriggerEvent>)(event);
};

describe('pre-sign-up', () => {
  it('auto-confirms and verifies when email present', async () => {
    const e = await run('sam@example.com');
    expect(e.response.autoConfirmUser).toBe(true);
    expect(e.response.autoVerifyEmail).toBe(true);
  });

  it('auto-confirms without email, no verify', async () => {
    const e = await run();
    expect(e.response.autoConfirmUser).toBe(true);
    expect(e.response.autoVerifyEmail).toBeFalsy();
  });
});
