<!-- GSD:project-start source:PROJECT.md -->
## Project

# Rangoo Universitário — App de Créditos para Restaurantes Universitários

App Android para estudantes da UFMG que permite consultar saldo e recarregar créditos para uso nos Restaurantes Universitários (RUs) via PIX. Desenvolvido para o Hackathon InovaRU 2026/01.

**Core Value:** O estudante consegue recarregar créditos no RU em menos de 30 segundos, de forma acessível e segura, mesmo com conectividade limitada.

**Platform:** React Native (Expo SDK 57)
**Architecture:** Feature-based
**Team:** 2-3 people (Dev + Designer)
**Timeline:** 1 week (12/07 to 18/07)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

- **Runtime:** Expo SDK 57 (React Native 0.86, React 19.2)
- **Navigation:** React Navigation v7
- **State:** TanStack Query (server state) + Zustand (client state)
- **Styling:** NativeWind v4 (Tailwind CSS 3.4)
- **Security:** expo-secure-store (Android Keystore)
- **Storage:** MMKV (fast local cache)
- **QR Code:** react-native-qrcode-svg
- **Animations:** React Native Reanimated v3
- **Build:** EAS Build
<!-- GSD:stack-end -->

<!-- GSD:conventions-start -->
## Conventions

- Feature-based folder structure: `/auth`, `/balance`, `/recharge`, `/profile`
- TypeScript strict mode
- Biome for linting and formatting
- Conventional commits
- All interactive elements must have accessible labels
- Touch targets minimum 48x48dp
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start -->
## Architecture

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
│   └── profile/            # User profile
├── shared/
│   ├── components/         # Reusable UI primitives
│   ├── hooks/              # Custom hooks
│   ├── services/           # API client, storage
│   └── utils/              # Helpers
├── store/                  # Zustand stores (client state only)
└── config/                 # Constants, theme
```

**Data Flow:** API → TanStack Query → Components → Zustand (UI state)
**Security:** JWT in expo-secure-store, never in plaintext
**Offline:** TanStack Query stale-while-revalidate + MMKV cache
<!-- GSD:architecture-end -->

<!-- GSD:skills-start -->
## Project Skills

No project skills found.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
<!-- GSD:profile-end -->

---

> **Fonte de verdade absoluta:** `docs/especificacao_tecnica.md` (Especificação Técnica API InovaRU v2.0, assinada 03/07/2026). Qualquer conflito entre este arquivo, código existente, ou memória de treinamento deve ser resolvido a favor desse documento. Se um agente encontrar uma divergência que não seja óbvia como erro de digitação/OCR, **pare e pergunte** antes de alterar o contrato — não assuma qual lado está certo.

> **Nomenclatura — não confundir:** "InovaRU" é o nome do **hackathon/edital da FUMP** (`Hackathon InovaRU 2026/01`) — aparece assim em toda referência ao evento, ao documento oficial e no contrato da API (`Especificação Técnica API InovaRU v2.0`). **Não renomeie essas ocorrências.** O nome do **nosso app**, construído para esse hackathon, é **Rangoo Universitário** (forma curta: **Rangoo**) — é isso que aparece em `app.json`, na tela de login, no compartilhamento de recibo, etc.

## 🛡️ 1. Segurança Extrema e Invariantes do Dispositivo

- **Tokens de Sessão**: O token JWT retornado no login deve ser armazenado exclusivamente no `expo-secure-store` (`src/shared/services/secureStorage.ts`). É proibido o uso de `MMKV` ou `AsyncStorage` para persistência do JWT.
- **Senhas**: A senha institucional do estudante NUNCA deve ser gravada, cacheada ou persistida em armazenamento persistente sob nenhuma circunstância. Ela deve permanecer apenas na memória volátil do estado do formulário durante o envio do `POST /usuarios/login`.
- **Tratamento de Exceções**: Stack traces internos da API ou erros do SQL Server nunca devem chegar à UI. Use mapeamento local estrito (`src/config/errors.ts` + `apiClient.ts`) para traduzir códigos HTTP em mensagens humanizadas em português brasileiro.
- **Ownership**: nenhuma requisição envia CPF no body ou na URL — o backend extrai o CPF do JWT. Se algum código estiver montando um payload ou query string com CPF, é bug.

---

## 🌐 2. Dicionário de Dados e Contratos da API FUMP v2.0

Os agentes devem seguir rigorosamente as chaves, tipos e estruturas dos payloads abaixo — copiados literalmente de `docs/especificacao_tecnica.md`. Não altere o nome das propriedades.

### 2.1 Autenticação (`POST /usuarios/login`)

**Payload de Envio:**

```json
{
  "user": "12345678901",
  "password": "senha_institucional"
}
```

**Payload de Retorno (Status 200) — seção 7.1:**

```json
{
  "usuario": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "nome": "JOÃO DA SILVA",
    "email": "joao@ufmg.br",
    "isAluno": 1,
    "isColaborador": 0
  }
}
```

> **ATENÇÃO — erro comum já cometido neste projeto:** o `token` vem DENTRO de `usuario`, NÃO no nível raiz da resposta. `src/features/auth/types/auth.types.ts` (`LoginResponse`) e `src/features/auth/hooks/useAuth.ts` já implementam isso corretamente (`const { token, ...profile } = response.usuario`) — não reverta para `{ token, usuario }` na raiz.

**Resposta 401 (credenciais inválidas):** `{ "message": "Usuário ou senha inválidos" }`

### 2.2 Saldo e Contexto (`GET /creditos/saldo`)

**Payload de Retorno (Status 200):**

```json
{
  "consumidor": {
    "nome": "JOÃO DA SILVA",
    "tipo_consumidor": { "codigo": "01", "descricao": "ESTUDANTE REGULAR" },
    "centro_custo": { "tipo": "Graduação", "descricao": "CIENCIA DA COMPUTACAO" },
    "situacao": "A"
  },
  "saldo": {
    "credito_disponivel": 45.50,
    "limite_recarga": 500.00
  }
}
```

**Resposta 404 (consumidor não encontrado/inativo):** `{ "message": "Consumidor não encontrado ou inativo." }`

**`situacao` (Anexo C) — não confundir os códigos:**

| Código | Situação | Efeito |
|---|---|---|
| `"A"` | Ativo | Uso normal |
| `"1"` | Inativo | Nunca aparece num `200` — o próprio endpoint responde `404` para consumidor inativo. Não codifique um caso `situacao === "1"` esperando um 200; a detecção de inatividade é pelo status HTTP 404, não pelo campo. |
| `"B"` | Bloqueado | Recarga desabilitada, aviso pedindo para procurar a FUMP |

`limite_recarga` é **dinâmico** — nunca hardcode R$ 500,00 como teto fixo; sempre leia o valor retornado por este endpoint.

### 2.3 Solicitação de Recarga PIX (`POST /creditos/pagamento`)

**Payload de Envio:** `{ "valor": 50.00 }` (mínimo R$ 5,00 / máximo R$ 500,00 — validação client-side em `src/shared/utils/recharge.ts`)

**Payload de Retorno (Status 201):**

```json
{
  "payment_id": 123456789,
  "status": "pending",
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "qr_code_base64": "iVBORw0KGgoAAAANSUhEUg...",
  "ticket_url": "https://www.mercadopago.com.br/payments/123456789/ticket",
  "expiration": "2026-04-27T11:00:00-03:00"
}
```

**Resposta 422 (valor fora do limite):** `{ "message": "Valor fora do limite permitido. Mínimo: R$ 5,00, Máximo: R$ 500,00" }`

> **QR CODE NUNCA É GERADO NO CLIENTE.** `qr_code_base64` é a imagem PNG autoritativa — renderize via `Image` com `uri` no formato `data:image/png;base64,<qr_code_base64>`. A ordem de fallback correta, já implementada em `src/features/recharge/components/QrCodeDisplay.tsx`, é: **1)** `qr_code_base64` decodificado → **2)** link para `ticket_url` → **3)** `react-native-qrcode-svg` gerando a partir do texto `qr_code`, e SÓ como último recurso quando os dois primeiros faltarem (ex.: mock local sem base64). Um agente já regrediu isso uma vez, trocando o componente inteiro por um placeholder "QR Code será gerado aqui" — não repita.
>
> **SEM IDEMPOTENCY KEY:** A API FUMP v2.0 NÃO define header `X-Idempotency-Key`. Não existe proteção server-side contra duplo-tap. A mitigação é 100% client-side: desabilitar botão de pagamento após primeiro toque (`isSubmitting`) e NÃO reenviar `POST` em retry automático.

### 2.4 Status do Pagamento (`GET /creditos/pagamento/:paymentId/status`)

```json
{
  "payment_id": 123456789,
  "status": "approved",
  "status_detail": "accredited",
  "creditado": true
}
```

`status_detail` existe no contrato (seção 6.3/7.4) — o tipo `PaymentStatusResponse` em `src/features/recharge/types/recharge.types.ts` já o inclui como campo opcional; não remova.

### 2.5 Histórico (`GET /creditos/recargas`, `GET /creditos/refeicoes`)

Query params: `page` (default 1), `perPage` (default 20, máx 100), `dataInicio`/`dataFim` (`YYYY-MM-DD`), e em refeições opcionalmente `filial` (código de RU, ver 2.6).

Envelope de paginação (seção 6.8), **sempre** presente em listagens:

```json
{ "data": [...], "pagination": { "total": 142, "currentPage": 1, "perPage": 20, "lastPage": 8 } }
```

UI deve usar `currentPage < lastPage` pra decidir se busca a próxima página (infinite scroll) — não invente outro critério de paginação.

### 2.6 Restaurantes Universitários (Anexo A) — códigos e nomes exatos

| Código | Nome | Localização |
|---|---|---|
| `0001` | RU Saúde/Direito | Campus Saúde, Belo Horizonte |
| `0002` | RU Setorial 2 | Campus Pampulha, Belo Horizonte |
| `0003` | RU Setorial 1 | Campus Pampulha, Belo Horizonte |
| `0004` | RU ICA | Campus Montes Claros |
| `0005` | RU HRTN | Hospital Risoleta T. Neves, Belo Horizonte |

Nunca invente código/nome de RU (ex.: `"01"`/`"RU Central"` já apareceu por engano em dado mockado — foi corrigido). Use sempre um destes cinco.

### 2.7 Rate limiting (Anexo D)

| Endpoint | Limite | Escopo |
|---|---|---|
| `POST /usuarios/login` | 5 req/min | por IP |
| `POST /creditos/pagamento` | 10 req/min | por token JWT |
| `GET (consultas)` | 60 req/min | por token JWT |

Em `429`, a API retorna header `Retry-After` (segundos) — **leia esse header** e mostre o tempo exato ao usuário; não exiba só uma mensagem genérica. Implementado em `src/shared/services/apiClient.ts` (interceptor de resposta lê `error.response.headers['retry-after']`).

### 2.8 Fuso horário

Todas as datas são ISO 8601 com offset `-03:00` (Brasília). `new Date(iso)` do JS já respeita o offset embutido na string e `toLocaleDateString`/`toLocaleTimeString` já convertem pro fuso local do dispositivo automaticamente — não escreva lógica manual de conversão de fuso.

---

## ⚡ 3. Algoritmo de Polling e Máquina de Estados (PIX)

Ao exibir a tela de pagamento do PIX, o agente deve disparar imediatamente o mecanismo de consulta periódica em `GET /creditos/pagamento/:paymentId/status` seguindo as diretrizes abaixo. Implementado em `src/features/recharge/utils/polling.ts` + `src/features/recharge/hooks/usePolling.ts` — reaproveite, não reimplemente.

### 3.1 Loop com Backoff Exponencial e Jitter

- **Janela Base Crescente**: Sequência de atrasos de 3s, 5s, 8s, 13s.
- **Jitter Obrigatório**: Aplique ruído aleatório de ±1s sobre o tempo base calculado.
- **Teto de Execução (Timeout)**: O polling possui tempo limite máximo de **2 minutos (120 segundos)**. Se atingir esse tempo sem alteração de estado, pare o loop e force o redirecionamento para a tela de Falha/Timeout.

### 3.2 Comportamento por Status do Gateway

| Status Recebido | Tipo | Ação do App |
|---|---|---|
| `pending` | Transiente | Mantém o loop ativo |
| `approved` | Terminal | Para o loop **somente se** `creditado === true`; se `approved` com `creditado !== true`, continue o polling (webhook ainda não creditou) — nunca libere sucesso só com `status === "approved"` |
| `rejected` | Terminal | Para o loop e redireciona para Falha detalhando rejeição |
| `cancelled` | Terminal | Para o loop e trata como expiração |
| `expired` | Terminal | Para o loop e exibe alerta de tempo esgotado |

---

## 🎨 4. Strings de Interface (UX/A11y)

Mensagens de app definidas em `src/config/errors.ts` — mantenha esse arquivo como fonte única, não duplique string literal em componente:

| Cenário | Mensagem na UI |
|---|---|
| Dispositivo Sem Internet | `"Sem conexão. Verifique sua internet e tente novamente."` |
| Credenciais Erradas (401) | `"Usuário ou senha inválidos."` |
| Acesso Negado (403) | `"Acesso não autorizado. Verifique suas credenciais."` |
| Não Encontrado (404) | `"Recurso não encontrado. Tente novamente."` |
| Conta Inativa (404 saldo) | `"Conta inativa. Procure a FUMP para regularizar sua situação."` |
| Estouro de Chamadas (429) | `"Muitas tentativas. Aguarde {N}s e tente de novo."` (N = valor real do header `Retry-After`, ver 2.7) |
| Valores Fora do Escopo (422) | `"Valor fora do limite. Mínimo R$ 5,00 e máximo R$ 500,00."` |
| Erro no Servidor (500) | `"Ocorreu um erro. Tente novamente em instantes."` |
| Histórico Vazio (Recargas) | `"Você ainda não fez recargas no período."` |
| Histórico Vazio (Refeições) | `"Nenhuma refeição encontrada no período."` |
| Bloqueio Administrativo (Situação B) | Desabilitar recarga (não só na Home — a aba Recarga em si precisa mostrar o motivo) e orientar a procurar FUMP |

---

## 🛠️ 5. Regras de Ambiente de Desenvolvimento Móvel

- **Sem Servidor Externo**: Não tente buscar URLs de staging da FUMP. Desenvolvimento e testes rodam exclusivamente contra o Mock Server local (`src/shared/services/mockHandler.ts`, ativado via `EXPO_PUBLIC_USE_MOCK=true` no `.env`).
- **Endereçamento de Rede**: Base URL em emulador Android deve apontar para `http://10.0.2.2:<porta_do_mock>`. Não use `localhost` nem `127.0.0.1`.
- **Configuração de Tráfego**: cleartext HTTP é liberado **apenas** para `10.0.2.2` via `network_security_config.xml` gerado pelo config plugin `plugins/withNetworkSecurityConfig.js` — não amplie isso pra um `usesCleartextTraffic="true"` genérico sem domain-config restrito; isso abriria cleartext pra qualquer domínio.

