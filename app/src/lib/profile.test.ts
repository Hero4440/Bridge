// Verifies profile selection never returns another authenticated-readable user's row.
import { describe, expect, it, vi } from 'vitest';

vi.mock('aws-amplify/data', () => ({
  generateClient: () => ({ models: { User: {} } }),
}));
vi.mock('aws-amplify/storage', () => ({ uploadData: vi.fn(), getUrl: vi.fn() }));
vi.mock('./auth', () => ({ currentUser: vi.fn() }));

import { findOwnedProfile, validateTrustedContact, type UserRecord } from './profile';

const profile = (id: string, owner: string) => ({ id, owner, email: `${id}@example.com` }) as UserRecord;

describe('findOwnedProfile', () => {
  it('selects the signed-in owner even when another readable profile is first', () => {
    const profiles = [profile('other', 'other-sub::other-user'), profile('mine', 'my-sub::my-user')];
    expect(findOwnedProfile(profiles, 'my-sub')?.id).toBe('mine');
  });

  it('returns null when no profile belongs to the signed-in user', () => {
    expect(findOwnedProfile([profile('other', 'other-sub::other-user')], 'my-sub')).toBeNull();
  });
});

describe('validateTrustedContact', () => {
  it('accepts and trims a trusted contact', () => {
    expect(validateTrustedContact({ name: ' Mom ', phone: ' (480) 555-0142 ', email: '', relation: 'Parent' }))
      .toMatchObject({ name: 'Mom', phone: '(480) 555-0142', relation: 'Parent' });
  });

  it('rejects an invalid phone number', () => {
    expect(() => validateTrustedContact({ name: 'Mom', phone: '123', email: '', relation: 'Parent' })).toThrow();
  });
});
