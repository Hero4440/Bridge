// app/amplify/functions/tone/resource.ts
// Tone-check / gentle-rewrite function. Haiku-class (D-01). Wired as a custom query in plan 05.
import { defineFunction } from '@aws-amplify/backend';

export const tone = defineFunction({ name: 'tone', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
