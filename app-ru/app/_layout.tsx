import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { ErrorBoundary, LoadingSpinner, OfflineBanner } from '@/shared/components/ui';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOffline } = useNetworkStatus();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <>
        <LoadingSpinner message="Carregando" />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <ErrorBoundary>
      <View className="flex-1">
        <OfflineBanner visible={isOffline} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="history" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </ErrorBoundary>
  );
}
