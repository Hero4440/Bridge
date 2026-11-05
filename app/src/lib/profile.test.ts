// Verifies profile selection never returns another authenticated-readable user's row.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const contactApi = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() }));
const userApi=vi.hoisted(()=>({list:vi.fn(),delete:vi.fn()}));
const badgeApi=vi.hoisted(()=>({list:vi.fn(),delete:vi.fn()}));
const storageApi=vi.hoisted(()=>({uploadData:vi.fn(),getUrl:vi.fn(),remove:vi.fn()}));
const authApi = vi.hoisted(() => ({ currentUser: vi.fn() }));

vi.mock('aws-amplify/data', () => ({
  generateClient: () => ({ models: { User: userApi, TrustedContact: contactApi, Badge: badgeApi } }),
}));
vi.mock('aws-amplify/storage', () => storageApi);
vi.mock('./auth', () => authApi);

import { deleteUserProfile, uploadPhoto, validateProfileName, findOwnedProfile, saveTrustedContacts, validateTrustedContact, type UserRecord } from './profile';

const profile = (id: string, owner: string) => ({ id, owner, email: `${id}@example.com` }) as UserRecord;

describe('findOwnedProfile', () => {
  it('selects the signed-in owner even when another readable profile is first', () => {
    const profiles = [profile('other', 'other-sub::other-user'), profile('mine', 'my-sub::my-user')];
    expect(findOwnedProfile(profiles, 'my-sub')?.id).toBe('mine');
  });

  it('returns null when no profile belongs to the signed-in user', () => {
    expect(findOwnedProfile([profile('other', 'other-sub::other-user')], 'my-sub')).toBeNull();
  });
  it('accepts the sub-only owner returned by the deployed API', () => {
    expect(findOwnedProfile([profile('mine', 'my-sub')], 'my-sub')?.id).toBe('mine');
  });
});

describe('saving trusted people', () => {
  const sam = { name: 'Sam', phone: '(480) 555-0142', email: '', relation: 'Other', otherRole: 'Neighbor' } as const;
  const jordan = { ...sam, name: 'Jordan', relation: 'Sibling', otherRole: '' } as const;
  beforeEach(() => {
    vi.resetAllMocks();
    authApi.currentUser.mockResolvedValue({ userId: 'person-sub' });
    contactApi.list.mockResolvedValue({ data: [] });
    contactApi.create.mockResolvedValue({ data: { id: 'saved' } });
    contactApi.update.mockResolvedValue({ data: { id: 'saved' } });
    contactApi.delete.mockResolvedValue({ data: { id: 'deleted' } });
    userApi.list.mockResolvedValue({ data: [] });
    userApi.delete.mockResolvedValue({ data: { id: 'deleted' } });
    badgeApi.list.mockResolvedValue({ data: [] });
    badgeApi.delete.mockResolvedValue({ data: { id: 'deleted' } });
  });
  it('saves both people with separate stable IDs and preserves the custom relationship', async () => {
    await saveTrustedContacts([sam, jordan]);
    expect(contactApi.create.mock.calls.map(([row]) => row)).toEqual([
      { ...sam, id: 'person-sub-trusted-0', position: 0 },
      { ...jordan, id: 'person-sub-trusted-1', position: 1 },
    ]);
  });
  it('recovers a partial save without duplicating the first person', async () => {
    contactApi.list.mockResolvedValue({ data: [{ ...sam, id: 'first-existing', position: 0, createdAt: '2026-11-05' }] });
    await saveTrustedContacts([sam, jordan]);
    expect(contactApi.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'first-existing' }));
    expect(contactApi.create).toHaveBeenCalledTimes(1);
  });
  it('stops on a failed write so the parent cannot mark setup complete', async () => {
    contactApi.create.mockResolvedValueOnce({ data: null, errors: [{ message: 'Denied' }] });
    await expect(saveTrustedContacts([sam, jordan])).rejects.toThrow('Could not save');
    expect(contactApi.create).toHaveBeenCalledTimes(1);
  });
  it('follows pagination before deciding whether to create a second person', async () => {
    contactApi.list.mockResolvedValueOnce({ data: [{ id: 'first', position: 0, createdAt: '2026-11-05' }], nextToken: 'next' })
      .mockResolvedValueOnce({ data: [{ id: 'second', position: 1, createdAt: '2026-11-05' }] });
    await saveTrustedContacts([sam, jordan]);
    expect(contactApi.create).not.toHaveBeenCalled();
    expect(contactApi.update).toHaveBeenCalledTimes(2);
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


describe('profile names and deletion from main',()=>{
 it('requires and trims both profile names',()=>{
  expect(validateProfileName({firstName:' Sam ',lastName:' Lee '})).toEqual({firstName:'Sam',lastName:'Lee'});
  expect(()=>validateProfileName({firstName:'Sam',lastName:' '})).toThrow('Enter your last name');
 });
 it('uploads photos beneath the signed-in storage identity',async()=>{
  storageApi.uploadData.mockReturnValue({result:Promise.resolve({path:'profile-photos/identity-1/photo.webp'})});
  const file=new File(['photo'],'My photo.webp',{type:'image/webp'});
  await expect(uploadPhoto(file)).resolves.toBe('profile-photos/identity-1/photo.webp');
  const input=storageApi.uploadData.mock.calls[0][0];
  expect(input.path({identityId:'identity-1'})).toMatch(/^profile-photos\/identity-1\/\d+-My-photo\.webp$/);
 });
 it('removes legacy duplicate profiles, trusted contacts, photos, and badges',async()=>{
  authApi.currentUser.mockResolvedValue({userId:'my-sub'});
  storageApi.remove.mockResolvedValue({});
  userApi.list.mockResolvedValue({data:[{...profile('mine','my-sub'),photoKey:'profile-photos/mine.webp'},profile('legacy','my-sub::tejas')]});
  userApi.delete.mockResolvedValue({data:{id:'deleted'}});
  contactApi.list.mockResolvedValue({data:[{id:'contact-1'}]});
  contactApi.delete.mockResolvedValue({data:{id:'deleted'}});
  badgeApi.list.mockResolvedValue({data:[{id:'my-sub#hello'}]});
  badgeApi.delete.mockResolvedValue({data:{id:'deleted'}});
  await deleteUserProfile({...profile('mine','my-sub'),photoKey:'profile-photos/mine.webp'});
  expect(storageApi.remove).toHaveBeenCalledWith({path:'profile-photos/mine.webp'});
  expect(contactApi.delete).toHaveBeenCalledWith({id:'contact-1'},{selectionSet:['id']});
  expect(badgeApi.delete).toHaveBeenCalledWith({id:'my-sub#hello'},{selectionSet:['id']});
  expect(userApi.delete.mock.calls.map(([row])=>row.id)).toEqual(['mine','legacy']);
 });
});
