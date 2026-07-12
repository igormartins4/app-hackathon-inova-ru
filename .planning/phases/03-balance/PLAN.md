# Phase 3: Balance & Profile

**Goal**: Users can view their current balance and account information with offline fallback
**Depends on**: Phase 2
**Requirements**: BALC-01, BALC-02, BALC-03, BALC-04, BALC-05, BALC-06

## Success Criteria

1. User can see current balance (credito_disponivel) on the Saldo tab
2. User can see consumer data (nome, tipo_consumidor, centro_custo, situacao) on Perfil tab
3. Balance data is cached locally and displayed when offline (with staleness indicator)
4. Pull-to-refresh updates balance from API
5. Se situacao == "B", botão de recarga está desabilitado com orientação para FUMP
6. Se 404 (consumidor inativo), exibir mensagem e desabilitar recarga

## Plans

### 03-01: Balance screen with data display and pull-to-refresh
- Create balance screen at app/(tabs)/balance.tsx
- Display credito_disponivel and limite_recarga
- Pull-to-refresh using TanStack Query
- Show loading state with LoadingSpinner
- Show error state with ErrorMessage
- accessibilityLabel on all data points

### 03-02: Balance API integration + types
- Create src/features/balance/services/balanceApi.ts
- GET /creditos/saldo with auth token
- Response: { consumidor: {...}, saldo: { credito_disponivel, limite_recarga } }
- Create src/features/balance/types/balance.types.ts
- Create src/features/balance/hooks/useBalance.ts
- TanStack Query hook with staleTime: 5min

### 03-03: Profile screen with consumer data
- Create profile screen at app/(tabs)/profile.tsx
- Display: nome, email, tipo_consumidor, centro_custo, situacao
- Use user data from auth + balance data
- accessibilityLabel on all data points

### 03-04: Consumer status handling (B, I)
- Create src/features/balance/hooks/useConsumerStatus.ts
- If situacao == "B" → disable recharge button, show alert
- If 404 (inactive) → show error, disable recharge
- Pass status to recharge feature via shared state or context

### 03-05: Offline cache for balance
- Use TanStack Query with MMKV cache
- Show "Dado aproximado" indicator when showing cached data
- StaleWhileRevalidate pattern

### 03-06: Tests for balance validation
- Test recharge limit calculation (if confirmed with FUMP)
- Test status handling logic
