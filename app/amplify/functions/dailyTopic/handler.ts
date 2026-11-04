// app/amplify/functions/dailyTopic/handler.ts
// CHAT-05 / D-03: returns a circle's daily topic. Reads today's cached Topic row FIRST and only
// calls Bedrock (Converse via the shared helper) when it is missing — at most one model call per
// circle per day (cost guard). Caches the result; degrades to a warm fallback on model failure.
// Logs the groupId label + fallback only — never the topic text (§1.4 / §2.8).
import { z } from 'zod';
import { converseWithTool } from '../shared/bedrock';
import { logTurn } from '../shared/log';
import { CLASSIFY_MODEL_ID } from '../../shared/config';
import { TOPIC_SYSTEM, TOPIC_TOOL_SCHEMA } from './prompts';
// Topic cache via the runtime Data client. `$amplify/env/dailyTopic` resolves only after deploy
// (generated into .amplify/) — isolated here; verified live in Plan 04.
import { env } from '$amplify/env/dailyTopic';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const dataClient = generateClient<Schema>();

const topicInput = z.object({ groupId: z.string().min(1), groupName: z.string().optional() });
const topicOutput = z.object({ text: z.string().min(1) });
const FALLBACK_TEXT = "What's something small that went okay today?";

export const handler = async (event: { arguments: { groupId: string; groupName?: string }; identity?: { sub?: string } }) => {
  const started = Date.now();
  const parsed = topicInput.safeParse(event.arguments);
  if (!parsed.success) return { text: FALLBACK_TEXT, fallback: true };
  const { groupId, groupName } = parsed.data;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

  // 1. cache read — if today's topic exists, return it WITHOUT calling Bedrock
  const existing = await dataClient.models.Topic.get({ groupId, date });
  if (existing.data) {
    logTurn({ fn: 'dailyTopic', latencyMs: Date.now() - started, labels: [groupId], fallback: existing.data.fallback ?? false });
    return { text: existing.data.text, fallback: existing.data.fallback ?? false };
  }

  // 2. generate (once per circle per day)
  const res = await converseWithTool({
    modelId: CLASSIFY_MODEL_ID, // Haiku-class — short, cheap
    system: TOPIC_SYSTEM,
    message: `Circle: ${groupName ?? groupId}.`,
    toolName: 'topic',
    inputSchema: TOPIC_TOOL_SCHEMA as unknown as Record<string, unknown>,
    validator: topicOutput,
  });
  const text = res.ok ? res.value.text : FALLBACK_TEXT;
  const fallback = !res.ok;

  // 3. cache write — swallow a conditional/duplicate error so concurrent opens don't double-generate
  try {
    await dataClient.models.Topic.create({ groupId, date, text, fallback });
  } catch {
    // another concurrent invocation already wrote today's row; the cached value wins next read
  }
  logTurn({ fn: 'dailyTopic', latencyMs: Date.now() - started, labels: [groupId], fallback });
  return { text, fallback };
};
