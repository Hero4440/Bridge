// app/amplify/storage/resource.ts
// S3 bucket for profile photo uploads (Phase 6 PROFILE-03).
// Signed-in people can view profile photos, while only the owner can replace or delete theirs.
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'bridgeProfilePhotos',
  access: (allow) => ({
    'profile-photos/{entity_id}/*': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
