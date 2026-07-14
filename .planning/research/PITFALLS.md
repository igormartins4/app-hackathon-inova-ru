# Domain Pitfalls: Rangoo Universitário Payment App

**Domain:** React Native (Expo) mobile payment app for university restaurants with PIX integration
**Researched:** 2026-07-12
**Overall Confidence:** HIGH (multiple authoritative sources cross-verified)

## Executive Summary

Building a React Native payment app with Expo, PIX integration, accessibility, offline support, and financial security touches five distinct domains where mistakes compound. The most dangerous pitfalls are not isolated — they interact. Storing tokens in AsyncStorage (security) breaks offline caching strategy (offline). Skipping accessibility labels on payment buttons (a11y) blocks screen reader users from the core value (payment). Each pitfall below maps to the InovaRU context with concrete prevention strategies.

---

## Critical Pitfalls

Mistakes that cause security breaches, payment failures, or complete rewrites.

### Pitfall 1: Storing JWT Tokens in AsyncStorage Instead of SecureStore

**What goes wrong:** The team stores the FUMP API JWT token in `AsyncStorage` for convenience. On a rooted Android device, any process can read the app's SharedPreferences directory and extract the token in plaintext. This enables full account takeover without needing the user's password.

**Why it happens:** `AsyncStorage` is the default "just works" storage in React Native. Developers reach for it automatically. The OWASP Mobile Top 10 (M1: Improper Credential Usage) lists this as the #1 finding in fintech apps.

**Consequences:** Full account takeover on rooted devices. Token extraction enables unauthorized balance transfers and PIX payments. A security audit would flag this as CRITICAL.

**Prevention:**
- Use `expo-secure-store` for JWT tokens, refresh tokens, and any PII (CPF, name)
- Never call `AsyncStorage.setItem` with any key containing `token`, `auth`, `cpf`, or `password`
- Implement a typed storage key enum to enforce correct usage:
  ```typescript
  // ✅ DO THIS
  import * as SecureStore from 'expo-secure-store';
  await SecureStore.setItemAsync('auth_token', token);
  
  // ❌ NOT THIS
  await AsyncStorage.setItem('authToken', token);
  ```

**Detection:** Grep codebase for `AsyncStorage.setItem` — any key with sensitive data is a critical finding.

**Phase:** Phase 1 (Auth + Storage) — must be correct from the start.

---

### Pitfall 2: Generating PIX QR Code Client-Side

**What goes wrong:** The app generates the PIX QR code locally instead of receiving it from the FUMP/MercadoPago backend. The BR Code (EMV-style) must be tied to a real charge and registered Pix key — generating it on the device is both insecure and incorrect.

**Why it happens:** Developers think "QR code = just render a string" without understanding that PIX QR codes are cryptographically bound to payment orders.

**Consequences:** Payment amounts can be tampered with. QR codes may not match server-side payment records. Users pay wrong amounts or payments fail silently.

**Prevention:**
- The PIX code MUST be generated server-side (FUMP API or MercadoPago)
- The app's only job is to render the QR code string returned by the backend
- Add a copy-paste button (many users paste rather than scan)
- Include expiry countdown — PIX charges expire after ~30 minutes

**Detection:** Any `qrcode` library generating codes from user-supplied amounts is wrong.

**Phase:** Phase 2 (Payment Flow) — core payment integrity.

---

### Pitfall 3: Client-Side Payment Status Confirmation

**What goes wrong:** The app polls the FUMP API and, upon receiving `status: 'approved'`, immediately grants credits to the user without waiting for server-side webhook confirmation. If the webhook is delayed or the status is stale, the user sees credits that don't actually exist.

**Why it happens:** The 30-second target encourages shortcuts. Developers assume the polling endpoint is the source of truth.

**Consequences:** Users spend credits that were never actually added. Race conditions between polling and webhook create inconsistent states. Financial reconciliation becomes impossible.

**Prevention:**
- The app waits for server-confirmed status — never assume success on its own
- Only the FUMP backend has the truth about payment status
- Implement the polling with exponential backoff (3s, 5s, 8s, 13s ± jitter) as specified
- Show "Processing" state until backend confirms — never "Success" prematurely
- Timeout at 2 minutes with a friendly message, not a false success

