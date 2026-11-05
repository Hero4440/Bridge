// Boundary cases matter here: incomplete second people and punctuation cannot bypass validation.
import { describe, expect, it } from 'vitest';
import { blankTrustedContact, isBlankTrustedContact, validateTrustedContact } from './trustedContacts';

describe('trusted people validation', () => {
  const valid = { name: 'Sam', phone: '(480) 555-0142', email: '', relation: 'Other', otherRole: 'Neighbor' } as const;
  it('preserves a custom relationship and trims names', () => {
    expect(validateTrustedContact({ ...valid, name: ' Sam ' })).toMatchObject({ name: 'Sam', otherRole: 'Neighbor' });
  });
  it('rejects punctuation-only and fewer than ten digit phone numbers', () => {
    for (const phone of ['----------', '(480) 12', 'abcdefghij']) {
      expect(() => validateTrustedContact({ ...valid, phone })).toThrow();
    }
  });
  it('accepts an international number', () => {
    expect(validateTrustedContact({ ...valid, phone: '+44 7700 900123' }).phone).toBe('+44 7700 900123');
  });
  it('allows skipping a blank second person but recognizes incomplete details', () => {
    expect(isBlankTrustedContact(blankTrustedContact())).toBe(true);
    expect(isBlankTrustedContact({ ...blankTrustedContact(), name: 'Jordan' })).toBe(false);
    expect(() => validateTrustedContact({ ...blankTrustedContact(), name: 'Jordan' })).toThrow();
  });
  it('rejects an invalid optional email', () => {
    expect(() => validateTrustedContact({ ...valid, email: 'invalid' })).toThrow();
  });
});
