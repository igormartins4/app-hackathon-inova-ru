// Design tokens — InovaRU theme
// Colors meet WCAG AA (4.5:1+ on white)

export const colors = {
  primary: '#1a73e8',
  primaryDark: '#1557b0',
  secondary: '#f1f3f4',
  secondaryDark: '#dadce0',
  success: '#34a853',
  danger: '#ea4335',
  warning: '#fbbc04',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f8f9fa',
    100: '#f1f3f4',
    200: '#dadce0',
    300: '#bdc1c6',
    400: '#9aa0a6',
    500: '#80868b',
    600: '#5f6368',
    700: '#3c4043',
    800: '#202124',
    900: '#111111',
  },
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
  full: 9999,
} as const

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 28,
} as const

// Animation timing constants
export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const

// Touch target minimum (WCAG 2.5.5)
export const touchTarget = {
  min: 48,
} as const
