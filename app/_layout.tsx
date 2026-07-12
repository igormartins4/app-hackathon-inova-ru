import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

// Auth gate placeholder — always show tabs for now.
// Phase 2 will check token in expo-secure-store and conditionally render (auth) vs (tabs).
export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}
