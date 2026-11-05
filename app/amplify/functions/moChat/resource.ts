// Free-form chat with Mo. Sonnet-class (same as practice) for conversational quality.
import { defineFunction } from '@aws-amplify/backend';

export const moChat = defineFunction({
  name: 'moChat',
  entry: './handler.ts',
  timeoutSeconds: 29,
  memoryMB: 512,
});
