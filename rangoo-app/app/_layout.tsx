import '../global.css'

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ErrorBoundary, LoadingSpinner, OfflineBanner } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { QUERY_PERSIST_MAX_AGE, queryClient, queryPersister } from '@/shared/services'
import { useFontScale, useResolvedTheme, useThemeStore } from '@/store/themeStore'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initialize = useThemeStore((s) => s.initialize)
  const resolvedTheme = useResolvedTheme()
  const _fontScale = useFontScale()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <View style={{ flex: 1 }} className={resolvedTheme === 'dark' ? 'dark' : ''}>
      {children}
    </View>
  )
}

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth()
  const { isOffline } = useNetworkStatus()
  const resolvedTheme = useResolvedTheme()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/home')
    }
  }, [isAuthenticated, isLoading, segments, router])

  return (
    <ErrorBoundary>
      <View className="flex-1">
        <OfflineBanner visible={isOffline} />
        {isLoading ? (
          <LoadingSpinner message="Carregando" />
        ) : (
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        )}
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      </View>
    </ErrorBoundary>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister, maxAge: QUERY_PERSIST_MAX_AGE }}
      >
        <ThemeProvider>
          <AuthGate />
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  )
}
