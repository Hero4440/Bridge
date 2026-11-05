// The four Make onboarding palettes use existing persisted theme IDs for compatibility.
import type { CSSProperties } from 'react';
import type { ThemeName } from './theme';

export const onboardingThemes = {
  dawn: { label: 'Peach', accent: '#C96B45', accentDark: '#A9583A', tint: '#FCE9DE', bg: '#FCF6F0', ink: '#3A2A28', soft: '#F4E8DE', soft2: '#F6E4D6', muted: '#8F7E77' },
  sage: { label: 'Sage', accent: '#5E8C6A', accentDark: '#4A6F55', tint: '#E8F0E3', bg: '#F7F2E8', ink: '#2E3A33', soft: '#EEE8DB', soft2: '#E9E6D8', muted: '#857F72' },
  berry: { label: 'Berry', accent: '#B85577', accentDark: '#9C4664', tint: '#FBE6EC', bg: '#FBF5F3', ink: '#3B2540', soft: '#F3E8EA', soft2: '#F4E4E8', muted: '#8E7C88' },
  honey: { label: 'Honey', accent: '#B9792A', accentDark: '#9C6420', tint: '#FBF0DA', bg: '#FCF7EC', ink: '#3A3025', soft: '#F4EBD9', soft2: '#F3E8D2', muted: '#8C8070' },
} satisfies Partial<Record<ThemeName, object>>;

export type OnboardingTheme = keyof typeof onboardingThemes;
export const onboardingThemeNames = Object.keys(onboardingThemes) as OnboardingTheme[];

export function onboardingThemeStyle(name: OnboardingTheme): CSSProperties {
  const t = onboardingThemes[name];
  return { '--bg': t.bg, '--bar': t.bg, '--ink': t.ink, '--soft': t.soft, '--soft2': t.soft2,
    '--muted': t.muted, '--accent': t.accent, '--accent-dark': t.accentDark, '--tint': t.tint,
    '--border': 'rgba(30,27,46,0.08)' } as CSSProperties;
}
