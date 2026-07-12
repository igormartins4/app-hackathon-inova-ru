# Phase 5: History

**Goal**: Users can view their recharge and meal history with filtering
**Depends on**: Phase 3
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04

## Plans

### 05-01: Recharge history screen + API
- Create src/features/history/services/historyApi.ts
- GET /creditos/historico-recargas with pagination
- Create src/features/history/types/history.types.ts
- Create src/features/history/hooks/useRechargeHistory.ts
- Infinite scroll pagination
- Display: date, amount, status

### 05-02: Meal history screen + API
- GET /creditos/historico-refeicoes with pagination
- Optional query param: filial ("0001" to "0005") for restaurant filter
- Create src/features/history/hooks/useMealHistory.ts
- Display: date, restaurant, amount

### 05-03: Date range filter
- Create src/features/history/components/DateFilter.tsx
- Date range picker (start/end)
- Filter history by date range

### 05-04: Empty states
- "Você ainda não fez recargas no período."
- "Nenhuma refeição encontrada no período."
