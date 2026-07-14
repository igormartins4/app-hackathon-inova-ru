import axios, { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ERROR_MESSAGES } from '@/config'
import { emitUnauthorized } from './authEvents'
import { getMockResponse } from './mockHandler'
import { getToken, removeToken, removeUser } from './secureStorage'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000'
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false'

function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const data = getMockResponse(config)
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config,
  })
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  adapter: USE_MOCK ? mockAdapter : undefined,
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
    let userMessage: string = status
      ? (ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] ?? ERROR_MESSAGES[500])
      : ERROR_MESSAGES.NETWORK

    // Spec §10.2: on 429 the API returns `Retry-After` (seconds) — surface the
    // exact wait time instead of a generic message.
    if (status === 429) {
      const retryAfterSeconds = Number(error.response?.headers?.['retry-after'])
      error.retryAfterSeconds = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined
      if (error.retryAfterSeconds) {
        userMessage = `Muitas tentativas. Aguarde ${error.retryAfterSeconds}s e tente de novo.`
      }
    }

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
