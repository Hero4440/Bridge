// app/src/components/NavBar.tsx
// Fixed-width production navigation translated from the Figma Make dark pill pattern.
type Screen = 'home' | 'circles' | 'events' | 'practice' | 'dms' | 'me';

interface NavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function NavBar({ currentScreen, onNavigate }: NavBarProps) {
  const tabs: Array<{ id: Screen; label: string; path: string }> = [
    { id: 'home', label: 'Home', path: 'M3 10.8 12 3l9 7.8M5.5 9.5V21h13V9.5' },
    { id: 'circles', label: 'Circles', path: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5' },
    { id: 'events', label: 'Events', path: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16' },
    { id: 'practice', label: 'Practice', path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z' },
    { id: 'dms', label: 'DMs', path: 'M4 5h16v12H9l-5 4V5ZM8 10h8M8 13h5' },
    { id: 'me', label: 'Me', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6' },
  ];

  return (
    <nav className="app-nav" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onNavigate(tab.id)}
          className="app-nav-button"
          aria-label={tab.label}
          aria-current={currentScreen === tab.id ? 'page' : undefined}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d={tab.path} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="app-nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
