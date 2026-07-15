import { create } from 'zustand'
import type { User } from '@/features/auth/types/auth.types'

interface AuthStoreState {
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  user: User | null
  error: string | null
  // Set when a valid JWT+user already sit in SecureStore from a previous
  // session, but restoring it still requires biometric confirmation (or a
  // fresh manual login) — see useBiometricAuth. Never holds a password.
  pendingUser: User | null
}

interface AuthStoreActions {
  setAuthenticated: (user: User) => void
  setUnauthenticated: () => void
  setPendingUser: (user: User | null) => void
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
  pendingUser: null,
  setAuthenticated: (user) => set({ isAuthenticated: true, user, error: null, pendingUser: null }),
  setUnauthenticated: () => set({ isAuthenticated: false, user: null }),
  setPendingUser: (pendingUser) => set({ pendingUser }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: () => set({ isInitialized: true }),
  setError: (error) => set({ error }),
}))
