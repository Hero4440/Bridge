// app/src/lib/topics.ts
// Typed client helper for the cached daily circle topic (CHAT-05). Calls the getDailyTopic custom
// query, which reads the Topic cache and only invokes Bedrock when today's topic is missing.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export async function getDailyTopic(
  groupId: string,
  groupName?: string,
): Promise<{ text: string; fallback: boolean }> {
  const { data, errors } = await client.queries.getDailyTopic({ groupId, groupName });
  if (errors?.length) throw new Error(`getDailyTopic failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('getDailyTopic returned no data');
  return { text: data.text ?? '', fallback: data.fallback ?? false };
}
