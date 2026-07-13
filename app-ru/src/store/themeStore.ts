import { useColorScheme } from 'react-native'
import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStoreState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}))

export function useResolvedTheme(): 'light' | 'dark' {
  const systemColorScheme = useColorScheme()
  const theme = useThemeStore((s) => s.theme)

  if (theme === 'system') return systemColorScheme === 'dark' ? 'dark' : 'light'
  return theme
}
