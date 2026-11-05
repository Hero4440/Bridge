// app/src/screens/Practice.tsx
// Practice screen: 4-step flow for conversation practice with real AI feedback from Bedrock.
// User picks scenario → sets level + goal → practices → gets strength + tip feedback.
// Matches figma-make prototype flow with real practiceTurn backend integration.
import { useState } from 'react';
import { practiceTurn, SCENARIOS, LEVELS, type ScenarioId } from '../lib/practice';
import { Mo } from '../components/Mo';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';

type Step = 'picker' | 'setup' | 'conversation' | 'feedback';

export function Practice({initialScenario,initialLevel=1}:{initialScenario?:ScenarioId;initialLevel?:1|2} = {}) {
  const [step, setStep] = useState<Step>(initialScenario?'setup':'picker');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(initialScenario??null);
  const [level, setLevel] = useState<1 | 2 | 3>(initialLevel);
  const [goal, setGoal] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [partnerReply, setPartnerReply] = useState('');
  const [strength, setStrength] = useState('');
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickScenario = (scenarioId: ScenarioId) => {
    setSelectedScenario(scenarioId);
    setStep('setup');
  };

  const handleStartPractice = () => {
    if (!goal.trim() || goal.trim().length < 5) {
      alert('Please set a goal (at least 5 characters)');
      return;
    }
    setStep('conversation');
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !selectedScenario) return;

    setLoading(true);
    setError(null);

    try {
      const result = await practiceTurn(selectedScenario, level, goal, userMessage.trim());

      if (result.crisis) {
        // Crisis detected - show 988 alert and reset
        alert(
          'It sounds like you might need help right now.\n\n' +
          'Please call or text 988 (Suicide & Crisis Lifeline) or reach out to your trusted person.\n\n' +
          'You can also text "HELLO" to 741741 (Crisis Text Line).'
        );
        // Reset to picker
        setStep('picker');
        setSelectedScenario(null);
        setGoal('');
        setUserMessage('');
        return;
      }

      // Store feedback and advance to feedback step
      setPartnerReply(result.partnerReply);
      setStrength(result.strength);
      setTip(result.tip);
      setStep('feedback');
    } catch (err) {
      console.error('Practice failed:', err);
      setError('Failed to get AI feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    // Reset conversation only (keep scenario, level, goal)
    setUserMessage('');
    setPartnerReply('');
    setStrength('');
    setTip('');
    setStep('conversation');
  };

  const handleDone = () => {
    // Reset everything and return to picker
    setStep('picker');
    setSelectedScenario(null);
    setLevel(1);
    setGoal('');
    setUserMessage('');
    setPartnerReply('');
    setStrength('');
    setTip('');
    setError(null);
  };

  const handleBack = () => {
    if (step === 'setup') setStep('picker');
    else if (step === 'conversation') setStep('setup');
    // Can't go back from feedback
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Step 1: Scenario Picker
  if (step === 'picker') {
    return (
      <div className="screen">
        <div className="header">
          <h1>Practice</h1>
          <p className="subtext">Practice conversations with Mo's feedback</p>
        </div>

        <div className="practice-intro">
          <Mo mood="happy" size={56} />
          <p>Pick something to practice. It's just between us.</p>
        </div>

        <div className="practice-scenarios">
          {Object.values(SCENARIOS).map((scenario) => (
            <button
              key={scenario.id}
              className="scenario-card"
              onClick={() => handlePickScenario(scenario.id as ScenarioId)}
            >
              <span className="scenario-icon">{scenario.icon}</span>
              <div className="scenario-info">
                <strong>{scenario.title}</strong>
                <p>{scenario.description}</p>
              </div>
              <span className="scenario-time">2 min</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Level + Goal Setup
  if (step === 'setup') {
    const scenario = selectedScenario ? SCENARIOS[selectedScenario] : null;

    return (
      <div className="screen">
        <div className="header">
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
          <h1>{scenario?.title}</h1>
        </div>

        <div className="practice-setup">
          <div className="setup-section">
            <h3>Pick a level</h3>
            <div className="level-buttons">
              {LEVELS.map((lv) => (
                <button
                  key={lv.level}
                  className={`level-btn ${level === lv.level ? 'active' : ''}`}
                  onClick={() => setLevel(lv.level)}
                >
                  <strong>{lv.title}</strong>
                  <span>{lv.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setup-section">
            <h3>What's your goal?</h3>
            <p className="subtext">Mo will judge your practice against YOUR goal, not anyone else's.</p>
            <textarea
              className="goal-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="I want to..."
              rows={3}
            />
            <p className="hint">Example: "I want to sound friendly" or "I want to be clear without seeming rude"</p>
          </div>

          <button
            className="primary-btn"
            onClick={handleStartPractice}
            disabled={goal.trim().length < 5}
          >
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Conversation
  if (step === 'conversation') {
    const scenario = selectedScenario ? SCENARIOS[selectedScenario] : null;

    return (
      <div className="screen practice-conversation">
        <div className="header">
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
          <h1>{scenario?.title}</h1>
          <span className="level-badge">{LEVELS.find(l => l.level === level)?.title}</span>
        </div>

        <div className="conversation-container">
          <div className="practice-context">
            <Mo mood="happy" size={56} />
            <div>
              <strong>{scenario?.title}</strong>
              <p className="subtext">{scenario?.description}. Mo plays the other person.</p>
            </div>
          </div>

          <div className="conversation-messages">
            <div className="message partner">
              <p className="message-label">Practice partner</p>
              <div className="message-bubble">
                {scenario?.id === 'join' && "Hey! We're just talking about our favorite games. What are you into?"}
                {scenario?.id === 'left-on-read' && "You sent: 'Hey, want to hang out this weekend?' (no reply yet)"}
                {scenario?.id === 'cancel' && "Sorry, I can't make it today. Something came up."}
                {scenario?.id === 'leave' && "(You're at an event and feeling tired. What do you say?)"}
                {scenario?.id === 'repair' && "(You said something harsh earlier. Time to make it right.)"}
                {scenario?.id === 'invite' && "(You want to invite someone. What do you say?)"}
                {scenario?.id === 'disagree' && "I think pineapple on pizza is the best! Don't you agree?"}
              </div>
            </div>

            {partnerReply && (
              <div className="message partner">
                <p className="message-label">Practice partner</p>
                <div className="message-bubble">{partnerReply}</div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading-container">
              <LoadingSpinner />
              <p>Mo is thinking...</p>
            </div>
          ) : error ? (
            <ErrorRetry error={error} onRetry={() => setError(null)} />
          ) : (
            <div className="message-composer">
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your practice message..."
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!userMessage.trim()}
                className="send-btn"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 4: Feedback
  if (step === 'feedback') {
    return (
      <div className="screen practice-feedback">
        <div className="header">
          <h1>How You Did</h1>
        </div>

        <div className="feedback-content">
          <Mo mood="happy" size={120} />
          <h2>Good job!</h2>

          <div className="feedback-card strength">
            <p className="feedback-label">WHAT WENT WELL</p>
            <p className="feedback-text">{strength}</p>
          </div>

          <div className="feedback-card tip">
            <p className="feedback-label">ONE THING TO TRY</p>
            <p className="feedback-text">{tip}</p>
          </div>

          <div className="feedback-actions">
            <button className="secondary-btn" onClick={handleTryAgain}>
              Practice Again
            </button>
            <button className="primary-btn" onClick={handleDone}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
