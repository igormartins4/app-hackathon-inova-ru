# Phase 1: Project Foundation

**Goal**: The app scaffolding, navigation structure, and shared services are ready for feature development
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, BLD-01, BLD-04

## Success Criteria

1. App launches on Android emulator/device with bottom tab navigation (Home, Saldo, Recarga, Perfil)
2. API client (axios) with interceptors and base URL configuration is working
3. expo-secure-store and MMKV storage abstractions are initialized and testable
4. Shared UI primitives (Button, Input, Card, LoadingSpinner) render correctly
5. Git repository exists with initial commits and feature-based directory structure
6. `network_security_config.xml` configurado para permitir HTTP em debug ao `10.0.2.2`

## Plans

### 01-01: Expo project init, dependencies, directory structure
- Init Expo SDK 55 project with TypeScript
- Install core dependencies: @react-navigation/native, @tanstack/react-query, zustand, nativewind, expo-secure-store, react-native-mmkv, react-native-qrcode-svg, react-native-reanimated
- Create feature-based directory structure: `src/features/{auth,balance,recharge,profile}`, `src/shared/{components,hooks,services,utils}`, `src/store`, `src/config`
- Configure TypeScript strict mode
- Configure Biome for linting/formatting

### 01-02: React Navigation v7 bottom tabs setup
- Install @react-navigation/bottom-tabs
- Create tab navigator with 4 tabs: Home, Saldo, Recarga, Perfil
- Setup Expo Router file-based routing with (tabs) group
- Configure tab icons and labels

### 01-03: Shared services (API client, storage abstractions)
- Create `src/shared/services/apiClient.ts` with axios, auth interceptor, base URL from env
- Create `src/shared/services/secureStorage.ts` wrapping expo-secure-store
- Create `src/shared/services/cacheStorage.ts` wrapping MMKV
- Create `src/shared/services/queryClient.ts` for TanStack Query

### 01-04: Shared UI primitives (Button, Input, Card, LoadingSpinner)
- Create `src/shared/components/ui/Button.tsx` with 48x48dp touch target, accessibilityLabel
- Create `src/shared/components/ui/Input.tsx` with accessible text input
- Create `src/shared/components/ui/Card.tsx` base card component
- Create `src/shared/components/ui/LoadingSpinner.tsx`
- Create `src/shared/components/ui/ErrorMessage.tsx`

### 01-05: NativeWind configuration and theme system
- Install nativewind, tailwindcss
- Configure tailwind.config.js with project theme
- Create `src/config/theme.ts` with design tokens
- Ensure NativeWind works with Expo SDK 55

### 01-06: network_security_config.xml para HTTP em debug
- Create `android/app/src/main/res/xml/network_security_config.xml`
- Allow cleartext traffic to `10.0.2.2` (emulator host)
- Reference in AndroidManifest.xml
- Enable `usesCleartextTraffic="true"` for debug builds

## Verification

After execution, verify:
1. `npx expo start` launches without errors
2. Bottom tabs render with 4 screens
3. API client can be imported and configured
4. SecureStore and MMKV abstractions are testable
5. All shared components render without errors
