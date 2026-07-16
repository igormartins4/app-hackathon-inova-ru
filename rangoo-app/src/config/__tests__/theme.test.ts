jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (obj: Record<string, unknown>) => obj.android ?? obj.default ?? obj.ios,
  },
  PlatformColor: (value: string) => value,
  useColorScheme: () => 'light',
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}))

import { colors, darkColors } from '@/config/theme'

function channel(value: number) {
  const normalized = value / 255
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string) {
  const raw = hex.replace('#', '')
  const r = channel(Number.parseInt(raw.slice(0, 2), 16))
  const g = channel(Number.parseInt(raw.slice(2, 4), 16))
  const b = channel(Number.parseInt(raw.slice(4, 6), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string) {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

describe('theme contrast', () => {
  it('keeps core light tokens above WCAG AA', () => {
    expect(contrast(colors.textPrimary, colors.background)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors.textSecondary, colors.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors.textInverse, colors.primary)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors.error, colors.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors.success, colors.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors.warning, colors.surface)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps core dark tokens above WCAG AA', () => {
    expect(contrast(darkColors.textPrimary, darkColors.background)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(darkColors.textSecondary, darkColors.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(darkColors.textInverse, darkColors.primary)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(darkColors.error, darkColors.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(darkColors.success, darkColors.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(darkColors.warning, darkColors.surface)).toBeGreaterThanOrEqual(4.5)
  })
})
