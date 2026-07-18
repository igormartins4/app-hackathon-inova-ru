import { StyleSheet, Text, type TextProps } from 'react-native'
import { useFontFamily, useFontScale } from '@/store/themeStore'

interface ScaledTextProps extends TextProps {
  children: React.ReactNode
  className?: string
}

const CLASS_FONT_SIZES: Record<string, number> = {
  'text-xs': 12,
  'text-sm': 14,
  'text-base': 16,
  'text-lg': 18,
  'text-xl': 20,
  'text-2xl': 24,
  'text-3xl': 28,
  'text-4xl': 36,
  'text-balance': 40,
}

const CLASS_LINE_HEIGHTS: Record<string, number> = {
  'text-xs': 16,
  'text-sm': 20,
  'text-base': 24,
  'text-lg': 28,
  'text-xl': 28,
  'text-2xl': 32,
  'text-3xl': 36,
  'text-4xl': 40,
  'text-balance': 48,
}

const ARBITRARY_TEXT_SIZE = /^text-\[(\d+)px\]$/

function resolveStyleMetric(
  style: TextProps['style'],
  metric: 'fontSize' | 'lineHeight',
): number | undefined {
  if (!style) return undefined
  const flat = StyleSheet.flatten(style)
  if (!flat || typeof flat !== 'object') return undefined
  const value = (flat as { fontSize?: number; lineHeight?: number })[metric]
  return typeof value === 'number' ? value : undefined
}

function resolveClassFontSize(className?: string): number | undefined {
  if (!className) return undefined
  return className
    .split(/\s+/)
    .map((name) => {
      const arbitrary = name.match(ARBITRARY_TEXT_SIZE)?.[1]
      return CLASS_FONT_SIZES[name] ?? (arbitrary ? Number(arbitrary) : undefined)
    })
    .find((size) => size != null)
}

function resolveClassLineHeight(className?: string): number | undefined {
  return className
    ?.split(/\s+/)
    .map((name) => CLASS_LINE_HEIGHTS[name])
    .find((size) => size != null)
}

export function ScaledText({ children, className, style, ...props }: ScaledTextProps) {
  const fontScale = useFontScale()
  const fontFamily = useFontFamily()
  const baseFontSize = resolveStyleMetric(style, 'fontSize') ?? resolveClassFontSize(className)
  const baseLineHeight =
    resolveStyleMetric(style, 'lineHeight') ?? resolveClassLineHeight(className)

  const scaledStyle = [
    style,
    fontFamily ? { fontFamily } : null,
    baseFontSize != null && fontScale !== 1
      ? {
          fontSize: Math.round(baseFontSize * fontScale),
          ...(baseLineHeight != null
            ? { lineHeight: Math.round(baseLineHeight * fontScale) }
            : null),
        }
      : null,
  ]

  return (
    <Text className={className} style={scaledStyle} {...props}>
      {children}
    </Text>
  )
}