**Detection:** Any code path that grants credits before receiving server confirmation is wrong.

**Phase:** Phase 2 (Payment Flow) — payment integrity.

---

### Pitfall 4: Missing Idempotency Keys on Payment Requests

**What goes wrong:** When a user retries a payment (network timeout, accidental double-tap), the app sends a duplicate POST to `/creditos/pagamento` without protection. The API processes both, charging the user twice.

**Why it happens:** Idempotency is not the default behavior of REST APIs. The FUMP API v2.0 does NOT define `X-Idempotency-Key` header — there is no server-side protection against duplicate charges.

**Consequences:** Double charges. Refund disputes. Users lose trust in the app. Financial reconciliation nightmares.

**Prevention (CLIENT-SIDE ONLY):**
- ⚠️ A API FUMP NÃO suporta `X-Idempotency-Key` — não inventar headers que não existem
- Mitigação é 100% client-side: desabilitar botão de pagamento após primeiro toque
- Implementar flag `isSubmitting` para prevenir reenvio de POST em retry automático
- Nunca reenviar POST de pagamento em retry — apenas pollar status existente
- O plano 04-04 e 07-04 devem implementar esta proteção explicitamente

**Detection:** Any payment endpoint call that sends duplicate POSTs without client-side guard is a critical bug.

**Phase:** Phase 4 (Payment Flow) — payment integrity.

---

### Pitfall 5: Biometric Data Invalidation Lockout

**What goes wrong:** Using `expo-secure-store` with `requireAuthentication: true` for sensitive operations. When the user adds a new fingerprint, the system invalidates all keys protected by biometrics. The app can no longer read the stored token.

**Why it happens:** Developers don't read the Expo docs warning: "Any data protected with the `requireAuthentication` option set to `true` will become inaccessible if there are changes to the user's biometric settings."

**Consequences:** Users locked out of the app after changing biometrics. Requires re-authentication flow that may not exist.

**Prevention:**
- Store tokens in SecureStore WITHOUT `requireAuthentication` — rely on app-level auth instead
- If biometric gating is needed for specific operations, implement a fallback re-authentication flow
- Test the scenario: add fingerprint → open app → verify token is still accessible

**Detection:** Any `SecureStore.setItemAsync` with `requireAuthentication: true` for auth tokens is a risk.

**Phase:** Phase 1 (Auth + Storage) — must handle correctly.

---

## Moderate Pitfalls

Mistakes that cause poor UX, accessibility failures, or technical debt.

### Pitfall 6: Screen Reader Users Cannot Navigate Payment Flow

**What goes wrong:** The PIX payment screen has icon-only buttons (copy code, refresh QR, back) without `accessibilityLabel`. Screen reader users hear "button" with no description. The payment amount is displayed in a `Text` without `accessibilityRole="header"`. The QR code has no alt text.

**Why it happens:** Accessibility is treated as "add labels later" instead of building it in. The deadline pressure makes "it works visually" feel sufficient.

**Consequences:** WCAG AA non-compliance (the edital requires it). Screen reader users cannot complete payments. Competitive disadvantage in hackathon evaluation.

**Prevention:**
- Every interactive element gets `accessibilityLabel` and `accessibilityRole`:
  ```tsx
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel="Copiar código PIX"
    onPress={copyPixCode}
  >
    <Icon name="copy" />
  </TouchableOpacity>
  ```
- Test every screen with TalkBack enabled — navigate using swipe-right only
- Use `accessibilityLiveRegion="polite"` for payment status updates
- QR code needs `accessibilityLabel="QR Code PIX para pagamento de R$ X,XX"`
- Touch targets must be at least 44x44 points (use `hitSlop` if needed)

**Detection:** Run TalkBack and try to complete a payment. If you get stuck, it's broken.

**Phase:** Phase 3 (UI Polish) — but accessibility props must be in code from Phase 1.

---

### Pitfall 7: Font Scaling Breaks Payment Layout

