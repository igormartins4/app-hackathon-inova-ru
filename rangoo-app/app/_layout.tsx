import '../global.css'

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useFonts } from 'expo-font'
import { Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { useColorScheme, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'

import { colors, darkColors } from '@/config/theme'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ErrorBoundary, LoadingSpinner, OfflineBanner } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { useI18n } from '@/shared/i18n'
import { QUERY_PERSIST_MAX_AGE, queryClient, queryPersister } from '@/shared/services'
import {
  useEffectiveReducedMotion,
  useIsHighContrast,
  useResolvedTheme,
  useThemeStore,
} from '@/store/themeStore'

SplashScreen.preventAutoHideAsync()

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const resolvedTheme = useResolvedTheme()
  const highContrast = useIsHighContrast()
  const { setColorScheme } = useNativeWindColorScheme()

  useEffect(() => {
    setColorScheme(resolvedTheme === 'dark' ? 'dark' : 'light')
  }, [resolvedTheme, setColorScheme])

  return (
    <View
      className={`flex-1 ${resolvedTheme === 'dark' ? 'dark' : ''} ${highContrast ? 'high-contrast' : ''}`}
    >
      {children}
    </View>
  )
}

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth()
  const { isOffline } = useNetworkStatus()
  const resolvedTheme = useResolvedTheme()
  const reducedMotion = useEffectiveReducedMotion()
  const segments = useSegments()
  const router = useRouter()
  const { t } = useI18n()

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
    <ThemeProvider>
      <ErrorBoundary>
        <View className="flex-1">
          <OfflineBanner visible={isOffline} />
          {isLoading ? (
            <LoadingSpinner message={t.loading} />
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
                animation: reducedMotion ? 'none' : 'slide_from_right',
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="restaurante/[codigo]" />
            </Stack>
          )}
          <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        </View>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default function RootLayout() {
  const initializeI18n = useI18n((s) => s.initialize)
  const initializeTheme = useThemeStore((s) => s.initialize)
  const isThemeInitialized = useThemeStore((s) => s.isInitialized)
  const colorScheme = useColorScheme()

  const [fontsLoaded] = useFonts({
    Lora: require('../assets/fonts/Lora.ttf'),
    'JetBrains Mono': require('../assets/fonts/JetBrainsMono.ttf'),
  })

  useEffect(() => {
    initializeI18n()
  }, [initializeI18n])

  useEffect(() => {
    initializeTheme(colorScheme === 'dark' ? 'dark' : 'light')
  }, [initializeTheme, colorScheme])

  useEffect(() => {
    if (fontsLoaded && isThemeInitialized) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isThemeInitialized])

  if (!fontsLoaded || !isThemeInitialized) {
    return <View className="flex-1 bg-background" />
  }

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister, maxAge: QUERY_PERSIST_MAX_AGE }}
      >
        <AuthGate />
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  )
}
