# Roadmap: InovaRU

## Overview

InovaRU is an Android app for UFMG students to check meal balances and recharge RU credits via PIX in under 30 seconds. The roadmap follows a foundation→features→polish trajectory across 10 phases, designed for a 2-3 person team working 1 week (12/07–18/07). Each phase delivers a complete, verifiable capability. Accessibility is woven throughout from Phase 1 (not bolted on), and offline resilience is built incrementally. The critical path is: Setup → Auth → Balance → PIX Payment → Polish → Ship.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Foundation** - Expo setup, navigation, shared services, build pipeline
- [ ] **Phase 2: Authentication** - Login flow with secure JWT storage and token management
- [ ] **Phase 3: Balance & Profile** - Balance display, user profile, tab navigation
- [ ] **Phase 4: PIX Payment Flow** - Complete recharge: amount → QR Code → polling → confirmation
- [ ] **Phase 5: History** - Recharge and meal history with pagination and date filtering
- [ ] **Phase 6: Offline & Connectivity** - Network-aware caching, stale-while-revalidate, offline UX
- [ ] **Phase 7: Error Handling & Resilience** - Retry logic, HTTP error handling, user-friendly messages
- [ ] **Phase 8: Accessibility** - TalkBack, WCAG AA contrast, font scaling, Switch Access
- [ ] **Phase 9: Design & Polish** - Creative UI, fluid animations, visual consistency
- [ ] **Phase 10: Build & Delivery** - EAS Build APK, GitHub repo, README, final QA

## Phase Details

### Phase 1: Project Foundation
**Goal**: The app scaffolding, navigation structure, and shared services are ready for feature development
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, BLD-01, BLD-04
**Success Criteria** (what must be TRUE):
  1. App launches on Android emulator/device with bottom tab navigation (Home, Saldo, Recarga, Perfil)
  2. API client (axios) with interceptors and base URL configuration is working
  3. expo-secure-store and MMKV storage abstractions are initialized and testable
  4. Shared UI primitives (Button, Input, Card, LoadingSpinner) render correctly
  5. Git repository exists with initial commits and feature-based directory structure
  6. `network_security_config.xml` configurado para permitir HTTP em debug ao `10.0.2.2`
**Plans**: TBD

Plans:
- [ ] 01-01: Expo project init, dependencies, directory structure
- [ ] 01-02: React Navigation v7 bottom tabs setup
- [ ] 01-03: Shared services (API client, storage abstractions)
- [ ] 01-04: Shared UI primitives (Button, Input, Card, LoadingSpinner)
- [ ] 01-05: NativeWind configuration and theme system
- [ ] 01-06: Configurar `network_security_config.xml` no Android para habilitar tráfego HTTP ao IP `10.0.2.2` em debug

### Phase 2: Authentication
**Goal**: Users can securely log in with CPF + password and the app manages JWT tokens correctly
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can enter CPF (11 digits) + password and submit login form
  2. JWT token is stored in expo-secure-store (never in plaintext) and retrieved on app launch
  3. App redirects to login screen when token expires (HTTP 401 response)
  4. App shows friendly message when rate limited (HTTP 429)
  5. Password is never persisted on device (verified: no password in storage)
**Plans**: TBD

Plans:
- [ ] 02-01: Login screen with CPF input (masked, 11 digits) + password field
- [ ] 02-02: Auth API integration (POST to FUMP endpoint) + token handling
- [ ] 02-03: Secure token storage (expo-secure-store) + auto-refresh logic
- [ ] 02-04: Auth gate in root layout (login vs tabs routing)
- [ ] 02-05: Error handling for 401, 429, and network failures

