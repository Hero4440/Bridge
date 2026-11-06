// app/src/screens/Signup.tsx
// Signup screen for creating new Cognito accounts. Email + password + confirm.
// Links back to Login and signs the new auto-confirmed Cognito account in before setup.
import { useState } from 'react';
import { authSignIn, authSignUp } from '../lib/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface SignupProps {
  onSignedUp: () => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignedUp, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      await authSignIn(email, password);
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
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5.1 0 8.6 4 9.8 6a12.8 12.8 0 0 1-3.1 3.7" /><path d="M6.3 6.3C4.4 7.5 3.1 9.2 2.2 10.5 3.4 12.5 6.9 16 12 16c.7 0 1.4-.1 2-.2" /></> : <><path d="M2.2 10.5C3.4 8.5 6.9 5 12 5s8.6 3.5 9.8 5.5C20.6 12.5 17.1 16 12 16s-8.6-3.5-9.8-5.5Z" /><circle cx="12" cy="10.5" r="2.5" /></>}
                </svg>
              </button>
            </div>
          </div>

          <div className="onb-field" style={{ marginTop: '14px' }}>
            <label>Confirm Password</label>
            <div className="password-input-wrap">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword((visible) => !visible)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {showConfirmPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5.1 0 8.6 4 9.8 6a12.8 12.8 0 0 1-3.1 3.7" /><path d="M6.3 6.3C4.4 7.5 3.1 9.2 2.2 10.5 3.4 12.5 6.9 16 12 16c.7 0 1.4-.1 2-.2" /></> : <><path d="M2.2 10.5C3.4 8.5 6.9 5 12 5s8.6 3.5 9.8 5.5C20.6 12.5 17.1 16 12 16s-8.6-3.5-9.8-5.5Z" /><circle cx="12" cy="10.5" r="2.5" /></>}
                </svg>
              </button>
            </div>
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
