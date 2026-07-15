import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import {
  deleteCache,
  getToken,
  getUser,
  onUnauthorized,
  removeToken,
  removeUser,
  setToken,
  setUser,
} from '@/shared/services'
import { getErrorMessage } from '@/shared/utils'
import { useAuthStore } from '@/store/authStore'
import { loginApi } from '../services/authApi'
import type { User } from '../types/auth.types'

interface UseAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
  login: (cpf: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  checkAuth: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const user = useAuthStore((s) => s.user)
  const error = useAuthStore((s) => s.error)
  const queryClient = useQueryClient()

  const checkAuth = useCallback(async () => {
    const store = useAuthStore.getState()
    try {
      store.setLoading(true)
      const token = await getToken()
      if (token) {
        const storedUser = await getUser<User>()
        if (storedUser) store.setAuthenticated(storedUser)
      }
    } catch {
      // Token invalid or missing — treat as not authenticated
    } finally {
      useAuthStore.getState().setLoading(false)
      useAuthStore.getState().setInitialized()
    }
  }, [])

  // Runs once per app session (guarded by isInitialized in the shared store),
  // regardless of how many components call useAuth().
  useEffect(() => {
    if (!isInitialized) checkAuth()
  }, [isInitialized, checkAuth])

  const logout = useCallback(async () => {
    await removeToken()
    await removeUser()
    queryClient.clear()
    await deleteCache('rangoo-query-cache')
    const store = useAuthStore.getState()
    store.setUnauthenticated()
    store.setError(null)
  }, [queryClient])

  // The API client already cleared the token/user on a 401 — just sync shared
  // state so the root layout's auth gate redirects to login.
  useEffect(() => {
    return onUnauthorized(() => {
      useAuthStore.getState().setUnauthenticated()
    })
  }, [])

  const login = useCallback(async (cpf: string, password: string) => {
    const store = useAuthStore.getState()
    try {
      store.setError(null)
      store.setLoading(true)
      const response = await loginApi({ user: cpf, password })
      const { token, ...profile } = response.usuario
      await setToken(token)
      await setUser(profile)
      useAuthStore.getState().setAuthenticated(profile)
    } catch (err: unknown) {
      useAuthStore.getState().setError(getErrorMessage(err))
      throw err
    } finally {
      useAuthStore.getState().setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    useAuthStore.getState().setError(null)
  }, [])

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    logout,
    clearError,
    checkAuth,
  }
}
