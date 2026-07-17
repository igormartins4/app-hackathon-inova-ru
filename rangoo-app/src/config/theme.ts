// Design tokens — Rangoo theme (Figma Material You)
// Colors use CSS variables defined in global.css for light/dark support.
// className-based components read those CSS vars directly via NativeWind;
// this file is the single source for the same values where a *native* prop
// (ActivityIndicator color, Ionicons color, tabBar*TintColor, etc.) needs a
// literal color instead of a className, so nothing here is re-hardcoded.

import { useResolvedTheme, useThemeStore } from '@/store/themeStore'

export const colors = {
  primary: '#1a5c4a',
  primaryLight: '#4e9e9e',
  primaryContainer: '#d1e8e6',
  primaryDark: '#0f3d31',
  surface: '#ffffff',
  surfaceVariant: '#f0faf6',
  background: '#f0faf6',
  /* 3:1 min against surface (WCAG 1.4.11, meaningful UI boundary) */
  outline: '#6a8f80',
  outlineVariant: '#e2f0e9',
  textPrimary: '#1a2e28',
  /* WCAG AA: #4d6b61 on #ffffff ≈ 5.85:1, on #f0faf6 ≈ 5.49:1 */
  textSecondary: '#4d6b61',
  /* WCAG AA: #5a6f65 on #ffffff ≈ 5.39:1 — also used as placeholder color */
  textDisabled: '#5a6f65',
  textInverse: '#ffffff',
  success: '#2e7d4f',
  error: '#c62828',
  warning: '#8a5a00',
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
  /* 3:1 min against surface (WCAG 1.4.11, meaningful UI boundary) */
  outline: '#628a76',
  outlineVariant: '#1f3830',
  textPrimary: '#f0faf6',
  /* WCAG AA: #a8d5c5 on #1a2e28 ≈ 5.0:1 */
  textSecondary: '#a8d5c5',
  /* WCAG AA: #82a597 on #1a2e28 ≈ 5.31:1 — also used as placeholder color */
  textDisabled: '#82a597',
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
    quickActionCardapio: '#1e3a5f',
    quickActionHistorico: '#713f12',
  },
} as const

export type GradientColors = typeof gradientColors.light

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

const highContrastColors = {
  primary: '#000000',
  primaryLight: '#333333',
  primaryContainer: '#e0e0e0',
  primaryDark: '#000000',
  textPrimary: '#000000',
  textSecondary: '#1a1a1a',
  textDisabled: '#666666',
  textInverse: '#ffffff',
  outline: '#000000',
  outlineVariant: '#cccccc',
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
  background: '#ffffff',
  success: '#006400',
  error: '#cc0000',
  /* #cc8800 measured 2.96:1 on white — worse than the non-high-contrast warning. Darkened to stay >= 4.5:1 */
  warning: '#663f00',
  chipSelected: '#000000',
  chipUnselected: '#ffffff',
} as const

// Só preto + branco/amarelo nos elementos de marca — sem verde/neon. Status
// (sucesso/erro) mantém cor semântica distinta, pois depende de cor pra
// diferenciar aprovado/rejeitado além do texto.
const highContrastDarkColors = {
  primary: '#ffffff',
  primaryLight: '#ffff00',
  primaryContainer: '#333300',
  primaryDark: '#cccc00',
  textPrimary: '#ffffff',
  textSecondary: '#ffff00',
  textDisabled: '#999999',
  textInverse: '#000000',
  // Não usar branco puro — colidiria com `primary` (também branco) em
  // qualquer par visual on/off (ex.: trilha de switch ligado vs desligado).
  outline: '#999999',
  outlineVariant: '#666666',
  surface: '#000000',
  surfaceVariant: '#111111',
  background: '#000000',
  success: '#00ff00',
  error: '#ff3333',
  warning: '#ffbb00',
  chipSelected: '#ffffff',
  chipUnselected: '#222222',
} as const

// Resolves to the light or dark token set for native props that can't take a
// NativeWind className (icon `color`, ActivityIndicator, tabBar tint colors).
export function useThemeColors() {
  const resolvedTheme = useResolvedTheme()
  const highContrast = useThemeStore((s) => s.highContrast)
  const base = resolvedTheme === 'dark' ? darkColors : colors
  if (!highContrast) return base
  const overrides = resolvedTheme === 'dark' ? highContrastDarkColors : highContrastColors
  return { ...base, ...overrides }
}

const highContrastGradientColors = {
  light: {
    loginHeader: ['#e0e0e0', '#f0f0f0', '#ffffff'] as const,
    balanceCard: ['#000000', '#333333', '#000000'] as const,
    balanceDetail: ['#f5f5f5', '#eeeeee'] as const,
    profileCard: ['#f5f5f5', '#eeeeee', '#f5f5f5'] as const,
    infoBanner: ['#f0f0f0', '#ffffff'] as const,
    hackathonBadge: ['#e0e0e0', '#d0d0d0'] as const,
    ruBanner: ['#f0f0f0', '#ffffff'] as const,
    quickActionCardapio: '#e0e0e0',
    quickActionHistorico: '#e0e0e0',
  },
  dark: {
    loginHeader: ['#000000', '#1a1a1a', '#000000'] as const,
    balanceCard: ['#cccc00', '#ffff00', '#cccc00'] as const,
    balanceDetail: ['#111111', '#0a0a0a'] as const,
    profileCard: ['#111111', '#0a0a0a', '#111111'] as const,
    infoBanner: ['#111111', '#0a0a0a'] as const,
    hackathonBadge: ['#222222', '#1a1a1a'] as const,
    ruBanner: ['#111111', '#0a0a0a'] as const,
    quickActionCardapio: '#222222',
    quickActionHistorico: '#222222',
  },
} as const

// Returns gradient colors for the current theme
export function useGradientColors() {
  const resolvedTheme = useResolvedTheme()
  const highContrast = useThemeStore((s) => s.highContrast)
  if (highContrast) {
    return resolvedTheme === 'dark'
      ? highContrastGradientColors.dark
      : highContrastGradientColors.light
  }
  return resolvedTheme === 'dark' ? gradientColors.dark : gradientColors.light
}
