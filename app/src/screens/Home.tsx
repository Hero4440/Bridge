// app/src/screens/Home.tsx
// Home screen showing event list from DynamoDB. Implements loading/error/empty states
// (FRONTEND-07, 08). Uses listEvents from lib/data.ts (FRONTEND-03).
import { useEffect, useState } from 'react';
import { listEvents, type EventRecord } from '../lib/data';
import { StatusBar } from '../components/StatusBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorRetry } from '../components/ErrorRetry';
import { EmptyState } from '../components/EmptyState';

export function Home() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const data = await listEvents();
      setEvents(data);
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
  if (events.length === 0) {
    return <EmptyState message="No events yet. Create your first event or join one from a circle!" />;
  }

  return (
    <div className="tab-screen">
      <StatusBar />
      <div className="tab-sticky-header">
        <h1 className="tab-page-title">Home</h1>
      </div>
      <div className="tab-screen-content">
        {events.map((event) => (
          <div key={event.id} className="event-row-card">
            <div>
              <strong>{event.what}</strong>
              <span>{event.whenAt ? new Date(event.whenAt).toLocaleDateString() : 'Date TBD'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
