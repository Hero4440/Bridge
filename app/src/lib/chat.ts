// Local tone explanations never rewrite or send a person's message automatically.
export const toneReasons: Record<string, string> = {
  whatever: "can sound like you do not care what they said",
  stupid: "calls their idea bad, which can hurt",
  "shut up": "tells them to stop talking, which feels rude",
  annoying: "can feel like you are criticizing them as a person",
  hate: "is a very strong word, so it can feel like an attack",
  overrated: "can sound like you are dismissing something they love",
  dumb: "calls their idea bad, which can hurt",
};
export function toneWarning(text: string) {
  const word = Object.keys(toneReasons).find((word) =>
    text.toLowerCase().includes(word),
  );
  return word ? `Why: “${word}” ${toneReasons[word]}.` : "";
}
export function messageTime(timestamp: string | null | undefined) {
  return timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
}
export function dayLabel(timestamp: string) {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? "Today"
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}
