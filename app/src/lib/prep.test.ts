// Unit tests for the static prep templates (pure, no network/AI).
import { describe, it, expect } from 'vitest';
import { prepFor, whatToExpect, type EventFormat } from './prep';

describe('prepFor', () => {
  it('in-person checklist has the four in-person items', () => {
    const c = prepFor('inPerson').checklist;
    for (const item of ['plan travel', 'pick exit line', 'pack headphones', 'share plan']) {
      expect(c).toContain(item);
    }
  });
  it('voice and video include test mic + log-off', () => {
    for (const f of ['voice', 'video'] as EventFormat[]) {
      expect(prepFor(f).checklist).toContain('test mic');
      expect(prepFor(f).checklist).toContain('set a log-off time');
    }
  });
  it('text excludes test mic', () => {
    expect(prepFor('text').checklist).not.toContain('test mic');
  });
  it('every format has non-empty sensory + checklist', () => {
    for (const f of ['inPerson', 'voice', 'video', 'text'] as EventFormat[]) {
      expect(prepFor(f).sensory.length).toBeGreaterThan(0);
      expect(prepFor(f).checklist.length).toBeGreaterThan(0);
    }
  });
});

describe('whatToExpect', () => {
  it('projects only host-set fields', () => {
    const out = whatToExpect({ comfortSize: 8, comfortSound: 'quiet', usuallyQuiet: true, exitPlan: 'slip out the side' });
    expect(out).toContain('Up to 8 people');
    expect(out).toContain('Sound: quiet');
    expect(out).toContain('Usually quiet');
    expect(out.some((s) => s.includes('slip out'))).toBe(true);
  });
  it('omits unset fields', () => {
    expect(whatToExpect({})).toEqual([]);
  });
});
