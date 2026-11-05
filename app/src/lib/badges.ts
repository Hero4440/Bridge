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
export const BADGE_EARNED_EVENT = 'bridge:badge-earned';

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

export async function listEarnedBadgeKeys(): Promise<BadgeKey[]> {
  const rows = await allPages((nextToken) => client.models.Badge.list({ nextToken }));
  return rows
    .map((badge) => badge.key)
    .filter((key): key is BadgeKey => key in BADGE_NAMES);
}
