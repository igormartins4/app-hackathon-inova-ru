<!-- GSD:project-start source:PROJECT.md -->
## Project

# InovaRU — App de Créditos para Restaurantes Universitários

App Android para estudantes da UFMG que permite consultar saldo e recarregar créditos para uso nos Restaurantes Universitários (RUs) via PIX. Desenvolvido para o Hackathon InovaRU 2026/01.

**Core Value:** O estudante consegue recarregar créditos no RU em menos de 30 segundos, de forma acessível e segura, mesmo com conectividade limitada.

**Platform:** React Native (Expo SDK 55)
**Architecture:** Feature-based
**Team:** 2-3 people (Dev + Designer)
**Timeline:** 1 week (12/07 to 18/07)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

- **Runtime:** Expo SDK 55 (React Native 0.83, React 19.2)
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

## 🛡️ 1. Segurança Extrema e Invariantes do Dispositivo

- **Tokens de Sessão**: O token JWT retornado no login deve ser armazenado exclusivamente no `expo-secure-store`. É proibido o uso de `MMKV` ou `AsyncStorage` para persistência do JWT.
- **Senhas**: A senha institucional do estudante NUNCA deve ser gravada, cacheada ou persistida em armazenamento persistente sob nenhuma circunstância. Ela deve permanecer apenas na memória volátil do estado do formulário durante o envio do `POST /usuarios/login`.
- **Tratamento de Exceções**: Stack traces internos da API ou erros do SQL Server nunca devem chegar à UI. Use mapeamento local estrito para traduzir códigos HTTP em mensagens humanizadas em português brasileiro.

---

## 🌐 2. Dicionário de Dados e Contratos da API FUMP v2.0

Os agentes de IA devem seguir rigorosamente as chaves, tipos e estruturas dos payloads abaixo. Não altere o nome das propriedades.

### 2.1 Autenticação (`POST /usuarios/login`)

**Payload de Envio:**
```json
{
  "user": "12345678901",
  "password": "senha_institucional"
}
```

**Payload de Retorno (Status 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "usuario": {
    "nome": "JOÃO DA SILVA",
    "email": "joao@ufmg.br",
    "isAluno": 1,
    "isColaborador": 0
  }
}
```

> **ATENÇÃO:** O `token` está no nível raiz da resposta, NÃO dentro de `usuario`. O objeto `usuario` contém apenas dados do perfil.

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

### 2.3 Solicitação de Recarga PIX (`POST /creditos/pagamento`)

**Payload de Envio:** `{ "valor": 50.00 }`

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

> **SEM IDEMPOTENCY KEY:** A API FUMP v2.0 NÃO define header `X-Idempotency-Key`. Não existe proteção server-side contra duplo-tap. A mitigação é 100% client-side: desabilitar botão de pagamento após primeiro toque e NÃO reenviar POST em retry automático. O plano 04-04 e 07-04 devem implementar `isSubmitting` flag para prevenir dupla cobrança.

---

## ⚡ 3. Algoritmo de Polling e Máquina de Estados (PIX)

Ao exibir a tela de pagamento do PIX, o agente deve disparar imediatamente o mecanismo de consulta periódica em `GET /creditos/pagamento/:paymentId/status` seguindo as diretrizes abaixo.

### 3.1 Loop com Backoff Exponencial e Jitter

- **Janela Base Crescente**: Sequência de atrasos de 3s, 5s, 8s, 13s.
- **Jitter Obrigatório**: Aplique ruído aleatório de ±1s sobre o tempo base calculado.
- **Teto de Execução (Timeout)**: O polling possui tempo limite máximo de **2 minutos (120 segundos)**. Se atingir esse tempo sem alteração de estado, pare o loop e force o redirecionamento para a tela de Falha/Timeout.

### 3.2 Comportamento por Status do Gateway

| Status Recebido | Tipo | Ação do App |
|---|---|---|
| `pending` | Transiente | Mantém o loop ativo |
| `approved` | Terminal | Para o loop se `creditado` for `true`, redireciona para Sucesso e atualiza saldo |
| `rejected` | Terminal | Para o loop e redireciona para Falha detalhando rejeição |
| `cancelled` | Terminal | Para o loop e trata como expiração |
| `expired` | Terminal | Para o loop e exibe alerta de tempo esgotado |

---

## 🎨 4. Strings de Interface e Mensagens Obrigatórias (UX/A11y)

| Cenário | Mensagem na UI |
|---|---|
| Dispositivo Sem Internet | `"Sem conexão. Verifique sua internet e tente novamente."` |
| Credenciais Erradas (401) | `"Usuário ou senha inválidos."` |
| Acesso Negado (403) | `"Acesso não autorizado. Verifique suas credenciais."` |
| Não Encontrado (404) | `"Recurso não encontrado. Tente novamente."` |
| Conta Inativa (404 saldo) | `"Conta inativa. Procure a FUMP para regularizar sua situação."` |
| Estouro de Chamadas (429) | `"Muitas tentativas. Aguarde um momento e tente de novo."` |
| Valores Fora do Escopo (422) | `"Valor fora do limite. Mínimo R$ 5,00 e máximo R$ 500,00."` |
| Erro no Servidor (500) | `"Ocorreu um erro. Tente novamente em instantes."` |
| Histórico Vazio (Recargas) | `"Você ainda não fez recargas no período."` |
| Histórico Vazio (Refeições) | `"Nenhuma refeição encontrada no período."` |
| Bloqueio Administrativo (Situação B) | Desabilitar recarga e orientar a procurar FUMP |

---

## 🛠️ 5. Regras de Ambiente de Desenvolvimento Móvel

- **Sem Servidor Externo**: Não tente buscar URLs de staging da FUMP. Desenvolvimento e testes rodam exclusivamente contra o Mock Server local.
- **Endereçamento de Rede**: Base URL em emulador Android deve apontar para `http://10.0.2.2:<porta_do_mock>`. Não use `localhost` nem `127.0.0.1` dentro das configurações do cliente HTTP.
- **Configuração de Tráfego**: Ative `android:usesCleartextTraffic="true"` no `AndroidManifest.xml` em escopo de debug para impedir bloqueio de requisições HTTP ao mock local.

