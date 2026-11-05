// app/src/App.tsx
// Bridge top-level router: checks auth state and profile existence,
// routes to Login/Signup (signedOut), Onboarding (no profile), or Main app.
// Implements FRONTEND-01, FRONTEND-02 (auth flow gating).
import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { currentUser } from './lib/auth';
import { getCurrentUserProfile } from './lib/profile';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NavBar } from './components/NavBar';
import { Login } from './screens/Login';
import { Signup } from './screens/Signup';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Me } from './screens/Me';
import { Circles } from './screens/Circles';
import { Events } from './screens/Events';
import { Dms } from './screens/Dms';
import { Practice } from './screens/Practice';

type AuthState = 'loading' | 'signedOut' | 'signedIn';
type AuthView = 'login' | 'signup';

const dawnTheme = {
  '--bg': 'linear-gradient(170deg, #FBE6DD 0%, #F1E4F3 45%, #DFE3FA 100%)',
  '--bar': 'rgba(251,232,226,0.97)',
  '--ink': '#3B3350',
  '--soft': '#EFE6F8',
  '--muted': '#5E5574',
} as CSSProperties;

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

  let content: ReactNode;

  if (authState === 'loading') {
    content = <LoadingSpinner />;
  } else if (authState === 'signedOut') {
    if (authView === 'signup') {
      content = (
        <Signup
          onSignedUp={() => setAuthState('signedIn')}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    } else {
      content = (
        <Login
          onSignedIn={() => setAuthState('signedIn')}
          onSwitchToSignup={() => setAuthView('signup')}
        />
      );
    }
  } else if (!hasProfile) {
    content = <Onboarding onComplete={() => setHasProfile(true)} />;
  } else {
    content = <MainApp onSignOut={() => setAuthState('signedOut')} />;
  }

  return (
    <div className="stage">
      <div className="phone">
        <div className="bridge-app" style={dawnTheme}>
          {content}
        </div>
      </div>
    </div>
  );
}

type Screen = 'home' | 'circles' | 'events' | 'dms' | 'practice' | 'me';

function MainApp({ onSignOut }: { onSignOut: () => void }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    currentUser().then(user => setUserId(user.userId));
  }, []);

  if (!userId) return <LoadingSpinner />;

  return (
    <div className="bridge-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '60px', boxSizing: 'border-box' }}>
      {screen === 'home' && <Home />}
      {screen === 'circles' && <Circles userId={userId} />}
      {screen === 'events' && <Events />}
      {screen === 'practice' && <Practice />}
      {screen === 'dms' && <Dms userId={userId} />}
      {screen === 'me' && <Me onSignOut={onSignOut} />}
      <NavBar currentScreen={screen} onNavigate={setScreen} />
    </div>
  );
}

export default App;
