// app/amplify/functions/reflectReply/resource.ts
// Warm Mo reflection reply (D-03). Haiku-class — short, kind acknowledgment. Registered as a
// custom query in data/resource.ts; Bedrock IAM in backend.ts.
import { defineFunction } from '@aws-amplify/backend';

export const reflectReply = defineFunction({ name: 'reflectReply', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
