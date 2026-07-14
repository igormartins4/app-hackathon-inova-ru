# Rangoo Universitário

**Hackathon InovaRU 2026/01 — UFMG**

App mobile para recarga de créditos e gestão de uso nos Restaurantes Universitários (RUs) da UFMG, integrado à API RESTful da FUMP com pagamentos via PIX (MercadoPago).

---

## Visão Geral

O Rangoo Universitário resolve os gargalos de fila nos RUs da UFMG ao permitir que estudantes recarreguem créditos, consultem saldos e acompanhem refeições diretamente pelo celular. A autenticação utiliza CPF + senha do sistema institucional da FUMP, sem necessidade de criar contas.

---

## Telas do Protótipo

> **[Figma — Telas Hackathon](https://www.figma.com/design/dfXpSXKWY3FOLlIZIbQNGC/Telas-Hackathon?node-id=0-1&t=rAANqahZo3F58UAm-1)** · **[Visualizar protótipo interativo](https://www.figma.com/proto/dfXpSXKWY3FOLlIZIbQNGC/Telas-Hackathon)**

| Tela | Descrição |
|------|-----------|
| **Login** | Autenticação via CPF + senha FUMP. Token JWT armazenado com Expo Secure Store. |
| **Início** | Dashboard com saldo disponível, ações rápidas (Saldo, Cardápio, Histórico) e últimas recargas. |
| **Saldo** | Detalhes do saldo atual, limite de recarga, dados do consumidor (nome, tipo, centro de custo, situação). |
| **Recarga** | Seleção de valor (R$ 5,00 a R$ 500,00) com opções predefinidas e campo personalizado. |
| **PIX QR Code** | Exibição do QR Code PIX com código copia-e-cola, timer de expiração e botão de compartilhamento. Polling de status com backoff exponencial. |
| **Sucesso** | Confirmação da recarga com valor adicionado, novo saldo e horário. |
| **Histórico** | Abas de Recargas e Refeições com filtros por data. Paginação e scroll infinito. |
| **Perfil** | Dados do consumidor, tipo, centro de custo e situação da conta. |

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
app-ru/
├── src/
│   ├── app/                    # Expo Router — file-based routes
│   │   ├── _layout.tsx         # Root layout: auth gate
│   │   ├── (auth)/             # Login
│   │   └── (tabs)/             # Home, Saldo, Recarga, Perfil
│   ├── features/
│   │   ├── auth/               # Login, JWT management
│   │   ├── balance/            # Saldo, dados do consumidor
│   │   ├── recharge/           # Fluxo PIX, QR Code, polling
│   │   ├── history/            # Histórico de recargas e refeições
│   │   └── profile/            # Perfil do usuário
│   ├── shared/
│   │   ├── components/ui/      # Button, Card, Input, ErrorMessage
│   │   ├── hooks/              # useNetworkStatus
│   │   ├── services/           # API client, secure storage, mock
│   │   └── utils/              # CPF, erros, validação de recarga
│   └── config/                 # Constantes, tema, mensagens de erro
├── app/                        # Expo Router routes
└── .env                        # Variáveis de ambiente (mock mode)
```

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Runtime | Expo SDK 54 (React Native 0.81.5, React 19.1) |
| Navegação | Expo Router 6 (file-based) |
| State | TanStack Query 5 + Zustand 5 |
| Estilo | NativeWind 4 (Tailwind CSS 3.4) |
| HTTP | Axios |
| QR Code | react-native-qrcode-svg |
| Armazenamento | AsyncStorage + expo-secure-store |
| Segurança | Expo Secure Store (Android Keystore) |

---

## Como Testar

```bash
cd app-ru
pnpm install
pnpm start
```

O app roda em **mock mode** por padrão — não precisa de servidor. Use CPF `12345678901` e qualquer senha para logar.

Veja mais detalhes em [`app-ru/README.md`](app-ru/README.md).

---

## Entregas

| Arquivo | Descrição |
|---------|-----------|
| [`docs/apresentacao-prototipo-hackathon.pdf`](docs/apresentacao-prototipo-hackathon.pdf) | Apresentação de slides do conceito e protótipo |
| [`docs/Documento_Conceitual_InovaRU_03.07.2026_assinado.pdf`](docs/Documento_Conceitual_InovaRU_03.07.2026_assinado.pdf) | Documento conceitual assinado pela equipe |
| [`docs/Especificacao_Tecnica_API_InovaRU_v2_03.07.2026_assinado.pdf`](docs/Especificacao_Tecnica_API_InovaRU_v2_03.07.2026_assinado.pdf) | Especificação técnica da API FUMP v2.0 |

---

## Licença

MIT License — Software Livre conforme exigido pelo edital (Seção 8.1).