---

## 🧭 6. Arquitetura de Estado — regra dura sobre estado compartilhado

**Bug real já cometido e corrigido neste projeto:** `useAuth()` guardava `isAuthenticated`/`user` em `useState` local dentro do próprio hook. Como o hook é chamado em várias telas (`_layout.tsx`, `login.tsx`, `home.tsx`, `profile.tsx`), cada chamada criava uma cópia isolada do estado. Login bem-sucedido em `login.tsx` nunca era percebido pelo `AuthGate` em `_layout.tsx` (outra instância do hook) — o app ficava travado na tela de login sem navegar, mesmo com login correto.

**Regra:** qualquer estado que precise ser visto por mais de um componente/tela (autenticação, tema, qualquer flag global) **tem que** viver numa store Zustand (`src/store/`), nunca em `useState` replicado por hook. `useAuth()` hoje é um wrapper fino sobre `src/store/authStore.ts` — siga esse padrão pra qualquer novo estado global. Antes de adicionar `useState` num hook customizado, pergunte: "esse hook é chamado em mais de um componente ao mesmo tempo?" Se sim, é store, não `useState`.

---

## 📱 7. Safe Area / Status Bar — regra dura

**Bug real já cometido e corrigido:** Expo SDK 54+/RN 0.81+ ativa edge-to-edge no Android por padrão — conteúdo desenha por baixo da status bar/barra de navegação a menos que o app peça inset manualmente. `react-native-safe-area-context` está instalado mas telas sem header nativo (modais, tela de login, banners renderizados acima do `Stack`) ficavam sem nenhum inset, e um botão ("Voltar" do Histórico) sentava embaixo da barra de hora/notificação.

