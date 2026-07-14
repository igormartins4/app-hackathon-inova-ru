import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme } from 'react-native'
import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'
type FontSize = 'p' | 'm' | 'g'

const FONT_SCALE: Record<FontSize, number> = {
  p: 0.85,
  m: 1.0,
  g: 1.15,
}

const STORAGE_KEY_THEME = '@rangoo_theme'
const STORAGE_KEY_FONT_SIZE = '@rangoo_font_size'

interface ThemeStoreState {
  theme: Theme
  fontSize: FontSize
  setTheme: (theme: Theme) => void
  setFontSize: (size: FontSize) => void
  initialize: () => Promise<void>
}

export const useThemeStore = create<ThemeStoreState>((set, _get) => ({
  theme: 'system',
  fontSize: 'm',
  setTheme: (theme) => {
    set({ theme })
    AsyncStorage.setItem(STORAGE_KEY_THEME, theme)
  },
  setFontSize: (fontSize) => {
    set({ fontSize })
    AsyncStorage.setItem(STORAGE_KEY_FONT_SIZE, fontSize)
  },
  initialize: async () => {
    try {
      const [savedTheme, savedFontSize] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_THEME),
        AsyncStorage.getItem(STORAGE_KEY_FONT_SIZE),
      ])
      const updates: Partial<ThemeStoreState> = {}
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        updates.theme = savedTheme as Theme
      }
      if (savedFontSize && ['p', 'm', 'g'].includes(savedFontSize)) {
        updates.fontSize = savedFontSize as FontSize
      }
      if (Object.keys(updates).length > 0) {
        set(updates)
      }
    } catch {}
  },
}))

export function useResolvedTheme(): 'light' | 'dark' {
  const systemColorScheme = useColorScheme()
  const theme = useThemeStore((s) => s.theme)

  if (theme === 'system') return systemColorScheme === 'dark' ? 'dark' : 'light'
  return theme
}

export function useFontScale(): number {
  const fontSize = useThemeStore((s) => s.fontSize)
  return FONT_SCALE[fontSize]
}

export function useScaledFontSize(baseSize: number): number {
  const scale = useFontScale()
  return Math.round(baseSize * scale)
}
