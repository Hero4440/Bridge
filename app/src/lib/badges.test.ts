// Badge checks prove awards are durable, deterministic, and never duplicated.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const badgeApi = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), list: vi.fn() }));
const authApi = vi.hoisted(() => ({ currentUser: vi.fn() }));

vi.mock('aws-amplify/data', () => ({
  generateClient: () => ({ models: { Badge: badgeApi } }),
}));
vi.mock('./auth', () => authApi);

import { awardBadge, listEarnedBadgeKeys } from './badges';

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
});
