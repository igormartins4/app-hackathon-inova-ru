import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  AccessibilityInfo,
  type ColorSchemeName,
  Platform,
  type TextStyle,
  useColorScheme,
} from 'react-native'
import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

export const FONT_STEPS = [
  { scale: 0.8, label: 'Pequena' },
  { scale: 0.9, label: 'Média' },
  { scale: 1.0, label: 'Padrão' },
  { scale: 1.15, label: 'Grande' },
  { scale: 1.3, label: 'Extra Grande' },
] as const

// ponytail: real font families loaded via expo-font in _layout.tsx
export const SERIF_FAMILY = Platform.select({
  android: 'Lora',
  ios: 'Lora',
  default: 'Lora',
}) as TextStyle['fontFamily']

export const MONOSPACE_FAMILY = Platform.select({
  android: 'JetBrains Mono',
  ios: 'JetBrains Mono',
  default: 'JetBrains Mono',
}) as TextStyle['fontFamily']

export const FONT_FAMILIES = [
  { family: undefined, label: 'Sistema' },
  {
    family: SERIF_FAMILY,
    label: 'Serif',
  },
  {
    family: MONOSPACE_FAMILY,
    label: 'Monospace',
  },
] as const

const DEFAULT_FONT_INDEX = 2
const DEFAULT_FONT_FAMILY_INDEX = 0

const STORAGE_KEY_THEME = '@rangoo_theme'
const STORAGE_KEY_FONT_SIZE = '@rangoo_font_size'
const STORAGE_KEY_HIGH_CONTRAST = '@rangoo_high_contrast'
const STORAGE_KEY_REDUCED_MOTION = '@rangoo_reduced_motion'
const STORAGE_KEY_FONT_FAMILY = '@rangoo_font_family'
const STORAGE_KEY_HIDE_SENSITIVE = '@rangoo_hide_sensitive'

