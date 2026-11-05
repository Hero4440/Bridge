// Shared theme tokens keep onboarding previews and every authenticated screen visually consistent.
import type { CSSProperties } from 'react';

export const themes = {
  dawn: { label: 'Dawn', swatch: '#D99C97', bg: '#FFF9F6', bar: '#F5EDE8', ink: '#3B2D2B', soft: '#F5DDD8', muted: '#8D7E79' },
  sage: { label: 'Sage', swatch: '#7DA08A', bg: '#F8FAF6', bar: '#E8F0E4', ink: '#33433A', soft: '#DDECE1', muted: '#748078' },
  mist: { label: 'Mist', swatch: '#7E91B7', bg: '#F6F8FA', bar: '#E4EAF0', ink: '#303B52', soft: '#DCE4F5', muted: '#758094' },
  sand: { label: 'Sand', swatch: '#B99A78', bg: '#FAF8F4', bar: '#F0EBE2', ink: '#46372F', soft: '#F1E4D3', muted: '#8D7F70' },
  berry: { label: 'Berry', swatch: '#B85B7C', bg: '#FFF8FA', bar: '#F5E7EC', ink: '#4A2E3B', soft: '#F1DCE4', muted: '#806570' },
  honey: { label: 'Honey', swatch: '#C28738', bg: '#FFFAF2', bar: '#F4EAD9', ink: '#493522', soft: '#F4E2C5', muted: '#806C55' },
} as const;

export type ThemeName = keyof typeof themes;
export const themeNames = Object.keys(themes) as ThemeName[];

export function isThemeName(value: string | null | undefined): value is ThemeName {
  return !!value && value in themes;
}

export function themeStyle(name: ThemeName): CSSProperties {
  const theme = themes[name];
  return {
    '--bg': theme.bg,
    '--bar': theme.bar,
    '--ink': theme.ink,
    '--soft': theme.soft,
    '--muted': theme.muted,
  } as CSSProperties;
}
