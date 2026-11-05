import { z } from 'zod';
import type { ScenarioId } from './practice';

export const feelingLabels = { over: 'Overwhelmed', okay: 'Okay', ready: 'Ready to connect' } as const;
export const upcomingLabels = { group: 'A group hangout', text: 'Texting someone new', hard: 'A hard conversation', none: 'Nothing planned' } as const;
export const hardestLabels = { start: 'Starting a chat', keep: 'Keeping it going', tone: 'Reading tone', disagree: 'Disagreeing', leave: 'Leaving or saying no' } as const;
export const checkInSchema = z.object({
  feeling: z.enum(['over', 'okay', 'ready']),
  upcoming: z.enum(['group', 'text', 'hard', 'none']),
  hardest: z.enum(['start', 'keep', 'tone', 'disagree', 'leave']),
});
export type CheckInValues = z.infer<typeof checkInSchema>;
// Local calendar boundaries keep a late evening check-in on the correct day.
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function weekStart(now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - (monday.getDay()+6)%7);
  return localDate(monday);
}
const hardScenarios: Record<CheckInValues['hardest'], ScenarioId> = {
  start:'join', keep:'left-on-read', tone:'left-on-read', disagree:'disagree', leave:'leave',
};
const titles: Record<ScenarioId, string> = {
  join:'Join a chat that is already going', 'left-on-read':'They left you on read', cancel:'A friend cancels last minute',
  leave:'Leave when your energy runs out', repair:'Fix it after saying something harsh', invite:'Ask someone to hang out', disagree:'Disagree without hurting',
};
export function recommendation(checkIn: CheckInValues) {
  const scenario = hardScenarios[checkIn.hardest];
  const lines: Partial<Record<CheckInValues['hardest'], string>> = {
    start:"Starting chats is tough. I picked today's practice just for that.",
    keep:"Knowing what to reply is hard. I've got a scenario ready for you.",
    tone:"Reading the room can be tricky. Let's work on that today.",
  };
  const line = lines[checkIn.hardest] ?? (checkIn.feeling === 'over'
    ? "Thanks for telling me. Let's keep today gentle. Just reading a circle counts."
    : checkIn.feeling === 'ready' ? "You're ready to connect! Let's practice, then go for it."
    : checkIn.upcoming === 'none' ? "Let's warm up with one small practice today."
    : `Let's warm up for your ${upcomingLabels[checkIn.upcoming].toLowerCase().replace('a ', '')}.`);
  return { scenario, title: titles[scenario], level: (checkIn.feeling === 'ready' ? 2 : 1) as 1|2, picked: !!lines[checkIn.hardest], line };
}
