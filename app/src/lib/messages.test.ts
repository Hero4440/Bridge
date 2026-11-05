// Unit tests for the pure last-50 window helper (CHAT-07). No network, no mocks.
import { describe, it, expect } from 'vitest';
import { lastN } from './messages';

const make = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i, ts: i }));
const key = (m: { ts: number }) => m.ts;

describe('lastN', () => {
  it('returns all items ascending when fewer than n', () => {
    const out = lastN(make(3), 50, key);
    expect(out.map((m) => m.ts)).toEqual([0, 1, 2]);
  });

  it('returns exactly the newest n when more than n, ascending', () => {
    const out = lastN(make(60), 50, key);
    expect(out).toHaveLength(50);
    expect(out[0].ts).toBe(10); // oldest kept
    expect(out[out.length - 1].ts).toBe(59); // newest
  });

  it('orders unsorted input newest-window ascending', () => {
    const shuffled = [{ ts: 5 }, { ts: 1 }, { ts: 9 }, { ts: 3 }];
    expect(lastN(shuffled, 2, key).map((m) => m.ts)).toEqual([5, 9]);
  });

  it('does not mutate the input array', () => {
    const input = make(3);
    lastN(input, 50, key);
    expect(input.map((m) => m.ts)).toEqual([0, 1, 2]);
  });
});
