// Shows newly earned badges above every signed-in screen and queues simultaneous awards.
import { useEffect, useState } from 'react';
import { BADGE_EARNED_EVENT, type BadgeKey } from '../lib/badges';

type EarnedBadge = { key: BadgeKey; name: string };

export function BadgeCelebration() {
  const [queue, setQueue] = useState<EarnedBadge[]>([]);

  useEffect(() => {
    const show = (event: Event) => {
      setQueue((current) => [...current, (event as CustomEvent<EarnedBadge>).detail]);
    };
    window.addEventListener(BADGE_EARNED_EVENT, show);
    return () => window.removeEventListener(BADGE_EARNED_EVENT, show);
  }, []);

  const badge = queue[0];
  if (!badge) return null;

  return <div className="badge-celebration-backdrop">
    <section className="badge-celebration" role="dialog" aria-labelledby="badge-earned-title">
      <span className="badge-celebration-star" aria-hidden="true">★</span>
      <span>You earned a badge</span>
      <h2 id="badge-earned-title">{badge.name}</h2>
      <p>Added to your collection.</p>
      <button autoFocus onClick={() => setQueue((current) => current.slice(1))}>Dismiss</button>
    </section>
  </div>;
}
