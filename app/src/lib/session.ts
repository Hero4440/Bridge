// Resolves Cognito authentication separately from profile loading so API failures never impersonate logout.
import type { UserRecord } from './profile';

export type AppSession =
  | { status: 'signedOut' }
  | { status: 'signedIn'; profile: UserRecord | null }
  | { status: 'profileError'; error: string };

export async function loadAppSession(
  getUser: () => Promise<unknown>,
  getProfile: () => Promise<UserRecord | null>,
): Promise<AppSession> {
  try {
    await getUser();
  } catch {
    return { status: 'signedOut' };
  }

  try {
    return { status: 'signedIn', profile: await getProfile() };
  } catch (error) {
    return { status: 'profileError', error: error instanceof Error ? error.message : 'Could not load your profile' };
  }
}
