// app/amplify/functions/practice/resource.ts
// Mo's scripted practice role-play. Sonnet-class (D-01). Writes PracticeRun (authz + the
// env Data client are wired in plan 05). Registered in backend.ts in plan 05.
import { defineFunction } from '@aws-amplify/backend';

export const practice = defineFunction({
  name: 'practice',
  entry: './handler.ts',
  timeoutSeconds: 29,
  memoryMB: 512,
});
