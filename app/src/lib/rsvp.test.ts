// Unit tests for the pure/deterministic RSVP helpers (id + count reducer). No network, no mocks.
import { describe, it, expect } from 'vitest';
import { rsvpId, countRsvps } from './rsvp';

describe('rsvpId', () => {
  it('is deterministic for the same inputs', () => {
    expect(rsvpId('E1', 'U1')).toBe('E1#U1');
    expect(rsvpId('E1', 'U1')).toBe(rsvpId('E1', 'U1'));
  });
  it('throws on empty eventId', () => {
    expect(() => rsvpId('', 'U1')).toThrow();
  });
  it('throws on empty userId', () => {
    expect(() => rsvpId('E1', '')).toThrow();
  });
});

describe('countRsvps', () => {
  it('empty list → all zeros', () => {
    expect(countRsvps([])).toEqual({ going: 0, maybe: 0, cant: 0 });
  });
  it('counts a mixed list', () => {
    expect(countRsvps([{ status: 'going' }, { status: 'going' }, { status: 'maybe' }])).toEqual({ going: 2, maybe: 1, cant: 0 });
  });
  it('ignores unknown/null statuses', () => {
    expect(countRsvps([{ status: 'going' }, { status: 'weird' }, { status: null }])).toEqual({ going: 1, maybe: 0, cant: 0 });
  });
});
