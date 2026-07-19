jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (obj: Record<string, unknown>) => obj.android ?? obj.default ?? obj.ios,
  },
  useColorScheme: () => 'light',
  PixelRatio: {
    getFontScale: () => 1,
  },
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}))

const mockAsyncStorage: Record<string, string> = {}

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockAsyncStorage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockAsyncStorage[key] = value
    return Promise.resolve()
  }),
}))

import AsyncStorage from '@react-native-async-storage/async-storage'
import { AccessibilityInfo } from 'react-native'
import {
  FONT_FAMILIES,
  FONT_STEPS,
  getDefaultFontSizeIndex,
  getFontFamily,
  getFontScale,
  getScaledFontStyle,
  isHighContrastTheme,
  resolveReducedMotion,
  resolveTheme,
  useThemeStore,
} from '@/store/themeStore'

const INITIAL_STATE = {
  theme: 'light' as const,
  fontSize: 2,
  fontFamily: 0,
  reducedMotion: false,
  systemReducedMotion: false,
  isInitialized: false,
  hideSensitiveData: false,
}

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState(INITIAL_STATE)
    for (const key of Object.keys(mockAsyncStorage)) delete mockAsyncStorage[key]
    jest.clearAllMocks()
  })

  describe('setTheme', () => {
    it('updates the theme and persists it', () => {
      useThemeStore.getState().setTheme('dark')
      expect(useThemeStore.getState().theme).toBe('dark')
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@rangoo_theme', 'dark')
    })
  })

  describe('setFontSize', () => {
    it('sets a valid index', () => {
      useThemeStore.getState().setFontSize(3)
      expect(useThemeStore.getState().fontSize).toBe(3)
    })

    it('clamps below zero to zero', () => {
      useThemeStore.getState().setFontSize(-5)
      expect(useThemeStore.getState().fontSize).toBe(0)
    })

    it('clamps above the max step to the last index', () => {
      useThemeStore.getState().setFontSize(999)
      expect(useThemeStore.getState().fontSize).toBe(FONT_STEPS.length - 1)
    })
  })

  describe('setFontFamily', () => {
    it('sets a valid index', () => {
      useThemeStore.getState().setFontFamily(1)
      expect(useThemeStore.getState().fontFamily).toBe(1)
    })

    it('clamps out-of-range values', () => {
      useThemeStore.getState().setFontFamily(-1)
      expect(useThemeStore.getState().fontFamily).toBe(0)
      useThemeStore.getState().setFontFamily(999)
      expect(useThemeStore.getState().fontFamily).toBe(FONT_FAMILIES.length - 1)
    })
  })

  describe('nextFontFamily', () => {
    it('advances to the next family', () => {
      useThemeStore.getState().nextFontFamily()
      expect(useThemeStore.getState().fontFamily).toBe(1)
    })

    it('wraps around to the first family after the last', () => {
      useThemeStore.setState({ fontFamily: FONT_FAMILIES.length - 1 })
      useThemeStore.getState().nextFontFamily()
      expect(useThemeStore.getState().fontFamily).toBe(0)
    })
  })

  describe('increaseFontSize', () => {
    it('increments while below the max step', () => {
      useThemeStore.setState({ fontSize: 2 })
      useThemeStore.getState().increaseFontSize()
      expect(useThemeStore.getState().fontSize).toBe(3)
    })

    it('does not exceed the last step', () => {
      useThemeStore.setState({ fontSize: FONT_STEPS.length - 1 })
      useThemeStore.getState().increaseFontSize()
      expect(useThemeStore.getState().fontSize).toBe(FONT_STEPS.length - 1)
    })
  })

  describe('decreaseFontSize', () => {
    it('decrements while above zero', () => {
      useThemeStore.setState({ fontSize: 2 })
      useThemeStore.getState().decreaseFontSize()
      expect(useThemeStore.getState().fontSize).toBe(1)
    })

    it('does not go below zero', () => {
      useThemeStore.setState({ fontSize: 0 })
      useThemeStore.getState().decreaseFontSize()
      expect(useThemeStore.getState().fontSize).toBe(0)
    })
  })

  describe('toggles', () => {
    it('toggleReducedMotion flips the flag and persists it', () => {
      useThemeStore.getState().toggleReducedMotion()
      expect(useThemeStore.getState().reducedMotion).toBe(true)
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@rangoo_reduced_motion', 'true')
    })

    it('toggleHideSensitiveData flips the flag and persists it', () => {
      useThemeStore.getState().toggleHideSensitiveData()
      expect(useThemeStore.getState().hideSensitiveData).toBe(true)
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@rangoo_hide_sensitive', 'true')
    })
  })

  describe('initialize', () => {
    it('restores a valid saved theme', async () => {
      mockAsyncStorage['@rangoo_theme'] = 'dark'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('ignores an invalid saved theme', async () => {
      mockAsyncStorage['@rangoo_theme'] = 'not-a-theme'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('restores "high-contrast" as a valid saved theme', async () => {
      mockAsyncStorage['@rangoo_theme'] = 'high-contrast'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().theme).toBe('high-contrast')
    })

    it('falls back to the OS color scheme when nothing is saved', async () => {
      await useThemeStore.getState().initialize('dark')
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('migrates legacy "p"/"m"/"g" font size values', async () => {
      mockAsyncStorage['@rangoo_font_size'] = 'p'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().fontSize).toBe(0)

      useThemeStore.setState(INITIAL_STATE)
      mockAsyncStorage['@rangoo_font_size'] = 'm'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().fontSize).toBe(2)

      useThemeStore.setState(INITIAL_STATE)
      mockAsyncStorage['@rangoo_font_size'] = 'g'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().fontSize).toBe(3)
    })

    it('restores a valid numeric font size', async () => {
      mockAsyncStorage['@rangoo_font_size'] = '4'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().fontSize).toBe(4)
    })

    it('ignores an out-of-range numeric font size', async () => {
      mockAsyncStorage['@rangoo_font_size'] = '999'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().fontSize).toBe(INITIAL_STATE.fontSize)
    })

    it('restores hideSensitiveData when "true"', async () => {
      mockAsyncStorage['@rangoo_hide_sensitive'] = 'true'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().hideSensitiveData).toBe(true)
    })

    it('derives the initial font size from the OS font scale when nothing is saved', async () => {
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().fontSize).toBe(getDefaultFontSizeIndex(1))
    })

    it('restores a saved reducedMotion preference while retaining the OS preference', async () => {
      mockAsyncStorage['@rangoo_reduced_motion'] = 'true'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().reducedMotion).toBe(true)
      expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled()
    })

    it('reads the OS reduce-motion setting when nothing is saved', async () => {
      ;(AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true)
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().systemReducedMotion).toBe(true)
      expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled()
    })

    it('does not blow up if the OS reduce-motion check throws', async () => {
      ;(AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockRejectedValue(new Error('nope'))
      await expect(useThemeStore.getState().initialize()).resolves.toBeUndefined()
      expect(useThemeStore.getState().reducedMotion).toBe(false)
    })

    it('restores a valid font family index', async () => {
      mockAsyncStorage['@rangoo_font_family'] = '1'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().fontFamily).toBe(1)
    })

    it('ignores an out-of-range font family index', async () => {
      mockAsyncStorage['@rangoo_font_family'] = '999'
      await useThemeStore.getState().initialize()
      expect(useThemeStore.getState().fontFamily).toBe(INITIAL_STATE.fontFamily)
    })

    it('swallows AsyncStorage failures without throwing', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('storage unavailable'))
      await expect(useThemeStore.getState().initialize()).resolves.toBeUndefined()
    })
  })
})

