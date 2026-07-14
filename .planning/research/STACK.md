# Technology Stack

**Project:** Rangoo Universitário — App de Créditos para Restaurantes Universitários
**Researched:** 2026-07-12
**Context:** Hackathon with 1-week timeline, Android-only, team of 2-3

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Expo SDK | 55.x | React Native framework | Stable release (Feb 2026), New Architecture mandatory, well-documented. SDK 56 just shipped (June 2026) — too fresh for a hackathon. | HIGH |
| React Native | 0.83 | Mobile runtime | Ships with SDK 55, 43% faster cold starts vs legacy, synchronous layouts | HIGH |
| React | 19.2 | UI library | Concurrent features (useTransition, Suspense), concurrent rendering | HIGH |
| TypeScript | 5.x | Type safety | Catch errors early, better DX with autocomplete, industry standard | HIGH |

**Why not SDK 56?** SDK 56 (React Native 0.85) shipped June 2026. For a 1-week hackathon, SDK 55 is the safer bet — stable, well-tested, all docs current. SDK 56 will have edge cases.

### Navigation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React Navigation | v7 | Screen routing | Industry standard, native bottom tabs support, deep linking | HIGH |
| @react-navigation/bottom-tabs | v7 | Bottom tab navigator | Matches PROJECT.md requirement (Home, Saldo, Recarga, Perfil) | HIGH |
| @react-navigation/native | v7 | Core navigation | Required peer dependency | HIGH |

**Why not Expo Router?** Expo Router v7 is file-based routing designed for universal (web + native) apps. Our app is Android-only. React Navigation v7 gives more explicit control over tab behavior and is the navigation layer Expo Router itself uses under the hood. For a hackathon, explicit routing is simpler to debug.

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zustand | 5.x | Client state | Lightweight, no boilerplate, already validated in interno-rotas project | HIGH |
| TanStack Query | 5.x | Server state / caching | Built-in offline cache, stale-while-revalidate, polling support (critical for PIX status) | HIGH |

**Already decided in PROJECT.md.** These are proven choices from the team's reference project.

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| NativeWind | 4.x | Utility-first CSS | Tailwind classes in React Native, fast prototyping, dark mode support | HIGH |
| Tailwind CSS | 3.4 | CSS utilities | NativeWind v4 targets Tailwind v3 (not v4) | HIGH |

**Why NativeWind over StyleSheet?** For a hackathon, utility classes are 3-5x faster to write than StyleSheet objects. The team likely knows Tailwind from web. NativeWind v4 compiles to StyleSheet at build time — zero runtime overhead.

**Why not Unistyles or Tamagui?** Unistyles requires learning a new API. Tamagui has a steep learning curve with token systems and compilers. NativeWind's value proposition is "you already know this from web."

### Animations

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React Native Reanimated | 3.x | Native-thread animations | 60fps animations, layout animations, gesture-driven. SDK 55 ships v3. | HIGH |
| React Native Gesture Handler | 2.x | Touch gestures | Required by Reanimated, better gesture handling than built-in | HIGH |

**Why not Reanimated v4?** SDK 55 ships with Reanimated v3. v4 is available for SDK 56. Stick with v3 for stability.

### Secure Storage (JWT)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| expo-secure-store | SDK 55 built-in | Token persistence | Uses Android Keystore/EncryptedSharedPreferences natively, API is simple (setItemAsync/getItemAsync) | HIGH |

**Implementation:**
```typescript
import * as SecureStore from 'expo-secure-store';

// Store JWT
await SecureStore.setItemAsync('auth_token', token);

// Retrieve JWT
const token = await SecureStore.getItemAsync('auth_token');

// Delete JWT
await SecureStore.deleteItemAsync('auth_token');
```

**Why not Keychain?** expo-secure-store wraps Android Keystore automatically. No need to touch native code.

### Offline Storage

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| react-native-mmkv | 2.x | Fast key-value cache | ~30x faster than AsyncStorage, synchronous API, encryption support | HIGH |

**Why MMKV over AsyncStorage?** MMKV is synchronous (no await for reads), 30x faster, and uses memory-mapped files. For caching balance/history that the app reads on every screen, synchronous access eliminates loading flicker.

**Alternative:** `expo-sqlite/kv-store` is also viable if you want to stay pure Expo. MMKV is faster but requires a native module (works fine with Expo dev builds).

### QR Code Generation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| react-native-qrcode-svg | 6.3.x | PIX QR code display | Mature (1.2K stars), SVG-based, supports logo embedding, works with Expo | HIGH |
| react-native-svg | SDK compatible | SVG rendering | Peer dependency of qrcode-svg | HIGH |

**Why not react-qr-code?** Both work. react-native-qrcode-svg has more React Native-specific features (logo embedding, getRef for saving). react-qr-code is more web-focused.

### PIX Payment Integration

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| FUMP API (REST) | N/A | Payment backend | Already provided, we don't choose this | HIGH |
| Custom polling logic | N/A | Payment status | Exponential backoff (3s→5s→8s→13s ± jitter), 2min timeout | HIGH |

