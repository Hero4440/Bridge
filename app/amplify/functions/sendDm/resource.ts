// app/amplify/functions/sendDm/resource.ts
// Server-side DM send (SKILL §1.4): classifies the text, holds a non-contact first message as a
// MessageRequest with a trustworthy unsafe flag, delivers to the thread for contacts, and stops on
// crisis. Wired as the sendDm custom mutation; needs Bedrock (classify) + Data access.
import { defineFunction } from '@aws-amplify/backend';

export const sendDm = defineFunction({ name: 'sendDm', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
