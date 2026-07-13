import { create } from 'zustand'
import type { User } from '@/features/auth/types/auth.types'

interface AuthStoreState {
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  user: User | null
  error: string | null
}

interface AuthStoreActions {
  setAuthenticated: (user: User) => void
  setUnauthenticated: () => void
  setLoading: (loading: boolean) => void
  setInitialized: () => void
  setError: (error: string | null) => void
}

// Single source of truth for auth state. useAuth() previously kept this in a
// per-component useState, so a login() call in LoginScreen never reached the
// AuthGate instance in app/_layout.tsx — the redirect to (tabs) never fired.
export const useAuthStore = create<AuthStoreState & AuthStoreActions>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  user: null,
  error: null,
  setAuthenticated: (user) => set({ isAuthenticated: true, user, error: null }),
  setUnauthenticated: () => set({ isAuthenticated: false, user: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: () => set({ isInitialized: true }),
  setError: (error) => set({ error }),
}))
