// app/src/screens/Dms.tsx
// DMs screen: message requests and direct message threads.
// Uses Phase 5 DM backend with safety checks (hold/deliver for unsafe requests).
// Subscription cleanup on unmount prevents memory leaks.
import { useEffect, useState } from 'react';
import { sendDm, respondToRequest, listRequests, observeThread } from '../lib/dm';
import { type MessageRecord } from '../lib/messages';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';
import { PersonAvatar } from '../components/PersonAvatar';
import { currentUser } from '../lib/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type MessageRequestRecord = Schema['MessageRequest']['type'];
type ContactRecord = Schema['Contact']['type'];

interface DmsProps {
  userId: string;
}

type View = 'list' | 'thread' | 'requests';

export function Dms({ userId }: DmsProps) {
  const [view, setView] = useState<View>('list');
  const [requests, setRequests] = useState<MessageRequestRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await currentUser();
      
      // Load message requests
      const requestList = await listRequests(user.userId);
      setRequests(requestList);

      // Load contacts (accepted DM partners)
      const { data: contactData, errors } = await client.models.Contact.list({
        filter: { userId: { eq: user.userId }, status: { eq: 'accepted' } }
      });
      if (errors?.length) throw new Error('Failed to load contacts');
      setContacts(contactData);
    } catch (err) {
      console.error('Failed to load DM data:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Subscribe to thread messages when a contact is selected
  useEffect(() => {
    if (view !== 'thread' || !selectedContact) return;

    const subscription = observeThread(
      userId,
      selectedContact.contactId || '',
      (items) => setMessages(items),
      (err) => {
        console.error('Thread subscription error:', err);
        setError('Failed to load messages');
      }
    );

    return () => subscription.unsubscribe();
  }, [view, selectedContact, userId]);

  const handleAcceptRequest = async (request: MessageRequestRecord) => {
    if (!request.id) return;
    setProcessingRequest(request.id);
    try {
      await respondToRequest(request.id, true);
      // Reload data to refresh contacts and requests
      await loadData();
      setView('list');
    } catch (err) {
      console.error('Failed to accept request:', err);
      alert('Failed to accept request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (request: MessageRequestRecord) => {
    if (!request.id) return;
    setProcessingRequest(request.id);
    try {
      await respondToRequest(request.id, false);
      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (err) {
      console.error('Failed to decline request:', err);
      alert('Failed to decline request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleSendMessage = async () => {
    if (!draft.trim() || !selectedContact || sendingMessage) return;

    setSendingMessage(true);
    try {
      const result = await sendDm(selectedContact.contactId || '', draft.trim());
      
      if (result.crisis) {
        alert('Your message indicates you may need help. Please reach out to a trusted person or call 988.');
      } else if (result.unsafe) {
        alert('This message was flagged by our safety system. Please review and try again.');
      } else if (result.held) {
        alert('Your message is pending review.');
      } else if (result.delivered) {
        setDraft('');
      }
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

  if (loading) {
    return (
      <div className="screen">
        <div className="header">
          <h1>Messages</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error && view === 'list') {
    return (
      <div className="screen">
        <div className="header">
          <h1>Messages</h1>
        </div>
        <ErrorRetry error={error} onRetry={loadData} />
      </div>
    );
  }

  // Requests view
  if (view === 'requests') {
    return (
      <div className="screen">
        <div className="header">
          <button className="back-btn" onClick={() => setView('list')}>
            ← Back
          </button>
          <h1>Message Requests</h1>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="dm-requests-list">
            {requests.map(request => (
              <div key={request.id} className="request-card">
                <PersonAvatar name={request.fromUserId || ''} size={48} />
                <div className="request-content">
                  <div className="request-from">
                    <strong>{request.fromUserId}</strong>
                    {request.unsafe && <span className="unsafe-badge">⚠️ Flagged</span>}
                  </div>
                  <p className="request-preview">{request.firstMessage}</p>
                  <div className="request-buttons">
                    <button
                      className="accept-btn"
                      onClick={() => handleAcceptRequest(request)}
                      disabled={processingRequest === request.id}
                    >
                      {processingRequest === request.id ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      className="decline-btn"
                      onClick={() => handleDeclineRequest(request)}
                      disabled={processingRequest === request.id}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Thread view
  if (view === 'thread' && selectedContact) {
    return (
      <div className="screen dm-thread">
        <div className="header">
          <button className="back-btn" onClick={() => {
            setView('list');
            setSelectedContact(null);
          }}>
            ← Back
          </button>
          <h1>{selectedContact.contactId}</h1>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
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

  // List view (default)
  return (
    <div className="screen">
      <div className="header">
        <h1>Messages</h1>
        {requests.length > 0 && (
          <button 
            className="requests-badge"
            onClick={() => setView('requests')}
          >
            {requests.length} {requests.length === 1 ? 'request' : 'requests'}
          </button>
        )}
      </div>

      {contacts.length === 0 ? (
        <div className="empty-state">
          <p>No conversations yet</p>
          <p className="subtext">
            {requests.length > 0 
              ? 'Check your message requests above'
              : 'Start a conversation from a circle or event'}
          </p>
        </div>
      ) : (
        <div className="dm-contacts-list">
          {contacts.map(contact => (
            <button
              key={contact.id}
              className="contact-row"
              onClick={() => {
                setSelectedContact(contact);
                setView('thread');
              }}
            >
              <PersonAvatar name={contact.contactId || ''} size={48} />
              <div className="contact-info">
                <strong>{contact.contactId}</strong>
                <p className="subtext">Tap to message</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
