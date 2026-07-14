# Project Research Summary

**Project:** Rangoo Universitário — App de Créditos para Restaurantes Universitários
**Domain:** Mobile payment app for university meal plans (Brazilian context)
**Researched:** 2026-07-12
**Confidence:** HIGH

## Executive Summary

InovaRU is a focused Android-only mobile payment application for Brazilian university restaurant (RU) systems, enabling students to check meal balances and recharge credits via PIX in under 30 seconds. The research concludes this is a well-defined hackathon project with clear technical constraints: Expo SDK 55, React Native, FUMP API integration, and a 1-week timeline. The recommended approach is a feature-based architecture using Expo Router's file-based routing, with TanStack Query for server state, Zustand for client state, and NativeWind for rapid UI prototyping with Tailwind CSS.

The critical success factor is strict adherence to security and payment integrity patterns from day one. JWT tokens must be stored exclusively in `expo-secure-store` (Android Keystore), PIX QR codes must be generated server-side by the FUMP API, and every payment request needs an idempotency key to prevent double charges. The research identifies 20 pitfalls spanning security, payment processing, accessibility, and offline behavior, with the most dangerous being the compounding interaction between incorrect token storage and concurrent sync operations.

The hackathon's differentiator opportunity lies in accessibility: WCAG AA+ compliance is explicitly required by the edital (competition rules) yet poorly implemented in competing university RU apps. Building accessibility-first (TalkBack labels, font scaling, touch targets) from Phase 1 creates competitive advantage while preventing costly rewrites. The offline-first architecture addresses the reality of unreliable campus connectivity, using MMKV for fast local cache and TanStack Query's stale-while-revalidate pattern for seamless online/offline transitions.

## Key Findings

### Recommended Stack

The research recommends a proven, stable stack optimized for hackathon velocity and reliability. Expo SDK 55 (not 56) provides the stability needed for a 1-week timeline — SDK 56 shipped June 2026 and introduces unnecessary risk. The team's familiarity with Tailwind CSS (from the `interno-rotas` reference project) makes NativeWind 4.x the clear choice for styling, delivering 3-5x faster prototyping than StyleSheet objects.

**Core technologies:**
- **Expo SDK 55.x** — React Native framework, stable release with New Architecture mandatory
- **React Navigation v7** — Explicit bottom tab routing, simpler debugging than Expo Router for Android-only apps
- **Zustand 5.x** — Client state management, lightweight with no boilerplate, validated in team's reference project
- **TanStack Query 5.x** — Server state/cache with built-in offline support, stale-while-revalidate, and polling
- **NativeWind 4.x** — Tailwind CSS in React Native, compiles to StyleSheet at build time (zero runtime overhead)
- **expo-secure-store** — JWT token storage backed by Android Keystore (hardware-backed encryption)
- **react-native-mmkv** — 30x faster than AsyncStorage for offline cache, synchronous API
- **react-native-qrcode-svg** — Mature QR code renderer with logo embedding for PIX display
- **EAS Build** — Cloud APK builds without local Android Studio setup

### Expected Features

The feature set is tightly scoped by PROJECT.md constraints. PIX payment integration is the core value proposition, with balance check and transaction history as supporting utilities. The research identifies a clear critical path: Login → Balance → PIX Flow → Confirmation.

**Must have (table stakes):**
- **CPF + Password Login** — Standard Brazilian university auth, FUMP API handles authentication
- **Balance Check** — Core utility, must work offline with staleness indicator
- **PIX Payment Flow** — QR code display, copy-paste code, amount entry, status polling
- **Transaction History** — Students track spending, verify charges (cache last 30 days)
- **Secure Token Storage** — JWT in encrypted Keystore, never in plaintext
- **Error Handling** — Network failures, expired PIX, API errors with PT-BR messages
- **Offline Balance Cache** — Last known balance with timestamp for unreliable campus networks
- **Basic Accessibility** — TalkBack labels, contrast, 48dp touch targets (hackathon requirement)

**Should have (competitive):**
- **Extreme Accessibility (WCAG AA+)** — Differentiator per edital rules, social impact
- **Fluid Microinteractions** — Animations for balance refresh, PIX success, tab transitions
- **Offline-First Architecture** — Seamless low-connectivity experience
- **Real-Time PIX Status Polling** — Exponential backoff (3s→5s→8s→13s) with visual progress
- **<30 Second Recharge** — Core value proposition, 3-tap optimized flow

**Defer (v2+):**
- Advanced accessibility (Switch Access, extended font scaling)
- Push notifications for low balance
- Transaction export/statistics
- Biometric authentication (fingerprint/PIN unlock)

### Architecture Approach

