// app/amplify/functions/preview/resource.ts
// Mo reply-idea suggestions. Haiku-class (D-01). Wired as a custom query in plan 05.
import { defineFunction } from '@aws-amplify/backend';

export const preview = defineFunction({ name: 'preview', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