**Regra:**

- `app/_layout.tsx` já envolve tudo num `<SafeAreaProvider>` — não remova.
- Qualquer tela/rota que **não** tenha header nativo do React Navigation (ex.: `(auth)/login.tsx`, `app/history.tsx` — modal com `headerShown: false`) deve usar `<SafeAreaView edges={['top', 'bottom']}>` (de `react-native-safe-area-context`, não o `SafeAreaView` legado do `react-native`) como container raiz.
- Componentes renderizados **acima** do `<Stack>` no root layout (ex.: `OfflineBanner`) não ganham o inset do header de ninguém — usam `useSafeAreaInsets()` diretamente e aplicam `paddingTop: insets.top` na própria borda.
- Telas dentro de `(tabs)/` já têm header nativo (`headerShown` não é `false` no `Tabs` screenOptions) — não precisam de `SafeAreaView` extra.

---

## 🎨 8. Cores e Tema — só tokens, nunca hex solto

**Regra dura:** nenhuma cor literal (`#RRGGBB`) ou classe de paleta Tailwind crua (`bg-gray-500`, `text-red-600`, `bg-blue-600` etc.) em componente. Todas as cores vêm de `global.css` (CSS vars `--color-*`, claro/escuro) + `tailwind.config.js` (mapeia pra classes semânticas: `bg-primary`, `text-text-secondary`, `bg-status-error`, `bg-surface-variant`, etc.) usadas via `className`.