### Phase 3: Balance & Profile
**Goal**: Users can view their current balance and account information with offline fallback
**Depends on**: Phase 2
**Requirements**: BALC-01, BALC-02, BALC-03, BALC-04, BALC-05, BALC-06
**Success Criteria** (what must be TRUE):
  1. User can see current balance (credito_disponivel) on the Saldo tab
  2. User can see consumer data (nome, tipo_consumidor, centro_custo, situacao) on Perfil tab
  3. Balance data is cached locally and displayed when offline (with staleness indicator)
  4. Pull-to-refresh updates balance from API
  5. Se `situacao == "B"`, botão de recarga está desabilitado com orientação para FUMP
**Plans**: TBD

Plans:
- [ ] 03-01: Balance screen with data display and pull-to-refresh
- [ ] 03-02: Profile screen with consumer data
- [ ] 03-03: TanStack Query setup with MMKV offline cache
- [ ] 03-04: Staleness indicator for cached data

### Phase 4: PIX Payment Flow
**Goal**: Users can complete a full PIX recharge in under 30 seconds with clear status feedback
**Depends on**: Phases 2, 3
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07, PAY-08, PAY-09
**Success Criteria** (what must be TRUE):
  1. User can select recharge value (R$ 5,00 to R$ 500,00) and generate a PIX payment
  2. QR Code image is displayed and PIX code (copia-e-cola) can be copied with one tap
  3. App polls payment status with exponential backoff (3s→5s→8s→13s ± jitter)
  4. All payment statuses are handled: pending, approved, rejected, cancelled, expired
  5. After 2 minutes, polling stops with a friendly timeout message; user can retry
**Plans**: TBD

Plans:
- [ ] 04-01: Amount selection screen (preset values + custom input)
- [ ] 04-02: PIX QR Code generation and display (react-native-qrcode-svg)
- [ ] 04-03: Copy PIX code functionality
- [ ] 04-04: Exponential backoff polling with status screen. ⚠️ Nuança `approved`: só considerar sucesso se `creditado == true`. Se `approved` com `creditado == false`, manter polling (webhook ainda não creditou). Não confundir com tabela simplificada da seção 8 do PDF.
- [ ] 04-05: Confirmation screen with new balance after success
- [ ] 04-06: Timeout handling and retry flow
- [ ] 04-07: Criar arquivo de configuração Mock (Mockoon ou JSON Server) com respostas exatas da API v2.0, incluindo transição de status `pending` → `approved`

### Phase 5: History
**Goal**: Users can view their recharge and meal history with filtering
**Depends on**: Phase 3
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04
**Success Criteria** (what must be TRUE):
  1. User can scroll through recharge history with pagination (infinite scroll or load-more)
  2. User can filter history by date range
  3. User can view meal history with pagination
  4. History data is cached locally for offline display
**Plans**: TBD

Plans:
- [ ] 05-01: Recharge history screen with pagination
- [ ] 05-02: Date range filter component
- [ ] 05-03: Meal history screen with pagination
- [ ] 05-04: History caching with MMKV

### Phase 6: Offline & Connectivity
**Goal**: The app degrades gracefully when offline and syncs seamlessly when connectivity returns
**Depends on**: Phases 3, 4, 5
**Requirements**: OFFL-01, OFFL-02, OFFL-03, OFFL-04
**Success Criteria** (what must be TRUE):
  1. Connection status indicator is visible on all screens (online/offline)
  2. Balance and history use stale-while-revalidate: show cached data immediately, refresh in background
  3. App shows a friendly offline message when there's no connectivity
  4. PIX payment flow is blocked when offline with clear messaging ("Connect to internet to recharge")
**Plans**: TBD

Plans:
- [ ] 06-01: Network state management (NetInfo integration)
- [ ] 06-02: Connection status indicator component
- [ ] 06-03: Stale-while-revalidate pattern for all data queries
- [ ] 06-04: Offline payment flow guard

