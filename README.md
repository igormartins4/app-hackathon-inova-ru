# Rangoo Universitário

**Hackathon InovaRU 2026/01 — UFMG**

App mobile para recarga de créditos e gestão de uso nos Restaurantes Universitários (RUs) da UFMG, integrado à API RESTful da FUMP com pagamentos via PIX (MercadoPago).

---

## Equipe

| Nome | Papel |
|------|-------|
| Igor de Oliveira Martins dos Santos | Desenvolvimento |
| Ítalo Leal Lana Santos | Desenvolvimento |
| Vitor Hugo Dias Santos | Desenvolvimento |

---

## Visão Geral

O Rangoo Universitário resolve os gargalos de fila nos RUs da UFMG ao permitir que estudantes recarreguem créditos, consultem saldos, acompanhem refeições e vejam informações dos restaurantes (horários, avisos, cardápio) diretamente pelo celular. A autenticação utiliza CPF + senha do sistema institucional da FUMP, sem necessidade de criar contas.

---

## Telas do Protótipo

> **[Figma — Telas Hackathon](https://www.figma.com/design/dfXpSXKWY3FOLlIZIbQNGC/Telas-Hackathon?node-id=0-1&t=rAANqahZo3F58UAm-1)** · **[Visualizar protótipo interativo](https://www.figma.com/proto/dfXpSXKWY3FOLlIZIbQNGC/Telas-Hackathon)**

| Tela | Descrição |
|------|-----------|
| **Login** | Autenticação via CPF + senha FUMP. Token JWT armazenado com Expo Secure Store. Logo Rangoo e dialog de ajuda acessível. |
| **Início** | Dashboard com saldo disponível, ações rápidas, restaurantes favoritos com status em tempo real, card de baixo saldo e carousel de avisos. |
| **Saldo** | Detalhes do saldo atual, limite de recarga, dados do consumidor (nome, tipo, centro de custo, situação). |
| **Recarga** | Seleção de valor (R$ 5,00 a R$ 500,00) com opções predefinidas e campo personalizado. |
| **PIX QR Code** | Exibição do QR Code PIX com código copia-e-cola, timer de expiração e botão de compartilhamento. Polling de status com backoff exponencial. |
| **Sucesso** | Confirmação da recarga com valor adicionado, novo saldo e horário. |
| **Histórico** | Abas de Recargas e Refeições com filtros por data. Detalhes em dialog acessível. Paginação e scroll infinito. |
| **Cardápio** | Cardápio do dia por restaurante, com calendário semanal scrollável e favoritos via Zustand (bônus fora do contrato v2.0 — integração não-oficial com a API pública da FUMP). |
| **Restaurantes** | Detalhes de cada RU: horários, avisos de férias, status em tempo real, como chegar (Google Maps). |
| **Transferência** | Transferência de saldo entre estudantes com comprovante compartilhável (bônus fora do contrato v2.0). |
| **Perfil** | Dados do consumidor, tipo, centro de custo, situação da conta. Dialog de logout acessível. |

---

## Fluxo de Recarga PIX

```
1. Usuário seleciona valor na tela de Recarga
2. App chama POST /creditos/pagamento
3. Exibe QR Code (decodificado de Base64) e código copia-e-cola
4. Usuário paga pelo app do banco
5. App faz polling em GET /creditos/pagamento/:id/status
   - Backoff exponencial com jitter: 3s → 5s → 8s → 13s → ±1s
   - Máximo de 2 minutos
6. Webhook do MercadoPago credita saldo na API FUMP
7. App exibe confirmação e novo saldo
```

---

## Integração com a API

O app consome a API RESTful fornecida pela FUMP. Todos os dados são extraídos automaticamente do token JWT — o CPF nunca é enviado no body ou URL.

### Endpoints utilizados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/usuarios/login` | Autenticação (CPF + senha) |
| `GET` | `/creditos/saldo` | Consulta saldo e dados do consumidor |
| `POST` | `/creditos/pagamento` | Cria pagamento PIX |
| `GET` | `/creditos/pagamento/:id/status` | Polling de status do pagamento |
| `GET` | `/creditos/recargas` | Histórico de recargas |
| `GET` | `/creditos/refeicoes` | Histórico de refeições |

### Segurança

- Token JWT armazenado em `expo-secure-store` (keystore nativo do sistema)
- Nunca persistir senha no dispositivo
- Tratamento de HTTP 401 → redireciona para login
- HTTPS obrigatório (TLS 1.2+)

---

## Estrutura do Projeto

```
rangoo-app/
├── app/                         # Expo Router — file-based routes
│   ├── _layout.tsx              # Root layout: auth gate + tema + splash
│   ├── (auth)/                  # Login
│   ├── (tabs)/                  # Início, Saldo, Recarga, Cardápio, Histórico, Perfil, Transferência
│   └── restaurante/             # Detalhes do restaurante (/[codigo])
├── src/
│   ├── features/
│   │   ├── auth/                # Login, JWT management
│   │   ├── balance/             # Saldo, dados do consumidor
│   │   ├── recharge/            # Fluxo PIX, QR Code, polling
│   │   ├── history/             # Histórico de recargas e refeições (API real)
│   │   ├── cardapio/            # Cardápio do dia (integração não-oficial)
│   │   ├── restaurantes/        # Info dos RUs: horários, avisos, status, directions
│   │   ├── transfer/            # Transferência de saldo (mock, bônus)
│   │   └── profile/             # Perfil do usuário
│   ├── shared/
│   │   ├── components/ui/       # Button, Card, Input, AppDialog, ScaledText, etc.
│   │   ├── hooks/               # useNetworkStatus
│   │   ├── services/            # API client, secure storage, mock
│   │   └── utils/               # CPF, erros, validação, máscaras
│   ├── store/                   # Zustand stores (authStore, themeStore, favoriteRUsStore)
│   └── config/                  # Constantes, tema, mensagens de erro
├── mock/                        # Ambiente Mockoon (servidor mock real)
└── .env                         # Variáveis de ambiente (modo mock)
```

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Runtime | Expo SDK 57 (React Native 0.86, React 19.2) |
| Navegação | Expo Router 6 (file-based) + React Navigation 7 |
| State | TanStack Query 5 + Zustand 5 |
| Estilo | NativeWind 4 (Tailwind CSS 3.4) |
| HTTP | Axios |
| QR Code | react-native-qrcode-svg |
| Armazenamento | AsyncStorage + expo-secure-store |
| Segurança | Expo Secure Store (Android Keystore) |
| Animações | React Native Reanimated 4 |
| Validação | Zod 4 + máscaras locais |
| Compartilhamento | expo-sharing (comprovantes) |

---

## Como Testar

```bash
cd rangoo-app
pnpm install
pnpm start
```

O app roda em **modo mock** por padrão — não precisa de servidor. Use CPF válido como `52998224725` e qualquer senha para logar.

O Perfil inclui um seletor de cenários demo para simular bloqueio, inatividade, PIX expirado/rejeitado, rate limit e erro 500.

Pra testar o fluxo de pagamento contra rede real (polling, erros, rate limit), tem um servidor [Mockoon](https://mockoon.com) pronto — `pnpm mock` num segundo terminal. Passo a passo completo em [`rangoo-app/README.md`](rangoo-app/README.md#modos-de-execução).

---

## Entregas

| Arquivo | Descrição |
|---------|-----------|
| [`docs/apresentacao-prototipo-hackathon.pdf`](docs/apresentacao-prototipo-hackathon.pdf) | Apresentação de slides do conceito e protótipo |
| [`docs/Documento_Conceitual_InovaRU_03.07.2026_assinado.pdf`](docs/Documento_Conceitual_InovaRU_03.07.2026_assinado.pdf) | Documento conceitual assinado pela equipe |
| [`docs/Especificacao_Tecnica_API_InovaRU_v2_03.07.2026_assinado.pdf`](docs/Especificacao_Tecnica_API_InovaRU_v2_03.07.2026_assinado.pdf) | Especificação técnica da API FUMP v2.0 (PDF assinado, original) |
| [`docs/especificacao_tecnica.md`](docs/especificacao_tecnica.md) | Mesma especificação, transcrita em markdown — fonte de verdade usada pelo código e por `AGENTS.md` |

---

## Licença

MIT License — Software Livre conforme exigido pelo edital (Seção 8.1).

**Equipe:** Igor de Oliveira Martins dos Santos · Ítalo Leal Lana Santos · Vitor Hugo Dias Santos
