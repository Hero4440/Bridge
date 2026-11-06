// Unit tests for the bounded practice session: start/turn/finish, safety, fallback, and persistence.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { createPracticeRun, listPracticeRuns } = vi.hoisted(() => ({
  createPracticeRun: vi.fn(async (_input: { feedback?: string; goal?: string; userId?: string; scenarioId?: string }) => ({ data: {} })),
  listPracticeRuns: vi.fn(async (_input?: unknown): Promise<{ data: Array<{ createdAt?: string; feedback?: string }> }> => ({ data: [] })),
}));

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
  generateClient: () => ({ models: { PracticeRun: { create: createPracticeRun, list: listPracticeRuns } } }),
}));

import { handler } from '../handler';
import { classify } from '../../shared/classify';
import { checkRateLimit } from '../../shared/rateLimit';
import { converseWithTool } from '../../shared/bedrock';

const turnArgs = { mode: 'turn' as const, scenarioId: 'join' as const, level: 1, goal: 'say hi', message: 'hello', history: 'Practice partner: Hi' };
beforeEach(() => vi.clearAllMocks());

describe('practice handler', () => {
  it('crisis stops the role-play with 988 and skips rate limit + model', async () => {
    vi.mocked(classify).mockResolvedValueOnce({ label: 'crisis', confidence: 1, fallback: false });
    const r = (await handler({ arguments: turnArgs })) as Record<string, unknown>;
    expect(r.crisis).toBe(true);
    expect(r.partnerReply as string).toContain('988');
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(converseWithTool).not.toHaveBeenCalled();
  });

  it('starts with a goal-aware model call without saving a run', async () => {
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { partnerReply: 'What would you like to say?', replyOptions: ['Hi, I am new here!', 'Um, hey'], hint: 'Try a simple greeting.' } });
    const r = (await handler({ arguments: { mode: 'start', scenarioId: 'join', level: 1, goal: 'introduce myself' } })) as Record<string, unknown>;
    expect(r).toMatchObject({ partnerReply: 'What would you like to say?', strength: '', tip: '', fallback: false, replyOptions: ['Hi, I am new here!', 'Um, hey'], hint: 'Try a simple greeting.' });
    expect(converseWithTool).toHaveBeenCalledWith(expect.objectContaining({ system: expect.stringContaining('introduce myself'), toolName: 'partner' }));
    expect(createPracticeRun).not.toHaveBeenCalled();
  });

  it('continues from ephemeral history without saving a run', async () => {
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { partnerReply: 'hi back', replyOptions: ['Nice to meet you!', 'Yeah...'], hint: 'Keep it going with a question.' } });
    const r = (await handler({ arguments: turnArgs })) as Record<string, unknown>;
    expect(r).toMatchObject({ partnerReply: 'hi back', strength: '', tip: '', fallback: false, replyOptions: ['Nice to meet you!', 'Yeah...'], hint: 'Keep it going with a question.' });
    expect(createPracticeRun).not.toHaveBeenCalled();
  });

  it('generates goal-based feedback and saves exactly one run when finished', async () => {
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { partnerReply: 'Nice work.', strength: 'Clear hello', tip: 'Ask one question', memory: 'Tejas is practicing clear greetings and may benefit from asking one follow-up question.' } });
    const r = (await handler({ arguments: { mode: 'finish', scenarioId: 'join', level: 1, goal: 'say hi', history: 'Practice partner: Hi\nUser: Hello' }, identity: { sub: 'user-1' } })) as Record<string, unknown>;
    expect(r).toMatchObject({ strength: 'Clear hello', tip: 'Ask one question', fallback: false });
    expect(createPracticeRun).toHaveBeenCalledOnce();
    expect(createPracticeRun).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', scenarioId: 'join' }));
    const saved = createPracticeRun.mock.calls[0]?.[0] ?? {};
    expect(saved.goal).toBe('say hi');
    expect(saved).not.toHaveProperty('transcript');
    expect(saved.feedback).toContain('clear greetings');
  });

  it('uses recent privacy-safe practice memories as context next time', async () => {
    listPracticeRuns.mockResolvedValueOnce({ data: [{
      createdAt: '2026-11-05T10:00:00.000Z',
      feedback: JSON.stringify({ memory: 'The person prefers short greetings.', strength: 'Clear', tip: 'Ask one question' }),
    }] });
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { partnerReply: 'Ready to practice another greeting?', replyOptions: ['Sure!', 'I guess'], hint: 'Start with something simple.' } });

    await handler({ arguments: { mode: 'start', scenarioId: 'join', level: 1, goal: 'introduce myself' }, identity: { sub: 'user-1' } });

    expect(listPracticeRuns).toHaveBeenCalledWith(expect.objectContaining({ filter: { userId: { eq: 'user-1' } } }));
    expect(converseWithTool).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('prefers short greetings') }));
  });

  it('model failure yields a warm fallback', async () => {
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: false });
    const r = (await handler({ arguments: turnArgs })) as Record<string, unknown>;
    expect(r.fallback).toBe(true);
    expect((r.strength as string).length).toBeGreaterThan(0);
    expect(r.replyOptions).toEqual(['Thanks, I appreciate that.', 'I hear you.']);
  });

  it('over the rate limit returns a gentle message', async () => {
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ allowed: false, count: 101 });
    const r = (await handler({ arguments: turnArgs })) as Record<string, unknown>;
    expect(r.rateLimited).toBe(true);
    expect(r.fallback).toBe(true);
  });

  it('replaces an unsafe model reply with the warm fallback', async () => {
    vi.mocked(classify)
      .mockResolvedValueOnce({ label: 'safe', confidence: 0.9, fallback: false })
      .mockResolvedValueOnce({ label: 'unsafe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { partnerReply: 'unsafe output', replyOptions: ['ok', 'fine'], hint: 'stay calm' } });
    const r = (await handler({ arguments: turnArgs })) as Record<string, unknown>;
    expect(r.partnerReply).toBe('Thanks for telling me.');
  });
});
