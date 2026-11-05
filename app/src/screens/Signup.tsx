// app/src/screens/Signup.tsx
// Signup screen for creating new Cognito accounts. Email + password + confirm.
// Links back to Login. Calls authSignUp from lib/auth.ts.
import { useState } from 'react';
import { authSignUp } from '../lib/auth';
import { StatusBar } from '../components/StatusBar';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface SignupProps {
  onSignedUp: () => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignedUp, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authSignUp(email, password);
      onSignedUp();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
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
        <h1 className="onb-title">Create your account</h1>
        <p className="onb-sub">Preview. Practice. Go.</p>

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
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="onb-field" style={{ marginTop: '14px' }}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="field-hint" style={{ marginTop: '10px' }}>{error}</p>}

          <button type="submit" className="primary-action" style={{ marginTop: '24px' }}>
            Create Account
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '15px', color: 'var(--muted)' }}>
          Have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