**What goes wrong:** When the user increases system font size to 1.7x or higher, the payment amount overflows its container, buttons become unclickable, and the QR code screen becomes unusable. The team hardcoded `fontSize: 16` everywhere.

**Why it happens:** Developers design at default font size. Android allows up to 200% text scaling. Fixed-height containers clip scaled text.

**Consequences:** Users with low vision cannot use the app. WCAG AA failure. Layout broken for a significant user segment.

**Prevention:**
- Use `allowFontScaling={true}` (default) — never disable it
- Test at 200% font scale on Android
- Use `flex` layouts instead of fixed heights
- Set `minHeight` on touch targets to ensure they remain tappable
- Use `responsiveWidth` or similar for critical dimensions

**Detection:** Increase Android font size to maximum → navigate every screen → look for overflow/clipping.

**Phase:** Phase 3 (UI Polish) — but layout must be resilient from Phase 1.

---

### Pitfall 8: Offline Cache Shows Stale Balance as Truth

**What goes wrong:** The app caches the user's balance for offline display. When the user pays at the RU (deducting credits), the app still shows the old cached balance. The user thinks they have more credits than they do.

**Why it happens:** Offline caching is implemented as "just store the last API response" without considering that the balance changes outside the app (at the RU terminal).

**Consequences:** Users overspend. Confusion at the RU when balance is insufficient. Trust erosion.

**Prevention:**
- Display cached balance with a clear "last updated" timestamp
- Show a visual indicator when data is potentially stale (e.g., "Saldo aproximado")
- Immediately invalidate cache when user performs any action
- On app resume, always attempt to fetch fresh balance
- Use TanStack Query's `staleTime` to auto-refresh
- Consider a banner: "Conecte-se para atualizar o saldo"

**Detection:** Test: cache balance → pay at RU → check app → see stale balance without warning.

**Phase:** Phase 4 (Offline) — cache invalidation strategy.

---

### Pitfall 9: Concurrent Sync Runs Corrupt Data

**What goes wrong:** The app triggers sync from multiple sources simultaneously: AppState change, NetInfo change, manual refresh, screen focus. Two sync operations run in parallel, creating duplicate entries or database locks.

**Why it happens:** Developers add sync triggers without a central coordinator. "Just call sync() whenever something changes" seems reasonable.

**Consequences:** Duplicate PIX payment requests. "Database is locked" errors. Inconsistent offline state. Hard-to-debug race conditions.

**Prevention:**
- Implement a single `SyncManager` that runs at most one sync at a time
- Use a boolean lock (`isSyncing`) to prevent concurrent runs
- All sync triggers call `requestSync()` which checks the lock
- Use an outbox pattern: write locally → queue sync → process sequentially
- Reference pattern from DEV.to article: "I triggered sync from everywhere... caused concurrent sync runs, duplicated pushes, and random 'database is locked' errors"

**Detection:** Add logging to sync operations — if two start within 100ms of each other, it's broken.

**Phase:** Phase 4 (Offline) — sync architecture.

---

### Pitfall 10: MercadoPago Sandbox vs Production Key Confusion

**What goes wrong:** The team uses MercadoPago test credentials in production or vice versa. The app works perfectly in testing but fails when users try real payments. Or: test keys in production allow free payments.

**Why it happens:** Environment variables are hardcoded or `.env` files aren't properly managed. No visual indicator of which environment is active.

**Consequences:** Real charges with test keys (financial loss). Test keys in production (security breach). Users see confusing error messages.

**Prevention:**
- Separate `.env.development` and `.env.production` files
- Add environment indicator in dev builds (banner or screen title)
- Never commit real credentials to git (use `.gitignore`)
- Test the full payment flow with real credentials before shipping
- Use Expo environment variables properly: `process.env.EXPO_PUBLIC_MP_ACCESS_TOKEN`

**Detection:** Search codebase for hardcoded API keys or access tokens.

**Phase:** Phase 2 (Payment Flow) — environment configuration.

---

### Pitfall 11: Payment Expiry Without User Notification

