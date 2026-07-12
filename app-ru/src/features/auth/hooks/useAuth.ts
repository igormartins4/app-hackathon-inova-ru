import { useCallback, useEffect, useState } from 'react'
import {
  getToken,
  getUser,
  onUnauthorized,
  removeToken,
  removeUser,
  setToken,
  setUser,
} from '@/shared/services'
import { getErrorMessage } from '@/shared/utils'
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUserState] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = await getToken()
      if (token) {
        const storedUser = await getUser<User>()
        setUserState(storedUser)
        setIsAuthenticated(true)
      }
    } catch {
      // Token invalid or missing — treat as not authenticated
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const logout = useCallback(async () => {
    await removeToken()
    await removeUser()
    setUserState(null)
    setIsAuthenticated(false)
    setError(null)
  }, [])

  // The API client already cleared the token/user on a 401 — just sync local state
  // so the root layout's auth gate redirects to login.
  useEffect(() => {
    return onUnauthorized(() => {
      setUserState(null)
      setIsAuthenticated(false)
    })
  }, [])

  const login = useCallback(async (cpf: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await loginApi({ user: cpf, password })
      await setToken(response.token)
      await setUser(response.usuario)
      setUserState(response.usuario)
      setIsAuthenticated(true)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
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
