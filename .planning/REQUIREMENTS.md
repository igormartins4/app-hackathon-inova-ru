# Requirements: Rangoo Universitário

**Defined:** 2026-07-12
**Core Value:** O estudante consegue recarregar créditos no RU em menos de 30 segundos, de forma acessível e segura, mesmo com conectividade limitada.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can log in with CPF (11 digits) + password via FUMP API. Payload: `{ "user": "11_digitos", "password": "..." }`. Response (Especificação Técnica API InovaRU v2.0, seção 7.1): `{ "usuario": { "token": "...", "nome": "...", "email": "...", "isAluno": 1, "isColaborador": 0 } }`. O `token` vem DENTRO de `usuario`, não na raiz.
- [ ] **AUTH-02**: JWT token is stored securely in expo-secure-store (Android Keystore)
- [ ] **AUTH-03**: App redirects to login when token expires (HTTP 401)
- [ ] **AUTH-04**: App shows friendly message on HTTP 429 (rate limit exceeded)
- [ ] **AUTH-05**: Password is never persisted on device

### Balance & Profile

- [ ] **BALC-01**: User can view current balance (`credito_disponivel`) and recharge limit (`limite_recarga`). ⚠️ **SUPosição não confirmada:** `credito_disponivel + valor_recarga <= limite_recarga` (máx R$ 500,00) — o PDF só documenta validação de range absoluto do valor (R$5–500, erro 422 genérico). Validar com FUMP (Leonardo Cunha) antes de implementar como regra rígida.
- [ ] **BALC-02**: User can view consumer data (nome, tipo_consumidor, centro_custo, situacao)
- [ ] **BALC-03**: User can view profile screen with account information
- [ ] **BALC-04**: Balance is cached locally for offline display
- [ ] **BALC-05**: Se `situacao == "B"` (Bloqueado), botão de recarga é desabilitado na home com orientação para procurar a FUMP
- [ ] **BALC-06**: Se `GET /creditos/saldo` retornar404 ("Consumidor não encontrado ou inativo"), exibir tela de erro com mensagem: `"Conta inativa. Procure a FUMP para regularizar sua situação."` e desabilitar recarga

### PIX Payment

- [ ] **PAY-01**: User can select recharge value (R$ 5,00 to R$ 500,00)
- [ ] **PAY-02**: App generates PIX QR Code via POST /creditos/pagamento
- [ ] **PAY-03**: App displays QR Code image (decoded from qr_code_base64)
- [ ] **PAY-04**: User can copy PIX code (copia-e-cola) with one tap
- [ ] **PAY-05**: App polls GET /creditos/pagamento/:id/status with exponential backoff (3s, 5s, 8s, 13s ± jitter)
- [ ] **PAY-06**: App handles all payment statuses: pending, approved, rejected, cancelled, expired
- [ ] **PAY-07**: Polling stops after 2 minutes with friendly timeout message
- [ ] **PAY-08**: User can retry payment generation after timeout/failure
- [ ] **PAY-09**: App shows confirmation screen with new balance after successful payment

### History

- [ ] **HIST-01**: User can view recharge history with pagination
- [ ] **HIST-02**: User can filter history by date range
- [ ] **HIST-03**: User can view meal history with pagination. Parâmetro opcional `filial` na query string aceita valores de `"0001"` a `"0005"` para filtrar por restaurante específico
- [ ] **HIST-04**: History is cached locally for offline display

### Offline & Connectivity

- [ ] **OFFL-01**: App shows connection status indicator
- [ ] **OFFL-02**: Balance and history are cached with stale-while-revalidate pattern
- [ ] **OFFL-03**: App shows friendly message when offline
- [ ] **OFFL-04**: PIX payment flow requires internet (blocked when offline)

### Accessibility

- [ ] **A11Y-01**: All screens are fully navigable with TalkBack/screen reader
- [ ] **A11Y-02**: All text meets WCAG AA contrast ratio (4.5:1 normal, 3:1 large)
- [ ] **A11Y-03**: Touch targets are minimum 48x48dp
- [ ] **A11Y-04**: Font size is adjustable in settings
- [ ] **A11Y-05**: Switch Access navigation works on all screens
- [ ] **A11Y-06**: All interactive elements have accessible labels
- [ ] **A11Y-07**: App respects system "reduce motion" setting

### Error Handling

