// app/src/lib/profile.ts
// User profile persistence library for Bridge. Handles User model CRUD operations
// and S3 photo upload/download. Follows the data.ts pattern: single Data client,
// typed exports, throw on errors. Implements lazy User row creation (PROFILE-01):
// getCurrentUserProfile() returns null if no row exists, createUserProfile() creates
// the first row (onboarding complete), updateUserProfile() updates settings.
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type UserRecord = Schema['User']['type'];
export type CreateUserInput = Parameters<typeof client.models.User.create>[0];
export type UpdateUserInput = Parameters<typeof client.models.User.update>[0];

/**
 * Get current user's profile (owner query, max 1 result).
 * Returns null if no User row exists yet (onboarding not complete).
 */
export async function getCurrentUserProfile(): Promise<UserRecord | null> {
  const { data, errors } = await client.models.User.list();
  if (errors?.length) throw new Error(`getCurrentUserProfile failed: ${JSON.stringify(errors)}`);
  return data[0] || null; // Owner filter returns max 1 row
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
