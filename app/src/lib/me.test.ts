// Focused checks keep Me journey counts and badge unlocks tied to persisted activity.
import { describe, expect, it } from 'vitest';
import { summarizeMeActivity } from './me';

describe('summarizeMeActivity', () => {
  it('uses persisted activity for the four-week journey and badges', () => {
    const summary = summarizeMeActivity({
      practices: [{ createdAt: '2026-11-03T12:00:00Z', level: 2, scenarioId: 'kind-disagreement' }],
      rsvps: [{ createdAt: '2026-10-28T12:00:00Z' }],
      reflections: [],
      messages: [{ createdAt: '2026-11-04T12:00:00Z', groupId: 'gaming' }],
      blockedCount: 1,
      earnedBadgeKeys: ['breather'],
    }, new Date('2026-11-05T12:00:00Z'));

    expect(summary.weeks.map((week) => week.value)).toEqual([0, 0, 1, 2]);
    expect(summary).toMatchObject({ stepsThisWeek: 2, practices: 1, eventsJoined: 1, levelReached: 2, blockedCount: 1 });
    expect(summary.badges).toEqual({ hello: true, kind: true, breather: true, circle: true, event: true });
  });
});
