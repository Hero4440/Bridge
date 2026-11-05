// app/src/screens/Events.tsx
// Events screen: list all events with RSVP functionality.
// Uses listEvents() and setRsvp() from lib modules for persistence (EVENT-03/04/05).
import { useEffect, useState } from 'react';
import { listEvents, type EventRecord } from '../lib/data';
import { setRsvp, getRsvp, listRsvpsForEvent, countRsvps, type RsvpStatus } from '../lib/rsvp';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';
import { currentUser } from '../lib/auth';

interface EventsProps {
  userId: string;
}

export function Events({ userId }: EventsProps) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRsvps, setUserRsvps] = useState<Record<string, RsvpStatus>>({});
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, { going: number; maybe: number; cant: number }>>({});
  const [updatingRsvp, setUpdatingRsvp] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await currentUser();
      const eventList = await listEvents();
      setEvents(eventList);

      // Load user's RSVPs for each event
      const rsvpPromises = eventList.map(async (event) => {
        const rsvp = await getRsvp(event.id);
        return { eventId: event.id, status: rsvp?.status };
      });
      const rsvpResults = await Promise.all(rsvpPromises);
      const rsvpMap: Record<string, RsvpStatus> = {};
      rsvpResults.forEach(r => {
        if (r.status) rsvpMap[r.eventId] = r.status as RsvpStatus;
      });
      setUserRsvps(rsvpMap);

      // Load RSVP counts for each event
      const countPromises = eventList.map(async (event) => {
        const rsvps = await listRsvpsForEvent(event.id);
        return { eventId: event.id, counts: countRsvps(rsvps) };
      });
      const countResults = await Promise.all(countPromises);
      const countsMap: Record<string, { going: number; maybe: number; cant: number }> = {};
      countResults.forEach(c => {
        countsMap[c.eventId] = c.counts;
      });
      setRsvpCounts(countsMap);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRsvp = async (eventId: string, status: RsvpStatus) => {
    setUpdatingRsvp(eventId);
    try {
      await setRsvp(eventId, status);
      setUserRsvps(prev => ({ ...prev, [eventId]: status }));
      
      // Reload counts for this event
      const rsvps = await listRsvpsForEvent(eventId);
      setRsvpCounts(prev => ({ ...prev, [eventId]: countRsvps(rsvps) }));
    } catch (err) {
      console.error('Failed to update RSVP:', err);
      alert('Failed to update RSVP. Please try again.');
    } finally {
      setUpdatingRsvp(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="screen">
        <div className="header">
          <h1>Events</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen">
        <div className="header">
          <h1>Events</h1>
        </div>
        <ErrorRetry message={error} onRetry={loadEvents} />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="screen">
        <div className="header">
          <h1>Events</h1>
        </div>
        <div className="empty-state">
          <p>No events yet</p>
          <p className="subtext">Check back soon for upcoming gatherings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="header">
        <h1>Events</h1>
        <p className="subtext">{events.length} {events.length === 1 ? 'event' : 'events'} coming up</p>
      </div>

      <div className="events-list">
        {events.map((event) => {
          const userRsvp = userRsvps[event.id];
          const counts = rsvpCounts[event.id] || { going: 0, maybe: 0, cant: 0 };
          const isUpdating = updatingRsvp === event.id;

          return (
            <div key={event.id} className="event-card">
              <div className="event-date-tile">
                <div className="month">{new Date(event.date).toLocaleDateString([], { month: 'short' })}</div>
                <div className="day">{new Date(event.date).getDate()}</div>
              </div>

              <div className="event-details">
                <h3>{event.what}</h3>
                <div className="event-meta">
                  <div className="meta-row">
                    <span className="icon">📅</span>
                    <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                  </div>
                  <div className="meta-row">
                    <span className="icon">📍</span>
                    <span>{event.where}</span>
                  </div>
                  {event.groupSize && (
                    <div className="meta-row">
                      <span className="icon">👥</span>
                      <span>{counts.going} / {event.groupSize} going</span>
                    </div>
                  )}
                </div>

                <div className="rsvp-buttons">
                  <button
                    className={`rsvp-btn ${userRsvp === 'going' ? 'active going' : ''}`}
                    onClick={() => handleRsvp(event.id, 'going')}
                    disabled={isUpdating}
                  >
                    Going {counts.going > 0 && `(${counts.going})`}
                  </button>
                  <button
                    className={`rsvp-btn ${userRsvp === 'maybe' ? 'active maybe' : ''}`}
                    onClick={() => handleRsvp(event.id, 'maybe')}
                    disabled={isUpdating}
                  >
                    Maybe {counts.maybe > 0 && `(${counts.maybe})`}
                  </button>
                  <button
                    className={`rsvp-btn ${userRsvp === 'cant' ? 'active cant' : ''}`}
                    onClick={() => handleRsvp(event.id, 'cant')}
                    disabled={isUpdating}
                  >
                    Can't {counts.cant > 0 && `(${counts.cant})`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
