// Unit tests for preview(): suggestions happy path, model fallback, rate limit, invalid input.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../shared/rateLimit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, count: 1 })),
  RATE_LIMIT_MESSAGE: 'take a breather',
}));
vi.mock('../../shared/bedrock', () => ({ converseWithTool: vi.fn() }));

import { handler } from '../handler';
import { converseWithTool } from '../../shared/bedrock';
import { checkRateLimit } from '../../shared/rateLimit';

beforeEach(() => vi.clearAllMocks());

describe('preview handler', () => {
  it('returns 1-3 suggestions on ok model', async () => {
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { suggestions: ['hi', 'hey'] } });
    const r = (await handler({ arguments: { context: 'joining a chat' } })) as Record<string, unknown>;
    expect((r.suggestions as string[]).length).toBeGreaterThanOrEqual(1);
    expect(r.fallback).toBe(false);
  });

  it('model failure yields the preview fallback', async () => {
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: false });
    const r = (await handler({ arguments: { context: 'x' } })) as Record<string, unknown>;
    expect(r.fallback).toBe(true);
  });

  it('over the rate limit returns a gentle message', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ allowed: false, count: 101 });
    const r = (await handler({ arguments: { context: 'x' } })) as Record<string, unknown>;
    expect(r.rateLimited).toBe(true);
  });

  it('invalid input falls back without throwing', async () => {
    const r = (await handler({ arguments: { context: '' } })) as Record<string, unknown>;
    expect(r.fallback).toBe(true);
  });
});
