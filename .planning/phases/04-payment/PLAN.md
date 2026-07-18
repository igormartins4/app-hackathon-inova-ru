# Phase 4: PIX Payment Flow

**Goal**: Users can complete a full PIX recharge in under 30 seconds with clear status feedback
**Depends on**: Phases 2, 3
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07, PAY-08, PAY-09

## Success Criteria

1. User can select recharge value (R$ 5,00 to R$ 500,00) and generate a PIX payment
2. QR Code image is displayed and PIX code (copia-e-cola) can be copied with one tap
3. App polls payment status with exponential backoff (3s→5s→8s→13s ± jitter)
4. All payment statuses are handled: pending, approved, rejected, cancelled, expired
5. After 2 minutes, polling stops. If last status was `approved` (regardless of `creditado`), show a distinct "payment approved, credit processing" state — never the generic "not confirmed" message, since the payment WAS detected and approved (defensive decision, not literally specified in the signed PDF — see AGENTS.md §3.3). Otherwise show the generic timeout message; user can retry
6. approved + creditado==true → success; approved + creditado==false → keep polling until timeout, then land on the distinct pending-credit state above

## Plans

### 04-01: Amount selection screen
- Create recharge screen at app/(tabs)/recharge.tsx
- Preset values: R$10, R$20, R$30, R$50, R$100, R$200
- Custom amount input (R$5 to R$500)
- Validate: amount >= 5 and amount <= 500
- Show current balance for context
- Disable if consumer is blocked/inactive (from useConsumerStatus)
- accessibilityLabel on all buttons

### 04-02: PIX payment creation + QR Code display
- Create src/features/recharge/services/rechargeApi.ts
- POST /creditos/pagamento with { valor: number }
- Response: { payment_id, status, qr_code, qr_code_base64, ticket_url, expiration }
- Create src/features/recharge/types/recharge.types.ts
- Create src/features/recharge/components/QrCodeDisplay.tsx
- Decode qr_code_base64 to display QR image
- Show expiration countdown

### 04-03: Copy PIX code functionality
- "Copiar código" button with one tap
- Copy qr_code string to clipboard (expo-clipboard)
- Show confirmation: "Código copiado!"
- accessibilityLabel="Copiar código PIX para cola e cola"

### 04-04: Exponential backoff polling + status screen
- Create src/features/recharge/hooks/usePolling.ts
- Intervals: 3s, 5s, 8s, 13s (base) ± 1s jitter
- Timeout: 120 seconds
- GET /creditos/pagamento/:paymentId/status
- Status handling:
  - pending → continue polling
  - approved + creditado==true → SUCCESS, stop polling, navigate to confirmation
  - approved + creditado==false → continue polling (webhook pending); if timeout hits in this state, land on distinct "pendingCredit" screen (not the generic timeout/failure message)
  - rejected → show error, allow retry
  - cancelled → show message, allow retry
  - expired → show "PIX expirado", allow retry
- CRITICAL: No server-side idempotency → disable submit button after first tap, no retry POST

### 04-05: Confirmation screen with new balance
- After approved: show success screen
- Display new balance (refetch from API)
- "Voltar" button to return to home
- Celebration animation placeholder

### 04-06: Timeout handling and retry flow
- After 2 min timeout: show friendly message
- If last known status was `approved` (creditado still false): show distinct "pendingCredit" state instead — approved, not failed, credit still processing (defensive decision, see AGENTS.md §3.3)
- "Tentar novamente" button → back to amount selection
- Never retry POST automatically (no idempotency)

### 04-07: Tests for polling and validation
- Test backoff calculation with jitter within ±1s
- Test status transitions
- Test recharge limit validation
- Test CPF cleaning

### 04-08: Mock server configuration
- Create mock/ directory with response fixtures
- Document mock setup for development
