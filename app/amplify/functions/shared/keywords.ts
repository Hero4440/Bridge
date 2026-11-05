// app/amplify/functions/shared/keywords.ts
// Deterministic safety layer. Runs BEFORE any model call and BEFORE rate limiting
// (D-02) so a crisis is caught even if the LLM is down, throttled, or disagrees.
export type SafetyLabel = 'crisis' | 'money' | 'address';

const CRISIS = /\b(kill myself|suicid|end my life|want to die|hurt myself|self[-\s]?harm|no reason to live)\b/i;
const MONEY = /\b(send (me )?money|venmo|cash\s?app|paypal|zelle|gift card|wire (me )?money|\$\d+)\b/i;
const ADDRESS = /(\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|blvd|lane|ln|drive|dr)\b|what('?s| is)\s+your\s+(home\s+)?address|where do you live|your\s+(home\s+)?address|home address)/i;

export function keywordLabel(text: string): { label: SafetyLabel; confidence: 1 } | null {
  if (CRISIS.test(text)) return { label: 'crisis', confidence: 1 };
  if (MONEY.test(text)) return { label: 'money', confidence: 1 };
  if (ADDRESS.test(text)) return { label: 'address', confidence: 1 };
  return null;
}