Componentes que usam props nativas que **não aceitam `className`** (`ActivityIndicator color`, `Ionicons color`, `tabBarActiveTintColor`, `placeholderTextColor`, `QRCode color`/`backgroundColor`) devem importar `useThemeColors()` de `@/config` — esse hook resolve automaticamente claro/escuro a partir de `src/config/theme.ts` (que espelha os mesmos valores de `global.css`; se mudar uma cor, mude nos dois lugares). Nunca escreva `color="#006A6A"` direto num componente — isso quebra o dark mode e já foi encontrado e corrigido em ~10 arquivos.

Contraste mínimo WCAG AA 4.5:1 pra texto normal — antes de escolher uma cor de texto secundário/desabilitado nova, calcule o contraste contra o fundo real onde ela aparece (não assuma que "parece escuro o suficiente"). `--color-text-secondary` já foi ajustado uma vez por medir 4.497:1 (abaixo do mínimo) contra branco.

---

## 🧱 9. Uma implementação por tela — nunca duas arquiteturas paralelas

**Bug real já cometido e corrigido:** em algum momento passaram a existir duas implementações do fluxo de recarga coexistindo (`RechargeForm.tsx` reescrito como `RechargeFormContainer` que importava a si mesmo, dependendo de hooks que não existiam — `useRecharge`, `usePaymentStatus`, `@/shared/hooks/usePolling`), enquanto a tela real (`app/(tabs)/recharge.tsx`) continuava chamando a versão antiga e funcional. Junto com isso apareceu uma aba de Histórico fantasma (`app/(tabs)/history.tsx`, placeholder morto) ao lado da tela de Histórico real (`app/history.tsx`).

