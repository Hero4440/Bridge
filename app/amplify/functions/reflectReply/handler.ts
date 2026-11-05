// app/amplify/functions/reflectReply/handler.ts
// Returns a warm Mo reply to a reflection (feeling + wins). Uses the Bedrock Converse API via the
// shared converseWithTool helper (forced tool, 5s abort, zod), and degrades to a warm fallback (D-03 / §2.7).
// Logs only the feeling label + fallback — never the wins text.
import { z } from 'zod';
import { converseWithTool } from '../shared/bedrock';
import { logTurn } from '../shared/log';
import { CLASSIFY_MODEL_ID } from '../../shared/config';
import { withPersonalContext } from '../shared/context';
import { REFLECT_SYSTEM, REFLECT_TOOL_SCHEMA } from './prompts';

const reflectInput = z.object({
  feeling: z.string().min(1),
  wins: z.array(z.string()),
  personalContext: z.string().max(1600).optional(),
});
const reflectOutput = z.object({ reply: z.string().min(1) });
const FALLBACK_REPLY = 'Thanks for sharing how that went — showing up and reflecting is real progress.';

export const handler = async (event: { arguments: { feeling: string; wins: string[]; personalContext?: string }; identity?: { sub?: string } }) => {
  const started = Date.now();
  const parsed = reflectInput.safeParse(event.arguments);
  if (!parsed.success) return { reply: FALLBACK_REPLY, fallback: true };
  const { feeling, wins, personalContext } = parsed.data;

  const res = await converseWithTool({
    modelId: CLASSIFY_MODEL_ID, // Haiku-class — short, cheap reply
    system: REFLECT_SYSTEM,
    message: withPersonalContext(
      `Feeling: ${feeling}. Wins: ${wins.join(', ') || 'none shared'}.`,
      personalContext,
    ),
    toolName: 'reflect',
    inputSchema: REFLECT_TOOL_SCHEMA as unknown as Record<string, unknown>,
    validator: reflectOutput,
  });
  logTurn({ fn: 'reflectReply', latencyMs: Date.now() - started, labels: [feeling], fallback: !res.ok });
  return res.ok ? { reply: res.value.reply, fallback: false } : { reply: FALLBACK_REPLY, fallback: true };
};
