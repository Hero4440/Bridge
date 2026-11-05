// app/src/components/StatusBar.tsx
// iOS-style status bar with time + signal/wifi/battery icons (32px height).
// Extracted from figma-make prototype. Shows 9:41 (Apple keynote time).
export function StatusBar() {
  return (
    <div className="ios-status" aria-hidden="true">
      <span>9:41</span>
      <span className="status-icons">
        {/* Signal strength */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="var(--ink)">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2" width="3" height="10" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* WiFi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round">
          <path d="M1 4c4.5-4 10.5-4 15 0M4 7c2.8-2.4 6.2-2.4 9 0M7 10c1-.8 2-.8 3 0" />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" stroke="var(--ink)" strokeWidth="1.5">
          <rect x=".8" y=".8" width="20" height="10.4" rx="3" />
          <path d="M23 4v4" />
          <rect x="3" y="3" width="16" height="6" rx="1.5" fill="var(--ink)" stroke="none" />
        </svg>
      </span>
    </div>
  );
}
