// Regression checks ensure stale local Cognito sessions cannot block an explicit email sign-in.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), signOut: vi.fn() }));

vi.mock('aws-amplify/auth', () => ({
  signUp: vi.fn(),
  signIn: mocks.signIn,
  signOut: mocks.signOut,
  getCurrentUser: vi.fn(),
  fetchAuthSession: vi.fn(),
}));

import { authSignIn } from './auth';

beforeEach(() => vi.clearAllMocks());

describe('authSignIn', () => {
  it('clears a stale signed-in session and retries the requested account once', async () => {
    const alreadySignedIn = Object.assign(new Error('There is already a signed in user.'), { name: 'UserAlreadyAuthenticatedException' });
    const result = { isSignedIn: true, nextStep: { signInStep: 'DONE' } };
    mocks.signIn.mockRejectedValueOnce(alreadySignedIn).mockResolvedValueOnce(result);
    mocks.signOut.mockResolvedValue(undefined);

    await expect(authSignIn('sam@example.com', 'password')).resolves.toBe(result);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(mocks.signIn).toHaveBeenCalledTimes(2);
  });
});
