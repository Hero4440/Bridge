// app/amplify/functions/classify/resource.ts
// The one safety/labeling function (SKILL code standard #4): keyword-first + Haiku
// structured output. Registered in backend.ts + wired as a custom query in plan 05.
import { defineFunction } from '@aws-amplify/backend';

export const classify = defineFunction({
  name: 'classify',
  entry: './handler.ts',
  timeoutSeconds: 29,
  memoryMB: 512,
});
