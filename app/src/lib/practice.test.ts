// Verifies ephemeral practice history stays bounded before it is sent to Bedrock.
import { describe, expect, it } from 'vitest';
import { buildPracticeHistory, type PracticeMessage } from './practice';

describe('buildPracticeHistory', () => {
  it('labels both speakers and keeps only the latest seven bounded messages', () => {
    const messages: PracticeMessage[] = Array.from({ length: 9 }, (_, index) => ({
      role: index % 2 ? 'user' : 'partner',
      text: `${index}-${'x'.repeat(600)}`,
    }));
    const history = buildPracticeHistory(messages);

    expect(history).not.toContain('0-');
    expect(history).not.toContain('1-');
    expect(history).toContain('Practice partner: 2-');
    expect(history).toContain('User: 3-');
    expect(history.length).toBeLessThanOrEqual(3600);
  });
});
