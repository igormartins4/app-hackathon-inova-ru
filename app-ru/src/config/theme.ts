// Design tokens — InovaRU theme (Figma Material You)
// Colors use CSS variables defined in global.css for light/dark support.
// className-based components read those CSS vars directly via NativeWind;
// this file is the single source for the same values where a *native* prop
// (ActivityIndicator color, Ionicons color, tabBar*TintColor, etc.) needs a
// literal color instead of a className, so nothing here is re-hardcoded.

import { useResolvedTheme } from '@/store/themeStore'

export const colors = {
  primary: '#006A6A',
  primaryLight: '#4E9E9E',
  primaryContainer: '#D1E8E6',
  primaryDark: '#004D4D',
  surface: '#FFFFFF',
  surfaceVariant: '#EFF1F0',
  background: '#EFF1F0',
  outline: '#DADDE4',
  outlineVariant: '#E8EAED',
  textPrimary: '#191C1C',
  textSecondary: '#717784',
  textDisabled: '#A0A5AD',
  textInverse: '#FFFFFF',
  success: '#34A853',
  error: '#EA4335',
  warning: '#FFB800',
  chipSelected: '#006A6A',
  chipUnselected: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
} as const

export const darkColors = {
  primary: '#2DD4A8',
  primaryLight: '#5EECC4',
  primaryContainer: '#1A3D3D',
  primaryDark: '#1F9E7A',
  surface: '#1E2121',
  surfaceVariant: '#2D3131',
  background: '#191C1C',
  outline: '#3A3F3F',
  outlineVariant: '#2D3131',
  textPrimary: '#FBFAF7',
  textSecondary: '#A0A5AD',
  textDisabled: '#5A5F66',
  textInverse: '#191C1C',
  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24',
  chipSelected: '#2DD4A8',
  chipUnselected: '#2D3131',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  balance: 40,
} as const

export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const

export const touchTarget = {
  min: 48,
} as const

// Resolves to the light or dark token set for native props that can't take a
// NativeWind className (icon `color`, ActivityIndicator, tabBar tint colors).
export function useThemeColors() {
  const resolvedTheme = useResolvedTheme()
  return resolvedTheme === 'dark' ? darkColors : colors
}
