# Architecture Patterns

**Domain:** Mobile payment app for university restaurants (PIX/Expo/React Native)
**Researched:** 2026-07-12
**Overall confidence:** HIGH

## Executive Summary

This architecture serves a focused Android app: students check RU balance and reload credits via PIX in under 30 seconds. The reference project `interno-rotas-master` (React 19, Vite, Tailwind, feature-based) confirms the team's familiarity with feature-based organization — we translate that pattern to Expo Router's file-based routing.

The architecture follows three non-negotiable principles:
1. **Server state and client state are separate libraries** — TanStack Query for API data, Zustand for UI state
2. **Features are self-contained modules** — each domain (auth, balance, recharge, profile) owns its components, hooks, services, and types
3. **Security is architectural, not bolted on** — JWT lives in Keystore via `expo-secure-store`, never in AsyncStorage or memory

## Recommended Architecture

### High-Level Structure

```
rangoo-universitario/
├── app/                          # Expo Router — file-based routes
│   ├── _layout.tsx               # Root layout: auth gate + providers
│   ├── (auth)/                   # Unauthenticated routes
│   │   ├── _layout.tsx           # Stack navigator for auth flow
│   │   └── login.tsx             # CPF + password login
│   └── (tabs)/                   # Authenticated routes
│       ├── _layout.tsx           # Bottom tab navigator
│       ├── home.tsx              # Home screen
│       ├── balance.tsx           # Balance inquiry
│       ├── recharge.tsx          # PIX recharge flow
│       └── profile.tsx           # User profile
│
├── features/                     # Feature modules (self-contained)
│   ├── auth/                     # Authentication domain
│   │   ├── hooks/
│   │   │   ├── useAuth.ts        # Auth state + login/logout mutations
│   │   │   └── useTokenStorage.ts # Secure token management
│   │   ├── services/
│   │   │   └── authApi.ts        # Login/logout API calls to FUMP
│   │   ├── types/
│   │   │   └── auth.types.ts     # LoginRequest, LoginResponse, User
│   │   └── index.ts              # Public API surface
│   │
│   ├── balance/                  # Balance inquiry domain
│   │   ├── hooks/
│   │   │   └── useBalance.ts     # Query hook with offline cache
│   │   ├── components/
│   │   │   └── BalanceCard.tsx   # Balance display with accessibility
│   │   ├── services/
│   │   │   └── balanceApi.ts     # GET /saldo endpoint
│   │   ├── types/
│   │   │   └── balance.types.ts  # BalanceResponse
│   │   └── index.ts
│   │
│   ├── recharge/                 # PIX recharge domain
│   │   ├── hooks/
│   │   │   ├── useRecharge.ts    # Create payment mutation
│   │   │   ├── usePolling.ts     # Exponential backoff polling
│   │   │   └── useQrCode.ts     # QR code rendering + copy-paste
│   │   ├── components/
│   │   │   ├── RechargeForm.tsx  # Amount selection
│   │   │   ├── QrCodeDisplay.tsx # QR code + copy-paste
│   │   │   └── StatusTimeline.tsx # Payment status visualization
│   │   ├── services/
│   │   │   └── rechargeApi.ts    # POST /pagamento + GET /status
│   │   ├── types/
│   │   │   └── recharge.types.ts # PaymentRequest, PaymentStatus, QrCode
│   │   └── index.ts
│   │
│   └── profile/                  # User profile domain
│       ├── hooks/
│       │   └── useProfile.ts     # Profile query hook
│       ├── components/
│       │   └── ProfileInfo.tsx   # User info display
│       ├── services/
│       │   └── profileApi.ts     # GET /usuario endpoint
│       ├── types/
│       │   └── profile.types.ts  # UserProfile
│       └── index.ts
│
├── shared/                       # Cross-feature shared code
│   ├── components/               # Reusable UI primitives
│   │   ├── ui/
│   │   │   ├── Button.tsx        # Accessible button (44pt+ touch target)
│   │   │   ├── Input.tsx         # Accessible text input
│   │   │   ├── Card.tsx          # Base card component
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx  # Accessible error display
│   │   └── accessibility/
│   │       ├── AccessibleText.tsx # Dynamic font scaling wrapper
│   │       └── FocusManager.tsx  # Focus management for modals
│   ├── hooks/
│   │   ├── useNetworkStatus.ts   # NetInfo connectivity monitoring
│   │   └── useAccessibility.ts   # System font size + reduce motion
│   ├── services/
│   │   ├── apiClient.ts          # Axios/fetch wrapper with auth interceptor
│   │   ├── storage.ts            # AsyncStorage abstraction (MMKV-ready)
│   │   └── queryClient.ts        # TanStack Query client config
│   ├── config/
│   │   ├── api.ts                # API base URL, endpoints
│   │   └── constants.ts          # App-wide constants
│   └── types/
│       └── common.types.ts       # Shared types (ApiResponse, Error)
│
├── store/                        # Zustand stores (client state only)
│   ├── uiStore.ts                # UI state: modals, active tab, theme
│   └── offlineQueue.ts           # Queued operations for offline sync
│
└── app.json                      # Expo configuration
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **app/(auth)** | Auth flow screens (login) | `features/auth` (hooks, services) |
| **app/(tabs)** | Tab navigation shell | All feature screens |
| **features/auth** | Login, token management, auth state | `shared/services/apiClient`, `shared/services/storage` |
| **features/balance** | Balance display + offline cache | `features/auth` (token), `shared/hooks/useNetworkStatus` |
| **features/recharge** | PIX payment flow + polling | `features/auth` (token), `features/balance` (invalidate on success) |
| **features/profile** | User profile display | `features/auth` (token) |
| **shared/components** | Reusable UI primitives | Nothing (leaf nodes) |
| **shared/services** | API client, storage, query client | `features/*` (consumed by all) |
| **store/** | Global client state | `features/*` (read/write) |

### Import Rules (Feature Isolation)

```
// ✅ ALLOWED: Feature imports from its own internals
import { useBalance } from '@/features/balance';
import { BalanceCard } from '@/features/balance/components/BalanceCard';

// ✅ ALLOWED: Feature imports from shared
import { Button } from '@/shared/components/ui/Button';
import { apiClient } from '@/shared/services/apiClient';

// ❌ FORBIDDEN: Cross-feature imports
import { useAuth } from '@/features/auth';  // FROM features/balance
// Balance should get auth state via React context or a shared hook,
// not by reaching into auth's internals
```

**Enforcement:** ESLint rule `no-restricted-imports` blocks direct cross-feature imports. Features expose public API only through their `index.ts`.

## Data Flow

### 1. Authentication Flow

```
User enters CPF + password
  → useAuth().login() mutation
    → authApi.login() calls FUMP API
      → Response: { usuario: { token, nome, email, isAluno, isColaborador } } (token dentro de usuario, v2.0 §7.1)
        → useTokenStorage().saveToken() → expo-secure-store (Keystore)
        → useAuth().setUser() → Zustand store
        → TanStack Query cache invalidated
        → Navigation: (auth) → (tabs) [automatic via auth gate]
```

**Key rule:** Token is NEVER stored in AsyncStorage, Redux, or component state. Only `expo-secure-store` (backed by Android Keystore/EncryptedSharedPreferences).

### 2. Balance Inquiry Flow

```
User opens Balance tab
  → useBalance() query hook
    → Checks TanStack Query cache (staleTime: 5min)
    → If stale/missing:
      → apiClient.get('/saldo', { Authorization: Bearer <token> })
        → Success: cache response, write to Zustand for offline fallback
        → Error: show cached data from Zustand + "offline" indicator
    → Renders BalanceCard with accessibility props
```

### 3. PIX Recharge Flow (Critical Path)

```
User selects amount → taps "Pagar com PIX"
  → useRecharge().createPayment() mutation
    → rechargeApi.createPayment({ valor, usuario_id })
      → FUMP API → MercadoPago → returns { qr_code_base64, qr_code, id }
        → Render QrCodeDisplay:
          - QR code image from base64
          - "Copiar código" button (accessibility: "Copiar código PIX para cola e cola")
          - Amount display
          - Expiry countdown timer
        → Start usePolling() with payment ID:
          - Intervals: 3s → 5s → 8s → 13s (± jitter)
          - GET /status/{id}
          - Status handling:
            - pending → continue polling
            - approved → invalidate balance query, navigate to balance, show success
            - rejected → show error, allow retry
            - cancelled → show message, allow retry
            - expired → show "PIX expirado", allow retry
          - Timeout: 2 minutes → show friendly message + retry button
```

**Key rule:** App NEVER generates PIX code server-side. QR code string comes from FUMP/MercadoPago. App only renders it.

### 4. Offline Data Flow

```
App starts (online or offline)
  → TanStack Query restores cache from AsyncStorage (PersistQueryClientProvider)
  → User sees last-known balance + "offline" indicator if no connection
  → Network status monitored via NetInfo (useNetworkStatus hook)
  → When online:
    → Stale queries auto-refetch in background
    → Offline queue operations sync to server
  → When offline:
    → Mutations queued in Zustand store (offlineQueue)
    → UI shows cached data with offline banner
    → Queue persists across app restarts via AsyncStorage
```

## Patterns to Follow

### Pattern 1: Feature Module with Public API

**What:** Each feature exposes only its public API through `index.ts`. Internal components, hooks, and services are private.

**When:** Every feature domain (auth, balance, recharge, profile).

**Example:**
```typescript
// features/balance/index.ts — PUBLIC API ONLY
export { useBalance } from './hooks/useBalance';
export { BalanceCard } from './components/BalanceCard';
export type { BalanceResponse } from './types/balance.types';

// ❌ NEVER export from internal paths
// Other features import: import { useBalance } from '@/features/balance';
// NOT: import { useBalance } from '@/features/balance/hooks/useBalance';
```

### Pattern 2: Auth Gate in Root Layout

**What:** Conditional rendering in root layout based on auth state. No manual navigation between auth/app flows.

**When:** App startup, token refresh, logout.

**Example:**
```typescript
// app/_layout.tsx
import { useAuth } from '@/features/auth';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
```

### Pattern 3: TanStack Query + Zustand Separation

**What:** TanStack Query manages server state (API data). Zustand manages client state (UI state, preferences, offline queue).

**When:** Always. Never mix server and client state in the same store.

**Example:**
```typescript
// ✅ Server state → TanStack Query
function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: () => balanceApi.getBalance(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    networkMode: 'offlineFirst',
  });
}

// ✅ Client state → Zustand
const useUIStore = create((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isOffline: false,
  setOffline: (value) => set({ isOffline: value }),
}));
```

### Pattern 4: Secure Token Storage

**What:** JWT token stored exclusively in `expo-secure-store` (backed by Android Keystore). Never in AsyncStorage, memory, or component state.

**When:** After login, before any API call, on logout.

**Example:**
```typescript
// features/auth/hooks/useTokenStorage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export function useTokenStorage() {
  return {
    saveToken: async (token: string) => {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    },
    getToken: async (): Promise<string | null> => {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    },
    removeToken: async () => {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    },
  };
}
```

### Pattern 5: Exponential Backoff Polling

**What:** Poll payment status with increasing intervals and jitter to avoid thundering herd.

**When:** After creating PIX payment, until status is terminal (approved/rejected/cancelled/expired) or timeout.

**Example:**
```typescript
// features/recharge/hooks/usePolling.ts
function usePolling(paymentId: string, onStatusChange: (status: PaymentStatus) => void) {
  const intervals = [3000, 5000, 8000, 13000]; // Base intervals in ms
  const TIMEOUT = 120000; // 2 minutes

  useEffect(() => {
    let attempt = 0;
    let timeoutId: NodeJS.Timeout;
    const startTime = Date.now();

    const poll = async () => {
      if (Date.now() - startTime > TIMEOUT) {
        onStatusChange('timeout');
        return;
      }

      const status = await rechargeApi.checkStatus(paymentId);
      onStatusChange(status);

      if (['pending'].includes(status)) {
        const baseInterval = intervals[Math.min(attempt, intervals.length - 1)];
        const jitter = Math.random() * 1000; // 0-1s jitter
        timeoutId = setTimeout(poll, baseInterval + jitter);
        attempt++;
      }
    };

    poll();
    return () => clearTimeout(timeoutId);
  }, [paymentId]);
}
```

### Pattern 6: Accessibility-First Components

**What:** Every interactive element has `accessible={true}`, `accessibilityLabel`, `accessibilityRole`, and meets 44pt minimum touch target.

**When:** Every component. Accessibility is not optional.

**Example:**
```typescript
// shared/components/ui/Button.tsx
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        padding: 16, // Generous touch target
        minHeight: 44, // WCAG 2.5.5 minimum
        borderRadius: 12,
        opacity: pressed ? 0.8 : 1,
        backgroundColor: variant === 'primary' ? '#1a73e8' : '#f1f3f4',
      })}
    >
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Server State in Zustand

**What:** Copying API responses into Zustand stores after fetch.

**Why bad:** Creates sync bugs — two sources of truth for same data. TanStack Query already caches server state.

**Instead:** Use TanStack Query's `useQuery` for all API data. Use Zustand only for UI state (modals, preferences, offline queue).

### Anti-Pattern 2: AsyncStorage for Token Storage

**What:** Using `@react-native-async-storage/async-storage` for JWT tokens.

**Why bad:** AsyncStorage is unencrypted plaintext on disk. Extractable by any app with root access or debugging tools.

**Instead:** Use `expo-secure-store` which encrypts with Android Keystore (hardware-backed on modern devices).

### Anti-Pattern 3: Cross-Feature Imports

**What:** Feature A importing directly from Feature B's internal files.

**Why bad:** Creates hidden dependencies. Refactoring Feature B breaks Feature A silently.

**Instead:** Import only from feature's `index.ts` public API. Use React context or shared hooks for cross-feature state.

### Anti-Pattern 4: Generating PIX Code on Device

**What:** Attempting to create PIX payment codes in the React Native app.

**Why bad:** PIX codes are EMV-style BR Codes tied to registered Pix keys and real charges. They MUST be generated server-side through MercadoPago.

**Instead:** App requests payment creation from FUMP API → FUMP calls MercadoPago → returns QR code string → app renders it.

### Anti-Pattern 5: Client-Side Payment Confirmation

**What:** App marking payment as "success" based on local state.

**Why bad:** Only the server knows the true payment status (via MercadoPago webhook). Client can lie to itself.

**Instead:** Always poll server for confirmed status. Show "processing" until server confirms.

## Accessibility Architecture

### WCAG AA Compliance Strategy

| Requirement | Implementation | Component |
|-------------|----------------|-----------|
| **Contrast 4.5:1** | Design tokens with pre-validated color pairs | `shared/config/theme.ts` |
| **Touch targets 44pt** | All Pressable/TouchableOpacity min 44x44 | `shared/components/ui/Button.tsx` |
| **Screen reader labels** | `accessibilityLabel` on every interactive element | Every component |
| **Semantic roles** | `accessibilityRole` for button, header, link, etc. | Every component |
| **Dynamic content** | `accessibilityLiveRegion="polite"` for status updates | `StatusTimeline.tsx`, `BalanceCard.tsx` |
| **Font scaling** | Respect system font size via `allowFontScaling` | `shared/components/accessibility/AccessibleText.tsx` |
| **Reduce motion** | Respect `prefers-reduced-motion` via `useAccessibility` | All animated components |
| **Focus management** | `AccessibilityInfo.setAccessibilityFocus` on navigation | `shared/components/accessibility/FocusManager.tsx` |

### TalkBack-Specific Considerations

- **Focus order:** Logical flow matches visual hierarchy. Use `importantForAccessibility` to control traversal.
- **Modal focus:** `accessibilityViewIsModal={true}` on modals to trap TalkBack within.
- **Live regions:** Use `accessibilityLiveRegion="polite"` for balance updates, `"assertive"` for errors.
- **State changes:** Announce payment status changes via `AccessibilityInfo.announceForAccessibility`.

## Offline Architecture

### Cache Strategy

| Data | Cache Location | TTL | Sync Strategy |
|------|----------------|-----|---------------|
| **Balance** | TanStack Query + AsyncStorage | 5 min stale, 24h cache | Background refetch on reconnect |
| **User profile** | TanStack Query + AsyncStorage | 15 min stale, 24h cache | Background refetch on reconnect |
| **Payment status** | Never cached | N/A | Always fresh from server |
| **Auth token** | expo-secure-store (Keystore) | Until logout | Never cached offline |
| **Offline queue** | Zustand + AsyncStorage | Until synced | Process on reconnect |

### Network Status Integration

```typescript
// shared/hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo';
import { useUIStore } from '@/store/uiStore';

export function useNetworkStatus() {
  const setOffline = useUIStore((s) => s.setOffline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);
}
```

## Build Order Implications

Based on component dependencies, the recommended build order:

```
Phase 1: Foundation
  └── shared/services/* (apiClient, storage, queryClient)
  └── shared/components/ui/* (Button, Input, Card)
  └── store/uiStore.ts
  └── app/_layout.tsx (auth gate skeleton)

Phase 2: Authentication
  └── features/auth/* (hooks, services, types)
  └── app/(auth)/login.tsx
  └── Token storage integration

Phase 3: Core Features
  └── features/balance/* (hooks, components, services)
  └── features/profile/* (hooks, components, services)
  └── app/(tabs)/_layout.tsx (tab navigator)
  └── app/(tabs)/home.tsx, balance.tsx, profile.tsx

Phase 4: Payment Flow
  └── features/recharge/* (hooks, components, services)
  └── app/(tabs)/recharge.tsx
  └── usePolling hook with exponential backoff
  └── QR code display + copy-paste

Phase 5: Polish
  └── Accessibility audit (TalkBack testing)
  └── Offline cache persistence
  └── Error handling + retry flows
  └── Animations + micro-interactions
```

**Rationale:**
- Phase 1-2 must complete first (auth is prerequisite for all API calls)
- Phase 3 depends on Phase 2 (balance/profile need auth token)
- Phase 4 depends on Phase 3 (recharge needs balance display for confirmation)
- Phase 5 is independent polish that can happen in parallel with Phase 4

## Scalability Considerations

| Concern | At Current Scale (Hackathon) | If App Grows (10K+ users) |
|---------|------------------------------|---------------------------|
| **State management** | Zustand + TanStack Query | Same — scales naturally |
| **Feature isolation** | ESLint rules enforce boundaries | Same — prevents spaghetti |
| **Offline cache** | AsyncStorage (sufficient) | Migrate to MMKV (30x faster) |
| **API client** | Axios/fetch wrapper | Add request dedup + retry queue |
| **Auth** | JWT in Keystore | Add biometric auth, token refresh |
| **Navigation** | Expo Router tabs | Same — file-based scales well |

## Sources

- Expo Router documentation (Context7: `/expo/expo`, HIGH confidence)
- TanStack Query offline persistence docs (Context7: `/tanstack/query`, HIGH confidence)
- MercadoPago PIX integration docs (web, MEDIUM confidence — official docs)
- React Native accessibility docs (official, HIGH confidence)
- Expo SecureStore docs (Context7 + official, HIGH confidence)
- Production Expo architecture patterns (multiple 2025-2026 sources, MEDIUM confidence)
- Feature-based architecture patterns (multiple production apps, MEDIUM confidence)
