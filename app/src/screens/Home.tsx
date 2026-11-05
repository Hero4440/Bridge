// app/src/screens/Home.tsx
// Home turns the Figma Make visual language into a personalized dashboard backed by
// the current user's real profile and DynamoDB events.
import { useEffect, useState } from 'react';
import { listEvents, type EventRecord } from '../lib/data';
import { getCurrentUserProfile } from '../lib/profile';
import { StatusBar } from '../components/StatusBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';
import { Mo } from '../components/Mo';

interface HomeProps {
  onOpenEvents: () => void;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function eventTime(event: EventRecord) {
  return event.whenAt ? new Date(event.whenAt).getTime() : Number.MAX_SAFE_INTEGER;
}

export function Home({ onOpenEvents }: HomeProps) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [firstName, setFirstName] = useState('there');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const [eventData, profile] = await Promise.all([listEvents(), getCurrentUserProfile()]);
      setEvents([...eventData].sort((a, b) => eventTime(a) - eventTime(b)));
      setFirstName(profile?.firstName?.trim() || 'there');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorRetry error={error} onRetry={loadEvents} />;

  const nextEvent = events[0];

  return (
    <div className="tab-screen">
      <StatusBar />
      <div className="tab-sticky-header home-header">
        <span className="home-greeting">{greeting()}</span>
        <h1>{firstName}</h1>
      </div>
      <div className="tab-screen-content">
        <section className="up-next-card" aria-labelledby="up-next-title">
          <div className="home-up-next">
            <Mo mood={nextEvent ? 'happy' : 'calm'} size={56} />
            <div>
              <span className="meta-label">Up next</span>
              <h2 id="up-next-title">
                {nextEvent?.what ?? 'Your next plan can start small'}
              </h2>
              <span className="home-event-summary">
                {nextEvent?.whenAt
                  ? new Date(nextEvent.whenAt).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : nextEvent
                    ? 'Date to be decided'
                    : 'Find something comfortable to join when you are ready.'}
              </span>
            </div>
          </div>
          <button className="primary-action" onClick={onOpenEvents}>
            {nextEvent ? 'See event options' : 'Explore events'}
          </button>
        </section>

        <section className="home-events" aria-labelledby="home-events-title">
          <div className="home-section-heading">
            <h2 id="home-events-title" className="section-title">Upcoming events</h2>
            {events.length > 0 && <button onClick={onOpenEvents}>See all</button>}
          </div>

          {events.length === 0 ? (
            <div className="calm-card home-empty-events">
              <Mo mood="calm" size={44} />
              <span>No events yet. New circle events will appear here.</span>
            </div>
          ) : (
            events.slice(0, 4).map((event) => {
              const date = event.whenAt ? new Date(event.whenAt) : null;
              return (
                <article key={event.id} className="event-row-card">
                  <div className="date-tile" aria-hidden="true">
                    <small>{date?.toLocaleDateString([], { weekday: 'short' }).toUpperCase() ?? 'TBD'}</small>
                    <strong>{date?.getDate() ?? '—'}</strong>
                  </div>
                  <div className="event-copy">
                    <strong>{event.what}</strong>
                    <span>
                      {date
                        ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                        : 'Time TBD'}
                    </span>
                    <span>{event.whereText || event.venue || 'Location TBD'}</span>
                    {event.format && <span className="meta-pill">{event.format}</span>}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
