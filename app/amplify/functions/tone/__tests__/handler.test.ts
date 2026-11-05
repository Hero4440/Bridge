// Unit tests for tone(): keyword flagging, clean text, model fallback, invalid input.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../shared/rateLimit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, count: 1 })),
  RATE_LIMIT_MESSAGE: 'take a breather',
}));
vi.mock('../../shared/bedrock', () => ({ converseWithTool: vi.fn() }));

import { handler } from '../handler';
import { converseWithTool } from '../../shared/bedrock';

beforeEach(() => vi.clearAllMocks());

describe('tone handler', () => {
  it('flags harsh words with a reason', async () => {
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { gentle: 'nicer', flaggedWords: [] } });
    const r = (await handler({ arguments: { text: 'this is stupid, shut up' } })) as Record<string, unknown>;
    const flags = r.flaggedWords as string[];
    expect(flags.length).toBeGreaterThan(0);
    expect(flags.some((f) => f.includes('stupid'))).toBe(true);
  });

  it('clean text still returns a gentle rewrite + empty flags', async () => {
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { gentle: 'nice', flaggedWords: [] } });
    const r = (await handler({ arguments: { text: 'hello friend' } })) as Record<string, unknown>;
    expect(r.flaggedWords).toEqual([]);
    expect((r.gentle as string).length).toBeGreaterThan(0);
  });

  it('model failure yields the tone fallback', async () => {
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: false });
    const r = (await handler({ arguments: { text: 'hello' } })) as Record<string, unknown>;
    expect(r.fallback).toBe(true);
  });

  it('invalid input falls back without throwing', async () => {
    const r = (await handler({ arguments: { text: '' } })) as Record<string, unknown>;
    expect(r.fallback).toBe(true);
  });
});
