// Client wrapper for Mo free-chat. Session-scoped only — no persistence.
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type MoChatMessage = { role: 'mo' | 'user'; text: string };

export function buildMoChatHistory(messages: readonly MoChatMessage[]): string {
  return messages
    .slice(-7)
    .map(({ role, text }) => `${role === 'mo' ? 'Mo' : 'User'}: ${text.slice(0, 500)}`)
    .join('\n')
    .slice(0, 3600);
}

export async function sendToMo(
  message: string,
  history: string,
  personalContext?: string,
): Promise<{ reply: string; crisis: boolean; rateLimited: boolean; fallback: boolean }> {
  const { data, errors } = await client.queries.moChatTurn({
    message,
    history: history || undefined,
    personalContext: personalContext || undefined,
  });

  if (errors?.length) throw new Error(`moChatTurn failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('moChatTurn returned no data');

  return {
    reply: data.reply || '',
    crisis: data.crisis || false,
    rateLimited: data.rateLimited || false,
    fallback: data.fallback || false,
  };
}
