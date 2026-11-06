// Verifies MoChat can use the user's owner-scoped saved practice feedback memory.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { listPracticeRuns } = vi.hoisted(() => ({
  listPracticeRuns: vi.fn(async (): Promise<{ data: Array<{
    createdAt: string;
    scenarioId: string;
    level: number;
    goal: string;
    feedback: string;
  }> }> => ({ data: [] })),
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
  generateClient: () => ({ models: { PracticeRun: { list: listPracticeRuns } } }),
}));

import { handler } from '../handler';
import { classify } from '../../shared/classify';
import { converseWithTool } from '../../shared/bedrock';

beforeEach(() => vi.clearAllMocks());

describe('moChat handler', () => {
  it('passes recent saved practice feedback memory to the model as context', async () => {
    listPracticeRuns.mockResolvedValueOnce({
      data: [{
        createdAt: '2026-11-05T10:00:00.000Z',
        scenarioId: 'join',
        level: 2,
        goal: 'introduce myself clearly',
        feedback: JSON.stringify({ memory: 'The person practiced a clear introduction.', strength: 'Clear goal', tip: 'Ask one follow-up question.' }),
      }],
    });
    vi.mocked(classify).mockResolvedValue({ label: 'safe', confidence: 0.9, fallback: false });
    vi.mocked(converseWithTool).mockResolvedValueOnce({ ok: true, value: { reply: 'You practiced introducing yourself at Level 2.' } });

    const result = await handler({
      arguments: { message: 'What did I practice?', history: '' },
      identity: { sub: 'user-1' },
    });

    expect(result).toMatchObject({ reply: 'You practiced introducing yourself at Level 2.', fallback: false });
    expect(listPracticeRuns).toHaveBeenCalledWith(expect.objectContaining({ filter: { userId: { eq: 'user-1' } } }));
    expect(converseWithTool).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('practiced a clear introduction'),
    }));
  });
});