interface ThemeStoreState {
  theme: Theme
  fontSize: number
  fontFamily: number
  highContrast: boolean
  reducedMotion: boolean
  hideSensitiveData: boolean
  setTheme: (theme: Theme) => void
  setFontSize: (index: number) => void
  setFontFamily: (index: number) => void
  nextFontFamily: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  toggleHideSensitiveData: () => void
  initialize: () => Promise<void>
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  theme: 'system',
  fontSize: DEFAULT_FONT_INDEX,
  fontFamily: DEFAULT_FONT_FAMILY_INDEX,
  highContrast: false,
  reducedMotion: false,
  hideSensitiveData: false,
  setTheme: (theme) => {
    set({ theme })
    AsyncStorage.setItem(STORAGE_KEY_THEME, theme)
  },
  setFontSize: (index) => {
    const clamped = Math.max(0, Math.min(FONT_STEPS.length - 1, index))
    set({ fontSize: clamped })
    AsyncStorage.setItem(STORAGE_KEY_FONT_SIZE, String(clamped))
  },
  setFontFamily: (index) => {
    const clamped = Math.max(0, Math.min(FONT_FAMILIES.length - 1, index))
    set({ fontFamily: clamped })
    AsyncStorage.setItem(STORAGE_KEY_FONT_FAMILY, String(clamped))
  },
  nextFontFamily: () => {
    const next = (get().fontFamily + 1) % FONT_FAMILIES.length
    set({ fontFamily: next })
    AsyncStorage.setItem(STORAGE_KEY_FONT_FAMILY, String(next))
  },
  increaseFontSize: () => {
    const { fontSize } = get()
    if (fontSize < FONT_STEPS.length - 1) {
      const next = fontSize + 1
      set({ fontSize: next })
      AsyncStorage.setItem(STORAGE_KEY_FONT_SIZE, String(next))
    }
  },
  decreaseFontSize: () => {
    const { fontSize } = get()
    if (fontSize > 0) {
      const prev = fontSize - 1
      set({ fontSize: prev })
      AsyncStorage.setItem(STORAGE_KEY_FONT_SIZE, String(prev))
    }
  },
  toggleHighContrast: () => {
    const next = !get().highContrast
    set({ highContrast: next })
    AsyncStorage.setItem(STORAGE_KEY_HIGH_CONTRAST, String(next))
  },
  toggleReducedMotion: () => {
    const next = !get().reducedMotion
    set({ reducedMotion: next })
    AsyncStorage.setItem(STORAGE_KEY_REDUCED_MOTION, String(next))
  },
  toggleHideSensitiveData: () => {
    const next = !get().hideSensitiveData
    set({ hideSensitiveData: next })
    AsyncStorage.setItem(STORAGE_KEY_HIDE_SENSITIVE, String(next))
  },
  initialize: async () => {
    try {
      const [
        savedTheme,
        savedFontSize,
        savedHighContrast,
        savedReducedMotion,
        savedFontFamily,
        savedHideSensitive,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_THEME),
        AsyncStorage.getItem(STORAGE_KEY_FONT_SIZE),
        AsyncStorage.getItem(STORAGE_KEY_HIGH_CONTRAST),
        AsyncStorage.getItem(STORAGE_KEY_REDUCED_MOTION),
        AsyncStorage.getItem(STORAGE_KEY_FONT_FAMILY),
        AsyncStorage.getItem(STORAGE_KEY_HIDE_SENSITIVE),
      ])
      const updates: Partial<ThemeStoreState> = {}
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        updates.theme = savedTheme as Theme
      }
      if (savedFontSize !== null) {
        // Migrate legacy 'p'/'m'/'g' values to numeric indices
        if (savedFontSize === 'p') {
          updates.fontSize = 0
        } else if (savedFontSize === 'm') {
          updates.fontSize = 2
        } else if (savedFontSize === 'g') {
          updates.fontSize = 3
        } else {
          const num = Number(savedFontSize)
          if (!Number.isNaN(num) && num >= 0 && num < FONT_STEPS.length) {
            updates.fontSize = num
          }
        }
      }
      if (savedHighContrast === 'true') {
        updates.highContrast = true
      }
      if (savedReducedMotion === 'true') {
        updates.reducedMotion = true
      } else if (savedReducedMotion === null) {
        // Sem preferência salva: herda "Remover animações" do Android (AccessibilityInfo).
        // Isolado em try/catch próprio — se essa chamada falhar num device específico,
        // não pode derrubar a restauração do tema/fonte/alto-contraste junto.
        try {
          updates.reducedMotion = await AccessibilityInfo.isReduceMotionEnabled()
        } catch {}
      }
      if (savedFontFamily !== null) {
        const num = Number(savedFontFamily)
        if (!Number.isNaN(num) && num >= 0 && num < FONT_FAMILIES.length) {
          updates.fontFamily = num
        }
      }
      if (savedHideSensitive === 'true') {
        updates.hideSensitiveData = true
      }
      if (Object.keys(updates).length > 0) {
        set(updates)
      }
    } catch {}
  },
}))

// Pure decision logic, extracted so it's unit-testable without rendering a
// component — this project's Jest setup runs in `node` and has no React
// hook-testing harness installed.
export function resolveTheme(
  theme: Theme,
  systemColorScheme: ColorSchemeName | null | undefined,
): 'light' | 'dark' {
  if (theme === 'system') return systemColorScheme === 'dark' ? 'dark' : 'light'
  return theme
}

export function getFontScale(fontSize: number): number {
  return FONT_STEPS[fontSize].scale
}

export function getFontFamily(fontFamily: number): string | undefined {
  return FONT_FAMILIES[fontFamily].family
}

export function getScaledFontStyle(
  fontFamily: string | undefined,
  scale: number,
  baseFontSize: number,
) {
  return { ...(fontFamily ? { fontFamily } : null), fontSize: Math.round(baseFontSize * scale) }
}

export function useResolvedTheme(): 'light' | 'dark' {
  const systemColorScheme = useColorScheme()
  const theme = useThemeStore((s) => s.theme)
  return resolveTheme(theme, systemColorScheme)
}

export function useFontScale(): number {
  const fontSize = useThemeStore((s) => s.fontSize)
  return getFontScale(fontSize)
}

export function useFontFamily(): string | undefined {
  const fontFamily = useThemeStore((s) => s.fontFamily)
  return getFontFamily(fontFamily)
}

export function useScaledFontStyle(baseFontSize = 16) {
  const scale = useFontScale()
  const fontFamily = useFontFamily()
  return getScaledFontStyle(fontFamily, scale, baseFontSize)
}
