// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const

// Polling config — exponential backoff with jitter
export const POLLING = {
  INTERVALS: [3000, 5000, 8000, 13000] as const,
  TIMEOUT: 120_000, // 2 minutes
  JITTER_MS: 1000, // ±1s
} as const
