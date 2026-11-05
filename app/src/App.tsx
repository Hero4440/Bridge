// app/src/App.tsx
// Bridge top-level router: checks auth state and profile existence,
// routes to Login/Signup (signedOut), Onboarding (no profile), or Main app.
// Implements FRONTEND-01, FRONTEND-02 (auth flow gating).
import { useEffect, useState } from 'react';
import { currentUser } from './lib/auth';
import { getCurrentUserProfile } from './lib/profile';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NavBar } from './components/NavBar';
import { Login } from './screens/Login';
import { Signup } from './screens/Signup';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Me } from './screens/Me';

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

  return <MainApp onSignOut={() => setAuthState('signedOut')} />;
}

type Screen = 'home' | 'circles' | 'events' | 'dms' | 'me';

function MainApp({ onSignOut }: { onSignOut: () => void }) {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <div className="bridge-app" style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '60px' }}>
      {screen === 'home' && <Home />}
      {screen === 'me' && <Me onSignOut={onSignOut} />}
      {screen === 'circles' && <div style={{ padding: '40px', textAlign: 'center' }}><h2>Circles Coming Soon</h2></div>}
      {screen === 'events' && <div style={{ padding: '40px', textAlign: 'center' }}><h2>Events Coming Soon</h2></div>}
      {screen === 'dms' && <div style={{ padding: '40px', textAlign: 'center' }}><h2>DMs Coming Soon</h2></div>}
      <NavBar currentScreen={screen} onNavigate={setScreen} />
    </div>
  );
}

export default App;
