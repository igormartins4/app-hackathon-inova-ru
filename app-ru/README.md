# InovaRU — App de Créditos para Restaurantes Universitários

App Android para estudantes da UFMG que permite consultar saldo e recarregar créditos para uso nos Restaurantes Universitários (RUs) via PIX. Desenvolvido para o Hackathon InovaRU 2026/01.

## Tech Stack

- **Runtime:** Expo SDK 57 (React Native 0.86, React 19)
- **Navigation:** Expo Router (file-based)
- **State:** TanStack Query (server state) + Zustand (client state)
- **Styling:** NativeWind v4 (Tailwind CSS 3.4)
- **Security:** expo-secure-store (Android Keystore)
- **Storage:** AsyncStorage (Expo Go-compatible local cache)
- **QR Code:** react-native-qrcode-svg
- **Animations:** React Native Reanimated v4
- **Build:** EAS Build

## Architecture

Feature-based folder structure with strict domain isolation:

```
src/
├── app/                    # Expo Router — file-based routes
│   ├── _layout.tsx         # Root layout: auth gate
│   ├── (auth)/             # Unauthenticated routes (login)
│   └── (tabs)/             # Authenticated routes (home, balance, recharge, profile)
├── features/
│   ├── auth/               # Login, token management
│   ├── balance/            # Balance display, consumer data
│   ├── recharge/           # PIX flow, QR Code, polling
│   └── history/            # Recharge and meal history
├── shared/
│   ├── components/         # Reusable UI primitives
│   │   ├── ui/             # Button, Card, Input, ErrorMessage, etc.
│   │   └── accessibility/  # AccessibleText, useAccessibility
│   ├── hooks/              # Custom hooks (useNetworkStatus, useAccessibility)
│   ├── services/           # API client, secure storage, cache
│   └── utils/              # Helpers
├── store/                  # Zustand stores (client state only)
└── config/                 # Constants, theme, error messages
```

**Data Flow:** API → TanStack Query → Components → Zustand (UI state)
**Security:** JWT in expo-secure-store, never in plaintext
**Offline:** TanStack Query stale-while-revalidate + AsyncStorage cache

## Setup

### Prerequisites

- Node.js 18+
- pnpm (`corepack enable` or `npm install -g pnpm`)
- Expo Go app (Android) or Android Studio (for emulator)

### Install

```bash
pnpm install
```

### Run

```bash
pnpm start
```

Scan the QR code with the Expo Go app. All native dependencies (AsyncStorage, secure-store, SVG, gesture-handler, reanimated, screens) ship with Expo Go — no custom development build needed.

### Android Emulator

The app connects to a mock server at `http://10.0.2.2:3000` (Android emulator localhost alias). Ensure your mock server is running on port 3000.

```bash
pnpm android
```

> **Note:** The emulator must have `android:usesCleartextTraffic="true"` for HTTP connections to the local mock server. This is already configured in debug builds.

### EAS Build

```bash
pnpm exec eas build --platform android
```

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `app/` | Expo Router file-based routes |
| `features/auth/` | Login, JWT management |
| `features/balance/` | Balance display, consumer status |
| `features/recharge/` | PIX payment flow, QR code, polling |
| `features/history/` | Recharge and meal history |
| `shared/components/ui/` | Reusable UI primitives |
| `shared/components/accessibility/` | Accessibility helpers |
| `shared/hooks/` | Custom React hooks |
| `shared/services/` | API client, storage |
| `config/` | Constants, theme tokens, errors |

## API

Connects to FUMP v2.0 API. See `src/config/constants.ts` for endpoints.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/usuarios/login` | POST | Authenticate with CPF + password |
| `/creditos/saldo` | GET | Get balance and consumer data |
| `/creditos/pagamento` | POST | Create PIX payment |
| `/creditos/pagamento/:id/status` | GET | Poll payment status |
| `/creditos/recargas` | GET | Recharge history |
| `/creditos/refeicoes` | GET | Meal history |

## License

Hackathon InovaRU 2026/01
