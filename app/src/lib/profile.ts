// app/src/lib/profile.ts
// User profile persistence library for Bridge. Handles User model CRUD operations
// and S3 photo upload/download. Follows the data.ts pattern: single Data client,
// typed exports, throw on errors. Implements lazy User row creation (PROFILE-01):
// getCurrentUserProfile() returns null if no row exists, createUserProfile() creates
// the first row (onboarding complete), updateUserProfile() updates settings.
import { generateClient } from "aws-amplify/data";
import { uploadData, getUrl, remove } from "aws-amplify/storage";
import { z } from "zod";
import type { Schema } from "../../amplify/data/resource";
import { currentUser } from "./auth";
import {
  trustedContactSchema,
  validateTrustedContact,
  type TrustedContactInput,
} from "./trustedContacts";
import { allPages } from "./apiResults";
export {
  validateTrustedContact,
  type TrustedContactInput,
} from "./trustedContacts";

const client = generateClient<Schema>();

export type UserRecord = Schema["User"]["type"];
export type CreateUserInput = Parameters<typeof client.models.User.create>[0];
export type UpdateUserInput = Parameters<typeof client.models.User.update>[0];
export type TrustedContactRecord = Schema["TrustedContact"]["type"];

export function findOwnedProfile(
  profiles: readonly UserRecord[],
  userId: string,
): UserRecord | null {
  return (
    profiles.find(
      (profile) =>
        profile.owner === userId || profile.owner?.startsWith(`${userId}::`),
    ) ?? null
  );
}

function listOwnedProfiles(userId: string): Promise<UserRecord[]> {
  return allPages((nextToken) => client.models.User.list({
    filter: {
      or: [
        { owner: { eq: userId } },
        { owner: { beginsWith: `${userId}::` } },
      ],
    },
    nextToken,
  }));
}

/**
 * Get current user's profile (owner query, max 1 result).
 * Returns null if no User row exists yet (onboarding not complete).
 */
export async function getCurrentUserProfile(): Promise<UserRecord | null> {
  const user = await currentUser();
  return findOwnedProfile(await listOwnedProfiles(user.userId), user.userId);
}

/**
 * Create user profile (first save, onboarding complete).
 * Owner field auto-set to Cognito sub by allow.owner() authorization.
 */
export async function createUserProfile(
  input: CreateUserInput,
): Promise<UserRecord> {
  const { data, errors } = await client.models.User.create(input);
  if (errors?.length)
    throw new Error(`createUserProfile failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error("createUserProfile returned no data");
  const saved = await client.models.User.get({ id: data.id });
  if (saved.errors?.length || !saved.data)
    throw new Error(
      "Your saved profile could not be reloaded. Please try again.",
    );
  return saved.data;
}

/**
 * Update user profile (settings changes, theme, comfort, photo key).
 */
export async function updateUserProfile(
  input: UpdateUserInput,
): Promise<UserRecord> {
  const { data, errors } = await client.models.User.update(input);
  if (errors?.length)
    throw new Error(`updateUserProfile failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error("updateUserProfile returned no data");
  const saved = await client.models.User.get({ id: data.id });
  if (saved.errors?.length || !saved.data)
    throw new Error(
      "Your saved profile could not be reloaded. Please try again.",
    );
  return saved.data;
}

export async function getCurrentTrustedContact(): Promise<TrustedContactRecord | null> {
  return (await getCurrentTrustedContacts())[0] ?? null;
}

export async function getCurrentTrustedContacts(): Promise<
  TrustedContactRecord[]
> {
  const contacts: TrustedContactRecord[] = [];
  let nextToken: string | null | undefined;
  do {
    const result = await client.models.TrustedContact.list({ nextToken });
    if (result.errors?.length)
      throw new Error("Could not load your trusted people. Please try again.");
    contacts.push(...result.data);
    nextToken = result.nextToken;
  } while (nextToken);
  return contacts.sort(
    (a, b) =>
      (a.position ?? 0) - (b.position ?? 0) ||
      a.createdAt.localeCompare(b.createdAt),
  );
}

export async function listTrustedContacts(): Promise<TrustedContactRecord[]> {
  return getCurrentTrustedContacts();
}

// Stable, owner-specific IDs let a retry recover partial saves without duplicating people.
export async function saveTrustedContacts(
  inputs: TrustedContactInput[],
): Promise<void> {
  const valid = z.array(trustedContactSchema).min(1).max(2).parse(inputs);
  const user = await currentUser();
  const existing = await getCurrentTrustedContacts();
  for (const [position, contact] of valid.entries()) {
    const id = existing[position]?.id ?? `${user.userId}-trusted-${position}`;
    const row = {
      id,
      ...contact,
      otherRole: contact.relation === "Other" ? contact.otherRole : "",
      position,
    };
    const result = existing[position]
      ? await client.models.TrustedContact.update(row)
      : await client.models.TrustedContact.create(row);
    if (result.errors?.length || !result.data)
      throw new Error("Could not save your trusted people. Please try again.");
  }
  // A blank optional second form must not leave an earlier partial save behind.
  for (const contact of existing.slice(valid.length)) {
    const result = await client.models.TrustedContact.delete(
      { id: contact.id },
      { selectionSet: ["id"] },
    );
    if (result.errors?.length)
      throw new Error(
        "Could not update your trusted people. Please try again.",
      );
  }
}

// Upsert makes a failed/retried final onboarding submission safe and avoids duplicate contacts.
export async function saveTrustedContact(
  input: TrustedContactInput,
  id?: string,
  createNew = false,
): Promise<TrustedContactRecord> {
  const valid = validateTrustedContact(input);
  const existing = id || createNew ? null : await getCurrentTrustedContact();
  const result = id || existing
    ? await client.models.TrustedContact.update({ id: id || existing!.id, ...valid })
    : await client.models.TrustedContact.create(valid);
  if (result.errors?.length)
    throw new Error(
      `saveTrustedContact failed: ${JSON.stringify(result.errors)}`,
    );
  if (!result.data) throw new Error("saveTrustedContact returned no data");
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
    throw new Error("Photo must be under 5MB");
  }

  // Validate MIME type (PROFILE-03)
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Photo must be JPEG, PNG, or WebP");
  }

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  try {
    const result = await uploadData({
      path: ({ identityId }) => `profile-photos/${identityId}/${fileName}`,
      data: file,
    }).result;
    return result.path;
  } catch {
    throw new Error("Your photo could not be uploaded. Please try again.");
  }
}

