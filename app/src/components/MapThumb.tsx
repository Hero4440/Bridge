// Decorative map artwork from Make; the Directions action opens the host's actual address.
export function MapThumb() {
  return (
    <span className="map-thumb" aria-hidden="true">
      <svg viewBox="0 0 100 64" width="100%" height="100%">
        <path
          d="M-5 15 35 42 75 17l30 20M15-5l18 70M70-5l-8 70"
          fill="none"
          stroke="#C8C1D4"
          strokeWidth="5"
        />
        <circle cx="56" cy="31" r="7" fill="var(--ink)" />
        <circle cx="56" cy="31" r="2.5" fill="#fff" />
      </svg>
    </span>
  );
}
