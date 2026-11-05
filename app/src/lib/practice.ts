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
  fallback: boolean;
  crisis: boolean;
};

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

export async function practiceTurn(
  scenarioId: ScenarioId,
  level: 1 | 2 | 3,
  goal: string,
  message: string,
  personalContext?: string,
): Promise<PracticeReply> {
  const { data, errors } = await client.queries.practiceTurn({
    scenarioId,
    level,
    goal,
    message,
    personalContext,
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
    fallback: data.fallback || false,
    crisis: data.crisis || false,
  };
  if (!reply.crisis && (scenarioId === 'disagree' || scenarioId === 'repair')) {
    awardBadgeAfter('kind');
  }
  return reply;
}
