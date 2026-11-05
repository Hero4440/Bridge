// Me activity reads persisted owner data and reduces it into the Figma journey and badge view.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { currentUser } from './auth';
import { countBadgeSteps, listEarnedBadges, type EarnedBadge } from './badges';
import { localDate } from './checkin';

const client = generateClient<Schema>();

type Dated = { createdAt?: string | null; timestamp?: string | null };

export interface MeActivityInput {
  practices: Array<Dated & { level?: number | null; scenarioId?: string | null }>;
  rsvps: Dated[];
  reflections: Dated[];
  messages: Array<Dated & { groupId?: string | null }>;
  goals: Array<{ week?: string | null; done?: boolean | null; updatedAt?: string | null }>;
  blockedCount: number;
  earnedBadges?: EarnedBadge[];
}

export interface MeActivity {
  weeks: Array<{ label: string; value: number }>;
  stepsThisWeek: number;
  practices: number;
  eventsJoined: number;
  levelReached: number;
  blockedCount: number;
  badges: { hello: boolean; kind: boolean; breather: boolean; circle: boolean; event: boolean };
}

function weekStart(date: Date): number {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start.getTime();
}

export function summarizeMeActivity(input: MeActivityInput, now = new Date()): MeActivity {
  const currentWeek = weekStart(now);
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const starts = [3, 2, 1, 0].map((offset) => currentWeek - offset * weekMs);
  const stepActivity = [...input.practices, ...input.reflections, ...input.rsvps];
  const counts = starts.map((start) => stepActivity.filter((item) => {
    const date = item.timestamp ?? item.createdAt;
    const time = date ? new Date(date).getTime() : NaN;
    return time >= start && time < start + weekMs;
  }).length + input.goals.filter((goal) => goal.done && goal.week === localDate(new Date(start))).length
    + countBadgeSteps(input.earnedBadges ?? [], new Date(start), new Date(start + weekMs)));
  const earned = new Set((input.earnedBadges ?? []).map(({ key }) => key));

  return {
    weeks: starts.map((start, index) => ({
      label: index === 3 ? 'This week' : new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: counts[index],
    })),
    stepsThisWeek: counts[3],
    practices: input.practices.length,
    eventsJoined: input.rsvps.length,
    levelReached: Math.max(0, ...input.practices.map((run) => run.level ?? 0)),
    blockedCount: input.blockedCount,
    badges: {
      hello: earned.has('hello'),
      kind: earned.has('kind'),
      breather: earned.has('breather'),
      circle: earned.has('circle'),
      event: earned.has('event'),
    },
  };
}

export async function loadMeActivity(): Promise<MeActivity> {
  const { userId } = await currentUser();
  const [practices, rsvps, reflections, messages, goals, blocked, earnedBadges] = await Promise.all([
    client.models.PracticeRun.list(),
    client.models.RSVP.list({ filter: { userId: { eq: userId }, status: { eq: 'going' } } }),
    client.models.Reflection.list(),
    client.models.Message.list({ filter: { senderId: { eq: userId } } }),
    client.models.WeeklyGoal.list({ filter: { done: { eq: true } } }),
    client.models.Contact.list({ filter: { userId: { eq: userId }, status: { eq: 'blocked' } } }),
    listEarnedBadges(),
  ]);
  const errors = [...(practices.errors ?? []), ...(rsvps.errors ?? []), ...(reflections.errors ?? []), ...(messages.errors ?? []), ...(goals.errors ?? []), ...(blocked.errors ?? [])];
  if (errors.length) throw new Error(`loadMeActivity failed: ${JSON.stringify(errors)}`);
  return summarizeMeActivity({
    practices: practices.data,
    rsvps: rsvps.data,
    reflections: reflections.data,
    messages: messages.data,
    goals: goals.data,
    blockedCount: blocked.data.length,
    earnedBadges,
  });
}
