// app/src/screens/Me.tsx
// Profile screen showing current user's profile from DynamoDB.
// Displays photo (if exists), name, email, interests, settings list.
// Sign out button. Implements FRONTEND-04 (data persists).
import { useEffect, useState } from 'react';
import { getCurrentTrustedContact, getCurrentUserProfile, getPhotoUrl, type TrustedContactRecord, type UserRecord } from '../lib/profile';
import { authSignOut } from '../lib/auth';
import { StatusBar } from '../components/StatusBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';

interface MeProps {
  onSignOut: () => void;
}

export function Me({ onSignOut }: MeProps) {
  const [profile, setProfile] = useState<UserRecord | null>(null);
  const [trustedContact, setTrustedContact] = useState<TrustedContactRecord | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);
      const [data, contact] = await Promise.all([getCurrentUserProfile(), getCurrentTrustedContact()]);
      setProfile(data);
      setTrustedContact(contact);
      
      if (data?.photoKey) {
        const url = await getPhotoUrl(data.photoKey);
        setPhotoUrl(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await authSignOut();
    onSignOut();
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorRetry error={error} onRetry={loadProfile} />;
  if (!profile) return <div>No profile found</div>;

  const initials = profile.firstName && profile.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : profile.email[0];

  return (
    <div className="tab-screen">
      <StatusBar />
      <div className="tab-sticky-header">
        <h1 className="tab-page-title">Me</h1>
      </div>
      <div className="me-content">
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

          <button className="me-list-row" onClick={handleSignOut} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <span className="setting-icon">🚪</span>
            <span>
              <strong style={{ color: '#A0503F' }}>Sign Out</strong>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
