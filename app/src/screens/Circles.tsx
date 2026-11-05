// app/src/screens/Circles.tsx
// Circles screen: group list and live chat via observeMessages subscription.
// Uses hardcoded 6 groups from the prototype (real Group records will come from Phase 4 seeding).
// Subscription cleanup on unmount prevents memory leaks (CHAT-07).
import { useEffect, useState } from 'react';
import { observeMessages, sendMessage, type MessageRecord } from '../lib/messages';
import { getDailyTopic } from '../lib/topics';
import { listCircles, heartbeat, leaveCircle, type Circle } from '../lib/dashboard';
import { CircleGlyph, type CircleKind } from '../components/CircleGlyph';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';
import { currentUser } from '../lib/auth';

interface CirclesProps {
  userId: string;
  initialCircleId?: string;
  onOpenDms:()=>void;
}

export function Circles({ userId, initialCircleId, onOpenDms }: CirclesProps) {
  const [selectedCircle, setSelectedCircle] = useState<string | null>(initialCircleId??null);
  const [circles,setCircles]=useState<Circle[]>([]);
  const [groupsLoading,setGroupsLoading]=useState(true);
  const [groupsError,setGroupsError]=useState('');
  async function loadGroups(retry=false){if(retry){setGroupsLoading(true);setGroupsError('');}try{setCircles(await listCircles());}catch{setGroupsError('Circles could not be loaded. Please try again.');}finally{setGroupsLoading(false);}}
  useEffect(()=>{void loadGroups();},[]);
  useEffect(()=>{
    if(!selectedCircle)return;
    let stopped=false;
    const publish=()=>{if(!stopped&&navigator.onLine)void heartbeat(userId,selectedCircle).catch(()=>undefined);};
    publish();const timer=setInterval(publish,30000);
    return()=>{stopped=true;clearInterval(timer);void leaveCircle(userId).catch(()=>undefined);};
  },[selectedCircle,userId]);
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
    const circle = circles.find(c => c.id === selectedCircle);
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
  }, [selectedCircle, circles]);

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
  if(groupsLoading)return <LoadingSpinner/>;
  if(groupsError)return <ErrorRetry error={groupsError} onRetry={()=>void loadGroups(true)}/>;
  if (!selectedCircle) {
    return (
      <div className="screen">
        <div className="header">
          <h1>Circles</h1>
          <p className="subtext">Join conversations around what you love</p>
        </div>
        
        <div className="community-switch" aria-label="Community views"><button aria-current="page">Circles</button><button onClick={onOpenDms}>Messages</button></div>
        <div className="circles-list">
          {circles.length===0&&<p>No circles yet. Check back soon.</p>}
          {circles.map(circle => (
            <button
              key={circle.id}
              className="circle-card"
              onClick={() => setSelectedCircle(circle.id)}
            >
              <CircleGlyph kind={(circle.slug??circle.name.toLowerCase()) as CircleKind} size={56} />
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
  const circle = circles.find(c => c.id === selectedCircle);
  
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
            error={error}
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
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: 'numeric', 
                      minute: '2-digit' 
                    }) : ''}
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
