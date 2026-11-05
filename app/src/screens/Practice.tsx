// Practice flow styled from the Figma Make screen while keeping real Bedrock feedback.
import { useEffect, useRef, useState } from 'react';
import {
  buildPracticeHistory,
  finishPractice,
  practiceTurn,
  SCENARIOS,
  startPractice,
  LEVELS,
  type PracticeMessage,
  type ScenarioId,
} from '../lib/practice';
import { Mo } from '../components/Mo';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';

type Step = 'picker' | 'setup' | 'conversation' | 'feedback';

const PARTNERS: Record<ScenarioId, string> = {
  join: 'Lee', 'left-on-read': 'Jordan', cancel: 'Maya', leave: 'Maya', repair: 'Jordan', invite: 'Alex', disagree: 'Alex',
};

const ICONS: Record<ScenarioId, string> = {
  join: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 21c.5-4 2.2-6 5-6M14 15c4 0 6.5 2 7 6',
  'left-on-read': 'M4 5h16v12H9l-5 4V5ZM8 10h8',
  cancel: 'M4 5h16v15H4zM8 3v4M16 3v4M7 13h10',
  leave: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9',
  repair: 'M4 5h16v12H9l-5 4V5Zm5 7 2 2 4-5',
  invite: 'M12 5v14M5 12h14',
  disagree: 'M5 7h14M5 12h10M5 17h7',
};

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>;
}

function PracticeHeader({ level, onBack }: { level: number; onBack: () => void }) {
  return <header className="practice-header inner-header"><button className="practice-back" onClick={onBack} aria-label="Back"><BackIcon /></button><h1>Practice</h1><span className="practice-level-pill">Level {level}</span></header>;
}

