// app/src/components/CircleGlyph.tsx
// Rounded square icon for interest circles (Gaming, Music, Anime, etc.).
// SVG paths extracted from figma-make prototype.
import React from 'react';

type CircleKind = 'gaming' | 'music' | 'anime' | 'cooking' | 'art' | 'tech';

interface CircleGlyphProps {
  kind: CircleKind;
  tint?: string;
  size?: number;
}

const iconPaths: Record<CircleKind, string> = {
  gaming: 'M7 8h10a5 5 0 0 1 4.5 7.2l-1 2A2.5 2.5 0 0 1 16 17l-1-2H9l-1 2a2.5 2.5 0 0 1-4.5.2l-1-2A5 5 0 0 1 7 8ZM7 11v4M5 13h4M16 12h.01M19 14h.01',
  music: 'M9 18V6l10-2v12M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  anime: 'm12 2 1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
  cooking: 'M5 10h14v5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-5ZM8 7c-1-1 1-2 0-4M12 7c-1-1 1-2 0-4M16 7c-1-1 1-2 0-4',
  art: 'm5 19 3.5-1 9.8-9.8-2.5-2.5L6 15.5 5 19ZM14.5 7l2.5 2.5M4 21h16',
  tech: 'M4 5h16v12H4zM8 21h8M12 17v4M8 10l2 2-2 2M13 14h3',
};

export function CircleGlyph({ kind, tint, size = 44 }: CircleGlyphProps) {
  const iconSize = size > 40 ? 24 : 20;

  return (
    <span
      className="circle-glyph"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: tint || 'var(--soft)',
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        style={{ stroke: 'var(--ink)' }}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPaths[kind]} />
      </svg>
    </span>
  );
}
