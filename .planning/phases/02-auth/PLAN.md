# Phase 2: Authentication

**Goal**: Users can securely log in with CPF + password and the app manages JWT tokens correctly
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05

## Success Criteria

1. User can enter CPF (11 digits) + password and submit login form
2. JWT token is stored in expo-secure-store (never in plaintext) and retrieved on app launch
3. App redirects to login screen when token expires (HTTP 401 response)
4. App shows friendly message when rate limited (HTTP 429)
5. Password is never persisted on device (verified: no password in storage)

## Plans

### 02-01: Login screen with CPF input (masked, 11 digits) + password field
- Create login screen with CPF and password inputs
- CPF mask: XXX.XXX.XXX-XX → strips to 11 digits before sending
- Password field with secureTextEntry
- Form validation: CPF exactly 11 digits, password not empty
- Submit button with loading state
- accessibilityLabel on all elements

### 02-02: Auth API integration (POST to FUMP endpoint) + token handling
- Create `src/features/auth/services/authApi.ts`
- POST /usuarios/login with { user: "11_digitos", password: "..." }
- Response (Especificação Técnica API InovaRU v2.0, seção 7.1): { usuario: { token: "...", nome, email, isAluno, isColaborador } }
- Token is INSIDE usuario, not at root — destructure `token` out before storing the profile
- Store token in expo-secure-store via shared/services/secureStorage
- Store user data (without token) in secureStorage

### 02-03: Secure token storage (expo-secure-store) + auto-refresh logic
- Use existing secureStorage service from Phase 1
- On app launch: check if token exists → if yes, validate with API
- If token invalid/expired → redirect to login
- Logout: clear token + user from secureStorage

### 02-04: Auth gate in root layout (login vs tabs routing)
- Update app/_layout.tsx with auth state check
- If no token → show (auth) stack
- If token exists → show (tabs) stack
- Loading state while checking auth

### 02-05: Error handling for 401, 429, and network failures
- Map HTTP errors to PT-BR messages per AGENTS.md §4:
  - 401 → "Usuário ou senha inválidos."
  - 429 → "Muitas tentativas. Aguarde um momento e tente de novo."
  - Network → "Sem conexão. Verifique sua internet e tente novamente."
- Show error message below form
- Never show raw error to user

### 02-06: Tests for auth logic
- Test CPF mask strips to exactly 11 digits
- Test auth state transitions (loading → success → error)
- Test token storage/retrieval
