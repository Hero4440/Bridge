// Persists each earned badge once and announces new awards to the app-level celebration UI.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { currentUser } from './auth';
import { allPages, checked } from './apiResults';

const client = generateClient<Schema>();

export const BADGE_NAMES = {
  hello: 'First Hello',
  kind: 'Kind Words',
  breather: 'Breather',
  circle: 'First Circle',
  event: 'Game Night',
} as const;

export type BadgeKey = keyof typeof BADGE_NAMES;
export type EarnedBadge = Pick<Schema['Badge']['type'], 'key' | 'earnedAt'>;
export const BADGE_EARNED_EVENT = 'bridge:badge-earned';
const BRAVE_STEP_BADGES = new Set<BadgeKey>(['hello', 'breather', 'circle']);

export function isBraveStepBadge(key: string): key is BadgeKey {
  return BRAVE_STEP_BADGES.has(key as BadgeKey);
}

export async function awardBadge(key: BadgeKey): Promise<boolean> {
  const { userId } = await currentUser();
  const id = `${userId}#${key}`;
  if (checked(await client.models.Badge.get({ id }))) return false;

  const badge = checked(await client.models.Badge.create({
    id,
    key,
    earnedAt: new Date().toISOString(),
  }));
  if (!badge) return false;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BADGE_EARNED_EVENT, {
      detail: { key, name: BADGE_NAMES[key] },
    }));
  }
  return true;
}

export function awardBadgeAfter(key: BadgeKey): void {
  void awardBadge(key).catch(() => {
    // Earning a badge must never make the successful user action look failed.
  });
}

export async function listEarnedBadges(): Promise<Schema['Badge']['type'][]> {
  return allPages((nextToken) => client.models.Badge.list({ nextToken }));
}

export function countBadgeSteps(badges: readonly EarnedBadge[], start: Date, end: Date): number {
  return badges.filter((badge) => {
    const earnedAt = new Date(badge.earnedAt).getTime();
    return isBraveStepBadge(badge.key) && earnedAt >= start.getTime() && earnedAt < end.getTime();
  }).length;
}

export async function listEarnedBadgeKeys(): Promise<BadgeKey[]> {
  const rows = await listEarnedBadges();
  return rows
    .map((badge) => badge.key)
    .filter((key): key is BadgeKey => key in BADGE_NAMES);
}