- [ ] **ERR-01**: App retries automatically on network errors (up to 3 attempts)
- [ ] **ERR-02**: All error messages are clear and user-friendly (no technical jargon)
- [ ] **ERR-03**: App provides manual fallback when automatic retry fails
- [ ] **ERR-04**: App handles HTTP errors with mandatory UI strings per FUMP contract:
  - 401 → `"Usuário ou senha inválidos."`
  - 403 → `"Acesso não autorizado. Verifique suas credenciais."`
  - 404 → `"Recurso não encontrado. Tente novamente."`
  - 422 → `"Valor fora do limite. Mínimo R$ 5,00 e máximo R$ 500,00."`
  - 429 → `"Muitas tentativas. Aguarde um momento e tente de novo."`
  - 500 → `"Ocorreu um erro. Tente novamente em instantes."`
  - Offline → `"Sem conexão. Verifique sua internet e tente novamente."`
  - Histórico vazio (recargas) → `"Você ainda não fez recargas no período."`
  - Histórico vazio (refeições) → `"Nenhuma refeição encontrada no período."`

### UI & Navigation

- [ ] **UI-01**: App uses bottom tab navigation (Home, Saldo, Recarga, Perfil)
- [ ] **UI-02**: Design is creative and original (not generic)
- [ ] **UI-03**: Animations and microinteractions are fluid
- [ ] **UI-04**: App has consistent visual language across all screens

### Build & Delivery

- [ ] **BLD-01**: Code is versioned in public GitHub repository
- [ ] **BLD-02**: README.md includes technologies, setup instructions, and architecture
- [ ] **BLD-03**: APK is generated via EAS Build
- [ ] **BLD-04**: Git commits are continuous throughout development

## v2 Requirements

### Notifications

- **NOTF-01**: User receives push notification for low balance
- **NOTF-02**: User receives push notification for payment confirmation
- **NOTF-03**: User can configure notification preferences

### RU Information

- **RU-01**: User can view daily menu/cardápio
- **RU-02**: User can view RU operating hours
- **RU-03**: User can view RU locations on map

### Widget

- **WIDGET-01**: Android widget displays current balance
- **WIDGET-02**: Widget updates periodically when app is closed

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/API creation | FUMP provides the API, we only consume it |
| User registration | App only authenticates, doesn't create accounts |
| Multiple payment methods | PIX only per edital specification |
| iOS support | Edital requires Android only |
| Play Store publication | Delivery is APK + source code |
| Multi-language | Portuguese only |
| Real-time notifications | Deferred to v2 |
| Menu/RU info | Deferred to v2 (bonus if time permits) |
| Android widget | Deferred to v2 (bonus if time permits) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| BALC-01 | Phase 3 | Pending |
| BALC-02 | Phase 3 | Pending |
| BALC-03 | Phase 3 | Pending |
| BALC-04 | Phase 3 | Pending |
| BALC-05 | Phase 3 | Pending |
| BALC-06 | Phase 3 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| PAY-04 | Phase 4 | Pending |
| PAY-05 | Phase 4 | Pending |
| PAY-06 | Phase 4 | Pending |
| PAY-07 | Phase 4 | Pending |
| PAY-08 | Phase 4 | Pending |
| PAY-09 | Phase 4 | Pending |
| HIST-01 | Phase 5 | Pending |
| HIST-02 | Phase 5 | Pending |
| HIST-03 | Phase 5 | Pending |
| HIST-04 | Phase 5 | Pending |
| OFFL-01 | Phase 6 | Pending |
| OFFL-02 | Phase 6 | Pending |
| OFFL-03 | Phase 6 | Pending |
| OFFL-04 | Phase 6 | Pending |
| A11Y-01 | Phase 8 | Pending |
| A11Y-02 | Phase 8 | Pending |
| A11Y-03 | Phase 8 | Pending |
| A11Y-04 | Phase 8 | Pending |
| A11Y-05 | Phase 8 | Pending |
| A11Y-06 | Phase 8 | Pending |
| A11Y-07 | Phase 8 | Pending |
| ERR-01 | Phase 7 | Pending |
| ERR-02 | Phase 7 | Pending |
| ERR-03 | Phase 7 | Pending |
| ERR-04 | Phase 7 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 9 | Pending |
| UI-03 | Phase 9 | Pending |
| UI-04 | Phase 9 | Pending |
| BLD-01 | Phase 10 | Pending |
| BLD-02 | Phase 10 | Pending |
| BLD-03 | Phase 10 | Pending |
| BLD-04 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 46 total (44 original + BALC-05 + BALC-06)
- Mapped to phases: 46
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-12*
*Last updated: 2026-07-14 — corrigido AUTH-01: token vem dentro de `usuario`, não na raiz (fonte de verdade: docs/especificacao_tecnica.md, seção 7.1)*
