// app/src/lib/prep.ts
// Static, non-AI event prep (D-02): a fixed per-format checklist + sensory tips, and a
// what-to-expect projection built ONLY from host-set Event fields. The "pick an opener with Mo"
// item is routed by the UI to the Phase 2 previewReplies query — never called here.
export type EventFormat = 'inPerson' | 'voice' | 'video' | 'text';
export interface PrepTemplate {
  sensory: string[];
  checklist: string[];
}

const TEMPLATES: Record<EventFormat, PrepTemplate> = {
  inPerson: {
    sensory: ['Expect some background noise and movement', 'You can step out any time'],
    checklist: ['plan travel', 'pick exit line', 'pack headphones', 'share plan'],
  },
  voice: {
    sensory: ['Voice only — no camera', 'You can mute any time'],
    checklist: ['test mic', 'pick opener with Mo', 'set a log-off time'],
  },
  video: {
    sensory: ['Camera optional', 'You can turn video off any time'],
    checklist: ['test mic', 'pick opener with Mo', 'set a log-off time'],
  },
  text: {
    sensory: ['Text only — reply at your own pace'],
    checklist: ['text only', 'pick opener with Mo', 'set a log-off time'],
  },
};

export function prepFor(format: EventFormat): PrepTemplate {
  return TEMPLATES[format];
}

type EventLike = {
  comfortSize?: number | null;
  comfortSound?: string | null;
  comfortLighting?: string | null;
  usuallyQuiet?: boolean | null;
  exitPlan?: string | null;
  format?: string | null;
};

// Pure projection of host-set fields (D-02: what-to-expect is host data, not AI). No fetch, no model.
export function whatToExpect(event: EventLike): string[] {
  const out: string[] = [];
  if (event.comfortSize != null) out.push(`Up to ${event.comfortSize} people`);
  if (event.comfortSound) out.push(`Sound: ${event.comfortSound}`);
  if (event.comfortLighting) out.push(`Lighting: ${event.comfortLighting}`);
  if (event.usuallyQuiet) out.push('Usually quiet');
  if (event.exitPlan) out.push(`Exit plan: ${event.exitPlan}`);
  return out;
}
