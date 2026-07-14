// Design tokens — InovaRU theme (Figma Material You)
// Colors use CSS variables defined in global.css for light/dark support.
// className-based components read those CSS vars directly via NativeWind;
// this file is the single source for the same values where a *native* prop
// (ActivityIndicator color, Ionicons color, tabBar*TintColor, etc.) needs a
// literal color instead of a className, so nothing here is re-hardcoded.

import { useResolvedTheme } from '@/store/themeStore'

export const colors = {
  primary: '#1a5c4a',
  primaryLight: '#4e9e9e',
  primaryContainer: '#d1e8e6',
  primaryDark: '#0f3d31',
  surface: '#ffffff',
  surfaceVariant: '#f0faf6',
  background: '#f0faf6',
  outline: '#d4e8df',
  outlineVariant: '#e2f0e9',
  textPrimary: '#1a2e28',
  textSecondary: '#5f7a70',
  textDisabled: '#a0b5aa',
  textInverse: '#ffffff',
  success: '#2e7d4f',
  error: '#c62828',
  warning: '#f9a825',
  chipSelected: '#1a5c4a',
  chipUnselected: '#ffffff',
  white: '#ffffff',
  black: '#000000',
} as const

export const darkColors = {
  primary: '#34d399',
  primaryLight: '#6ee7b7',
  primaryContainer: '#0f3d31',
  primaryDark: '#059669',
  surface: '#1a2e28',
  surfaceVariant: '#1f3830',
  background: '#0f1f1a',
  outline: '#2d4a3e',
  outlineVariant: '#1f3830',
  textPrimary: '#f0faf6',
  textSecondary: '#8fb5a5',
  textDisabled: '#4a6b5e',
  textInverse: '#0f1f1a',
  success: '#4ade80',
  error: '#f87171',
  warning: '#fbbf24',
  chipSelected: '#34d399',
  chipUnselected: '#1f3830',
} as const

export const gradientColors = {
  light: {
    loginHeader: ['#b8e6d9', '#d4f0e7', '#e8f7f0'] as const,
    balanceCard: ['#1a5c4a', '#2d7a64', '#1a5c4a'] as const,
    balanceDetail: ['#e0f2f1', '#b2dfdb'] as const,
    profileCard: ['#e0f2f1', '#b2dfdb', '#e8f7f0'] as const,
    infoBanner: ['#d4f0e7', '#e8f7f0'] as const,
    hackathonBadge: ['#dbeafe', '#e0e7ff'] as const,
    ruBanner: ['#d4f0e7', '#e8f7f0'] as const,
    quickActionSaldo: '#dcfce7',
    quickActionCardapio: '#dbeafe',
    quickActionHistorico: '#fef9c3',
  },
  dark: {
    loginHeader: ['#0f3d31', '#1a5c4a', '#0f3d31'] as const,
    balanceCard: ['#059669', '#10b981', '#059669'] as const,
    balanceDetail: ['#1a3a34', '#0f2e28'] as const,
    profileCard: ['#1a3a34', '#0f2e28', '#1a3a34'] as const,
    infoBanner: ['#1a3a34', '#0f2e28'] as const,
    hackathonBadge: ['#1e3a5f', '#1e1b4b'] as const,
    ruBanner: ['#1a3a34', '#0f2e28'] as const,
    quickActionSaldo: '#064e3b',
    quickActionCardapio: '#1e3a5f',
    quickActionHistorico: '#713f12',
  },
} as const

export type GradientColors = typeof gradientColors.light

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

// Returns gradient colors for the current theme
export function useGradientColors() {
  const resolvedTheme = useResolvedTheme()
  return resolvedTheme === 'dark' ? gradientColors.dark : gradientColors.light
}
