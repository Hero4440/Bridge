// Me activity reads persisted owner data and reduces it into the Figma journey and badge view.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { currentUser } from './auth';

const client = generateClient<Schema>();

type Dated = { createdAt?: string | null };

export interface MeActivityInput {
  practices: Array<Dated & { level?: number | null; scenarioId?: string | null }>;
  rsvps: Dated[];
  reflections: Dated[];
  messages: Array<Dated & { groupId?: string | null }>;
  blockedCount: number;
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
  const all = [...input.practices, ...input.rsvps, ...input.reflections, ...input.messages];
  const counts = starts.map((start) => all.filter((item) => {
    const time = item.createdAt ? new Date(item.createdAt).getTime() : NaN;
    return time >= start && time < start + weekMs;
  }).length);

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
      hello: input.messages.length > 0,
      kind: input.practices.some((run) => /disagree|kind|repair/i.test(run.scenarioId ?? '')),
      breather: false,
      circle: input.messages.some((message) => !message.groupId?.startsWith('dm#')),
      event: input.rsvps.length > 0,
    },
  };
}

export async function loadMeActivity(): Promise<MeActivity> {
  const { userId } = await currentUser();
  const [practices, rsvps, reflections, messages, blocked] = await Promise.all([
    client.models.PracticeRun.list(),
    client.models.RSVP.list({ filter: { userId: { eq: userId }, status: { eq: 'going' } } }),
    client.models.Reflection.list(),
    client.models.Message.list({ filter: { senderId: { eq: userId } } }),
    client.models.Contact.list({ filter: { userId: { eq: userId }, status: { eq: 'blocked' } } }),
  ]);
  const errors = [...(practices.errors ?? []), ...(rsvps.errors ?? []), ...(reflections.errors ?? []), ...(messages.errors ?? []), ...(blocked.errors ?? [])];
  if (errors.length) throw new Error(`loadMeActivity failed: ${JSON.stringify(errors)}`);
  return summarizeMeActivity({
    practices: practices.data,
    rsvps: rsvps.data,
    reflections: reflections.data,
    messages: messages.data,
    blockedCount: blocked.data.length,
  });
}