The architecture follows three non-negotiable principles: server state and client state use separate libraries (TanStack Query vs Zustand), features are self-contained modules with public API surfaces, and security is architectural (JWT in Keystore, never bolted on). The directory structure separates `app/` (file-based routes), `features/` (auth, balance, recharge, profile modules), `shared/` (reusable UI primitives and services), and `store/` (Zustand client state).

**Major components:**
1. **Auth Feature** — Login flow, token management, auth gate in root layout
2. **Balance Feature** — Balance display with offline cache, staleness indicators
3. **Recharge Feature** — PIX payment flow with QR code rendering and exponential backoff polling
4. **Profile Feature** — User profile display (minimal complexity)
5. **Shared Layer** — Reusable UI primitives (Button, Input, Card), API client, storage abstractions

**Key patterns to follow:**
- Feature modules expose public API only through `index.ts` (no cross-feature imports)
- Auth gate in root layout renders `(auth)` or `(tabs)` based on token state
- TanStack Query for all API data, Zustand only for UI state and offline queue
- `expo-secure-store` for JWT tokens, MMKV for fast cache, AsyncStorage only for non-sensitive preferences
- Exponential backoff polling with jitter (3s→5s→8s→13s) and 2-minute timeout
- Accessibility-first components with `accessibilityLabel`, `accessibilityRole`, 44pt minimum touch targets

### Critical Pitfalls

The research identifies 20 pitfalls across 5 domains (security, payment, accessibility, offline, polish). The most dangerous are:

1. **Storing JWT in AsyncStorage** — Android Keystore extraction enables full account takeover. Use `expo-secure-store` exclusively.
2. **Client-side PIX QR generation** — PIX codes are cryptographically bound to charges; must come from FUMP/MercadoPago backend.
3. **Missing idempotency keys** — Payment retries without `X-Idempotency-Key` header cause double charges.
4. **Client-side payment confirmation** — Polling endpoint is not source of truth; wait for server webhook confirmation.
5. **Accessibility labels as afterthought** — Adding labels in Phase 3 creates rework; must be in code from Phase 1.

**Pitfall compounding risk:** Storing tokens in AsyncStorage (security) + concurrent sync runs (offline) → tokens get corrupted during parallel operations. Client-side QR generation + missing idempotency → double charges with tamperable amounts.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Auth
**Rationale:** Auth is prerequisite for all API calls; security patterns must be correct from day one. Token storage architecture affects every subsequent feature.
**Delivers:** Project setup, shared services (API client, storage), auth flow with secure token storage, basic UI primitives.
**Addresses:** CPF + Password Login, Secure Token Storage
**Avoids:** Pitfall 1 (AsyncStorage tokens), Pitfall 5 (biometric invalidation), Pitfall 20 (auth race condition), Pitfall 18 (SecureStore size limits)
**Stack:** Expo SDK 55, React Navigation v7, Zustand, TanStack Query, expo-secure-store
**Research flags:** None — well-documented patterns

### Phase 2: Core Features (Balance + Profile)
**Rationale:** Balance check is core utility; depends on auth token from Phase 1. Profile is minimal complexity, builds on same patterns.
**Delivers:** Balance display with offline cache, user profile, tab navigation structure.
**Addresses:** Balance Check, Offline Balance Cache, Transaction History (partial)
**Avoids:** Pitfall 12 (AsyncStorage for cache), Pitfall 8 (stale balance display)
**Stack:** TanStack Query (server state), MMKV (offline cache), NativeWind (styling)
**Research flags:** None — standard CRUD patterns

### Phase 3: Payment Flow
**Rationale:** Core value proposition; depends on auth (Phase 1) and balance display (Phase 2). Most complex feature with security-critical requirements.
**Delivers:** Complete PIX recharge flow: amount selection, QR code display, copy-paste, status polling with exponential backoff.
**Addresses:** PIX Payment Flow, Real-Time PIX Status Polling, <30 Second Recharge
**Avoids:** Pitfall 2 (client-side QR), Pitfall 3 (client-side confirmation), Pitfall 4 (missing idempotency), Pitfall 10 (MercadoPago key confusion), Pitfall 11 (payment expiry), Pitfall 16 (incomplete status handling)
**Stack:** react-native-qrcode-svg, FUMP API integration, exponential backoff polling
**Research flags:** **Needs research** — FUMP API specifics (endpoint structure, error codes, idempotency requirements)

### Phase 4: Accessibility & Polish
**Rationale:** WCAG AA+ is a hackathon differentiator; accessibility props must be in code from Phase 1 but full audit and polish happens here. Animations and micro-interactions add competitive polish.
**Delivers:** TalkBack-tested navigation, font scaling resilience, animation accessibility, error state refinement, visual polish.
**Addresses:** Extreme Accessibility (WCAG AA+), Fluid Microinteractions, Creative Original Design
**Avoids:** Pitfall 6 (screen reader navigation), Pitfall 7 (font scaling), Pitfall 17 (animations vs reduce motion)
**Stack:** React Native Reanimated 3.x, AccessibilityInfo APIs
**Research flags:** **Needs research** — WCAG AA mobile-specific requirements, TalkBack best practices

