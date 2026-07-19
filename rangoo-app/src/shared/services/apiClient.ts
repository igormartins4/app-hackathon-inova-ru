import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ERROR_MESSAGES } from '@/config'
import { emitUnauthorized } from './authEvents'
import { deleteCache } from './cacheStorage'
import { getMockResponse } from './mockHandler'
import { queryClient } from './queryClient'
import { getToken, removeToken, removeUser } from './secureStorage'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000'
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false'

// O adapter mock não passa pelo pipeline padrão do axios, então `config.params`
// nunca vira querystring de verdade em `config.url` — sem isso, todo filtro
// via query param (filial, dataInicio, dataFim etc.) seria silenciosamente
// ignorado pelo mockHandler, que só lê a URL.
function appendParamsToUrl(url: string, params?: Record<string, unknown>): string {
  if (!params) return url
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value))
  }
  const qs = search.toString()
  if (!qs) return url
  return `${url}${url.includes('?') ? '&' : '?'}${qs}`
}

function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const url = appendParamsToUrl(config.url ?? '', config.params)
  const mock = getMockResponse({ ...config, url })
  const response = {
    data: mock.data,
    status: mock.status,
    statusText: mock.statusText ?? (mock.status >= 400 ? 'Error' : 'OK'),
    headers: new AxiosHeaders(mock.headers),
    config,
  }

  if (mock.status >= 400) {
    return Promise.reject(new AxiosError('Mock API error', undefined, config, undefined, response))
  }

  return Promise.resolve(response)
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
  async (error) => {
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
      // Token expired/invalid — clear everything and let the auth layer redirect to login.
      await removeToken()
      await removeUser()
      queryClient.clear()
      await deleteCache('rangoo-query-cache')
      emitUnauthorized()
    }

    return Promise.reject(error)
  },
)