**Regra:** ao redesenhar/refatorar um componente ou tela, edite o arquivo existente ou delete explicitamente o antigo antes de criar o novo. Nunca deixe duas versões de "a mesma tela" vivas ao mesmo tempo — uma delas vai ficar órfã, referenciando hooks/services que não existem, e vai quebrar sem nenhum erro de lint óbvio até alguém navegar até ela. Antes de terminar qualquer tarefa que toque em telas/componentes, rode `tsc --noEmit` — ele pega import de export inexistente, mas só se você realmente checar o resultado.

---

## 📝 10. Regras Absolutas de Escrita de Código e Commits

- **Commits Atômicos**: Um commit por preocupação lógica isolada. Não misture rotas de navegação com implementação de login.
- **Mensagens de Commit**: Conventional Commits em português com escopos definidos (ex.: `feat(auth): implementar armazenamento seguro do JWT no Keystore`, `fix(payments): corrigir jitter no loop de backoff do PIX`).
- **Anonimato de IA**: NUNCA adicione marcadores ou metadados informando coautoria de inteligência artificial (`Co-authored-by`, emojis de robô, assinaturas de IDEs). Autoria limpa e exclusivamente humana.

---

## 📐 11. Organização de Pastas (Feature-Based)

As funcionalidades devem ser estritamente isoladas por domínio de uso na pasta `src/features/`. Cada pasta de feature deve conter seus próprios componentes, hooks e serviços locais.

