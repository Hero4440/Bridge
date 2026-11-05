// One-time profile setup persists interests, an owner-only trusted contact, and comfort settings.
import { useState } from 'react';
import { ZodError } from 'zod';
import { currentUser } from '../lib/auth';
import {
  createUserProfile,
  saveTrustedContact,
  validateTrustedContact,
  type UserRecord,
} from '../lib/profile';
import { themeNames, themes, themeStyle, type ThemeName } from '../lib/theme';
import { Mo } from '../components/Mo';
import { StatusBar } from '../components/StatusBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CircleGlyph, type CircleKind } from '../components/CircleGlyph';

interface OnboardingProps {
  onComplete: (profile: UserRecord) => void;
}

type Relation = 'Parent' | 'Guardian' | 'Sibling' | 'Coach' | 'Friend' | 'Other';

const interestOptions: Array<{ id: CircleKind; label: string; tint: string }> = [
  { id: 'gaming', label: 'Gaming', tint: '#F4D9E2' },
  { id: 'music', label: 'Music', tint: '#E2E0F7' },
  { id: 'anime', label: 'Anime', tint: '#F7DED3' },
  { id: 'cooking', label: 'Cooking', tint: '#F6E3D5' },
  { id: 'art', label: 'Art', tint: '#F4E7C9' },
  { id: 'tech', label: 'Tech', tint: '#DDE3F6' },
];