### Phase 5: Offline & Deployment
**Rationale:** Offline-first architecture is final integration layer; EAS Build pipeline must work early but final APK testing happens here.
**Delivers:** Complete offline cache with background sync, EAS Build APK, real device testing, final bug fixes.
**Addresses:** Offline-First Architecture, Low Balance Alerts (if time permits)
**Avoids:** Pitfall 8 (stale balance), Pitfall 9 (concurrent sync), Pitfall 13 (no real device testing), Pitfall 15 (Expo Go limitations)
**Stack:** MMKV, NetInfo, EAS Build
**Research flags:** None — offline patterns well-documented

### Phase Ordering Rationale

- **Auth-first dependency chain:** All features require authentication token; Phase 1 must complete before any API integration
- **Balance before payment:** Students need to see current balance before recharging; recharge flow should show "previous balance" and "new balance after recharge"
- **Payment as standalone phase:** PIX flow is security-critical with 6 specific pitfalls; deserves focused attention without competing priorities
- **Accessibility woven throughout:** Props added in Phase 1-2, full audit in Phase 4; prevents costly rewrites
- **Offline as integration layer:** Cache strategy affects all features; implementing last ensures consistent patterns
- **Pitfall avoidance drives order:** Security patterns (Phase 1) → payment integrity (Phase 3) → accessibility compliance (Phase 4) → offline reliability (Phase 5)

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Payment Flow):** FUMP API documentation — endpoint structure, error codes, idempotency requirements, polling intervals
- **Phase 4 (Accessibility):** WCAG AA mobile-specific criteria, TalkBack testing patterns, Android font scaling behavior

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Expo + React Navigation + Zustand + TanStack Query is well-documented
- **Phase 2 (Core Features):** Standard CRUD with offline cache, established patterns
- **Phase 5 (Offline & Deployment):** MMKV + EAS Build + NetInfo is documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Expo SDK 55, React Navigation v7, Zustand, TanStack Query — all well-documented with official sources |
| Features | HIGH | PROJECT.md constraints clear, Brazilian RU app survey completed, PIX payment patterns established |
| Architecture | HIGH | Feature-based architecture validated in team's reference project, patterns match industry best practices |
| Pitfalls | HIGH | 20 pitfalls identified with concrete prevention strategies, OWASP and MercadoPago documentation cited |

**Overall confidence:** HIGH

### Gaps to Address

- **FUMP API specifics:** Endpoint structure, authentication flow, error codes, idempotency requirements — needs API documentation review during Phase 3 planning
- **MercadoPago integration details:** How FUMP handles PIX code generation — unclear if FUMP proxies MercadoPago or generates codes directly
- **Campus connectivity patterns:** Real-world network conditions at target university — affects offline cache TTL and sync strategy
- **Android device fragmentation:** Minimum Android version target, TalkBack behavior across versions — affects accessibility implementation
- **Competition edital details:** Exact WCAG AA requirements, evaluation criteria for accessibility — affects Phase 4 scope

## Sources

### Primary (HIGH confidence)
- Expo SDK 55 Changelog (expo.dev/changelog/sdk-55) — Framework version, API compatibility
- React Navigation Docs (reactnavigation.org) — Navigation patterns, bottom tabs
- TanStack Query Docs (tanstack.com/query) — Server state, offline persistence, polling
- Zustand Docs (zustand-demo.pmnd.rs) — Client state management
- Expo SecureStore Docs (docs.expo.dev/versions/latest/sdk/securestore) — Token storage, Keystore integration
- MercadoPago PIX Integration Documentation (mercadopago.com.br) — PIX payment requirements
- OWASP Mobile Top 10 for React Native Fintech Apps (DEV.to, 2026-05-16) — Security pitfalls
- React Native Accessibility Docs (reactnative.dev/docs/accessibility) — WCAG AA compliance

### Secondary (MEDIUM confidence)
- NativeWind Docs (nativewind.dev) — Tailwind CSS in React Native
- react-native-mmkv GitHub (mrousavy/react-native-mmkv) — Fast offline storage
- "RN Styling 2026: NativeWind vs Unistyles vs Tamagui" (reactnativerelay.com) — Styling comparison
- Brazilian university RU apps (UFDPar, Unicamp, USP, UFC, UFSC) — Feature comparison
- Offline-First SQLite Sync in Expo (DEV.to, 2026-01-23) — Sync patterns

### Tertiary (LOW confidence)
- FUMP API documentation (unavailable — needs direct consultation)
- Campus connectivity patterns (no direct data — assumption-based)

---
*Research completed: 2026-07-12*
*Ready for roadmap: yes*