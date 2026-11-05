// app/src/App.tsx
// Bridge top-level router: checks auth state and profile existence,
// routes to Login/Signup (signedOut), Onboarding (no profile), or Main app.
// Implements FRONTEND-01, FRONTEND-02 (auth flow gating).
import { type ReactNode, useEffect, useState } from 'react';
import { currentUser } from './lib/auth';
import { getCurrentUserProfile, type UserRecord } from './lib/profile';
import { isThemeName, themeStyle } from './lib/theme';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NavBar, type Screen } from './components/NavBar';
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

function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [profile, setProfile] = useState<UserRecord | null>(null);

  async function checkAuth() {
    setAuthState('loading');
    try {
      await currentUser();
      setProfile(await getCurrentUserProfile());
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
          onSignedUp={() => void checkAuth()}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    } else {
      content = (
        <Login
          onSignedIn={() => void checkAuth()}
          onSwitchToSignup={() => setAuthView('signup')}
        />
      );
    }
  } else if (!profile) {
    content = <Onboarding onComplete={setProfile} />;
  } else {
    content = <MainApp profile={profile} onProfileChange={setProfile} onSignOut={() => { setProfile(null); setAuthState('signedOut'); }} />;
  }

  const selectedTheme = isThemeName(profile?.theme) ? profile.theme : 'dawn';
  const appClass = [
    'bridge-app',
    profile?.comfortCalmMode ? 'calm-mode' : '',
    profile?.comfortTextSize === 'large' ? 'text-large' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="stage">
      <div className="phone">
        <div className={appClass} style={themeStyle(selectedTheme)}>
          {content}
        </div>
      </div>
    </div>
  );
}

function MainApp({ profile, onProfileChange, onSignOut }: { profile: UserRecord; onProfileChange: (profile: UserRecord) => void; onSignOut: () => void }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    currentUser().then(user => setUserId(user.userId));
  }, []);

  if (!userId) return <LoadingSpinner />;

  return (
    <>
      <div className="bridge-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '92px', boxSizing: 'border-box' }}>
        {screen === 'home' && <Home profile={profile} onOpenEvents={() => setScreen('events')} />}
        {screen === 'circles' && <Circles userId={userId} onOpenDms={() => setScreen('dms')} />}
        {screen === 'events' && <Events />}
        {screen === 'practice' && <Practice />}
        {screen === 'dms' && <Dms userId={userId} onOpenCircles={() => setScreen('circles')} />}
        {screen === 'me' && <Me profile={profile} onProfileChange={onProfileChange} onSignOut={onSignOut} />}
      </div>
      <NavBar currentScreen={screen} onNavigate={setScreen} />
    </>
  );
}

export default App;
