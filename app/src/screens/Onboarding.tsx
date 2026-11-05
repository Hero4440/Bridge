// app/src/screens/Onboarding.tsx
// Five-step onboarding flow: Welcome → Interests → Meet Mo → Trusted Person → Comfort.
// Saves profile to DynamoDB on completion via createUserProfile().
import { useState } from 'react';
import { currentUser } from '../lib/auth';
import { createUserProfile } from '../lib/profile';
import { Mo } from '../components/Mo';
import { StatusBar } from '../components/StatusBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CircleGlyph } from '../components/CircleGlyph';

interface OnboardingProps {
  onComplete: () => void;
}

const interests = ['gaming', 'music', 'anime', 'cooking', 'art', 'tech'] as const;
const themes = ['dawn', 'sage', 'mist', 'sand'] as const;

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['gaming', 'music']);
  const [trustedName, setTrustedName] = useState('');
  const [trustedRelation, setTrustedRelation] = useState<'Parent' | 'Sibling' | 'Friend' | 'Other'>('Parent');
  const [theme, setTheme] = useState<typeof themes[number]>('dawn');
  const [textLarge, setTextLarge] = useState(false);
  const [calmMode, setCalmMode] = useState(false);

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleFinish() {
    try {
      setLoading(true);
      setError(null);
      
      const user = await currentUser();
      await createUserProfile({
        email: user.signInDetails?.loginId || '',
        firstName: '',
        lastName: '',
        interests: selectedInterests,
        trustedPersonName: trustedName,
        trustedPersonRelation: trustedRelation,
        theme,
        comfortTextSize: textLarge ? 'large' : 'default',
        comfortCalmMode: calmMode,
        comfortTextFirst: true,
      });
      
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  const progress = (step / 5) * 100;

  return (
    <div className="onb">
      <StatusBar />
      
      {/* Progress bar */}
      <div className="event-progress" style={{ margin: '16px 0' }}>
        <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Step {step} of 5</span>
        <div>
          <i style={{ width: `${progress}%` }}></i>
        </div>
      </div>

      {step > 1 && (
        <button className="onb-back" onClick={() => setStep(step - 1)} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth="2">
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
      )}

      <div className="onb-body">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="onb-center">
            <span className="onb-brand">BRIDGE</span>
            <h1 className="onb-title">Welcome to Bridge</h1>
            <p className="onb-sub">Preview. Practice. Go.</p>
            
            <div className="onb-list" style={{ marginTop: '32px' }}>
              <div>
                <span className="onb-dot">👁</span>
                <span>Preview events before you go</span>
              </div>
              <div>
                <span className="onb-dot">💬</span>
                <span>Practice conversations with Mo</span>
              </div>
              <div>
                <span className="onb-dot">✨</span>
                <span>Connect with groups that get you</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <>
            <h1 className="onb-title">What interests you?</h1>
            <p className="onb-sub">Pick as many as you like. You can change these later.</p>
            
            <div className="interest-grid" style={{ marginTop: '24px' }}>
              {interests.map((interest) => (
                <button
                  key={interest}
                  className="interest-tile"
                  onClick={() => toggleInterest(interest)}
                  style={{
                    border: selectedInterests.includes(interest) ? '2px solid var(--ink)' : '2px solid transparent',
                  }}
                >
                  <CircleGlyph kind={interest} size={48} />
                  <span style={{ flex: 1, textAlign: 'left', textTransform: 'capitalize' }}>{interest}</span>
                  {selectedInterests.includes(interest) && (
                    <span className="tick" style={{ fontSize: '12px' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Meet Mo */}
        {step === 3 && (
          <div className="onb-center">
            <Mo mood="happy" size={160} className="breathe" />
            <h1 className="onb-title" style={{ marginTop: '24px' }}>Meet Mo</h1>
            <p className="onb-sub">
              Mo is your friendly AI buddy. Practice conversations, get reply ideas, and take breathers when you need them.
            </p>
            
            <div className="onb-card" style={{ marginTop: '24px', textAlign: 'left' }}>
              <strong>Mo can help you:</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Practice tricky conversations</li>
                <li>Suggest reply ideas (you always decide)</li>
                <li>Take a one-minute breather</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Trusted Person */}
        {step === 4 && (
          <>
            <h1 className="onb-title">Who do you trust?</h1>
            <p className="onb-sub">Someone you can reach out to when things feel hard. Optional but recommended.</p>
            
            <div className="onb-field" style={{ marginTop: '24px' }}>
              <label>Name</label>
              <input
                type="text"
                value={trustedName}
                onChange={(e) => setTrustedName(e.target.value)}
                placeholder="e.g., Mom, Sarah, Coach"
              />
            </div>

            <div className="onb-field" style={{ marginTop: '16px' }}>
              <label>Relation</label>
              <select
                value={trustedRelation}
                onChange={(e) => setTrustedRelation(e.target.value as typeof trustedRelation)}
                style={{
                  height: '52px',
                  borderRadius: '16px',
                  border: '1.5px solid #DCD3EA',
                  background: '#fff',
                  padding: '0 16px',
                  fontSize: '17px',
                  width: '100%',
                }}
              >
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>
        )}

        {/* Step 5: Comfort Settings */}
        {step === 5 && (
          <>
            <h1 className="onb-title">Make Bridge yours</h1>
            <p className="onb-sub">These settings help Bridge feel comfortable for you.</p>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Theme</label>
                <div className="theme-grid">
                  {themes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      style={{
                        border: theme === t ? '2px solid var(--ink)' : '2px solid transparent',
                        textTransform: 'capitalize',
                      }}
                    >
                      <i style={{ background: t === 'dawn' ? '#F9DCE4' : t === 'sage' ? '#DDF1E6' : t === 'mist' ? '#DCE4FA' : '#F6E5C9' }} />
                      <span>{t}</span>
                      {theme === t && <b>✓</b>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={textLarge}
                    onChange={(e) => setTextLarge(e.target.checked)}
                  />
                  <span>Larger text</span>
                </label>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={calmMode}
                    onChange={(e) => setCalmMode(e.target.checked)}
                  />
                  <span>Calm mode (no animations)</span>
                </label>
              </div>
            </div>

            {error && <p className="field-hint" style={{ marginTop: '16px' }}>{error}</p>}
          </>
        )}
      </div>

      {/* Footer button */}
      <div className="onb-foot">
        <button className="primary-action" onClick={step === 5 ? handleFinish : () => setStep(step + 1)}>
          {step === 5 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
