// app/src/components/NavBar.tsx
// Bottom navigation bar with 5 tabs (Home, Circles, Events, DMs, Me).
// 44px height, dark pill style, active state in var(--ink).
// New component (not in prototype) designed from UI-SPEC (FRONTEND-06).
import React from 'react';

type Screen = 'home' | 'circles' | 'events' | 'dms' | 'me';

interface NavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function NavBar({ currentScreen, onNavigate }: NavBarProps) {
  const tabs: Array<{ id: Screen; label: string; icon: string }> = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'circles', label: 'Circles', icon: '◉' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'dms', label: 'DMs', icon: '💬' },
    { id: 'me', label: 'Me', icon: '👤' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '44px',
        background: 'var(--bar)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        zIndex: 10,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onNavigate(tab.id)}
          style={{
            flex: 1,
            height: '100%',
            border: 'none',
            background: currentScreen === tab.id ? 'var(--ink)' : 'transparent',
            color: currentScreen === tab.id ? '#fff' : 'var(--muted)',
            fontSize: '12px',
            fontWeight: currentScreen === tab.id ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            transition: 'background 0.2s, color 0.2s',
          }}
          aria-label={tab.label}
          aria-current={currentScreen === tab.id ? 'page' : undefined}
        >
          <span style={{ fontSize: '16px' }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
