// Four-screen Make onboarding; the parent provides authenticated persistence.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CircleGlyph, type CircleKind } from '../components/CircleGlyph';
import { OnboardingMo as Mo } from '../components/OnboardingMo';
import { OnboardingStatusBar } from '../components/OnboardingStatusBar';
import { onboardingThemes, onboardingThemeNames, onboardingThemeStyle, type OnboardingTheme } from '../lib/onboarding';
import { blankTrustedContact, isBlankTrustedContact, trustedContactSchema, type TrustedContactInput } from '../lib/trustedContacts';
import './Onboarding.css';

export interface OnboardingValues {
  firstName:string;
  lastName:string;
  interests: string[];
  contacts: TrustedContactInput[];
  theme: OnboardingTheme;
  textLarge: boolean;
  calmMode: boolean;
  textFirst: boolean;
}
const interests: { id: CircleKind; name: string; tint: string }[] = [
  { id: 'gaming', name: 'Gaming', tint: '#F9DCE4' },
  { id: 'music', name: 'Music', tint: '#E3E0F8' },
  { id: 'anime', name: 'Anime', tint: '#FBE1D8' },
  { id: 'cooking', name: 'Cooking', tint: 'var(--tint)' },
  { id: 'art', name: 'Art', tint: '#F6E5C9' },
  { id: 'tech', name: 'Tech', tint: '#DCE4FA' },
];
const relations = ['Parent', 'Guardian', 'Sibling', 'Coach', 'Other'] as const;

function Segments({ label, value, labels, onChange }: {
  label: string; value: boolean; labels: [string, string]; onChange: (value: boolean) => void;
}) {
  return <div className="segments" role="group" aria-label={label}>
    <i className="seg-ind" style={{ transform: `translateX(${value ? 100 : 0}%)` }} />
    {labels.map((text, index) => <button type="button" key={text} aria-pressed={value === !!index}
      className={value === !!index ? 'on' : ''} onClick={() => onChange(!!index)}>{text}</button>)}
  </div>;
}

