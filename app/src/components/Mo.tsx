// Mo is Bridge's shared soft-blob companion, matching the Figma Make character.
import { useId } from 'react';

type MoMood = 'happy' | 'worried' | 'calm';

interface MoProps {
  mood?: MoMood;
  size?: number;
  className?: string;
}

const labels: Record<MoMood, string> = {
  happy: 'Mo, smiling',
  worried: 'Mo, looking concerned',
  calm: 'Mo, calm with eyes closed',
};

export function Mo({ mood = 'happy', size = 160, className = '' }: MoProps) {
  const gradientId = `mo-${useId().replace(/:/g, '')}`;

  return (
    <div
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className={className}
    >
      <svg width="100%" height="100%" viewBox="0 0 160 160" role="img" aria-label={labels[mood]}>
        <defs>
          <radialGradient id={gradientId} cx="40%" cy="30%" r="80%">
            <stop offset="0" stopColor="#EEF4F0" />
            <stop offset="0.6" stopColor="#B8D4C8" />
            <stop offset="1" stopColor="#7FB8A8" />
          </radialGradient>
        </defs>
        <ellipse cx="80" cy="142" rx="50" ry="6" fill="#1E1B2E" opacity="0.08" />
        <g transform="translate(0 -10)">
          <path
            d="M79.06 44.56 C97.96 44.56 118.76 41.83 129.12 51.42 C142.89 64.17 144 77.46 144 98 C144 117.65 140.27 133.64 125.43 141.09 C114.59 146.53 95.2 146 80 146 C66.99 146 45.32 147.57 35.34 143.63 C17.71 136.67 16 119.72 16 98 C16 74.89 14.14 63.48 31.69 51.08 C41.47 44.17 63.31 44.56 79.06 44.56 Z"
            fill={`url(#${gradientId})`}
          />
          <circle cx="48" cy="110" r="7" fill="#F29BAE" opacity="0.45" />
          <circle cx="112" cy="110" r="7" fill="#F29BAE" opacity="0.45" />
          {mood === 'happy' && <>
            <ellipse cx="62" cy="92" rx="8.5" ry="10.5" fill="#1E1B2E" />
            <ellipse cx="98" cy="92" rx="8.5" ry="10.5" fill="#1E1B2E" />
            <circle cx="65" cy="88" r="3.8" fill="#FFFFFF" />
            <circle cx="101" cy="88" r="3.8" fill="#FFFFFF" />
            <circle cx="60" cy="96" r="1.6" fill="#FFFFFF" />
            <circle cx="96" cy="96" r="1.6" fill="#FFFFFF" />
            <path d="M74 112 Q80 117 86 112" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round" />
          </>}
          {mood === 'calm' && <>
            <path d="M53 92 Q62 99 71 92" fill="none" stroke="#1E1B2E" strokeWidth="4" strokeLinecap="round" />
            <path d="M89 92 Q98 99 107 92" fill="none" stroke="#1E1B2E" strokeWidth="4" strokeLinecap="round" />
            <path d="M75 112 Q80 116 85 112" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round" />
          </>}
          {mood === 'worried' && <>
            <path d="M50 80 L64 75" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M110 80 L96 75" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="62" cy="94" rx="7" ry="9" fill="#1E1B2E" />
            <ellipse cx="98" cy="94" rx="7" ry="9" fill="#1E1B2E" />
            <circle cx="64.5" cy="91" r="2.8" fill="#FFFFFF" />
            <circle cx="100.5" cy="91" r="2.8" fill="#FFFFFF" />
            <path d="M73 116 Q80 111 87 116" fill="none" stroke="#1E1B2E" strokeWidth="3.5" strokeLinecap="round" />
          </>}
        </g>
      </svg>
    </div>
  );
}
