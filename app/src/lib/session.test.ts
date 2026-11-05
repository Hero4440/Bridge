// Regression checks keep an authenticated user out of Login when only their profile request fails.
import { describe, expect, it, vi } from 'vitest';
import { loadAppSession } from './session';

describe('loadAppSession', () => {
  it('reports a profile error without treating the Cognito session as signed out', async () => {
    await expect(loadAppSession(
      vi.fn().mockResolvedValue({ userId: 'user-1' }),
      vi.fn().mockRejectedValue(new Error('AppSync unavailable')),
    )).resolves.toEqual({ status: 'profileError', error: 'AppSync unavailable' });
  });

  it('reports signed out only when Cognito has no current user', async () => {
    const getProfile = vi.fn();
    await expect(loadAppSession(
      vi.fn().mockRejectedValue(new Error('No session')),
      getProfile,
    )).resolves.toEqual({ status: 'signedOut' });
    expect(getProfile).not.toHaveBeenCalled();
  });
});
