// Focused checks keep Me journey counts and badge unlocks tied to persisted activity.
import { describe, expect, it } from 'vitest';
import { summarizeMeActivity } from './me';

describe('summarizeMeActivity', () => {
  it('uses persisted activity for the four-week journey and badges', () => {
    const summary = summarizeMeActivity({
      practices: [{ createdAt: '2026-11-03T12:00:00Z', level: 2, scenarioId: 'kind-disagreement' }],
      rsvps: [{ createdAt: '2026-10-28T12:00:00Z' }],
      reflections: [{ createdAt: '2026-11-04T13:00:00Z' }],
      messages: [{ createdAt: '2026-11-04T12:00:00Z', groupId: 'gaming' }],
      goals: [{ week: '2026-11-02', done: true, updatedAt: '2026-11-05T09:00:00Z' }],
      blockedCount: 1,
      earnedBadges: ['hello', 'kind', 'breather', 'circle', 'event'].map((key) => ({ key, earnedAt: '2026-10-01T12:00:00Z' })),
    }, new Date('2026-11-05T12:00:00Z'));

    expect(summary.weeks.map((week) => week.value)).toEqual([0, 0, 1, 3]);
    expect(summary).toMatchObject({ stepsThisWeek: 3, dailyStreak: 3, practices: 1, eventsJoined: 1, levelReached: 2, blockedCount: 1 });
    expect(summary.badges).toEqual({ hello: true, kind: true, breather: true, circle: true, event: true });
  });

  it('does not restore deleted badges from retained messages or events', () => {
    const summary = summarizeMeActivity({
      practices: [{ scenarioId: 'disagree' }],
      rsvps: [{}],
      reflections: [],
      messages: [{ groupId: 'gaming' }],
      goals: [],
      blockedCount: 0,
      earnedBadges: [],
    });
    expect(summary.badges).toEqual({ hello: false, kind: false, breather: false, circle: false, event: false });
  });

  it('counts First Hello and First Circle badges as brave steps', () => {
    const summary = summarizeMeActivity({
      practices: [], rsvps: [], reflections: [], messages: [], goals: [], blockedCount: 0,
      earnedBadges: [
        { key: 'hello', earnedAt: '2026-11-04T12:00:00Z' },
        { key: 'circle', earnedAt: '2026-11-04T12:01:00Z' },
      ],
    }, new Date('2026-11-05T12:00:00Z'));
    expect(summary.stepsThisWeek).toBe(2);
  });

  it('counts every completed practice and Going RSVP once', () => {
    const summary = summarizeMeActivity({
      practices: [{ createdAt: '2026-11-04T10:00:00Z' }],
      rsvps: [{ timestamp: '2026-11-04T11:00:00Z' }],
      reflections: [], messages: [], goals: [], blockedCount: 0,
      earnedBadges: [{ key: 'event', earnedAt: '2026-11-04T11:00:01Z' }],
    }, new Date('2026-11-05T12:00:00Z'));
    expect(summary.stepsThisWeek).toBe(2);
  });

  it('advances the streak once per active day and resets after a missed day', () => {
    const active = summarizeMeActivity({
      practices: [{ createdAt: '2026-11-03T10:00:00-07:00' }],
      rsvps: [{ timestamp: '2026-11-04T11:00:00-07:00' }],
      reflections: [{ timestamp: '2026-11-04T12:00:00-07:00' }],
      messages: [], goals: [], blockedCount: 0,
      earnedBadges: [{ key: 'hello', earnedAt: '2026-11-04T13:00:00-07:00' }],
    }, new Date('2026-11-05T12:00:00-07:00'));
    const reset = summarizeMeActivity({
      practices: [{ createdAt: '2026-11-02T10:00:00-07:00' }],
      rsvps: [{ timestamp: '2026-11-04T11:00:00-07:00' }],
      reflections: [], messages: [], goals: [], blockedCount: 0, earnedBadges: [],
    }, new Date('2026-11-05T12:00:00-07:00'));

    expect(active.dailyStreak).toBe(2);
    expect(reset.dailyStreak).toBe(1);
  });
});
