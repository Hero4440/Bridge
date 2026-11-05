// app/src/App.tsx
// Bridge top-level router: checks auth state and profile existence,
// routes to Login/Signup (signedOut), Onboarding (no profile), or Main app.
// Implements FRONTEND-01, FRONTEND-02 (auth flow gating).
import { useEffect, useState } from 'react';
import { currentUser } from './lib/auth';
import { getCurrentUserProfile } from './lib/profile';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Login } from './screens/Login';
import { Signup } from './screens/Signup';
import { Onboarding } from './screens/Onboarding';

type AuthState = 'loading' | 'signedOut' | 'signedIn';
type AuthView = 'login' | 'signup';

function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [hasProfile, setHasProfile] = useState(false);

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

  useEffect(() => {
    checkAuth();
  }, []);

  if (authState === 'loading') {
    return <LoadingSpinner />;
  }

  if (authState === 'signedOut') {
    if (authView === 'signup') {
      return (
        <Signup
          onSignedUp={() => setAuthState('signedIn')}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <Login
        onSignedIn={() => setAuthState('signedIn')}
        onSwitchToSignup={() => setAuthView('signup')}
      />
    );
  }

  if (!hasProfile) {
    return <Onboarding onComplete={() => setHasProfile(true)} />;
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Main App Coming Soon</h1>
      <p>You're signed in with a profile! Main screens coming in Wave 3.</p>
    </div>
  );
}

export default App;