export function OnboardingFlow({ onSave }: { onSave: (values: OnboardingValues) => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [firstName,setFirstName]=useState('');
  const [lastName,setLastName]=useState('');
  const [selected, setSelected] = useState<string[]>(['gaming']);
  const [otherOpen, setOtherOpen] = useState(false);
  const [customInterest, setCustomInterest] = useState('');
  const [contacts, setContacts] = useState<TrustedContactInput[]>([blankTrustedContact()]);
  const [theme, setTheme] = useState<OnboardingTheme>('dawn');
  const [textLarge, setTextLarge] = useState(false);
  const [calmMode, setCalmMode] = useState(false);
  const [textFirst, setTextFirst] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const scroll = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const savingRef = useRef(false);
  const initialized = useRef(false);
  const firstValid = trustedContactSchema.safeParse(contacts[0]).success;
  const customFilled = otherOpen && !!customInterest.trim();
  const count = selected.length + (customFilled ? 1 : 0);
  const secondValid = !contacts[1] || isBlankTrustedContact(contacts[1]) || trustedContactSchema.safeParse(contacts[1]).success;
  const canContinue = step === 1 ? !!firstName.trim() && !!lastName.trim() : step === 2 ? count > 0 : step === 3 ? firstValid && secondValid : true;

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  useEffect(() => {
    scroll.current?.scrollTo(0, 0);
    if (initialized.current) heading.current?.focus({ preventScroll: true });
    initialized.current = true;
  }, [step]);

  function updateContact(index: number, patch: Partial<TrustedContactInput>) {
    setContacts((current) => current.map((contact, i) => i === index ? { ...contact, ...patch } : contact));
    setError('');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canContinue || savingRef.current) return;
    setError('');
    if (step < 4) { setStep(step + 1); return; }
    if (!online) { setError('You’re offline. Reconnect, then try again. Your choices are still here.'); return; }
    savingRef.current = true;
    setSaving(true);
    try {
      await onSave({ firstName:firstName.trim(),lastName:lastName.trim(),interests: [...new Set([...selected, ...(customFilled ? [customInterest.trim()] : [])])],
        contacts: contacts.filter((c, i) => i === 0 || !isBlankTrustedContact(c)).map((c) => trustedContactSchema.parse(c)),
        theme, textLarge, calmMode, textFirst });
    } catch {
      setError('We couldn’t save your setup. Your choices are still here. Please try again.');
    } finally { setSaving(false); savingRef.current = false; }
  }

  return <div className={`setup-flow${calmMode ? ' calm-mode calm' : ''}${textLarge ? ' text-large' : ''}`} style={onboardingThemeStyle(theme)}>
    <OnboardingStatusBar />
    <div className="setup-scroll" ref={scroll}>
      <form className="onb" onSubmit={(e) => void submit(e)} noValidate aria-busy={saving}>
        <fieldset disabled={saving} className="setup-fields">
          <div className="onb-top">
            {step > 0 && <>
              <button type="button" className="onb-back" aria-label="Back" onClick={() => { setError(''); setStep(step - 1); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
              </button>
              <div className="event-progress"><div role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={4} aria-valuenow={step}><i style={{ width: `${step / 4 * 100}%` }} /></div><span>Step {step} of 4</span></div>
            </>}
          </div>
          {step === 0 && <div className="onb-body onb-center setup-welcome"><div className="setup-welcome-copy">
            <div className="mo-breathe"><Mo size={100} /></div>
            <h1 ref={heading} tabIndex={-1}>Make friends at your own pace.</h1>
          </div></div>}
          {step === 1 && <div className="onb-body">
            <h1 className="onb-title" ref={heading} tabIndex={-1}>What should we call you?</h1>
            <p className="onb-sub">People in circles will only see your first name.</p>
            <label className="onb-field">First name<input value={firstName} onChange={e=>setFirstName(e.target.value)} autoComplete="given-name" maxLength={50}/></label>
            <label className="onb-field">Last name<input value={lastName} onChange={e=>setLastName(e.target.value)} autoComplete="family-name" maxLength={50}/></label>
          </div>}
          {step === 2 && <div className="onb-body">
            <h1 className="onb-title" ref={heading} tabIndex={-1}>What are you into?</h1>
            <span className="onb-sub">Pick at least one. Mo will suggest circles that match.</span>
            <div className="interest-grid">
              {interests.map((item) => <button type="button" className="interest-tile" key={item.id} aria-pressed={selected.includes(item.id)} onClick={() => {
                setSelected((current) => current.includes(item.id) ? (current.length > 1 || customFilled ? current.filter((id) => id !== item.id) : current) : [...current, item.id]);
              }}><CircleGlyph kind={item.id} tint={item.tint} size={44} /><span>{item.name}</span>{selected.includes(item.id) && <span className="tick" aria-hidden="true">✓</span>}</button>)}
              <button type="button" className="interest-tile" aria-pressed={otherOpen} onClick={() => setOtherOpen(!otherOpen)}><span className="setup-plus"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span><span>Something else ✏️</span>{otherOpen && <span className="tick" aria-hidden="true">✓</span>}</button>
            </div>
            {otherOpen && <label className="onb-field rise"><input autoFocus value={customInterest} onChange={(e) => setCustomInterest(e.target.value)} placeholder="Type your interest…" aria-label="Your own interest" autoComplete="off" maxLength={60} /></label>}
            <span className="onb-sub" aria-live="polite">{count ? `${count} picked` : 'Pick at least one'}</span>
          </div>}
          {step === 3 && <div className="onb-body setup-people">
            <h1 className="onb-title" ref={heading} tabIndex={-1}>Who can you count on?</h1>
            <span className="onb-sub">When you tap "I need help", Mo texts this person. They never see your chats.</span>
            {contacts.map((contact, index) => <div className="setup-contact" role="group" aria-label={index ? 'Second person' : 'First person'} key={index}>
              {index > 0 && <h2 className="section-title">Second person</h2>}
              <label className="onb-field">Their name<input value={contact.name} onChange={(e) => updateContact(index, { name: e.target.value })} placeholder="For example, Mom or Alex" autoComplete="off" maxLength={80} /></label>
              <label className="onb-field">Phone number<input type="tel" inputMode="tel" value={contact.phone} onChange={(e) => updateContact(index, { phone: e.target.value })} placeholder="(480) 555-0142" autoComplete="off" aria-invalid={!!contact.phone && contact.phone.replace(/\D/g, '').length < 10} aria-describedby={`phone-hint-${index}`} /></label>
              {(index === 0 || !isBlankTrustedContact(contact)) && contact.phone.replace(/\D/g, '').length < 10 && <span id={`phone-hint-${index}`} className="field-hint">Add a 10-digit number so Mo can text them.</span>}
              <label className="onb-field">Email (optional)<input type="email" value={contact.email} onChange={(e) => updateContact(index, { email: e.target.value })} placeholder="Backup if a text doesn't go through" autoComplete="off" /></label>
              {contact.email && !trustedContactSchema.shape.email.safeParse(contact.email).success && <span className="field-hint">Check the email address, or leave it blank.</span>}
              <span className="setup-label">They are my</span><div className="setup-pills" role="group" aria-label={`Relationship for ${index ? 'second' : 'first'} person`}>
                {relations.map((relation) => <button type="button" key={relation} aria-pressed={contact.relation === relation} className={contact.relation === relation ? 'on' : ''} onClick={() => updateContact(index, { relation })}>{relation}</button>)}
              </div>
              {contact.relation === 'Other' && <label className="onb-field rise"><input value={contact.otherRole || ''} onChange={(e) => updateContact(index, { otherRole: e.target.value })} placeholder="Type their role…" aria-label="Their role" autoComplete="off" maxLength={80} /></label>}
            </div>)}
            <span className="onb-sub">You can change this anytime in Me.</span>
          </div>}
          {step === 4 && <div className="onb-body">
            <h1 className="onb-title" ref={heading} tabIndex={-1}>Make it comfortable</h1>
            <span className="onb-sub">Changes show right away. You can change them later in Me.</span>
            <span className="setup-label">Colors</span><div className="setup-theme-grid">
              {onboardingThemeNames.map((name) => <button type="button" key={name} aria-pressed={theme === name} aria-label={`Theme: ${onboardingThemes[name].label}`} onClick={() => setTheme(name)}><i style={{ background: onboardingThemes[name].accent }} /><span>{onboardingThemes[name].label}</span>{theme === name && <b aria-hidden="true">✓</b>}</button>)}
            </div>
            <div className="comfort-card">
              <div className="segmented-row"><span>Text size</span><Segments label="Text size" value={textLarge} labels={['Default', 'Large']} onChange={setTextLarge} /></div>
              <div className="segmented-row"><span className={calmMode ? 'setup-calm-on' : ''}>{calmMode ? 'Calm mode · On' : 'Calm mode'}</span><Segments label="Calm mode" value={calmMode} labels={['Off', 'On']} onChange={setCalmMode} /></div>
              {calmMode && <div className="calm-preview"><Mo mood="calm" size={20} /><span>Animations off · Quieter layout</span></div>}
              <div className="segmented-row"><span>Chatting</span><Segments label="Chatting" value={!textFirst} labels={['Text first', 'Voice is okay']} onChange={(value) => setTextFirst(!value)} /></div>
            </div>
            <div className="setup-note"><Mo mood="calm" size={40} /><span>Calm mode turns off moving animations. Text first means circles and events start in text, and voice is always optional.</span></div>
            <h2 className="section-title setup-safety-title">A few safety rules</h2>
            <div className="onb-card">
              <span className="safety-row"><b>1</b>Never share your address, passwords or money.</span>
              <span className="safety-row"><b>2</b>If someone asks for secrets or money, Mo warns you privately.</span>
              <span className="safety-row"><b>3</b>You can leave, mute or block anyone, anytime. They are not told why.</span>
              <span className="safety-row"><b>4</b>Need help now? Tap Mo, then "I need help", or call 988.</span>
            </div>
          </div>}
        </fieldset>
        <div className="onb-foot">
          {(!online || error) && <p className="setup-error" role="alert">{error || 'You’re offline. You can keep setting up; reconnect to save.'}</p>}
          <button type="submit" disabled={!canContinue || saving} className="setup-next">{saving ? 'Saving your setup…' : step === 0 ? 'Get started' : step === 4 ? 'I understand, let’s go' : 'Next'}</button>
        </div>
        {step === 3 && firstValid && contacts.length === 1 && <button type="button" className="add-person-link" onClick={() => setContacts([...contacts, blankTrustedContact()])}>+ Add another person</button>}
      </form>
    </div>
  </div>;
}
