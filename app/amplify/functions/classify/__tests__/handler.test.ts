// Unit tests for the classify Lambda handler (keyword path needs no model/mock).
import { describe, it, expect } from 'vitest';
import { handler } from '../handler';

describe('classify handler', () => {
  it('labels crisis via the keyword net', async () => {
    expect(await handler({ arguments: { text: 'I want to die' } })).toEqual({
      label: 'crisis',
      confidence: 1,
      fallback: false,
    });
  });

  it('returns the safer fallback on invalid input, never throws', async () => {
    expect(await handler({ arguments: { text: '' } })).toEqual({
      label: 'unsafe',
      confidence: 0.5,
      fallback: true,
    });
  });
});
