// Figma-aligned Me flow backed by Amplify profile, contact, photo, and activity records.
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteUserProfile, getPhotoUrl, listTrustedContacts, removeProfilePhoto, replaceProfilePhoto,
  saveTrustedContact, updateUserProfile, validateProfileName,
  type TrustedContactInput, type TrustedContactRecord, type UserRecord,
} from '../lib/profile';
import { loadMeActivity, type MeActivity } from '../lib/me';
import { authSignOut } from '../lib/auth';
import { themes, themeNames, isThemeName, type ThemeName } from '../lib/theme';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';
import { PersonAvatar } from '../components/PersonAvatar';
import { CircleGlyph, type CircleKind } from '../components/CircleGlyph';

type MeView = 'overview' | 'journey' | 'trusted' | 'profile' | 'colors' | 'comfort' | 'interests' | 'privacy';
type BadgeKind = 'hello' | 'kind' | 'pause' | 'circle' | 'event';

interface MeProps {
  profile: UserRecord;
  onProfileChange: (profile: UserRecord) => void;
  onSignOut: () => void;
}

const EMPTY_ACTIVITY: MeActivity = {
  weeks: [], stepsThisWeek: 0, practices: 0, eventsJoined: 0, levelReached: 0, blockedCount: 0,
  badges: { hello: false, kind: false, breather: false, circle: false, event: false },
};

const INTERESTS: Array<{ key: CircleKind; label: string; tint: string }> = [
  { key: 'gaming', label: 'Gaming', tint: '#F3DCE5' }, { key: 'music', label: 'Music', tint: '#E4E1F8' },
  { key: 'anime', label: 'Anime', tint: '#F8E1D6' }, { key: 'cooking', label: 'Cooking', tint: '#F8E8D9' },
  { key: 'art', label: 'Art', tint: '#F7EDCF' }, { key: 'tech', label: 'Tech', tint: '#DFE7F8' },
];

const BADGES: Array<{ key: keyof MeActivity['badges']; kind: BadgeKind; name: string; detail: string; color: string; bg: string }> = [
  { key: 'hello', kind: 'hello', name: 'First Hello', detail: 'Said hi', color: '#D4733A', bg: '#FFF0EA' },
  { key: 'kind', kind: 'kind', name: 'Kind Words', detail: 'Practiced kindly', color: '#A03060', bg: '#FDE8EF' },
  { key: 'breather', kind: 'pause', name: 'Breather', detail: 'Took a pause', color: '#5A4FB0', bg: '#EEE8FD' },
  { key: 'circle', kind: 'circle', name: 'First Circle', detail: 'Joined in', color: '#3A7A5C', bg: 'var(--tint)' },
  { key: 'event', kind: 'event', name: 'Game Night', detail: 'Went to an event', color: 'var(--muted)', bg: '#F0EDE8' },
];

const BADGE_PATHS: Record<BadgeKind, string> = {
  hello: 'M4 5.5h16v11H9l-5 4v-15Z',
  kind: 'M20.8 5.7c-2-2-5.2-2-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z',
  pause: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
  circle: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5',
  event: 'M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3',
};

function BadgeIcon({ kind, color }: { kind: BadgeKind; color: string }) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={BADGE_PATHS[kind]} /></svg>;
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return <div className="tab-sticky-header inner-header"><button onClick={onBack} aria-label="Back to Me" className="inner-back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button><span className="header-title">{title}</span><span /></div>;
}

function Segments<T extends string | boolean>({ value, options, onChange, disabled }: { value: T; options: Array<[T, string]>; onChange: (value: T) => void; disabled?: boolean }) {
  return <div className="segments">{options.map(([option, label]) => <button key={String(option)} className={value === option ? 'on' : ''} aria-pressed={value === option} disabled={disabled} onClick={() => onChange(option)}>{label}</button>)}</div>;
}

