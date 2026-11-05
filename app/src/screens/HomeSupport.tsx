// Figma-matched feeling-low, breathing, and help flows with real trusted-person actions.
import { useEffect, useRef, useState } from 'react';
import { OnboardingMo as Mo } from '../components/OnboardingMo';
import type { SupportTool } from '../components/DashboardNav';
import { getCurrentTrustedContacts } from '../lib/profile';
import { sendHelpAlert } from '../lib/safety';
import { useOnline } from '../lib/useOnline';
import { awardBadgeAfter } from '../lib/badges';

const GROUNDING_PROMPTS = [
  'Name 1 thing you can see',
  'Name 1 thing you can hear',
  'Name 1 thing you can touch',
  'Name 1 thing you can smell',
  'Name 1 thing you can taste',
] as const;

function BackArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9,4 4,8 9,12" /></svg>;
}

export function HomeSupport({ tool, openedAt, onBack, onTalkLater }: {
  tool: SupportTool;
  openedAt: number;
  onBack: () => void;
  onTalkLater: () => void;
}) {
  const [view, setView] = useState<SupportTool>(tool);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(tool === 'reset');
  const deadline = useRef(tool === 'reset' ? openedAt + 60000 : 0);
  const [ground, setGround] = useState(-1);
  const [helpReturn, setHelpReturn] = useState<SupportTool | null>(null);
  const [contacts, setContacts] = useState<Awaited<ReturnType<typeof getCurrentTrustedContacts>>>([]);
  const [loading, setLoading] = useState(tool === 'help');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const online = useOnline();

  async function loadContacts() {
    try {
      setContacts(await getCurrentTrustedContacts());
    } catch {
      setError('Your trusted people could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function retryContacts() {
    setLoading(true);
    setError('');
    void loadContacts();
  }

  useEffect(() => {
    if (view !== 'help') return;
    let active = true;
    void getCurrentTrustedContacts()
      .then((people) => { if (active) setContacts(people); })
      .catch(() => { if (active) setError('Your trusted people could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [view]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        setRunning(false);
        awardBadgeAfter('breather');
      }
    }, 250);
    return () => clearInterval(timer);
  }, [running]);

  function startBreathing() {
    setRemaining(60);
    deadline.current = Date.now() + 60000;
    setRunning(true);
    setView('reset');
  }

  function openHelp(returnTo: SupportTool | null = null) {
    setRunning(false);
    setHelpReturn(returnTo);
    setLoading(true);
    setView('help');
  }

  async function notify() {
    if (busy || !online) return;
    setBusy(true);
    setError('');
    try {
      const result = await sendHelpAlert();
      setSent(result.notified > 0
        ? `Help notification sent to ${result.notified === 1 ? 'your connected trusted person' : `${result.notified} connected trusted people`}.`
        : 'No connected trusted person can receive help notifications yet. You can call someone below, or connect a trusted person in Me.');
    } catch {
      setError('The help notification could not be sent. Please try again, or call your trusted person.');
    } finally {
      setBusy(false);
    }
  }

  if (view === 'low') {
    return <section className="support-low">
      <div className="support-mo-pulse"><Mo mood="worried" size={72} /></div>
      <h1>That’s a big feeling.</h1>
      <p className="support-subtitle">Let’s slow things down together.</p>
      <div className="support-card-list">
        <button className="support-tap-card support-breathe-card" onClick={startBreathing}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M7.5 12a4.5 4.5 0 0 1 9 0" /><path d="M10 14.5l2 2 2-2" /></svg>
          <span><strong>Take a breath with me</strong><small>A quick breathing exercise. 60 seconds.</small></span>
        </button>
        {ground < 0 && <button className="support-tap-card" onClick={() => setGround(0)}><strong>Ground yourself</strong><small>Notice 5 things around you. Helps right now.</small></button>}
        {ground >= 0 && ground < GROUNDING_PROMPTS.length && <div className="support-tap-card support-ground-card" key={ground}>
          <small>{ground + 1} of 5</small>
          <strong>{GROUNDING_PROMPTS[ground]}</strong>
          <button onClick={() => setGround((step) => step + 1)}>Next →</button>
        </div>}
        {ground === GROUNDING_PROMPTS.length && <div className="support-tap-card support-ground-card" role="status">
          <strong className="support-safe-copy">Nice. Your body is here. You’re okay.</strong>
          <button className="support-soft-button" onClick={() => setGround(-1)}>Back</button>
        </div>}
        <button className="support-tap-card" onClick={onTalkLater}><strong>Talk it out later</strong><small>Mo will check in with you after.</small></button>
      </div>
      <div className="support-reassurance"><Mo mood="calm" size={36} /><span>Take your time. There’s no rush here.</span></div>
      <button className="support-exit" onClick={onBack}><BackArrow />I’m feeling better</button>
      {!online && <p className="support-status" role="status">You’re offline. Breathing and grounding still work.</p>}
    </section>;
  }

  if (view === 'reset') {
    const position = (60 - remaining) % 11;
    const phase = position < 4 ? 'in' : position < 5 ? 'hold' : 'out';
    const label = remaining === 0 ? 'Nicely done' : phase === 'in' ? 'Breathe in…' : phase === 'hold' ? 'Hold…' : 'Breathe out…';
    return <section className="support-reset">
      <span className="support-eyebrow">ONE-MINUTE BREATHER</span>
      <h1 aria-live="polite">{label}</h1>
      <div className="support-breathe-stage"><div className="support-breathe-glow" /><div className={running ? `support-breathe-mo breathe-${phase}` : 'support-breathe-mo'}><Mo mood="calm" size={130} /></div></div>
      <p className="support-reset-copy">In as the light grows. Out as it fades. Nothing needs fixing right now.</p>
      <div className="support-breathe-meta"><span>Breathe in 4</span><i /><span>Out 6</span><i /><strong>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} left</strong></div>
      {!running && <button className="support-restart" onClick={startBreathing}>Start again</button>}
      <div className="support-reset-actions">
        <button className="support-trusted-action" onClick={() => openHelp('reset')}>Text someone I trust</button>
        <button className="support-ready" onClick={() => tool === 'low' ? setView('low') : onBack()}>I’m ready</button>
      </div>
    </section>;
  }

  return <section className="dashboard-panel help-panel">
    <button onClick={() => helpReturn ? setView(helpReturn) : onBack()}><BackArrow /> Back</button>
    <Mo mood="worried" size={80} />
    <h1>You’re not alone.</h1>
    <p className="help-subtitle">Pick what feels right.</p>
    <div className="help-card"><strong>Text someone I trust</strong><div className="help-message">Can you call me when you’re free? I’m having a hard time.</div>{loading ? <p role="status">Loading your trusted people…</p> : <>{contacts.length === 0 ? <p>No trusted people saved yet. Add someone in Me.</p> : contacts.map((contact) => <div className="help-contact" key={contact.id}><span><strong>{contact.name}</strong><small>{contact.relation === 'Other' ? contact.otherRole : contact.relation}</small></span><a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>Call {contact.name}</a></div>)}<button disabled={!online || busy} onClick={() => void notify()}>{busy ? 'Sending…' : 'Notify my connected trusted person'}</button></>}{sent && <p className="help-sent" role="status">{sent}</p>}</div>
    <div className="help-card"><strong>Talk to a crisis line</strong><span className="help-detail">Free, confidential, 24/7</span><a className="help-crisis" href="tel:988">Call or text 988</a></div>
    {!online && <p role="status">You’re offline. Phone calls and breathing tools are still available.</p>}
    {error && <div role="alert"><p>{error}</p><button disabled={!online || busy} onClick={retryContacts}>Reload trusted people</button></div>}
  </section>;
}
