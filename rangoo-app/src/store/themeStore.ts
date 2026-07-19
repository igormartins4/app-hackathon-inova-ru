import AsyncStorage from '@react-native-async-storage/async-storage'
import { AccessibilityInfo, PixelRatio, Platform, type TextStyle } from 'react-native'
import { create } from 'zustand'

// 3 opções mutuamente exclusivas — sem cruzamento de "escuro" x "alto
// contraste" como antes (2 toggles independentes geravam 4 combinações).
// Alto contraste é sempre a variante clara (mais luminosidade/legibilidade,
// não uma tela escura) — ver resolveThemeColors/resolveGradientColors em
// src/config/theme.ts.
export type Theme = 'light' | 'dark' | 'high-contrast'

let reduceMotionSubscription: { remove: () => void } | undefined

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
const STORAGE_KEY_REDUCED_MOTION = '@rangoo_reduced_motion'
const STORAGE_KEY_FONT_FAMILY = '@rangoo_font_family'
const STORAGE_KEY_HIDE_SENSITIVE = '@rangoo_hide_sensitive'

interface ThemeStoreState {
  theme: Theme
  fontSize: number
  fontFamily: number
  reducedMotion: boolean
  systemReducedMotion: boolean
  isInitialized: boolean
  hideSensitiveData: boolean
  setTheme: (theme: Theme) => void
  setFontSize: (index: number) => void
  setFontFamily: (index: number) => void
  nextFontFamily: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  toggleReducedMotion: () => void
  toggleHideSensitiveData: () => void
  initialize: (systemColorScheme?: 'light' | 'dark' | null) => Promise<void>
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  theme: 'light',
  fontSize: DEFAULT_FONT_INDEX,
  fontFamily: DEFAULT_FONT_FAMILY_INDEX,
  reducedMotion: false,
  systemReducedMotion: false,
  isInitialized: false,
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
  initialize: async (systemColorScheme) => {
    try {
      const [savedTheme, savedFontSize, savedReducedMotion, savedFontFamily, savedHideSensitive] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_THEME),
          AsyncStorage.getItem(STORAGE_KEY_FONT_SIZE),
          AsyncStorage.getItem(STORAGE_KEY_REDUCED_MOTION),
          AsyncStorage.getItem(STORAGE_KEY_FONT_FAMILY),
          AsyncStorage.getItem(STORAGE_KEY_HIDE_SENSITIVE),
        ])
      const updates: Partial<ThemeStoreState> = {}
      if (savedTheme && ['light', 'dark', 'high-contrast'].includes(savedTheme)) {
        updates.theme = savedTheme as Theme
      } else if (systemColorScheme === 'dark') {
        // Nunca abre em "system" (não existe mais como valor persistido) nem
        // em alto-contraste por padrão — só puxa claro/escuro do SO na
        // primeira abertura, sem preferência salva ainda.
        updates.theme = 'dark'
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
      } else {
        // Sem preferência manual salva — parte do multiplicador de fonte de
        // acessibilidade do próprio SO, mapeado pro degrau mais próximo.
        updates.fontSize = getDefaultFontSizeIndex(PixelRatio.getFontScale())
      }
      if (savedReducedMotion === 'true') updates.reducedMotion = true
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
    try {
      set({ systemReducedMotion: Boolean(await AccessibilityInfo.isReduceMotionEnabled()) })
    } catch {}
    if (!reduceMotionSubscription && typeof AccessibilityInfo.addEventListener === 'function') {
      reduceMotionSubscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled) => {
          set({ systemReducedMotion: enabled })
        },
      )
    }
    set({ isInitialized: true })
  },
}))

// Pure decision logic, extracted so it's unit-testable without rendering a
// component — this project's Jest setup runs in `node` and has no React
// hook-testing harness installed.
//
// Alto contraste é sempre resolvido pra base "light" — é a variante clara que
// usa mais luminância/contraste, nunca uma tela escura (ver src/config/theme.ts).
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'dark' ? 'dark' : 'light'
}

export function isHighContrastTheme(theme: Theme): boolean {
  return theme === 'high-contrast'
}

// Mapeia o multiplicador de fonte do SO (PixelRatio.getFontScale()) pro
// degrau mais próximo de FONT_STEPS, usado só como valor INICIAL quando não
// há preferência manual salva — o usuário continua livre pra ajustar com os
// botões +/-, e o ajuste manual passa a ter prioridade e persiste normalmente.
export function getDefaultFontSizeIndex(systemFontScale: number): number {
  if (systemFontScale <= 0.85) return 0
  if (systemFontScale <= 0.95) return 1
  if (systemFontScale <= 1.05) return 2
  if (systemFontScale <= 1.2) return 3
  return 4
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
  return useThemeStore((s) => resolveTheme(s.theme))
}

export function useIsHighContrast(): boolean {
  return useThemeStore((s) => isHighContrastTheme(s.theme))
}

export function useFontScale(): number {
  const fontSize = useThemeStore((s) => s.fontSize)
  return getFontScale(fontSize)
}

export function useFontFamily(): string | undefined {
  const fontFamily = useThemeStore((s) => s.fontFamily)
  return getFontFamily(fontFamily)
}

export function resolveReducedMotion(
  reducedMotion: boolean,
  systemReducedMotion: boolean,
): boolean {
  return reducedMotion || systemReducedMotion
}

export function useEffectiveReducedMotion(): boolean {
  return useThemeStore((s) => resolveReducedMotion(s.reducedMotion, s.systemReducedMotion))
}

export function useScaledFontStyle(baseFontSize = 16) {
  const scale = useFontScale()
  const fontFamily = useFontFamily()
  return getScaledFontStyle(fontFamily, scale, baseFontSize)
}