export function Me({ profile, onProfileChange, onSignOut }: MeProps) {
  const [view, setView] = useState<MeView>('overview');
  const [contacts, setContacts] = useState<TrustedContactRecord[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<TrustedContactInput>({ name: '', phone: '', email: '', relation: 'Parent' });
  const [editingContact, setEditingContact] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [activity, setActivity] = useState<MeActivity>(EMPTY_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [gender, setGender] = useState(profile.gender ?? 'Prefer not to say');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (notice !== 'Saved ✓') return;
    const timeout = window.setTimeout(() => setNotice(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [trustedContacts, meActivity, photo] = await Promise.all([
        listTrustedContacts(), loadMeActivity(), profile.photoKey ? getPhotoUrl(profile.photoKey) : Promise.resolve(null),
      ]);
      setContacts(trustedContacts); setActivity(meActivity); setPhotoUrl(photo);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load profile'); }
    finally { setLoading(false); }
  }, [profile.photoKey]);

  useEffect(() => { void loadDetails(); }, [loadDetails]);

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}` || profile.email?.[0]?.toUpperCase() || '?';
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'User';
  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) ?? null;
  const interests = useMemo(() => (profile.interests ?? []).filter((interest): interest is string => !!interest), [profile.interests]);
  const maxWeek = Math.max(1, ...activity.weeks.map((week) => week.value));

  async function savePatch(patch: Omit<Parameters<typeof updateUserProfile>[0], 'id'>, message = 'Saved ✓') {
    try {
      setBusy(true); setNotice(null);
      const updated = await updateUserProfile({ ...patch, id: profile.id });
      onProfileChange(updated); setNotice(message); return true;
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not save'); return false; }
    finally { setBusy(false); }
  }

  async function changePhoto(file?: File) {
    if (!file) return;
    try {
      setBusy(true);
      const updated = await replaceProfilePhoto(profile, file);
      onProfileChange(updated); setPhotoUrl(await getPhotoUrl(updated.photoKey!)); setNotice('Photo saved ✓');
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not save photo'); }
    finally { setBusy(false); }
  }

  async function removePhoto() {
    try {
      setBusy(true);
      const updated = await removeProfilePhoto(profile);
      onProfileChange(updated); setPhotoUrl(null); setNotice('Photo removed');
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not remove photo'); }
    finally { setBusy(false); }
  }

  function openContact(contact: TrustedContactRecord | null) {
    setSelectedContactId(contact?.id ?? null);
    setContactForm({ name: contact?.name ?? '', phone: contact?.phone ?? '', email: contact?.email ?? '', relation: contact?.relation ?? 'Parent' });
    setEditingContact(!contact); setNotice(null); setView('trusted');
  }

  async function persistContact() {
    try {
      setBusy(true); setNotice(null);
      const saved = await saveTrustedContact(contactForm, selectedContact?.id, !selectedContact);
      setContacts((current) => selectedContact ? current.map((contact) => contact.id === saved.id ? saved : contact) : [...current, saved]);
      setSelectedContactId(saved.id); setEditingContact(false); setNotice('Trusted person saved ✓');
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not save trusted person'); }
    finally { setBusy(false); }
  }

  async function handleSignOut() {
    try { setBusy(true); await authSignOut(); onSignOut(); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Could not log out'); setBusy(false); }
  }

  async function handleDeleteProfile() {
    try { setBusy(true); await deleteUserProfile(profile); await authSignOut(); onSignOut(); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Could not delete profile'); setBusy(false); }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorRetry error={error} onRetry={loadDetails} />;

  function renderBadges(detail = false) {
    const earnedBadges = BADGES.map((badge) => {
      const unlocked = activity.badges[badge.key];
      return <div className={detail ? (unlocked ? '' : 'locked') : `badge-tile${unlocked ? '' : ' locked'}`} key={badge.key}>
        <span className={detail ? 'badge-mark' : 'badge-circle'} style={{ background: badge.bg }}><BadgeIcon kind={badge.kind} color={badge.color} /></span>
        <strong className={detail ? '' : 'badge-name'}>{badge.name}</strong>{detail && <small>{unlocked ? badge.detail : 'Not earned yet'}</small>}
      </div>;
    });
    return earnedBadges;
  }

  let content;
  if (view === 'overview') {
    content = <>
      <div className="tab-sticky-header me-identity-header">
        <div className="me-avatar-wrap">{photoUrl ? <img src={photoUrl} alt="Your profile" className="me-avatar" /> : <span className="me-avatar me-initials">{initials}</span>}<label aria-label="Change profile photo" className="camera-button">⌁<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => void changePhoto(event.target.files?.[0])} /></label></div>
        <div className="me-identity-copy"><h1>{fullName}</h1><span className="step-pill">✦ {activity.stepsThisWeek} {profile.comfortPlainWords ? 'steps' : 'brave steps'} this week</span></div>
      </div>
      <div className="tab-screen-content me-content">
        <button onClick={() => setView('journey')} className="calm-card journey-preview" aria-label="Open My journey"><div className="journey-mini-bars">{activity.weeks.map((week, index) => <span key={week.label}><i style={{ height: `${Math.max(10, Math.round((week.value / maxWeek) * 72))}px`, background: index === 3 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 30%, #FFFFFF)' }} /></span>)}</div><div className="journey-preview-copy"><strong>My journey</strong><span>4 weeks of small steps</span></div><span className="row-chevron">›</span></button>
        <section><h2 className="section-title">Badges</h2><div className="badge-scroll">{renderBadges()}</div></section>
        <section><h2 className="section-title">My people</h2><div className="me-list-card">{contacts.map((contact) => <button className="me-list-row" onClick={() => openContact(contact)} key={contact.id}><PersonAvatar name={contact.name} size={40} tint="var(--soft)" /><span><strong>{contact.name}</strong><small>{contact.relation} · Gets help texts</small></span><b>›</b></button>)}{contacts.length < 2 && <button className="me-list-row" onClick={() => openContact(null)}><span className="setting-icon">＋</span><span><strong>Add another person</strong></span><b>›</b></button>}</div></section>
        <section><h2 className="section-title">Settings</h2><div className="me-list-card">
          <button className="me-list-row settings-row" onClick={() => setView('profile')}><span className="setting-icon">♙</span><span><strong>Profile</strong></span><b>›</b></button>
          <button className="me-list-row settings-row" onClick={() => setView('colors')}><span className="setting-icon">◉</span><span><strong>Colors</strong></span><i className="setting-swatch" style={{ background: themes[isThemeName(profile.theme) ? profile.theme : 'dawn'].swatch }} /><small>{themes[isThemeName(profile.theme) ? profile.theme : 'dawn'].label}</small><b>›</b></button>
          <button className="me-list-row settings-row" onClick={() => setView('comfort')}><span className="setting-icon">✣</span><span><strong>Comfort</strong></span><small>{profile.comfortTextSize === 'large' ? 'Large' : profile.comfortCalmMode ? 'Calm' : 'Default'}</small><b>›</b></button>
          <button className="me-list-row settings-row" onClick={() => setView('interests')}><span className="setting-icon">♡</span><span><strong>Interests</strong></span><small>{interests.length} picked</small><b>›</b></button>
          <button className="me-list-row settings-row" onClick={() => setView('privacy')}><span className="setting-icon">♢</span><span><strong>Privacy &amp; safety</strong></span><b>›</b></button>
        </div></section>
        <section className="account-section"><h2 className="section-title">Account</h2><div className="me-list-card"><button className="me-list-row settings-row" onClick={() => void handleSignOut()} disabled={busy}><span className="setting-icon">↪</span><span><strong>Log out</strong></span></button><button className="me-list-row settings-row account-danger" onClick={() => setConfirmDelete(true)} disabled={busy}><span className="setting-icon">×</span><span><strong>Delete profile</strong><small>Remove your Bridge profile data</small></span></button></div>{confirmDelete && <div className="account-confirm" role="alertdialog"><strong>Delete your Bridge profile?</strong><p>This removes your profile, preferences, trusted people, photo and badges. Your login, messages and events remain.</p><div><button className="secondary-action" onClick={() => setConfirmDelete(false)}>Keep profile</button><button className="danger-action" onClick={() => void handleDeleteProfile()} disabled={busy}>Delete profile</button></div></div>}</section>
        <div className="me-footer-card">Mo isn't a therapist. Need help now? <strong>Call 988.</strong></div>
      </div>
    </>;
  } else if (view === 'journey') {
    content = <><SubHeader title="My journey" onBack={() => setView('overview')} /><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="journey-bars">{activity.weeks.map((week, index) => <div className="journey-col" key={week.label}><strong>{week.value}</strong><i style={{ height: `${Math.max(10, Math.round((week.value / maxWeek) * 84))}px`, background: index === 3 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 30%, #FFFFFF)' }} /><small>{week.label}</small></div>)}</div><span className="muted-copy">{profile.comfortPlainWords ? 'Steps per week' : 'Brave steps per week'}</span><div className="journey-stats"><div><strong>{activity.practices}</strong><small>practices</small></div><div><strong>{activity.eventsJoined}</strong><small>events joined</small></div><div><strong>{activity.levelReached ? `Level ${activity.levelReached}` : '—'}</strong><small>reached</small></div></div><h2 className="section-title">Badges</h2><div className="badge-grid">{renderBadges(true)}</div><span className="muted-copy no-streaks">No streaks here. Skip a day or a week and nothing resets. Your steps and badges stay yours.</span></div></div></>;
  } else if (view === 'trusted') {
    content = <><SubHeader title={selectedContact?.name || 'Trusted person'} onBack={() => setView('overview')} /><div className="me-sub-content"><div className="calm-card me-sub-card person-detail">{!editingContact && selectedContact ? <><PersonAvatar name={selectedContact.name} size={64} tint="var(--soft)" /><h2>{selectedContact.name}</h2><span className="muted-copy">{selectedContact.relation} · {selectedContact.phone}</span><strong>What they receive when you tap I need help</strong><div className="trusted-message">Can you call me when you're free? I'm having a hard time.</div><button className="secondary-action" onClick={() => setEditingContact(true)}>Edit</button></> : <div className="profile-form trusted-form"><label>Their name<input value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} /></label><label>Phone number<input inputMode="tel" value={contactForm.phone} onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })} /></label><label>Email (optional)<input type="email" value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} /></label><span>They are my</span><div className="pill-group">{(['Parent', 'Guardian', 'Sibling', 'Coach', 'Friend', 'Other'] as const).map((relation) => <button key={relation} className={`choice-pill${contactForm.relation === relation ? ' on' : ''}`} aria-pressed={contactForm.relation === relation} onClick={() => setContactForm({ ...contactForm, relation })}>{relation}</button>)}</div><button className="primary-action" disabled={busy} onClick={() => void persistContact()}>Save trusted person</button></div>}</div></div></>;
  } else if (view === 'profile') {
    content = <><SubHeader title="Profile" onBack={() => setView('overview')} /><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="sub-card-title"><h2>My profile</h2>{!editingProfile && <button onClick={() => setEditingProfile(true)}>Edit</button>}</div><div className="profile-photo-row">{photoUrl ? <img src={photoUrl} alt="Your profile" /> : <span>{initials}</span>}<label>Change photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void changePhoto(event.target.files?.[0])} /></label></div>{!editingProfile ? <div className="profile-values"><div><span>First name</span><strong>{profile.firstName || '—'}</strong></div><div><span>Last name</span><strong>{profile.lastName || '—'}</strong></div><div><span>Gender</span><strong>{profile.gender || 'Prefer not to say'}</strong></div><div><span>Email</span><strong>{profile.email ?? ''}</strong></div></div> : <div className="profile-form"><label>First name<input value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label><label>Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} /></label><span>Gender</span><div className="pill-group">{['Woman', 'Man', 'Nonbinary', 'Prefer not to say'].map((option) => <button key={option} className={`choice-pill${gender === option ? ' on' : ''}`} aria-pressed={gender === option} onClick={() => setGender(option)}>{option}</button>)}</div><label>Email<input value={profile.email ?? ''} disabled aria-describedby="email-note" /></label><small id="email-note" className="muted-copy">Your sign-in email is managed by your account.</small>{photoUrl && <button className="quiet-action" onClick={() => void removePhoto()} disabled={busy}>Remove profile photo</button>}<button className="primary-action" disabled={busy} onClick={() => { try { const valid = validateProfileName({ firstName, lastName }); void savePatch({ ...valid, gender }, 'Profile saved ✓').then((saved) => { if (saved) setEditingProfile(false); }); } catch (err) { setNotice(err instanceof Error ? err.message : 'Check your name'); } }}>Save profile</button></div>}<p className="muted-copy">In circles, people only see your first name and photo.</p></div></div></>;
  } else if (view === 'colors') {
    const currentTheme: ThemeName = isThemeName(profile.theme) ? profile.theme : 'dawn';
    content = <><SubHeader title="Colors" onBack={() => setView('overview')} /><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="theme-grid">{themeNames.map((name) => <button key={name} aria-pressed={currentTheme === name} disabled={busy} onClick={() => void savePatch({ theme: name })}><i style={{ background: themes[name].swatch }} /><span>{themes[name].label}</span>{currentTheme === name && <b>✓</b>}</button>)}</div></div><div className="theme-preview"><span className="preview-label">Preview</span><div><span style={{ background: themes[currentTheme].swatch }} /><i style={{ background: themes[currentTheme].soft }} /><b style={{ color: themes[currentTheme].ink }}>Aa</b></div></div></div></>;
  } else if (view === 'comfort') {
    content = <><SubHeader title="Comfort" onBack={() => setView('overview')} /><div className="me-sub-content"><div className="calm-card me-sub-card comfort-card"><div className="segmented-row"><span>Text size</span><Segments value={profile.comfortTextSize === 'large' ? 'large' : 'default'} options={[["default", 'Default'], ["large", 'Large']]} disabled={busy} onChange={(value) => void savePatch({ comfortTextSize: value })} /></div><div className="segmented-row"><span>Calm mode</span><Segments value={profile.comfortCalmMode ?? false} options={[[false, 'Off'], [true, 'On']]} disabled={busy} onChange={(value) => void savePatch({ comfortCalmMode: value })} /></div>{profile.comfortCalmMode && <div className="calm-preview"><span>Animations off · Quieter layout</span></div>}<div className="segmented-row"><span>Mo's help</span><Segments value={profile.comfortMoHelp ?? 'some'} options={[["lots", 'Lots'], ["some", 'Some'], ["ask", 'When I ask']]} disabled={busy} onChange={(value) => void savePatch({ comfortMoHelp: value })} /></div><div className="segmented-row"><span>Chatting</span><Segments value={profile.comfortTextFirst ?? true} options={[[true, 'Text first'], [false, 'Voice is okay']]} disabled={busy} onChange={(value) => void savePatch({ comfortTextFirst: value })} /></div><div className="segmented-row"><span>Words</span><Segments value={profile.comfortPlainWords ?? false} options={[[false, 'Friendly'], [true, 'Plain']]} disabled={busy} onChange={(value) => void savePatch({ comfortPlainWords: value })} /></div><p className="muted-copy">Calm mode turns off moving animations. Plain words drop the cheerful extras, like “brave steps”. Changes save right away.</p></div></div></>;
  } else if (view === 'interests') {
    content = <><SubHeader title="Interests" onBack={() => setView('overview')} /><div className="me-sub-content"><div className="calm-card me-sub-card"><div className="interest-grid">{INTERESTS.map((interest) => { const on = interests.includes(interest.key); return <button key={interest.key} className="interest-tile" aria-pressed={on} disabled={busy} style={{ boxShadow: on ? '0 0 0 2px var(--ink)' : '0 0 0 1px rgba(0,0,0,.06)' }} onClick={() => { const next = on ? interests.filter((item) => item !== interest.key) : [...interests, interest.key]; if (next.length) void savePatch({ interests: next }); }}><CircleGlyph kind={interest.key} tint={interest.tint} size={40} /><span>{interest.label}</span>{on && <b className="tick">✓</b>}</button>; })}</div><p className="muted-copy">{interests.length} picked. Changes save right away.</p></div></div></>;
  } else {
    content = <><SubHeader title="Privacy & safety" onBack={() => setView('overview')} /><div className="me-sub-content"><div className="calm-card me-sub-card privacy-card"><h2>Who sees what</h2><div><strong>{contacts.map((contact) => contact.name).join(' and ') || 'No trusted person'}</strong><span>Gets your I need help texts</span></div><p className="muted-copy">Your chats, check-ins and pauses are never shared.</p><h2>Blocked people</h2><div><strong>{activity.blockedCount ? `${activity.blockedCount} blocked ${activity.blockedCount === 1 ? 'person' : 'people'}` : 'No blocked people'}</strong></div><h2>Safety rules</h2>{['Never share your address, passwords or money.', 'If someone asks for secrets or money, Mo warns you privately.', 'You can leave, mute or block anyone, anytime.', 'Need help now? Tap Mo, then I need help, or call 988.'].map((rule, index) => <span className="safety-row" key={rule}><b>{index + 1}</b>{rule}</span>)}</div></div></>;
  }

  return <div className="tab-screen">{content}{notice && <div className="ui-toast" role="status"><span>{notice}</span>{notice !== 'Saved ✓' && <button className="toast-dismiss" onClick={() => setNotice(null)}>Dismiss</button>}</div>}</div>;
}
