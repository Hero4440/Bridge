// Primary navigation mirrors the current Figma Make pill and keeps Mo separate.
import { Mo } from './Mo';

export type Screen = 'home' | 'circles' | 'events' | 'practice' | 'dms' | 'me';

interface NavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function NavBar({ currentScreen, onNavigate }: NavBarProps) {
  const tabs = [
    { id: 'home', label: 'Home', path: 'M3 10.8 12 3l9 7.8M5.5 9.5V21h13V9.5' },
    { id: 'circles', label: 'Circles', path: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5' },
    { id: 'me', label: 'Me', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6' },
  ] as const;

  return (
    <>
      <nav className="app-nav" aria-label="Main navigation">
        {tabs.map((tab) => {
          const active = tab.id === 'circles'
            ? currentScreen === 'circles' || currentScreen === 'dms'
            : currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="app-nav-button"
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={tab.path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {active && <span className="app-nav-label">{tab.label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        className="app-mo-fab"
        onClick={() => onNavigate('practice')}
        aria-label="Practice with Mo"
        aria-current={currentScreen === 'practice' ? 'page' : undefined}
      >
        <Mo size={44} />
      </button>
    </>
  );
}