**No PIX SDK needed.** The FUMP API generates PIX charges. Our app:
1. Calls FUMP API to create a charge
2. Receives QR code data + copy-paste code
3. Displays QR code via react-native-qrcode-svg
4. Polls FUMP API for payment status with exponential backoff
5. Shows confirmation/rejection

**Why not MercadoPago SDK?** PROJECT.md says "PIX via MercadoPago" but the API is FUMP's. The MercadoPago integration happens server-side (FUMP's responsibility). Our app just talks to FUMP's REST API.

### HTTP / API Client

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Built-in fetch | Global | HTTP requests | Available globally in React Native, no extra dependency | HIGH |
| TanStack Query | 5.x | Cache + retry | Wraps fetch with automatic retry, caching, offline support | HIGH |

**Why not axios?** Fetch is built-in and sufficient. TanStack Query handles retry/cache/offline. Adding axios is unnecessary complexity.

### Build & Deploy

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| EAS Build | Latest | Cloud APK build | No Android Studio needed, `eas build -p android --profile preview` produces APK | HIGH |
| eas-cli | 18.x+ | CLI tool | Required for EAS Build commands | HIGH |

**Configuration (eas.json):**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Development Tools

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Expo Dev Client | SDK 55 | Development builds | Required for custom native modules (MMKV, etc.) | HIGH |
| Reactotron | Latest | Debugging | Visual state inspector, network request logger | MEDIUM |
| ESLint + Prettier | Latest | Code quality | Auto-formatting, catch bugs early | HIGH |

## Complete Installation

```bash
# Create project
npx create-expo-app@latest rangoo-universitario --template blank-typescript
cd rangoo-universitario

# Core dependencies
npx expo install expo-secure-store
npx expo install react-native-mmkv
npx expo install react-native-svg
npx expo install react-native-qrcode-svg

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State management
npm install zustand @tanstack/react-query

# Styling
npm install -D nativewind tailwindcss@^3.4
npx expo install react-native-reanimated react-native-gesture-handler

# Dev tools
npm install -D @types/react @types/react-native
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Expo SDK 55 | Expo SDK 56 | Too new (1 week old), hackathon needs stability |
| Navigation | React Navigation v7 | Expo Router v7 | Android-only app doesn't need file-based routing overhead |
| Styling | NativeWind v4 | StyleSheet.create | NativeWind is 3-5x faster for prototyping with Tailwind knowledge |
| Styling | NativeWind v4 | Unistyles 3 | New API to learn, no advantage for this project scope |
| Styling | NativeWind v4 | Tamagui | Steep learning curve, overkill for Android-only app |
| Animations | Reanimated v3 | Reanimated v4 | v4 requires SDK 56, v3 is stable and sufficient |
| Offline | MMKV | AsyncStorage | MMKV is 30x faster, synchronous, better for real-time UI |
| Offline | MMKV | expo-sqlite | SQLite is overkill for key-value cache of balance/history |
| QR Code | react-native-qrcode-svg | react-qr-code | qrcode-svg has better RN support (logo, save-to-disk) |
| HTTP | fetch + TanStack Query | axios | fetch is built-in, TanStack Query handles everything else |
| Build | EAS Build | Local Android Studio | EAS is simpler, no local SDK setup needed |

## What NOT to Use

| Don't Use | Why |
|-----------|-----|
| Expo SDK 56 | Just released, potential edge cases for hackathon timeline |
| Expo Router | File-based routing overkill for Android-only 4-screen app |
| Redux / Redux Toolkit | Zustand is simpler and already validated in team's reference project |
| Axios | Unnecessary when fetch + TanStack Query covers all needs |
| AsyncStorage | MMKV is 30x faster and synchronous |
| Tamagui / Unistyles | Learning curve too steep for 1-week hackathon |
| Reanimated v4 | Requires SDK 56, v3 is sufficient |
| GraphQL | REST API is provided by FUMP, no choice involved |
| Firebase | Not needed — FUMP handles auth and payments |
| React Native Paper / Material UI | Adds bundle size, custom design is a competition requirement |

## Sources

- Expo SDK 55 Changelog (expo.dev/changelog/sdk-55) — HIGH confidence
- Expo SDK 52 Changelog (expo.dev/changelog/2024-11-12-sdk-52) — HIGH confidence
- React Navigation Docs (reactnavigation.org) — HIGH confidence
- TanStack Query Docs (tanstack.com/query) — HIGH confidence
- Zustand Docs (zustand-demo.pmnd.rs) — HIGH confidence
- NativeWind Docs (nativewind.dev) — HIGH confidence
- react-native-mmkv GitHub (mrousavy/react-native-mmkv) — HIGH confidence
- react-native-qrcode-svg npm (npmjs.com/package/react-native-qrcode-svg) — HIGH confidence
- Expo SecureStore Docs (docs.expo.dev/versions/latest/sdk/securestore) — HIGH confidence
- React Native Accessibility Docs (reactnative.dev/docs/accessibility) — HIGH confidence
- "RN Styling 2026: NativeWind vs Unistyles vs Tamagui" (reactnativerelay.com) — MEDIUM confidence
- "Expo SDK 55: Legacy Architecture Is Gone" (byteiota.com) — MEDIUM confidence
