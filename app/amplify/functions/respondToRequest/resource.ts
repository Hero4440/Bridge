// app/amplify/functions/respondToRequest/resource.ts
// Server-side accept/decline of a held message request (DM-04). Only the recipient may accept;
// accepting creates the Contact (a cross-owner write the client can't do) and seeds the thread.
// Data access only — no Bedrock.
import { defineFunction } from '@aws-amplify/backend';

export const respondToRequest = defineFunction({ name: 'respondToRequest', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