**What goes wrong:** PIX charges expire after ~30 minutes. The app shows the QR code but doesn't track or display the expiry. Users copy the code, switch to their banking app, and paste an expired code. Payment fails silently.

**Why it happens:** The team focuses on the happy path (payment succeeds) and ignores the expiry edge case.

**Consequences:** Confused users. Failed payments without clear error messages. Support burden.

**Prevention:**
- Display countdown timer on the QR code screen
- Show clear status: "Expira em X minutos"
- When expired, show prominent "Gerar novo código" button
- Auto-refresh or prompt user to regenerate before expiry
- Handle `expired` status in the polling state machine

**Detection:** Test: generate QR code → wait 30+ minutes → try to pay → verify clear error message.

**Phase:** Phase 2 (Payment Flow) — payment UX.

---

## Minor Pitfalls

Mistakes that cause annoyances, tech debt, or missed optimization opportunities.

### Pitfall 12: Using AsyncStorage for Non-Sensitive Cache

**What goes wrong:** The team uses `AsyncStorage` for caching balance and history (non-sensitive but performance-critical). AsyncStorage is 30x slower than MMKV and unencrypted. On older Android devices, reads take 100-200ms.

**Why it happens:** AsyncStorage is the "standard" recommendation in many tutorials. MMKV is newer and less documented.

**Prevention:**
- Use `react-native-mmkv` for fast cache reads (balance, history)
- Use `expo-secure-store` only for small secrets (tokens, keys)
- AsyncStorage is acceptable ONLY for non-sensitive, non-performance-critical preferences (theme, language)
- Tiered storage: SecureStore → MMKV → AsyncStorage (by sensitivity)

**Detection:** Profile cache reads — if >50ms, consider MMKV.

**Phase:** Phase 1 (Storage) — architecture decision.

---

### Pitfall 13: Not Testing on Real Android Devices

**What goes wrong:** The team tests only on Android emulators. Emulators don't have real TalkBack behavior, real font scaling, real network conditions, or real biometric hardware. The APK crashes on real devices.

**Why it happens:** Emulators are convenient. Real device testing requires physical access or cloud services.

**Prevention:**
- Test on at least 2 real Android devices (different screen sizes, Android versions)
- Use Expo's device testing via EAS Build
- Test TalkBack on real hardware — emulator behavior differs
- Test with poor network (airplane mode toggle)
- Budget time for real device testing in the timeline

**Detection:** If you haven't touched a real Android phone with the app, it's not tested.

**Phase:** All phases — continuous testing.

---

### Pitfall 14: Hardcoding Strings Instead of Using i18n

