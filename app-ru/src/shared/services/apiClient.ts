import axios from 'axios'
import { ERROR_MESSAGES } from '@/config'
import { emitUnauthorized } from './authEvents'
import { getToken, removeToken, removeUser } from './secureStorage'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from SecureStore to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize errors into user-friendly messages (PT-BR) without losing the
// original Error instance — callers rely on `instanceof Error` upstream.
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status as number | undefined
    const userMessage = status
      ? (ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] ?? ERROR_MESSAGES[500])
      : ERROR_MESSAGES.NETWORK

    error.userMessage = userMessage

    if (status === 401) {
      // Token expired/invalid — clear it and let the auth layer redirect to login.
      removeToken()
      removeUser()
      emitUnauthorized()
    }

    return Promise.reject(error)
  },
)
