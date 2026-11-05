// app/src/lib/profile.ts
// User profile persistence library for Bridge. Handles User model CRUD operations
// and S3 photo upload/download. Follows the data.ts pattern: single Data client,
// typed exports, throw on errors. Implements lazy User row creation (PROFILE-01):
// getCurrentUserProfile() returns null if no row exists, createUserProfile() creates
// the first row (onboarding complete), updateUserProfile() updates settings.
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { z } from 'zod';
import type { Schema } from '../../amplify/data/resource';
import { currentUser } from './auth';

const client = generateClient<Schema>();

export type UserRecord = Schema['User']['type'];
export type CreateUserInput = Parameters<typeof client.models.User.create>[0];
export type UpdateUserInput = Parameters<typeof client.models.User.update>[0];
export type TrustedContactRecord = Schema['TrustedContact']['type'];

const trustedContactSchema = z.object({
  name: z.string().trim().min(1, 'Enter the person’s name').max(80),
  phone: z.string().trim().regex(/^[+()\d\s.-]{7,24}$/, 'Enter a valid phone number'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  relation: z.enum(['Parent', 'Guardian', 'Sibling', 'Coach', 'Friend', 'Other']),
});

const profileNameSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name').max(50, 'First name is too long'),
  lastName: z.string().trim().min(1, 'Enter your last name').max(50, 'Last name is too long'),
});

export type TrustedContactInput = z.input<typeof trustedContactSchema>;
export type ProfileNameInput = z.input<typeof profileNameSchema>;

export function validateProfileName(input: ProfileNameInput) {
  return profileNameSchema.parse(input);
}

export function validateTrustedContact(input: TrustedContactInput) {
  return trustedContactSchema.parse(input);
}

export function findOwnedProfile(profiles: readonly UserRecord[], userId: string): UserRecord | null {
  return profiles.find((profile) => profile.owner?.startsWith(`${userId}::`)) ?? null;
}

/**
 * Get current user's profile (owner query, max 1 result).
 * Returns null if no User row exists yet (onboarding not complete).
 */
export async function getCurrentUserProfile(): Promise<UserRecord | null> {
  const user = await currentUser();
  const { data, errors } = await client.models.User.list({
    filter: { owner: { beginsWith: `${user.userId}::` } },
  });
  if (errors?.length) throw new Error(`getCurrentUserProfile failed: ${JSON.stringify(errors)}`);
  return findOwnedProfile(data, user.userId);
}

/**
 * Create user profile (first save, onboarding complete).
 * Owner field auto-set to Cognito sub by allow.owner() authorization.
 */
export async function createUserProfile(input: CreateUserInput): Promise<UserRecord> {
  const { data, errors } = await client.models.User.create(input);
  if (errors?.length) throw new Error(`createUserProfile failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('createUserProfile returned no data');
  return data;
}

/**
 * Update user profile (settings changes, theme, comfort, photo key).
 */
export async function updateUserProfile(input: UpdateUserInput): Promise<UserRecord> {
  const { data, errors } = await client.models.User.update(input);
  if (errors?.length) throw new Error(`updateUserProfile failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('updateUserProfile returned no data');
  return data;
}

export async function deleteUserProfile(
  profile: UserRecord,
  trustedContacts: readonly TrustedContactRecord[],
): Promise<void> {
  if (profile.photoKey) await remove({ key: profile.photoKey });

  for (const trustedContact of trustedContacts) {
    const { errors } = await client.models.TrustedContact.delete({ id: trustedContact.id });
    if (errors?.length) throw new Error(`delete trusted contact failed: ${JSON.stringify(errors)}`);
  }

  const { errors } = await client.models.User.delete({ id: profile.id });
  if (errors?.length) throw new Error(`delete profile failed: ${JSON.stringify(errors)}`);
}

export async function getCurrentTrustedContact(): Promise<TrustedContactRecord | null> {
  return (await listTrustedContacts())[0] ?? null;
}

export async function listTrustedContacts(): Promise<TrustedContactRecord[]> {
  const { data, errors } = await client.models.TrustedContact.list();
  if (errors?.length) throw new Error(`listTrustedContacts failed: ${JSON.stringify(errors)}`);
  return data;
}

// Upsert makes a failed/retried final onboarding submission safe and avoids duplicate contacts.
export async function saveTrustedContact(input: TrustedContactInput, id?: string, createNew = false): Promise<TrustedContactRecord> {
  const valid = validateTrustedContact(input);
  const existing = id || createNew ? null : await getCurrentTrustedContact();
  const result = id || existing
    ? await client.models.TrustedContact.update({ id: id || existing!.id, ...valid })
    : await client.models.TrustedContact.create(valid);
  if (result.errors?.length) throw new Error(`saveTrustedContact failed: ${JSON.stringify(result.errors)}`);
  if (!result.data) throw new Error('saveTrustedContact returned no data');
  return result.data;
}

/**
 * Upload profile photo to S3. Validates size (5MB max) and MIME type (JPEG/PNG/WebP).
 * Returns S3 key to store in User.photoKey field.
 */
export async function uploadPhoto(file: File): Promise<string> {
  // Validate file size (PROFILE-03)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Photo must be under 5MB');
  }

  // Validate MIME type (PROFILE-03)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Photo must be JPEG, PNG, or WebP');
  }

  // Generate unique key with timestamp
  const key = `profile-photos/${Date.now()}-${file.name}`;

  // Upload to S3
  const result = await uploadData({ key, data: file }).result;
  return result.key;
}

/**
 * Get temporary signed URL for profile photo from S3 key.
 */
export async function getPhotoUrl(key: string): Promise<string> {
  const result = await getUrl({ key });
  return result.url.toString();
}

export async function replaceProfilePhoto(profile: UserRecord, file: File): Promise<UserRecord> {
  const key = await uploadPhoto(file);
  let updated: UserRecord;
  try {
    updated = await updateUserProfile({ id: profile.id, photoKey: key });
  } catch (error) {
    await remove({ key });
    throw error;
  }
  if (profile.photoKey) await remove({ key: profile.photoKey });
  return updated;
}

export async function removeProfilePhoto(profile: UserRecord): Promise<UserRecord> {
  const updated = await updateUserProfile({ id: profile.id, photoKey: null });
  if (profile.photoKey) await remove({ key: profile.photoKey });
  return updated;
}
