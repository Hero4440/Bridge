// Make sensory tiles reflect host-entered event details; missing information stays explicit.
import type { EventRecord } from "../lib/data";
export function EventExpectations({ event }: { event: EventRecord }) {
  const people = event.comfortSize;
  const sound = event.comfortSound ?? "";
  const light = event.comfortLighting ?? "";
  const items = [
    {
      label: "People",
      value: people ? `Up to ${people} people` : "Not added by the host",
      level: people ? (people <= 3 ? 1 : people <= 6 ? 2 : 3) : 0,
      words: ["Small group", "Medium group", "Big group"],
      path: "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5",
    },
    {
      label: "Sound",
      value: sound || "Not added by the host",
      level: !sound
        ? 0
        : /loud|music on/i.test(sound)
          ? 3
          : /text only|quiet/i.test(sound)
            ? 1
            : /soft|voice|background|music/i.test(sound)
              ? 2
              : 1,
      words: ["Quiet", "Some sound", "Loud"],
      path: "M4 10v4h4l5 4V6L8 10H4ZM16.5 9a4 4 0 0 1 0 6",
    },
    {
      label: "Lighting",
      value: light || "Not added by the host",
      level: !light
        ? 0
        : /bright|cameras on/i.test(light)
          ? 3
          : /dim|soft|camera off|no camera/i.test(light)
            ? 1
            : 2,
      words: ["Soft", "Medium", "Bright"],
      path: "M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    },
    {
      label: "Need a break?",
      value: event.exitPlan || "You can leave anytime",
      level: 0,
      words: [],
      path: "M10 4H5v16h5M15 8l4 4-4 4M19 12H9",
    },
  ];
  return (
    <div className="expect-grid">
      {items.map((item) => (
        <div className="expect-tile" key={item.label}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={item.path} />
          </svg>
          <span>{item.label}</span>
          {item.level > 0 && (
            <span
              className="sense-meter"
              aria-label={`${item.label}: ${item.words[item.level - 1]}`}
            >
              {[1, 2, 3].map((n) => (
                <i key={n} className={n <= item.level ? "on" : ""} />
              ))}
              <em>{item.words[item.level - 1]}</em>
            </span>
          )}
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
