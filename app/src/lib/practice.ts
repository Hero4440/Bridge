// app/src/lib/practice.ts
// Typed client wrapper for the Practice AI feature. Calls the practiceTurn custom query
// which returns Bedrock Claude feedback (partner reply + strength + tip) for 7 conversation
// scenarios at 3 difficulty levels. Crisis detection and fallback handling built into Lambda.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { awardBadgeAfter } from './badges';

const client = generateClient<Schema>();

export type PracticeReply = {
  partnerReply: string;
  strength: string;
  tip: string;
  replyOptions: string[];
  hint: string;
  fallback: boolean;
  crisis: boolean;
  rateLimited: boolean;
};

export type PracticeMessage = { role: 'partner' | 'user'; text: string };

// 7 scenarios from Phase 2 practice Lambda (prompts.ts)
export const SCENARIOS = {
  join: {
    id: 'join',
    title: 'Join a Chat',
    description: 'Joining an ongoing group conversation',
    icon: '💬',
  },
  'left-on-read': {
    id: 'left-on-read',
    title: 'Left on Read',
    description: 'A friend left your message on read',
    icon: '👻',
  },
  cancel: {
    id: 'cancel',
    title: 'Plans Canceled',
    description: 'A friend cancels plans last minute',
    icon: '📅',
  },
  leave: {
    id: 'leave',
    title: 'Leave Early',
    description: 'Leaving an event early when tired',
    icon: '🚪',
  },
  repair: {
    id: 'repair',
    title: 'Repair',
    description: 'Repairing after saying something harsh',
    icon: '🛠️',
  },
  invite: {
    id: 'invite',
    title: 'Invite Someone',
    description: 'Inviting someone to do something',
    icon: '✉️',
  },
  disagree: {
    id: 'disagree',
    title: 'Disagree Kindly',
    description: 'Disagreeing without conflict',
    icon: '🤝',
  },
} as const;

export type ScenarioId = keyof typeof SCENARIOS;

// 3 support levels from Phase 2 practice Lambda (prompts.ts)
export const LEVELS = [
  { level: 1, title: 'Guided', description: 'Gentle hints and encouragement' },
  { level: 2, title: 'Light Help', description: 'Fewer hints, help if stuck' },
  { level: 3, title: 'On Your Own', description: 'No hints, realistic surprises' },
] as const;

type PracticeRequest = {
  mode: 'start' | 'turn' | 'finish';
  scenarioId: ScenarioId;
  level: 1 | 2 | 3;
  goal: string;
  message?: string;
  history?: string;
  personalContext?: string;
};

export function buildPracticeHistory(messages: readonly PracticeMessage[]): string {
  return messages
    .slice(-7)
    .map(({ role, text }) => `${role === 'partner' ? 'Practice partner' : 'User'}: ${text.slice(0, 500)}`)
    .join('\n')
    .slice(0, 3600);
}

async function requestPractice(args: PracticeRequest): Promise<PracticeReply> {
  const { data, errors } = await client.queries.practiceTurn({
    ...args,
  });

  if (errors?.length) {
    throw new Error(`practiceTurn failed: ${JSON.stringify(errors)}`);
  }

  if (!data) {
    throw new Error('practiceTurn returned no data');
  }

  const reply = {
    partnerReply: data.partnerReply || '',
    strength: data.strength || '',
    tip: data.tip || '',
    replyOptions: (data.replyOptions?.filter((s): s is string => !!s)) || [],
    hint: data.hint || '',
    fallback: data.fallback || false,
    crisis: data.crisis || false,
    rateLimited: data.rateLimited || false,
  };
  return reply;
}

export function startPractice(scenarioId: ScenarioId, level: 1 | 2 | 3, goal: string, personalContext?: string) {
  return requestPractice({ mode: 'start', scenarioId, level, goal, personalContext });
}

export function practiceTurn(
  scenarioId: ScenarioId,
  level: 1 | 2 | 3,
  goal: string,
  message: string,
  history: string,
  personalContext?: string,
) {
  return requestPractice({ mode: 'turn', scenarioId, level, goal, message, history, personalContext });
}

export async function finishPractice(
  scenarioId: ScenarioId,
  level: 1 | 2 | 3,
  goal: string,
  history: string,
  personalContext?: string,
) {
  const reply = await requestPractice({ mode: 'finish', scenarioId, level, goal, history, personalContext });
  if (!reply.crisis && (scenarioId === 'disagree' || scenarioId === 'repair')) awardBadgeAfter('kind');
  return reply;
}