const relations: Relation[] = ['Parent', 'Guardian', 'Sibling', 'Coach', 'Friend', 'Other'];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [trustedName, setTrustedName] = useState('');
  const [trustedPhone, setTrustedPhone] = useState('');
  const [trustedEmail, setTrustedEmail] = useState('');
  const [trustedRelation, setTrustedRelation] = useState<Relation>('Parent');
  const [theme, setTheme] = useState<ThemeName>('dawn');
  const [textLarge, setTextLarge] = useState(false);
  const [calmMode, setCalmMode] = useState(false);
  const [textFirst, setTextFirst] = useState(true);

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
    );
    setError(null);
  }

  function nextStep() {
    setError(null);
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 1) {
      if (selectedInterests.length === 0) {
        setError('Pick at least one interest');
        return;
      }
      if (selectedInterests.includes('other') && !customInterest.trim()) {
        setError('Tell us what else you are into');
        return;
      }
      setStep(2);
      return;
    }
    try {
      validateTrustedContact({
        name: trustedName,
        phone: trustedPhone,
        email: trustedEmail,
        relation: trustedRelation,
      });
      setStep(3);
    } catch (validationError) {
      setError(
        validationError instanceof ZodError
          ? validationError.issues[0]?.message || 'Check the contact details'
          : validationError instanceof Error ? validationError.message : 'Check the contact details'
      );
    }
  }

  async function handleFinish() {
    try {
      setLoading(true);
      setError(null);
      const user = await currentUser();
      await saveTrustedContact({
        name: trustedName,
        phone: trustedPhone,
        email: trustedEmail,
        relation: trustedRelation,
      });
      const interests = selectedInterests.includes('other')
        ? selectedInterests.filter((interest) => interest !== 'other').concat(customInterest.trim())
        : selectedInterests;
      const profile = await createUserProfile({
        email: user.signInDetails?.loginId || '',
        firstName: '',
        lastName: '',
        interests,
        theme,
        comfortTextSize: textLarge ? 'large' : 'default',
        comfortCalmMode: calmMode,
        comfortTextFirst: textFirst,
      });
      onComplete(profile);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  const rootClass = ['onb', 'setup-flow', calmMode ? 'calm-mode' : '', textLarge ? 'text-large' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} style={themeStyle(theme)}>
      <StatusBar />

      {step === 0 ? (
        <div className="setup-welcome">
          <div className="setup-welcome-copy">
            <Mo mood="happy" size={112} className="floaty" />
            <h1>Make friends at<br />your own pace.</h1>
          </div>
          <button className="primary-action" onClick={nextStep}>Get started</button>
        </div>
      ) : (
        <>
          <div className="setup-progress">
            <button className="onb-back" onClick={() => { setError(null); setStep(step - 1); }} aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m14 6-6 6 6 6" />
              </svg>
            </button>
            <div className="event-progress"><div><i style={{ width: `${(step / 3) * 100}%` }} /></div></div>
            <span>Step {step} of 3</span>
          </div>

          <div className="onb-body setup-body" key={step}>
            {step === 1 && (
              <>
                <h1 className="setup-title">What are you into?</h1>
                <p className="onb-sub">Pick at least one. Mo will suggest circles that match.</p>
                <div className="setup-interest-grid">
                  {interestOptions.map((interest) => {
                    const selected = selectedInterests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        className="setup-interest"
                        aria-pressed={selected}
                        onClick={() => toggleInterest(interest.id)}
                      >
                        <CircleGlyph kind={interest.id} tint={interest.tint} size={52} />
                        <span>{interest.label}</span>
                        {selected && <b>✓</b>}
                      </button>
                    );
                  })}
                  <button
                    className="setup-interest"
                    aria-pressed={selectedInterests.includes('other')}
                    onClick={() => toggleInterest('other')}
                  >
                    <span className="setup-plus">＋</span><span>Something else</span>
                    {selectedInterests.includes('other') && <b>✓</b>}
                  </button>
                </div>
                {selectedInterests.includes('other') && (
                  <label className="onb-field">
                    What else?
                    <input value={customInterest} onChange={(event) => setCustomInterest(event.target.value)} maxLength={60} />
                  </label>
                )}
                <span className="setup-count">{selectedInterests.length} picked</span>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="setup-title">Who can you count on?</h1>
                <p className="onb-sub">Save someone you can choose to contact when you need help. They never see your chats.</p>
                <label className="onb-field">Their name
                  <input value={trustedName} onChange={(event) => setTrustedName(event.target.value)} autoComplete="name" maxLength={80} />
                </label>
                <label className="onb-field">Phone number
                  <input type="tel" value={trustedPhone} onChange={(event) => setTrustedPhone(event.target.value)} autoComplete="tel" inputMode="tel" />
                </label>
                <label className="onb-field">Email (optional)
                  <input type="email" value={trustedEmail} onChange={(event) => setTrustedEmail(event.target.value)} autoComplete="email" placeholder="Backup contact" />
                </label>
                <strong className="setup-label">They are my</strong>
                <div className="setup-pills">
                  {relations.map((relation) => (
                    <button
                      key={relation}
                      className={trustedRelation === relation ? 'on' : ''}
                      aria-pressed={trustedRelation === relation}
                      onClick={() => setTrustedRelation(relation)}
                    >
                      {relation}
                    </button>
                  ))}
                </div>
                <p className="onb-sub">You can change this anytime in Me.</p>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="setup-title">Make Bridge yours</h1>
                <p className="onb-sub">Your choices apply everywhere in the app.</p>
                <div className="setup-theme-grid">
                  {themeNames.map((name) => (
                    <button key={name} className={theme === name ? 'on' : ''} aria-pressed={theme === name} onClick={() => setTheme(name)}>
                      <i style={{ background: themes[name].swatch }} /><span>{themes[name].label}</span>{theme === name && <b>✓</b>}
                    </button>
                  ))}
                </div>
                <div className="setup-comfort-card">
                  <span>Text size</span><div><button className={!textLarge ? 'on' : ''} onClick={() => setTextLarge(false)}>Default</button><button className={textLarge ? 'on' : ''} onClick={() => setTextLarge(true)}>Large</button></div>
                  <span>Calm mode</span><div><button className={!calmMode ? 'on' : ''} onClick={() => setCalmMode(false)}>Off</button><button className={calmMode ? 'on' : ''} onClick={() => setCalmMode(true)}>On</button></div>
                  <span>Chatting</span><div><button className={textFirst ? 'on' : ''} onClick={() => setTextFirst(true)}>Text first</button><button className={!textFirst ? 'on' : ''} onClick={() => setTextFirst(false)}>Voice is okay</button></div>
                </div>
                <div className="setup-note"><Mo mood="calm" size={48} /><span>Calm mode turns off moving animations. Text and voice are always optional.</span></div>
                <h2 className="setup-safety-title">A few safety rules</h2>
                <div className="setup-safety-card">
                  <span><b>1</b>Never share your address, passwords or money.</span>
                  <span><b>2</b>If someone asks for secrets or money, Mo warns you privately.</span>
                  <span><b>3</b>You can leave, mute or block anyone, anytime.</span>
                  <span><b>4</b>Need help now? Choose your trusted person, or call 988.</span>
                </div>
              </>
            )}

            {error && <p className="field-hint setup-error">{error}</p>}
          </div>

          <div className="onb-foot setup-footer">
            <button className="primary-action" onClick={step === 3 ? handleFinish : nextStep}>
              {step === 3 ? 'I understand, let’s go' : 'Next'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