describe('resolveTheme', () => {
  it('resolves "dark" to "dark"', () => {
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('resolves "light" to "light"', () => {
    expect(resolveTheme('light')).toBe('light')
  })

  it('resolves "high-contrast" to the light base tone', () => {
    expect(resolveTheme('high-contrast')).toBe('light')
  })
})

describe('isHighContrastTheme', () => {
  it('is true only for "high-contrast"', () => {
    expect(isHighContrastTheme('high-contrast')).toBe(true)
    expect(isHighContrastTheme('light')).toBe(false)
    expect(isHighContrastTheme('dark')).toBe(false)
  })
})

describe('getDefaultFontSizeIndex', () => {
  it('maps the OS font scale to the nearest FONT_STEPS index', () => {
    expect(getDefaultFontSizeIndex(0.8)).toBe(0)
    expect(getDefaultFontSizeIndex(0.9)).toBe(1)
    expect(getDefaultFontSizeIndex(1)).toBe(2)
    expect(getDefaultFontSizeIndex(1.15)).toBe(3)
    expect(getDefaultFontSizeIndex(1.5)).toBe(4)
  })
})

describe('getFontScale', () => {
  it('returns the scale for a given font step index', () => {
    expect(getFontScale(0)).toBe(FONT_STEPS[0].scale)
    expect(getFontScale(FONT_STEPS.length - 1)).toBe(FONT_STEPS[FONT_STEPS.length - 1].scale)
  })
})

describe('getFontFamily', () => {
  it('returns the family for a given index', () => {
    expect(getFontFamily(0)).toBe(FONT_FAMILIES[0].family)
    expect(getFontFamily(1)).toBe(FONT_FAMILIES[1].family)
  })
})

describe('resolveReducedMotion', () => {
  it('honors either the app or system preference', () => {
    expect(resolveReducedMotion(false, false)).toBe(false)
    expect(resolveReducedMotion(true, false)).toBe(true)
    expect(resolveReducedMotion(false, true)).toBe(true)
  })
})

describe('getScaledFontStyle', () => {
  it('scales the base font size and rounds it', () => {
    expect(getScaledFontStyle(undefined, 1.15, 16)).toEqual({ fontSize: 18 })
  })

  it('includes fontFamily only when one is set', () => {
    expect(getScaledFontStyle('Lora', 1, 16)).toEqual({ fontFamily: 'Lora', fontSize: 16 })
    expect(getScaledFontStyle(undefined, 1, 16)).toEqual({ fontSize: 16 })
  })
})