**What goes wrong:** All UI strings are hardcoded in Portuguese. While the project scope is PT-only, hardcoded strings make it impossible to add languages later and make testing harder (can't verify all strings are translated).

**Why it happens:** "It's just Portuguese" seems sufficient. Deadlines prevent forward-thinking.

**Prevention:**
- Use a strings constants file at minimum (even if not full i18n)
- Group strings by screen/feature
- Enables future localization if the project expands
- Makes it easier to find and update all user-facing text

**Detection:** Grep for hardcoded Portuguese strings in JSX — if found in multiple files, consolidate.

**Phase:** Phase 1 (Foundation) — easy to do correctly from the start.

---

### Pitfall 15: Ignoring Expo Go Limitations

**What goes wrong:** The team develops in Expo Go and assumes the final APK will behave identically. Expo Go doesn't support native modules like `expo-secure-store` biometric auth, custom native configurations, or some notification features.

**Why it happens:** Expo Go is the default development environment. Developers don't realize it's a sandbox with limitations.

**Prevention:**
- Use `npx expo prebuild` + development builds for any feature requiring native modules
- Test the payment flow in a development build, not Expo Go
- `expo-secure-store` works in Expo Go but biometric `requireAuthentication` does not
- Any native module (SSL pinning, jailbreak detection) requires prebuild
- Build the APK via EAS Build early to verify the pipeline works

**Detection:** If you've never run `eas build` or `npx expo run:android`, you're not testing the real app.

**Phase:** Phase 1 (Foundation) — set up development build workflow.

---

### Pitfall 16: Not Handling Payment Status Edge Cases

**What goes wrong:** The polling state machine only handles `pending` and `approved`. It ignores `rejected`, `cancelled`, and `expired`. Users see an infinite "Processing..." screen when their payment fails.

**Why it happens:** Developers implement the happy path and assume failures are rare.

**Consequences:** Users think the app is broken. They retry, potentially creating duplicate charges. No clear path to recovery.

**Prevention:**
- Implement ALL status handlers: `pending`, `approved`, `rejected`, `cancelled`, `expired`
- Each status needs a clear user-facing message:
  - `rejected`: "Pagamento não autorizado. Tente outro método ou verifique seus dados."
  - `cancelled`: "Pagamento cancelado."
  - `expired`: "Código expirado. Gere um novo código PIX."
- Provide clear CTAs for each failure state (retry, go back, contact support)

**Detection:** Test each status manually by mocking the API response.

**Phase:** Phase 2 (Payment Flow) — complete state machine.

---

### Pitfall 17: Animations That Violate Reduce Motion

**What goes wrong:** The team adds beautiful micro-interactions and animations (as required by the edital). Users with vestibular disorders who have "Reduce Motion" enabled in system settings still see all animations, causing discomfort.

**Why it happens:** `AccessibilityInfo.isReduceMotionEnabled()` is not checked before playing animations.

**Prevention:**
- Check `Reduce Motion` preference before playing animations
- Substitute opacity transitions for motion-heavy animations
- Use `react-native-reanimated` with conditional animation configs
- Honor the system preference as a sign of quality engineering

**Detection:** Enable "Remove animations" in Android accessibility settings → use the app.

**Phase:** Phase 3 (UI Polish) — animation accessibility.

---

### Pitfall 18: Expo SecureStore Size Limits

**What goes wrong:** The team tries to store large JSON objects (full user profile, transaction history) in SecureStore. iOS rejects values over 2048 bytes silently or with cryptic errors.

**Why it happens:** Developers treat SecureStore as a general-purpose encrypted storage without reading the docs.

**Prevention:**
- SecureStore is for small secrets only (tokens, keys, small PII)
- Store large data in MMKV or SQLite with a SecureStore-protected encryption key
- Keep SecureStore payloads under 2KB
- Handle native errors when storing values

**Detection:** Log SecureStore write results — any failure indicates size or platform issues.

**Phase:** Phase 1 (Storage) — architecture decision.

---

### Pitfall 19: Deep Link Validation Missing

**What goes wrong:** The app registers a URL scheme for deep linking (e.g., `rangoo://payment/confirm`). An attacker crafts a malicious deep link that triggers unintended actions or redirects to a phishing page.

**Why it happens:** Deep links are often added for convenience without security review. OWASP Mobile Top 10 M4 (Insufficient Input/Output Validation) specifically calls this out.

**Prevention:**
- Validate all deep link parameters before acting on them
- Never execute actions from deep links without user confirmation
- Use universal links (HTTPS-based) instead of custom URL schemes when possible
- Sanitize any user-controlled data from deep link parameters

**Detection:** Try crafting a malicious deep link — if it triggers an action without validation, it's vulnerable.

**Phase:** Phase 3 (Polish) — if deep links are implemented.

---

### Pitfall 20: Race Condition Between Auth Check and UI Render

**What goes wrong:** The app checks for a stored token on mount. While the async check is running, the login screen renders briefly, then jumps to the main screen. Users see a flash of the login screen.

**Why it happens:** Token check is async. The app renders before the check completes.

**Prevention:**
- Implement a proper loading/splash screen state
- Use TanStack Query's `enabled` option to gate data fetching on auth state
- Show a loading indicator while checking authentication
- Don't render protected screens until auth is confirmed

**Detection:** Cold start the app — if you ever see the login screen flash, it's broken.

**Phase:** Phase 1 (Auth) — loading state management.

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Phase 1: Auth & Storage | AsyncStorage for tokens (Pitfall 1) | Use expo-secure-store from day 1 |
| Phase 1: Auth & Storage | Biometric invalidation (Pitfall 5) | Don't use requireAuthentication for tokens |
| Phase 1: Auth & Storage | Race condition on auth check (Pitfall 20) | Loading state before render |
| Phase 1: Auth & Storage | SecureStore size limits (Pitfall 18) | Tokens only, not large data |
| Phase 2: Payment Flow | Client-side QR generation (Pitfall 2) | Backend generates all PIX codes |
| Phase 2: Payment Flow | Client-side status confirmation (Pitfall 3) | Wait for server confirmation |
| Phase 4: Payment Flow | No server-side idempotency (Pitfall 4) | Client-side isSubmitting guard, no retry POST |
| Phase 2: Payment Flow | MercadoPago key confusion (Pitfall 10) | Separate env files, visual indicator |
| Phase 2: Payment Flow | Payment expiry UX (Pitfall 11) | Countdown timer + regeneration |
| Phase 2: Payment Flow | Incomplete status handling (Pitfall 16) | Handle all 5 statuses explicitly |
| Phase 3: UI & Accessibility | Screen reader navigation (Pitfall 6) | Labels on every interactive element |
| Phase 3: UI & Accessibility | Font scaling breaks layout (Pitfall 7) | Test at 200%, use flex layouts |
| Phase 3: UI & Accessibility | Animations vs Reduce Motion (Pitfall 17) | Check preference before animating |
| Phase 3: UI & Accessibility | Deep link validation (Pitfall 19) | Validate all parameters |
| Phase 4: Offline & Polish | Stale balance display (Pitfall 8) | Timestamp + visual indicator |
| Phase 4: Offline & Polish | Concurrent sync runs (Pitfall 9) | Single SyncManager with lock |
| All phases | No real device testing (Pitfall 13) | Budget real device testing time |
| All phases | AsyncStorage for cache (Pitfall 12) | Use MMKV for performance-critical data |

---

## Interaction Map: How Pitfalls Compound

```
Pitfall 1 (AsyncStorage tokens) + Pitfall 9 (Concurrent sync)
  → Tokens get corrupted during parallel sync operations
  
Pitfall 2 (Client-side QR) + Pitfall 4 (No idempotency)
  → Double charges with tamperable amounts
  
Pitfall 3 (Client-side confirmation) + Pitfall 8 (Stale balance)
  → User sees credits that don't exist, tries to spend them
  
Pitfall 6 (No a11y labels) + Pitfall 11 (No expiry notification)
  → Screen reader users can't complete payments AND don't know codes expire
  
Pitfall 10 (Key confusion) + Pitfall 4 (No idempotency)
  → Test keys process real payments without duplicate protection
```

---

## Quick Reference: The 5 Things That Must Be Right

1. **Tokens in SecureStore, not AsyncStorage** — security foundation
2. **PIX codes from backend only** — payment integrity
3. **Client-side double-tap guard (no server idempotency)** — prevent double charges
4. **Accessibility labels from day 1** — WCAG AA compliance
5. **Server confirms payment, not client** — financial truth

---

## Sources

- OWASP Mobile Top 10 for React Native Fintech Apps (DEV.to, 2026-05-16) — HIGH confidence
- MercadoPago PIX Integration Documentation (mercadopago.com.br, current) — HIGH confidence
- VP0: Pix Payment QR Code Screen in React Native (2026-06-04) — HIGH confidence
- Expo SecureStore Documentation (docs.expo.dev, current) — HIGH confidence
- React Native Accessibility Guide (reactnative.dev, 2026-05-25) — HIGH confidence
- React Native Accessibility Gotchas (vinicius.io, 2026) — MEDIUM confidence
- Offline-First SQLite Sync in Expo (DEV.to, 2026-01-23) — MEDIUM confidence
- Tiered Secure Storage in React Native (warrendeleon.com, 2026-05-11) — MEDIUM confidence
- React Native Payment Processing Pitfalls (DEV.to, 2026-05-07) — MEDIUM confidence
- WatermelonDB + Expo SDK 54 Guide (DEV.to, 2026-05-11) — MEDIUM confidence
