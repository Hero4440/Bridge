// Free-form chat with Mo. Session-scoped — no persistence across sessions.
import { useEffect, useRef, useState } from 'react';
import { Mo } from '../components/Mo';
import { sendToMo, buildMoChatHistory, type MoChatMessage } from '../lib/moChat';

export function MoChat({
  personalContext,
  onBack,
}: {
  personalContext?: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<MoChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);
    const updated: MoChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(updated);
    setLoading(true);
    try {
      const history = buildMoChatHistory(messages); // history before this message
      const result = await sendToMo(text, history, personalContext);
      if (result.crisis) {
        alert('It sounds like you might need help right now. Please call or text 988, or reach out to your trusted person.');
        onBack();
        return;
      }
      if (result.rateLimited) {
        setError('Mo needs a short break. Try again in a little while.');
        return;
      }
      setMessages((prev) => [...prev, { role: 'mo', text: result.reply }]);
    } catch {
      setError('Mo could not respond. Please try again.');
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="mo-chat-screen">
      <header className="inner-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px' }}>
        <button className="practice-back" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
        </button>
        <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '600' }}>Chat with Mo</h1>
      </header>

      <div className="mo-chat-scroll" ref={scrollRef}>
        {messages.length === 0 && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '32px 20px', textAlign: 'center' }}>
            <Mo mood="happy" size={64} />
            <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>
              Hey! I'm Mo. You can talk to me about anything — no judgment, no rush.
            </p>
          </div>
        )}
        <div className="conversation-messages">
          {messages.map((msg, i) => (
            <div className={`message ${msg.role === 'user' ? 'own' : 'partner'}`} key={i}>
              {msg.role === 'mo' && <p className="message-label">Mo</p>}
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
        </div>
        {loading && (
          <div style={{ padding: '8px 20px', color: 'var(--muted)', fontSize: '14px' }}>
            Mo is typing…
          </div>
        )}
        {error && (
          <div style={{ padding: '8px 20px', color: '#E85D5D', fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>

      <div className="mo-chat-bar">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Mo…"
          maxLength={1000}
          aria-label="Chat message"
          autoComplete="off"
        />
        <button
          className="practice-send-btn"
          onClick={() => void handleSend()}
          disabled={!input.trim() || loading}
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