### Phase 7: Error Handling & Resilience
**Goal**: Every failure scenario has a clear, user-friendly response with automatic recovery where possible
**Depends on**: Phases 2, 4
**Requirements**: ERR-01, ERR-02, ERR-03, ERR-04
**Success Criteria** (what must be TRUE):
  1. Network errors trigger automatic retry (up to 3 attempts) with visual feedback
  2. All error messages are in Portuguese, clear, and free of technical jargon
  3. Manual retry/fallback option is available when automatic retry fails
  4. HTTP errors (400, 401, 403, 404, 422, 429, 500) each have an appropriate user-friendly message
**Plans**: TBD

Plans:
- [ ] 07-01: Retry utility with exponential backoff
- [ ] 07-02: Error message system (PT-BR, per HTTP status)
- [ ] 07-03: Error boundary components with manual fallback
- [ ] 07-04: Integration across all API calls

### Phase 8: Accessibility
**Goal**: The app is fully usable by people with visual, motor, or cognitive impairments
**Depends on**: Phases 1–7
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07
**Success Criteria** (what must be TRUE):
  1. All screens are fully navigable with TalkBack (screen reader) — every element has a label
  2. All text meets WCAG AA contrast ratio (4.5:1 normal text, 3:1 large text)
  3. All touch targets are minimum 48x48dp
  4. Font size is adjustable and the layout remains usable at larger sizes
  5. App respects system "reduce motion" setting (animations disabled when enabled)
**Plans**: TBD

Plans:
- [ ] 08-01: TalkBack audit and accessibilityLabel fixes
- [ ] 08-02: WCAG AA contrast audit and color adjustments
- [ ] 08-03: Touch target sizing audit (48x48dp minimum)
- [ ] 08-04: Font scaling resilience testing
- [ ] 08-05: Reduce motion support and Switch Access testing

### Phase 9: Design & Polish
**Goal**: The app has a distinctive, creative visual identity with fluid microinteractions
**Depends on**: Phases 1–8
**Requirements**: UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. Design is creative and original — not a generic template (per hackathon evaluation criteria)
  2. Animations and microinteractions are fluid (tab transitions, loading states, success feedback)
  3. Visual language is consistent across all screens (colors, typography, spacing, iconography)
**Plans**: TBD

Plans:
- [ ] 09-01: Design system finalization (colors, typography, spacing tokens)
- [ ] 09-02: Tab transition animations (React Native Reanimated)
- [ ] 09-03: Loading state animations and microinteractions
- [ ] 09-04: PIX success celebration animation

### Phase 10: Build & Delivery
**Goal**: The app is built, tested, and ready for hackathon submission
**Depends on**: Phases 1–9
**Requirements**: BLD-01, BLD-02, BLD-03, BLD-04
**Success Criteria** (what must be TRUE):
  1. Public GitHub repository with clean commit history throughout development
  2. README.md includes technologies, setup instructions, and architecture description
  3. APK is generated via EAS Build and installs/runs correctly on a real Android device
  4. All commits are continuous (no empty gaps in git log)
**Plans**: TBD

Plans:
- [ ] 10-01: Final code review and cleanup
- [ ] 10-02: README.md with tech stack, setup, architecture, screenshots
- [ ] 10-03: EAS Build configuration and APK generation
- [ ] 10-04: Real device testing and final bug fixes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Note: Phases 3, 4 can be parallelized only if balance query hook is built first in Phase 3 (recharge needs it for PAY-09 confirmation). Phases 6, 7 can also run in parallel.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 0/6 | Not started | - |
| 2. Authentication | 0/5 | Not started | - |
| 3. Balance & Profile | 0/4 | Not started | - |
| 4. PIX Payment Flow | 0/7 | Not started | - |
| 5. History | 0/4 | Not started | - |
| 6. Offline & Connectivity | 0/4 | Not started | - |
| 7. Error Handling & Resilience | 0/4 | Not started | - |
| 8. Accessibility | 0/5 | Not started | - |
| 9. Design & Polish | 0/4 | Not started | - |
| 10. Build & Delivery | 0/4 | Not started | - |
