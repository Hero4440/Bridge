// Unit tests for the pure DM helpers (threadId symmetry + unsafe predicate). No network, no mocks.
import { describe, it, expect } from 'vitest';
import { threadId, isUnsafeLabel } from './dm';

describe('threadId', () => {
  it('is symmetric — same key regardless of argument order', () => {
    expect(threadId('u1', 'u2')).toBe(threadId('u2', 'u1'));
  });
  it('is deterministic and prefixed', () => {
    expect(threadId('u2', 'u1')).toBe('dm#u1#u2');
  });
  it('differs for different pairs', () => {
    expect(threadId('u1', 'u2')).not.toBe(threadId('u1', 'u3'));
  });
  it('throws on empty input', () => {
    expect(() => threadId('', 'u2')).toThrow();
    expect(() => threadId('u1', '')).toThrow();
  });
});

describe('isUnsafeLabel', () => {
  it('flags money/address/unsafe/crisis', () => {
    for (const l of ['money', 'address', 'unsafe', 'crisis']) expect(isUnsafeLabel(l)).toBe(true);
  });
  it('does not flag safe/bias', () => {
    expect(isUnsafeLabel('safe')).toBe(false);
    expect(isUnsafeLabel('bias')).toBe(false);
  });
});
