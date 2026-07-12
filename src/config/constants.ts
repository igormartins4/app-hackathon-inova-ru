// API endpoints — FUMP v2.0
// Base URL for Android emulator pointing to local mock server

export const API = {
  BASE_URL: 'http://10.0.2.2:3000',
  LOGIN: '/usuarios/login',
  SALDO: '/creditos/saldo',
  PAGAMENTO: '/creditos/pagamento',
  PAGAMENTO_STATUS: (paymentId: number | string) =>
    `/creditos/pagamento/${paymentId}/status`,
} as const

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

// Recharge limits
export const RECHARGE = {
  MIN: 5.0,
  MAX: 500.0,
} as const
