// Unit tests for the practice turn: crisis gate, happy path, model fallback, rate limit.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../shared/classify', () => ({ classify: vi.fn() }));
vi.mock('../../shared/rateLimit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, count: 1 })),
  RATE_LIMIT_MESSAGE: 'take a breather',
}));
vi.mock('../../shared/bedrock', () => ({ converseWithTool: vi.fn() }));
vi.mock('@aws-amplify/backend/function/runtime', () => ({
  getAmplifyDataClientConfig: vi.fn(async () => ({ resourceConfig: {}, libraryOptions: {} })),
}));
vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('aws-amplify/data', () => ({
  generateClient: () => ({ models: { PracticeRun: { create: vi.fn(async () => ({ data: {} })) } } }),
}));

import { handler } from '../handler';
import { classify } from '../../shared/classify';
import { checkRateLimit } from '../../shared/rateLimit';
import { converseWithTool } from '../../shared/bedrock';

const args = { scenarioId: 'join' as const, level: 1, goal: 'say hi', message: 'hello' };
beforeEach(() => vi.clearAllMocks());

describe('practice handler', () => {
  it('crisis stops the role-play with 988 and skips rate limit + model', async () => {
    vi.mocked(classify).mockResolvedValueOnce({ label: 'crisis', confidence: 1, fallback: false });
    const r = (await handler({ arguments: args })) as Record<string, unknown>;
    expect(r.crisis).toBe(true);
    expect(r.partnerReply as string).toContain('988');
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(converseWithTool).not.toHaveBeenCalled();
  });

  it('non-crisis + ok model returns strength + tip', async () => {
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { partnerReply: 'hi back', strength: 's', tip: 't' } });
    const r = (await handler({ arguments: args })) as Record<string, unknown>;
    expect(r).toMatchObject({ partnerReply: 'hi back', strength: 's', tip: 't', fallback: false });
  });

  it('model failure yields a warm fallback', async () => {
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: false });
    const r = (await handler({ arguments: args })) as Record<string, unknown>;
    expect(r.fallback).toBe(true);
    expect((r.strength as string).length).toBeGreaterThan(0);
  });

  it('over the rate limit returns a gentle message', async () => {
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ allowed: false, count: 101 });
    const r = (await handler({ arguments: args })) as Record<string, unknown>;
    expect(r.rateLimited).toBe(true);
    expect(r.fallback).toBe(true);
  });
});
