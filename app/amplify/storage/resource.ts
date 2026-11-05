// app/amplify/storage/resource.ts
// S3 bucket for profile photo uploads (Phase 6 PROFILE-03).
// Authenticated users can upload to profile-photos/ prefix and read their own files.
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'bridgeProfilePhotos',
  access: (allow) => ({
    'profile-photos/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});
