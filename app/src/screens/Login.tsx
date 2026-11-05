// app/src/screens/Login.tsx
// Login screen with email/password form. Calls authSignIn from lib/auth.ts.
// Shows loading spinner during auth, error message on failure.
// Links to Signup screen (to be added). Implements FRONTEND-02.
import { useState } from 'react';
import { authSignIn } from '../lib/auth';
import { StatusBar } from '../components/StatusBar';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface LoginProps {
  onSignedIn: () => void;
  onSwitchToSignup: () => void;
}

export function Login({ onSignedIn, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await authSignIn(email, password);
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="onb onb-center">
      <StatusBar />
      <div className="onb-body">
        <span className="onb-brand">BRIDGE</span>
        <h1 className="onb-title">Welcome back</h1>
        <p className="onb-sub">Sign in to continue</p>

        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', marginTop: '24px' }}>
          <div className="onb-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="onb-field" style={{ marginTop: '14px' }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="field-hint" style={{ marginTop: '10px' }}>{error}</p>}

          <button type="submit" className="primary-action" style={{ marginTop: '24px' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '15px', color: 'var(--muted)' }}>
          New here?{' '}
          <button
            onClick={onSwitchToSignup}
            style={{ background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
