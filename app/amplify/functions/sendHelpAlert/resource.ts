// app/amplify/functions/sendHelpAlert/resource.ts
// Server-side "I need help" alert (SAFE-06/07). Writes a Notification owned by the connected
// guardian — impossible from the client because Notification is allow.owner(). Data access only.
import { defineFunction } from '@aws-amplify/backend';

export const sendHelpAlert = defineFunction({ name: 'sendHelpAlert', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
