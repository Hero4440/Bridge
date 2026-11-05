// app/src/screens/Circles.tsx
// Circles screen: group list and live chat via observeMessages subscription.
// Uses hardcoded 6 groups from the prototype (real Group records will come from Phase 4 seeding).
// Subscription cleanup on unmount prevents memory leaks (CHAT-07).
import { useEffect, useState } from 'react';
import { observeMessages, sendMessage, type MessageRecord } from '../lib/messages';
import { getDailyTopic } from '../lib/topics';
import { CircleGlyph } from '../components/CircleGlyph';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';
import { currentUser } from '../lib/auth';

// Hardcoded circles from prototype (matches figma-make circleData)
const CIRCLES = [
  { id: 'gaming', name: 'Gaming', tint: '#F9DCE4' },
  { id: 'music', name: 'Music', tint: '#E3E0F8' },
  { id: 'anime', name: 'Anime', tint: '#FBE1D8' },
  { id: 'cooking', name: 'Cooking', tint: '#DDF1E6' },
  { id: 'art', name: 'Art', tint: '#F6E5C9' },
  { id: 'tech', name: 'Tech', tint: '#DCE4FA' },
];

interface CirclesProps {
  userId: string;
}

export function Circles({ userId }: CirclesProps) {
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [dailyTopic, setDailyTopic] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Subscribe to messages when a circle is selected
  useEffect(() => {
    if (!selectedCircle) return;
    
    setLoading(true);
    setError(null);

    // Fetch daily topic
    const circle = CIRCLES.find(c => c.id === selectedCircle);
    getDailyTopic(selectedCircle, circle?.name)
      .then(result => setDailyTopic(result.text))
      .catch(err => console.error('Failed to load topic:', err));

    // Subscribe to messages
    const subscription = observeMessages(
      selectedCircle,
      (items) => {
        setMessages(items);
        setLoading(false);
      },
      (err) => {
        console.error('Message subscription error:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount or circle change
    return () => subscription.unsubscribe();
  }, [selectedCircle]);

  const handleSendMessage = async () => {
    if (!draft.trim() || !selectedCircle || sendingMessage) return;

    setSendingMessage(true);
    try {
      const user = await currentUser();
      await sendMessage({
        groupId: selectedCircle,
        content: draft.trim(),
        senderId: user.userId,
      });
      setDraft('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Circle list view
  if (!selectedCircle) {
    return (
      <div className="screen">
        <div className="header">
          <h1>Circles</h1>
          <p className="subtext">Join conversations around what you love</p>
        </div>
        
        <div className="circles-list">
          {CIRCLES.map(circle => (
            <button
              key={circle.id}
              className="circle-card"
              onClick={() => setSelectedCircle(circle.id)}
            >
              <CircleGlyph kind={circle.id} tint={circle.tint} size={56} />
              <div className="circle-info">
                <h3>{circle.name}</h3>
                <p className="subtext">Tap to join</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Chat view
  const circle = CIRCLES.find(c => c.id === selectedCircle);
  
  return (
    <div className="screen circles-chat">
      <div className="header">
        <button 
          className="back-btn"
          onClick={() => setSelectedCircle(null)}
        >
          ← Back
        </button>
        <h1>{circle?.name}</h1>
      </div>

      {dailyTopic && (
        <div className="daily-topic">
          <strong>Today's topic:</strong> {dailyTopic}
        </div>
      )}

      <div className="messages-container">
        {loading && <LoadingSpinner />}
        
        {error && (
          <ErrorRetry
            message={error}
            onRetry={() => {
              setError(null);
              setLoading(true);
              // Re-trigger subscription by resetting and setting circle
              const current = selectedCircle;
              setSelectedCircle(null);
              setTimeout(() => setSelectedCircle(current), 0);
            }}
          />
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="messages-list">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.senderId === userId ? 'own' : 'other'}`}
              >
                <div className="message-bubble">
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="message-composer">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={2}
          disabled={sendingMessage}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!draft.trim() || sendingMessage}
          className="send-btn"
        >
          {sendingMessage ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
