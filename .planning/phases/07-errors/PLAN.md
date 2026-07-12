# Phase 7: Error Handling & Resilience

**Goal**: Every failure scenario has a clear, user-friendly response
**Depends on**: Phases 2, 4
**Requirements**: ERR-01, ERR-02, ERR-03, ERR-04

## Plans

### 07-01: Error message constants
- Create src/config/errors.ts with all PT-BR error messages
- Per HTTP status: 401, 403, 404, 422, 429, 500
- Network offline message
- Empty history messages

### 07-02: Error boundary components
- Create src/shared/components/ui/ErrorBoundary.tsx
- Catches React errors
- Shows fallback UI with retry

### 07-03: Retry utility
- Already partially in apiClient
- Add manual retry button to ErrorMessage component
- Exponential backoff for auto-retry (up to 3 attempts)

### 07-04: Integration across all API calls
- Ensure all hooks use consistent error handling
- All error messages map to PT-BR strings from AGENTS.md §4
