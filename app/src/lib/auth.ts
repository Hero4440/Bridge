// app/src/lib/auth.ts
// Thin wrapper over aws-amplify/auth so screens share one auth surface.
// Covers sign up (AUTH-01), sign in (AUTH-02), sign out from any screen
// (AUTH-04) and reading the current session/user (AUTH-05). Email+password
// only; profile data lives in the User model (D-02/D-03). No confirmation
// step — signUp returns nextStep 'DONE' because of the D-04 pre-sign-up trigger.
// NOTE [confirm on first live run]: aws-amplify v6 signatures per RESEARCH Pattern 5.
import { signUp, signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export const authSignUp = (email: string, password: string) =>
  signUp({ username: email, password, options: { userAttributes: { email } } });

export async function authSignIn(email: string, password: string) {
  const input = { username: email, password };
  try {
    return await signIn(input);
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'UserAlreadyAuthenticatedException') throw error;
    await signOut();
    return signIn(input);
  }
}

export const authSignOut = () => signOut();

export const currentUser = () => getCurrentUser();

export const currentSession = () => fetchAuthSession();
