// app/src/components/Mo.tsx
// Mo - Bridge's friendly AI buddy (soft blob SVG with 3 moods).
// Extracted from figma-make prototype, converted to TypeScript.
// Moods: happy (smile), worried (concerned brows), calm (eyes closed).
// Used in Practice, Reset, Onboarding screens. Animates with .breathe class.
import React from 'react';

type MoMood = 'happy' | 'worried' | 'calm';

interface MoProps {
  mood?: MoMood;
  size?: number;
  className?: string;
}

export function Mo({ mood = 'happy', size = 160, className = '' }: MoProps) {
  const fills: Record<MoMood, string> = {
    happy: 'url(#moHappy)',
    worried: 'url(#moWorried)',
    calm: 'url(#moCalm)',
  };

  const labels: Record<MoMood, string> = {
    happy: 'Mo, smiling',
    worried: 'Mo, looking concerned',
    calm: 'Mo, calm with eyes closed',
  };

  const fill = fills[mood];
  const label = labels[mood];
  const px = `${size}px`;

  return (
    <div
      style={{ width: px, height: px, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className={className}
    >
      <svg width="100%" height="100%" viewBox="0 0 160 160" role="img" aria-label={label}>
        <defs>
          <radialGradient id="moHappy" cx="40%" cy="30%" r="80%">
            <stop offset="0" stopColor="#FFF4EE" />
            <stop offset="0.6" stopColor="#F7C9D4" />
            <stop offset="1" stopColor="#C9B6F0" />
          </radialGradient>
          <radialGradient id="moWorried" cx="40%" cy="30%" r="80%">
            <stop offset="0" stopColor="#FFF4EC" />
            <stop offset="0.6" stopColor="#F9C7B4" />
            <stop offset="1" stopColor="#EE9F95" />
          </radialGradient>
          <radialGradient id="moCalm" cx="40%" cy="30%" r="80%">
            <stop offset="0" stopColor="#F6F4FF" />
            <stop offset="0.6" stopColor="#D3CDF6" />
            <stop offset="1" stopColor="#A9B8EE" />
          </radialGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="80" cy="150" rx="44" ry="6" fill="#3B3350" opacity="0.08" />
        {/* Body */}
        <path
          d="M80 30 C124 30 144 62 144 98 C144 132 116 146 80 146 C44 146 16 132 16 98 C16 62 36 30 80 30 Z"
          fill={fill}
        />
        {/* Highlight */}
        <ellipse cx="60" cy="58" rx="16" ry="9" fill="#FFFFFF" opacity="0.55" />
        {/* Cheeks */}
        <circle cx="50" cy="106" r="7" fill="#F29BAE" opacity="0.55" />
        <circle cx="110" cy="106" r="7" fill="#F29BAE" opacity="0.55" />

        {/* Happy face */}
        {mood === 'happy' && (
          <g>
            <ellipse cx="63" cy="92" rx="5.5" ry="7.5" fill="#3B3350" />
            <ellipse cx="97" cy="92" rx="5.5" ry="7.5" fill="#3B3350" />
            <circle cx="65" cy="89" r="2" fill="#FFFFFF" />
            <circle cx="99" cy="89" r="2" fill="#FFFFFF" />
            <path d="M72 110 Q80 117 88 110" fill="none" stroke="#3B3350" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        )}

        {/* Worried face */}
        {mood === 'worried' && (
          <g>
            <path d="M54 80 L67 84" stroke="#3B3350" strokeWidth="3" strokeLinecap="round" />
            <path d="M106 80 L93 84" stroke="#3B3350" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="63" cy="94" rx="5.5" ry="7" fill="#3B3350" />
            <ellipse cx="97" cy="94" rx="5.5" ry="7" fill="#3B3350" />
            <path d="M73 114 Q80 109 87 114" fill="none" stroke="#3B3350" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* Calm face */}
        {mood === 'calm' && (
          <g>
            <path d="M56 92 Q63 86 70 92" fill="none" stroke="#3B3350" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M90 92 Q97 86 104 92" fill="none" stroke="#3B3350" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M74 111 Q80 115 86 111" fill="none" stroke="#3B3350" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
