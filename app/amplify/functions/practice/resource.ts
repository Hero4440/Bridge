// app/amplify/functions/practice/resource.ts
// Mo's bounded practice role-play. Sonnet-class (D-01). Writes only the owner-scoped
// feedback memory in PracticeRun; the conversation itself stays ephemeral.
import { defineFunction } from '@aws-amplify/backend';

export const practice = defineFunction({
  name: 'practice',
  entry: './handler.ts',
  timeoutSeconds: 29,
  memoryMB: 512,
});
