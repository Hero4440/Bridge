// app/src/App.tsx
// Bridge top-level router: checks auth state and profile existence,
// routes to Login/Signup (signedOut), Onboarding (no profile), or Main app.
// Implements FRONTEND-01, FRONTEND-02 (auth flow gating).
import { useEffect, useState } from 'react';
import { currentUser } from './lib/auth';
import { getCurrentUserProfile } from './lib/profile';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Login } from './screens/Login';

type AuthState = 'loading' | 'signedOut' | 'signedIn';

function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        await currentUser();
        const profile = await getCurrentUserProfile();
        setHasProfile(!!profile);
        setAuthState('signedIn');
      } catch {
        setAuthState('signedOut');
      }
    }
    checkAuth();
  }, []);

  if (authState === 'loading') {
    return <LoadingSpinner />;
  }

  if (authState === 'signedOut') {
    return <Login onSignedIn={() => setAuthState('signedIn')} />;
  }

  if (!hasProfile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Onboarding Coming Soon</h1>
        <p>You're signed in! Onboarding screen will be added in next task.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Main App Coming Soon</h1>
      <p>You're signed in with a profile! Main screens coming in Wave 3.</p>
    </div>
  );
}

export default App;
