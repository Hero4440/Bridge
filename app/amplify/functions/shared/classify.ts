// app/amplify/functions/shared/classify.ts
// THE single labeling function (SKILL §3 code standard #4 — never call the model for
// labels anywhere else). Keyword layer first (deterministic, instant crisis catch),
// then the Haiku-class structured-output pass. On model failure it leans to the SAFER
// 'unsafe' label (D-02), never 'safe'.
import { keywordLabel } from './keywords';
import { converseWithTool } from './bedrock';
import { classifyOutput } from './schemas';
import { FALLBACKS } from './fallback';
import { CLASSIFY_MODEL_ID } from '../../shared/config';
import { CLASSIFY_SYSTEM, CLASSIFY_TOOL_SCHEMA } from './classify-prompts';

export type ClassifyResult = { label: string; confidence: number; fallback: boolean };

export async function classify(text: string): Promise<ClassifyResult> {
  const kw = keywordLabel(text);
  if (kw) return { ...kw, fallback: false }; // immediate, deterministic — never rate-limited upstream

  const res = await converseWithTool({
    modelId: CLASSIFY_MODEL_ID,
    system: CLASSIFY_SYSTEM,
    message: text,
    toolName: 'classify',
    inputSchema: CLASSIFY_TOOL_SCHEMA as unknown as Record<string, unknown>,
    validator: classifyOutput,
  });
  return res.ok ? { ...res.value, fallback: false } : { ...FALLBACKS.classify, fallback: true }; // D-02 safer default
}
