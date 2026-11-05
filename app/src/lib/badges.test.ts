// Badge checks prove awards are durable, deterministic, and never duplicated.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const badgeApi = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), list: vi.fn() }));
const authApi = vi.hoisted(() => ({ currentUser: vi.fn() }));

vi.mock('aws-amplify/data', () => ({
  generateClient: () => ({ models: { Badge: badgeApi } }),
}));
vi.mock('./auth', () => authApi);

import { awardBadge, countBadgeSteps, listEarnedBadgeKeys } from './badges';

describe('badges', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authApi.currentUser.mockResolvedValue({ userId: 'person-sub' });
    badgeApi.get.mockResolvedValue({ data: null });
    badgeApi.create.mockResolvedValue({ data: { id: 'person-sub#hello', key: 'hello' } });
    badgeApi.list.mockResolvedValue({ data: [], nextToken: null });
  });

  it('creates one deterministic owner badge record', async () => {
    await expect(awardBadge('hello')).resolves.toBe(true);
    expect(badgeApi.create).toHaveBeenCalledWith(expect.objectContaining({
      id: 'person-sub#hello',
      key: 'hello',
    }));
  });

  it('does not create or celebrate an already-earned badge', async () => {
    badgeApi.get.mockResolvedValue({ data: { id: 'person-sub#hello', key: 'hello' } });
    await expect(awardBadge('hello')).resolves.toBe(false);
    expect(badgeApi.create).not.toHaveBeenCalled();
  });

  it('returns only recognized earned badge keys', async () => {
    badgeApi.list.mockResolvedValue({ data: [{ key: 'breather' }, { key: 'unknown' }], nextToken: null });
    await expect(listEarnedBadgeKeys()).resolves.toEqual(['breather']);
  });

  it('counts badge-backed actions once and leaves Kind Words to its practice run', () => {
    const start = new Date('2026-11-02T00:00:00');
    const end = new Date('2026-11-09T00:00:00');
    expect(countBadgeSteps([
      { key: 'hello', earnedAt: '2026-11-04T12:00:00Z' },
      { key: 'circle', earnedAt: '2026-11-04T12:01:00Z' },
      { key: 'kind', earnedAt: '2026-11-04T12:02:00Z' },
      { key: 'event', earnedAt: '2026-11-04T12:03:00Z' },
    ], start, end)).toBe(2);
  });
});
