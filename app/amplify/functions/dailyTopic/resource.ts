// app/amplify/functions/dailyTopic/resource.ts
// Generates (and caches) a circle's daily conversation-starter. Haiku-class (D-01). Wired as the
// getDailyTopic custom query in data/resource.ts; reads/writes the Topic cache via the Data client.
import { defineFunction } from '@aws-amplify/backend';

export const dailyTopic = defineFunction({ name: 'dailyTopic', entry: './handler.ts', timeoutSeconds: 29, memoryMB: 512 });
