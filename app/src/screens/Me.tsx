// app/src/screens/Me.tsx
// Profile screen uses the authenticated profile already loaded by App.
// Displays photo (if exists), name, email, interests, settings list.
// Account actions sit after settings, matching the Figma Me hierarchy.
import { useCallback, useEffect, useState } from 'react';
import {
  deleteUserProfile,
  getCurrentTrustedContact,
  getPhotoUrl,
  type TrustedContactRecord,
  type UserRecord,
} from '../lib/profile';
import { authSignOut } from '../lib/auth';
import { StatusBar } from '../components/StatusBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';

interface MeProps {
  profile: UserRecord;
  onSignOut: () => void;
}

export function Me({ profile, onSignOut }: MeProps) {
  const [trustedContact, setTrustedContact] = useState<TrustedContactRecord | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountAction, setAccountAction] = useState<'logout' | 'delete' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProfileDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const contact = await getCurrentTrustedContact();
      setTrustedContact(contact);
      setPhotoUrl(profile.photoKey ? await getPhotoUrl(profile.photoKey) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [profile.photoKey]);

  async function handleSignOut() {
    try {
      setAccountAction('logout');
      setActionError(null);
      await authSignOut();
      onSignOut();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not log out');
    } finally {
      setAccountAction(null);
    }
  }

  async function handleDeleteProfile() {
    try {
      setAccountAction('delete');
      setActionError(null);
      await deleteUserProfile(profile, trustedContact);
      await authSignOut();
      onSignOut();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete profile');
    } finally {
      setAccountAction(null);
    }
  }

  useEffect(() => {
    loadProfileDetails();
  }, [loadProfileDetails]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorRetry error={error} onRetry={loadProfileDetails} />;

  const initials = profile.firstName && profile.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : profile.email[0];

  return (
    <div className="tab-screen">
      <StatusBar />
      <div className="tab-sticky-header">
        <h1 className="tab-page-title">Me</h1>
      </div>
      <div className="tab-screen-content me-content">
        {/* Identity header */}
        <div className="me-identity-header">
          <div className="me-avatar" style={{ position: 'relative' }}>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <div className="me-initials" style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initials}
              </div>
            )}
          </div>
          <div className="me-identity-copy">
            <h1>{profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'User'}</h1>
            <span>{profile.email}</span>
            {profile.interests && profile.interests.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                {profile.interests.map((interest) => (
                  <span key={interest} className="meta-pill">{interest}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings list */}
        <div className="me-list-card" style={{ marginTop: '20px' }}>
          <div className="me-list-row">
            <span className="setting-icon">🎨</span>
            <span>
              <strong>Theme</strong>
              <small style={{ textTransform: 'capitalize' }}>{profile.theme || 'dawn'}</small>
            </span>
            <b>›</b>
          </div>
          
          <div className="me-list-row">
            <span className="setting-icon">⚙️</span>
            <span>
              <strong>Comfort Settings</strong>
              <small>
                {profile.comfortCalmMode ? 'Calm mode' : 'Animations on'}
                {profile.comfortTextSize === 'large' ? ' • Large text' : ''}
              </small>
            </span>
            <b>›</b>
          </div>

          {(trustedContact || profile.trustedPersonName) && (
            <div className="me-list-row">
              <span className="setting-icon">👤</span>
              <span>
                <strong>Trusted Person</strong>
                <small>{trustedContact ? `${trustedContact.name} (${trustedContact.relation})` : `${profile.trustedPersonName} (${profile.trustedPersonRelation})`}</small>
                {trustedContact?.phone && <small>{trustedContact.phone}</small>}
              </span>
              <b>›</b>
            </div>
          )}

        </div>

        <section className="account-section" aria-labelledby="account-title">
          <h2 className="section-title" id="account-title">Account</h2>
          <div className="me-list-card">
            <button className="me-list-row settings-row" onClick={handleSignOut} disabled={accountAction !== null}>
              <span className="setting-icon" aria-hidden="true">↪</span>
              <span><strong>{accountAction === 'logout' ? 'Logging out…' : 'Log out'}</strong></span>
            </button>
            <button
              className="me-list-row settings-row account-danger"
              onClick={() => { setActionError(null); setConfirmDelete(true); }}
              disabled={accountAction !== null}
              aria-expanded={confirmDelete}
            >
              <span className="setting-icon" aria-hidden="true">×</span>
              <span>
                <strong>Delete profile</strong>
                <small>Remove your Bridge profile data</small>
              </span>
            </button>
          </div>

          {confirmDelete && (
            <div className="account-confirm" role="alertdialog" aria-labelledby="delete-profile-title" aria-describedby="delete-profile-copy">
              <strong id="delete-profile-title">Delete your Bridge profile?</strong>
              <p id="delete-profile-copy">This removes your profile, preferences, trusted contact and photo. Your login, messages and events stay.</p>
              <div>
                <button className="secondary-action" onClick={() => setConfirmDelete(false)} disabled={accountAction !== null}>Keep profile</button>
                <button className="danger-action" onClick={handleDeleteProfile} disabled={accountAction !== null}>
                  {accountAction === 'delete' ? 'Deleting…' : 'Delete profile'}
                </button>
              </div>
            </div>
          )}

          {actionError && <p className="account-error" role="alert">{actionError}</p>}
        </section>

        <div className="me-footer-card">Mo isn't a therapist. Need help now? <strong>Call 988.</strong></div>
      </div>
    </div>
  );
}
