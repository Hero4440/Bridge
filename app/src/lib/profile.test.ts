// Verifies profile ownership, setup validation, and destructive cleanup behavior.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteUser: vi.fn(),
  deleteTrustedContact: vi.fn(),
  removePhoto: vi.fn(),
}));

vi.mock('aws-amplify/data', () => ({
  generateClient: () => ({
    models: {
      User: { delete: mocks.deleteUser },
      TrustedContact: { delete: mocks.deleteTrustedContact },
    },
  }),
}));
vi.mock('aws-amplify/storage', () => ({ uploadData: vi.fn(), getUrl: vi.fn(), remove: mocks.removePhoto }));
vi.mock('./auth', () => ({ currentUser: vi.fn() }));

import {
  deleteUserProfile,
  findOwnedProfile,
  validateProfileName,
  validateTrustedContact,
  type TrustedContactRecord,
  type UserRecord,
} from './profile';

const profile = (id: string, owner: string) => ({ id, owner, email: `${id}@example.com` }) as UserRecord;

beforeEach(() => {
  vi.clearAllMocks();
});

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

describe('validateProfileName', () => {
  it('requires and trims both names', () => {
    expect(validateProfileName({ firstName: ' Sam ', lastName: ' Lee ' }))
      .toEqual({ firstName: 'Sam', lastName: 'Lee' });
    expect(() => validateProfileName({ firstName: 'Sam', lastName: ' ' })).toThrow('Enter your last name');
  });
});

describe('deleteUserProfile', () => {
  it('removes the profile photo and owner-only records', async () => {
    mocks.removePhoto.mockResolvedValue({});
    mocks.deleteTrustedContact.mockResolvedValue({ data: {}, errors: undefined });
    mocks.deleteUser.mockResolvedValue({ data: {}, errors: undefined });

    await deleteUserProfile(
      { ...profile('mine', 'my-sub::my-user'), photoKey: 'profile-photos/mine.webp' } as UserRecord,
      { id: 'trusted-1' } as TrustedContactRecord,
    );

    expect(mocks.removePhoto).toHaveBeenCalledWith({ key: 'profile-photos/mine.webp' });
    expect(mocks.deleteTrustedContact).toHaveBeenCalledWith({ id: 'trusted-1' });
    expect(mocks.deleteUser).toHaveBeenCalledWith({ id: 'mine' });
  });
});