---

## 📝 6. Regras Absolutas de Escrita de Código e Commits

- **Commits Atômicos**: Um commit por preocupação lógica isolada. Não misture rotas de navegação com implementação de login.
- **Mensagens de Commit**: Conventional Commits em português com escopos definidos (ex.: `feat(auth): implementar armazenamento seguro do JWT no Keystore`, `fix(payments): corrigir jitter no loop de backoff do PIX`).
- **Anonimato de IA**: NUNCA adicione marcadores ou metadados informando coautoria de inteligência artificial (`Co-authored-by`, emojis de robô, assinaturas de IDEs). Autoria limpa e exclusivamente humana.

---

## 📐 7. Organização de Pastas (Feature-Based)

As funcionalidades devem ser estritamente isoladas por domínio de uso na pasta `src/features/`. Cada pasta de feature deve conter seus próprios componentes, hooks e serviços locais.

- Cada feature é um módulo auto-contido: `components/`, `hooks/`, `services/`, `types/`
- É proibido espalhar arquivos de uma mesma funcionalidade por pastas globais do projeto
- Imports entre features são proibidos — usar apenas o `index.ts` público de cada feature
- Exemplo: `src/features/recharge/services/rechargeApi.ts`, não `src/services/rechargeApi.ts`

---

## 🧪 8. Diretrizes de Testes para Agentes

Utilize Jest para criar testes de unidade de lógica pura de negócio. Arquivos de teste ficam co-localizados (mesma pasta do arquivo testado) com extensão `.spec.ts` ou `.test.ts`.

### O que DEVE ter teste:
- **Algoritmo de Polling + Backoff Exponencial** (`PAY-05`): Testar cálculo de tempo com jitter dentro dos limites ±1s
- **Validação de Limites de Recarga** (`PAY-01`, `BALC-01`): Garantir que regra composta bloqueie se `saldo + recarga > R$ 500,00`
- **Máscaras e Validadores de Entrada**: CPF limpo com exatamente 11 dígitos no campo `user`
- **Calculadoras de validação de limite de saldo composto**
- **Estado da máquina de polling**: Transições de status (pending → approved/rejected/cancelled/expired)

### O que NÃO DEVE ter teste:
- Testes de snapshot ou renderização de componentes React Native (UI)
- Testes de integração com API mock (a menos que explicitamente solicitado)
- Testes de configuração de build ou tooling