/**
 * Get temporary signed URL for profile photo from S3 key.
 */
export async function getPhotoUrl(key: string): Promise<string> {
  const result = await getUrl({ path: key });
  return result.url.toString();
}

export async function replaceProfilePhoto(
  profile: UserRecord,
  file: File,
): Promise<UserRecord> {
  const key = await uploadPhoto(file);
  let updated: UserRecord;
  try {
    updated = await updateUserProfile({ id: profile.id, photoKey: key });
  } catch (error) {
    await remove({ path: key });
    throw error;
  }
  if (profile.photoKey) await remove({ path: profile.photoKey });
  return updated;
}

export async function removeProfilePhoto(profile: UserRecord): Promise<UserRecord> {
  const updated = await updateUserProfile({ id: profile.id, photoKey: null });
  if (profile.photoKey) await remove({ path: profile.photoKey });
  return updated;
}

const profileNameSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter your first name")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter your last name")
    .max(50, "Last name is too long"),
});

export type ProfileNameInput = z.input<typeof profileNameSchema>;

export function validateProfileName(input: ProfileNameInput) {
  return profileNameSchema.parse(input);
}

export async function deleteUserProfile(
  profile: UserRecord,
): Promise<void> {
  const { userId } = await currentUser();
  const [ownedProfiles, trustedContacts, badges] = await Promise.all([
    listOwnedProfiles(userId),
    getCurrentTrustedContacts(),
    allPages((nextToken) => client.models.Badge.list({ nextToken })),
  ]);
  if (!ownedProfiles.some(({ id }) => id === profile.id)) ownedProfiles.push(profile);

  for (const photoKey of new Set(ownedProfiles.map(({ photoKey }) => photoKey).filter(Boolean))) {
    await remove({ path: photoKey! });
  }

  for (const trustedContact of trustedContacts) {
    const { errors } = await client.models.TrustedContact.delete(
      { id: trustedContact.id },
      { selectionSet: ["id"] },
    );
    if (errors?.length)
      throw new Error(
        `delete trusted contact failed: ${JSON.stringify(errors)}`,
      );
  }

  for (const badge of badges) {
    const { errors } = await client.models.Badge.delete(
      { id: badge.id },
      { selectionSet: ["id"] },
    );
    if (errors?.length)
      throw new Error(`delete badge failed: ${JSON.stringify(errors)}`);
  }

  for (const ownedProfile of ownedProfiles) {
    const { errors } = await client.models.User.delete({ id: ownedProfile.id });
    if (errors?.length)
      throw new Error(`delete profile failed: ${JSON.stringify(errors)}`);
  }
}
