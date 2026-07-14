import '../global.css'

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { View } from 'react-native'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ErrorBoundary, LoadingSpinner, OfflineBanner } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { QUERY_PERSIST_MAX_AGE, queryClient, queryPersister } from '@/shared/services'
import { useThemeStore } from '@/store/themeStore'

function ThemeInitializer() {
  const initialize = useThemeStore((s) => s.initialize)
  useEffect(() => {
    initialize()
  }, [initialize])
  return null
}

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth()
  const { isOffline } = useNetworkStatus()
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
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        )}
        <StatusBar style="auto" />
      </View>
    </ErrorBoundary>
  )
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: QUERY_PERSIST_MAX_AGE }}
    >
      <ThemeInitializer />
      <AuthGate />
    </PersistQueryClientProvider>
  )
}