function PracticeProgress({ current }: { current: 1 | 2 | 3 }) {
  return <div className="practice-progress" aria-label={`Practice step ${current} of 3`}>
    {['Pick', 'Practice', 'Feedback'].map((label, index) => {
      const number = (index + 1) as 1 | 2 | 3;
      const done = number < current;
      return <div className={`practice-progress-step ${number === current ? 'active' : ''} ${done ? 'done' : ''}`} key={label}>
        {index > 0 && <i />}
        <span>{done ? <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 10l3 3 6-6" /></svg> : null}</span>
        <small>{label}</small>
      </div>;
    })}
  </div>;
}

export function Practice({ initialScenario, initialLevel = 1, personalContext, onBack }: { initialScenario?: ScenarioId; initialLevel?: 1 | 2; personalContext?: string; onBack?: () => void } = {}) {
  const [step, setStep] = useState<Step>(initialScenario ? 'setup' : 'picker');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(initialScenario ?? null);
  const [level, setLevel] = useState<1 | 2 | 3>(initialLevel);
  const [goal, setGoal] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState<PracticeMessage[]>([]);
  const [composing, setComposing] = useState(false);
  const [strength, setStrength] = useState('');
  const [tip, setTip] = useState('');
  const [replyOptions, setReplyOptions] = useState<string[]>([]);
  const [hint, setHint] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const composerRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userTurnCount = messages.filter(({ role }) => role === 'user').length;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const resetResult = () => {
    setUserMessage('');
    setMessages([]);
    setComposing(false);
    setStrength('');
    setTip('');
    setReplyOptions([]);
    setHint('');
    setHintVisible(false);
    setShowComposer(false);
    setError(null);
  };

  const handleCrisis = () => {
    alert('It sounds like you might need help right now. Please call or text 988, or reach out to your trusted person.');
    setStep('picker');
    setSelectedScenario(null);
    setGoal('');
    resetResult();
  };

  const handleStartPractice = async () => {
    if (!selectedScenario || goal.trim().length < 5) return;
    setStep('conversation');
    setLoading(true);
    setError(null);
    setMessages([]);
    try {
      const result = await startPractice(selectedScenario, level, goal.trim(), personalContext);
      if (result.crisis) return handleCrisis();
      if (result.rateLimited) return setError('Mo needs a short break. Please try again in a minute.');
      setMessages([{ role: 'partner', text: result.partnerReply }]);
      setReplyOptions(result.replyOptions);
      setHint(result.hint);
      setHintVisible(false);
      setShowComposer(level === 3);
      setComposing(true);
    } catch (err) {
      console.error('Practice start failed:', err);
      setError('Mo could not start this practice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !selectedScenario) return;
    setLoading(true);
    setError(null);
    try {
      const sent = userMessage.trim();
      const result = await practiceTurn(selectedScenario, level, goal.trim(), sent, buildPracticeHistory(messages), personalContext);
      if (result.crisis) return handleCrisis();
      if (result.rateLimited) return setError('Mo needs a short break. Please try again in a minute.');
      setMessages((current) => [...current, { role: 'user', text: sent }, { role: 'partner', text: result.partnerReply }]);
      setUserMessage('');
      setReplyOptions(result.replyOptions);
      setHint(result.hint);
      setHintVisible(false);
      setShowComposer(level === 3 || result.replyOptions.length === 0);
      setComposing(true);
    } catch (err) {
      console.error('Practice failed:', err);
      setError('Mo could not respond. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishPractice = async () => {
    if (!selectedScenario || userTurnCount < 1) return;
    setLoading(true);
    setError(null);
    try {
      const result = await finishPractice(selectedScenario, level, goal.trim(), buildPracticeHistory(messages), personalContext);
      if (result.crisis) return handleCrisis();
      if (result.rateLimited) return setError('Mo needs a short break. Please try again in a minute.');
      setStrength(result.strength);
      setTip(result.tip);
      setStep('feedback');
    } catch (err) {
      console.error('Practice feedback failed:', err);
      setError('Mo could not prepare your feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickReply = (text: string) => {
    setUserMessage(text);
    setShowComposer(true);
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  const continuePractice = () => {
    setComposing(true);
    setShowComposer(true);
    setError(null);
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  if (step === 'picker') {
    const scenarios = Object.values(SCENARIOS);
    const recommended = initialScenario ? SCENARIOS[initialScenario] : null;
    const others = recommended ? scenarios.filter((scenario) => scenario.id !== recommended.id) : scenarios;
    const renderScenario = (scenario: (typeof scenarios)[number], pickedForYou = false) => {
      return <button key={scenario.id} className="scenario-card" onClick={() => { setSelectedScenario(scenario.id); setStep('setup'); }}>
        <span className="scenario-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[scenario.id]} /></svg></span>
        <span className="scenario-info"><strong>{scenario.title}</strong><small>{scenario.description}</small>{pickedForYou && <em>Picked for you</em>}</span>
        <span className="scenario-time">2 min</span>
      </button>;
    };

    return <div className="screen practice-screen practice-picker">
      <PracticeHeader level={level} onBack={() => onBack?.()} />
      <PracticeProgress current={1} />
      <div className="practice-body">
        <div className="practice-intro"><Mo mood="happy" size={56} /><p>Pick something to practice. It's just between us.</p></div>
        {recommended && <section className="practice-section"><h2>Made for you today</h2>{renderScenario(recommended, true)}</section>}
        <section className="practice-section"><h2>{recommended ? 'More to practice' : 'Choose something to practice'}</h2><div className="practice-scenarios">{others.map((scenario) => renderScenario(scenario))}</div></section>
      </div>
    </div>;
  }

  const scenario = selectedScenario ? SCENARIOS[selectedScenario] : null;
  if (step === 'setup' && scenario) {
    return <div className="screen practice-screen practice-setup-screen">
      <PracticeHeader level={level} onBack={() => setStep('picker')} />
      <PracticeProgress current={1} />
      <div className="practice-body">
        <div className="practice-context"><span className="scenario-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[scenario.id]} /></svg></span><div><strong>{scenario.title}</strong><p>{scenario.description}</p></div></div>
        <section className="practice-section practice-setup-prompt"><h2>What do you want to practice?</h2><p>Tell Mo what a good reply would feel like for you.</p><textarea id="practice-goal" className="goal-input" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="I want to be clear and friendly…" rows={3} maxLength={300} /><p className="practice-help">Mo checks your reply against your goal, not anyone else's.</p></section>
        <section className="practice-section"><h2>Pick a level</h2><div className="level-buttons">{LEVELS.map((item) => <button key={item.level} className={`level-btn ${level === item.level ? 'active' : ''}`} onClick={() => setLevel(item.level)} aria-pressed={level === item.level}><strong>Level {item.level}</strong><span>{item.title}</span></button>)}</div><p className="practice-help">{LEVELS.find((item) => item.level === level)?.description}</p></section>
        <p className="practice-privacy">Your practice message is not saved as a transcript.</p>
      </div>
      <div className="practice-sticky-action"><button onClick={() => void handleStartPractice()} disabled={goal.trim().length < 5 || loading}>{loading ? 'Starting…' : 'Start practice'}</button></div>
    </div>;
  }

  if (step === 'conversation' && scenario) {
    const partnerName = PARTNERS[selectedScenario!] || 'Partner';
    const showPickReply = composing && replyOptions.length > 0 && !showComposer && level < 3;

    return <div className="screen practice-screen practice-conversation">
      <PracticeHeader level={level} onBack={() => { resetResult(); setStep('picker'); }} />
      <PracticeProgress current={2} />
      <div className="practice-chat-scroll" ref={scrollRef}>
        <div className="practice-context"><Mo mood="happy" size={56} /><div><strong>{scenario.title}</strong><p>{scenario.description}. Mo plays {partnerName}.</p></div></div>
        <div className="conversation-messages">
          {messages.map((message, index) => <div className={`message ${message.role === 'user' ? 'own' : 'partner'} ${index > 0 ? 'rise' : ''}`} key={`${message.role}-${index}`}>
            {message.role === 'partner' && <p className="message-label">{partnerName}</p>}
            <div className="message-bubble">{message.text}</div>
          </div>)}
          {loading && userMessage.trim() && <div className="message own rise"><div className="message-bubble">{userMessage.trim()}</div></div>}
        </div>
        {loading && <div className="practice-loading"><LoadingSpinner size={36} /><p>{messages.length ? `${partnerName} is typing…` : 'Starting your practice…'}</p></div>}
        {!loading && error && <ErrorRetry error={error} onRetry={messages.length ? () => setError(null) : () => void handleStartPractice()} />}
        {!loading && !error && composing && hint && (level === 1 || (level === 2 && hintVisible)) && <div className="practice-hint rise">Hint from Mo: {hint}</div>}
        {!loading && !error && composing && level === 2 && hint && !hintVisible && <button className="practice-hint-ask" onClick={() => setHintVisible(true)}>Need a hint?</button>}
        {showPickReply && <div className="practice-reply-options">
          <span className="practice-reply-label">Pick a reply</span>
          {replyOptions.map((opt, i) => <button key={i} className="reply-option-card" onClick={() => handlePickReply(opt)}>"{opt}"</button>)}
          <span className="practice-or-type">Or say it your own way</span>
        </div>}
      </div>
      {composing && !loading && !error && <div className="practice-text-bar">
        <input ref={composerRef} type="text" value={userMessage} onChange={(event) => setUserMessage(event.target.value)} onKeyDown={handleKeyDown} placeholder={`Reply to ${partnerName}`} maxLength={1000} aria-label="Practice message" autoComplete="off" />
        <button className="practice-send-btn" onClick={() => void handleSendMessage()} disabled={!userMessage.trim()} aria-label="Send"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button>
        {userTurnCount >= 1 && <button className="practice-done-btn" onClick={() => void handleFinishPractice()}>Done</button>}
      </div>}
    </div>;
  }

  if (step === 'feedback') {
    return <div className="screen practice-screen practice-feedback">
      <PracticeProgress current={3} />
      <div className="feedback-content"><Mo mood="happy" size={72} /><h1>Good start</h1><div className="feedback-card"><p className="feedback-label">What went well</p><p className="feedback-text">{strength}</p></div><div className="feedback-card"><p className="feedback-label">One thing to try</p><p className="feedback-text">{tip}</p></div><button className="practice-again" onClick={() => { resetResult(); void handleStartPractice(); }}>Practice again</button></div>
      <div className="practice-sticky-action"><button onClick={() => { resetResult(); setStep('picker'); }}>Done</button></div>
    </div>;
  }

  return null;
}
