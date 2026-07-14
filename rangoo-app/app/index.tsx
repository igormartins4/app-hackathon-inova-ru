import { Redirect } from 'expo-router'

// Root path ("/") has no screen of its own — AuthGate (app/_layout.tsx)
// bounces to (auth) or (tabs) once the auth check resolves. This just gives
// Expo Router a real match for "/" so cold boots don't hit +not-found.
export default function Index() {
  return <Redirect href="/(auth)/login" />
}