- Cada feature é um módulo auto-contido: `components/`, `hooks/`, `services/`, `types/`
- É proibido espalhar arquivos de uma mesma funcionalidade por pastas globais do projeto
- Imports entre features são proibidos — usar apenas o `index.ts` público de cada feature
- Exemplo: `src/features/recharge/services/rechargeApi.ts`, não `src/services/rechargeApi.ts`

---

## 🧪 12. Diretrizes de Testes para Agentes

Utilize Jest para testes de unidade de lógica pura de negócio. **Convenção real do projeto** (ver `jest.config.js`, `testMatch: ['**/__tests__/**/*.test.ts']`): arquivos ficam numa pasta `__tests__/` dentro do diretório do código testado, com extensão `.test.ts` — não `.spec.ts`, não co-localizado direto na pasta pai. Exemplo real: `src/features/recharge/utils/__tests__/polling.test.ts`.

### O que DEVE ter teste

- **Algoritmo de Polling + Backoff Exponencial** (`PAY-05`): Testar cálculo de tempo com jitter dentro dos limites ±1s
- **Validação de Limites de Recarga** (`PAY-01`, `BALC-01`): valor entre R$ 5,00 e R$ 500,00 (limite é o `limite_recarga` dinâmico da API, não um teto fixo)
- **Máscaras e Validadores de Entrada**: CPF limpo com exatamente 11 dígitos no campo `user`
- **Estado da máquina de polling**: Transições de status (pending → approved/rejected/cancelled/expired)

### O que NÃO DEVE ter teste

- Testes de snapshot ou renderização de componentes React Native (UI)
- Testes de integração com API mock (a menos que explicitamente solicitado)
- Testes de configuração de build ou tooling

### Antes de considerar qualquer tarefa concluída

Rode, nessa ordem, e confira que os três passam:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check .
pnpm exec jest
```

Se `node`/`pnpm` não estiverem no PATH do shell, use `pnpm env use --global lts` primeiro (self-contained, não precisa de admin).
