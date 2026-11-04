// app/amplify/functions/shared/bedrock.ts
// The ONE Bedrock entry point. Converse API with a FORCED tool (structured output,
// BEDROCK-03), maxTokens capped at 500 (BEDROCK-04), a 5s AbortController budget
// (D-03), and zod validation of the tool output (BEDROCK-05). Any throttle/timeout/
// parse failure resolves to { ok: false } so callers return a scripted fallback.
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import type { ZodSchema } from 'zod';
import { REGION } from '../../shared/config';

const client = new BedrockRuntimeClient({ region: REGION });

export type ToolResult<T> = { ok: true; value: T } | { ok: false };

export async function converseWithTool<T>(o: {
  modelId: string;
  system: string;
  message: string;
  toolName: string;
  inputSchema: Record<string, unknown>;
  validator: ZodSchema<T>;
  maxTokens?: number;
}): Promise<ToolResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000); // D-03: 5s inside the 29s Lambda
  try {
    const out = await client.send(
      new ConverseCommand({
        modelId: o.modelId,
        system: [{ text: o.system }],
        messages: [{ role: 'user', content: [{ text: o.message }] }],
        inferenceConfig: { maxTokens: Math.min(o.maxTokens ?? 500, 500), temperature: 0.2 }, // BEDROCK-04
        toolConfig: {
          // `as any`: Bedrock ToolInputSchema.json is a recursive DocumentType that a plain
          // Record doesn't satisfy cleanly; the schema object is validated at runtime by zod.
          tools: [{ toolSpec: { name: o.toolName, inputSchema: { json: o.inputSchema as any } } }],
          toolChoice: { tool: { name: o.toolName } }, // BEDROCK-03 force structured output
        },
      }),
      { abortSignal: controller.signal },
    );
    const block = out.output?.message?.content?.find((c) => 'toolUse' in c) as
      | { toolUse?: { input: unknown } }
      | undefined;
    const parsed = o.validator.safeParse(block?.toolUse?.input); // BEDROCK-05
    return parsed.success ? { ok: true, value: parsed.data } : { ok: false };
  } catch {
    return { ok: false }; // throttle / timeout / abort → fallback
  } finally {
    clearTimeout(timer);
  }
}
