# Rangoo Universitário — App de Créditos para Restaurantes Universitários

App Android para estudantes da UFMG que permite consultar saldo e recarregar créditos para uso nos Restaurantes Universitários (RUs) via PIX. Desenvolvido para o Hackathon InovaRU 2026/01.

## Stack Tecnológica

- **Runtime:** Expo SDK 57 (React Native 0.86, React 19.2)
- **Navegação:** Expo Router 6 (file-based, React Navigation 7)
- **Estado:** TanStack Query 5 (estado do servidor) + Zustand 5 (estado do cliente)
- **Estilo:** NativeWind 4 (Tailwind CSS 3.4)
- **Segurança:** expo-secure-store (Android Keystore)
- **Armazenamento:** AsyncStorage (compatível com Expo Go)
- **QR Code:** react-native-qrcode-svg
- **Animações:** React Native Reanimated 4
- **Build:** EAS Build

## Arquitetura

Estrutura de pastas por domínio com isolamento estrito:

```
src/
├── app/                    # Expo Router — rotas baseadas em arquivos
│   ├── _layout.tsx         # Layout raiz: autenticação + tema
│   ├── (auth)/             # Rotas não autenticadas (login)
│   └── (tabs)/             # Rotas autenticadas (início, saldo, recarga, cardápio, histórico, perfil)
├── features/
│   ├── auth/               # Login, gerenciamento de token
│   ├── balance/            # Exibição de saldo, dados do consumidor
│   ├── recharge/           # Fluxo PIX, QR Code, polling
│   ├── history/            # Histórico de recargas e refeições (API real)
│   ├── cardapio/           # Cardápio do dia (mock — não existe endpoint na spec)
│   └── profile/            # Perfil do usuário (reutiliza dados do balance)
├── shared/
│   ├── components/
│   │   ├── ui/             # Button, Card, Input, ErrorMessage, etc.
│   │   └── accessibility/  # AccessibleText
│   ├── hooks/              # useNetworkStatus, useAccessibility
│   ├── services/           # Cliente API, armazenamento seguro, cache, mock
│   └── utils/              # Helpers (CPF, erros, validação de recarga)
├── store/                  # Stores Zustand
└── config/                 # Constantes, tema, mensagens de erro
```

**Fluxo de dados:** API → TanStack Query → Componentes → Zustand (estado da UI)
**Segurança:** JWT no expo-secure-store, nunca em texto plano
**Offline:** TanStack Query stale-while-revalidate + cache AsyncStorage

## Configuração

### Pré-requisitos

- Node.js 18+
- pnpm (`corepack enable` ou `npm install -g pnpm`)
- App Expo Go (Android) ou Android Studio (para emulador)

### Instalação

```bash
pnpm install
```

## Modos de execução

O app tem **dois jeitos de mockar a API**, escolhidos pela variável `EXPO_PUBLIC_USE_MOCK` no `.env`. Escolha um:

| | Mock em-processo (padrão) | Servidor Mockoon |
|---|---|---|
| **Setup** | Zero — já vem pronto | `pnpm mock` num segundo terminal |
| **`.env`** | `EXPO_PUBLIC_USE_MOCK=true` (ou nem crie o `.env`) | `EXPO_PUBLIC_USE_MOCK=false` + `EXPO_PUBLIC_API_URL` |
| **Roda de verdade na rede?** | Não — tudo dentro do processo JS | Sim — HTTP real em `localhost:3001` |
| **Testa o polling de verdade?** | Não — aprova o pagamento na 1ª consulta | Sim — simula `pending` 3x antes de aprovar |
| **Testa `network_security_config.xml`?** | Não | Sim |
| **Quando usar** | Desenvolvimento rápido de UI | Testar fluxo de pagamento/erro de ponta a ponta |

### Opção A — Mock em-processo (mais simples)

Não precisa de nada além do app rodando (assumindo que já rodou `pnpm install` acima). Um único terminal:

```bash
pnpm start
```

Escaneie o QR Code com o app Expo Go. Todas as dependências nativas vêm com o Expo Go — não precisa de build customizado.

**Login:** qualquer CPF de 11 dígitos (ex.: `12345678901`) + qualquer senha (ex.: `123456`) — o mock não valida senha.

### Opção B — Servidor Mockoon (rede real)

Precisa de **dois terminais rodando ao mesmo tempo** — os dois processos ficam vivos, não terminam sozinhos.

**Terminal 1 — sobe o mock server e deixa ele rodando:**

```bash
cd rangoo-app
pnpm mock
```

Fica ouvindo em `http://localhost:3001`, mostrando o log de cada requisição. `Ctrl+C` pra parar.

**Terminal 2 — configura o `.env` e sobe o app:**

```env
# rangoo-app/.env
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001
```

```bash
cd rangoo-app
pnpm start
```

> `10.0.2.2` é o alias que o **emulador Android** usa pra falar com a máquina host — é o `localhost` de fora do emulador. Testando no navegador (`pnpm web`) ou no Expo Go de um celular físico na mesma rede Wi-Fi, troque por `http://<ip-da-sua-maquina>:3001` (ex.: `192.168.1.50`).

**Login (Mockoon):** CPF `12345678901` + senha **exatamente** `senha_do_usuario` (única credencial configurada com sucesso — qualquer outra senha responde `401`, de propósito, pra testar o fluxo de erro).

**O que esse mock cobre, rota por rota:**

| Rota | Cenários simulados |
|------|---------------------|
| `POST /usuarios/login` | 200 com `password=senha_do_usuario`; 401 (default) qualquer outra senha |
| `GET /creditos/saldo` | 200 ativo (default); `?situacao=B` → bloqueado; `?situacao=1` → 404 inativo |
| `POST /creditos/pagamento` | 201 (default, com `expiration` real +30min); 422 se `valor` fora de R\$5–500; `?force=429` → 429 com header `Retry-After: 30` |
| `GET /creditos/pagamento/:id/status` | **Sequencial**: 1ª–3ª consulta `pending`, 4ª+ `approved`+`creditado:true`, depois reinicia o ciclo — testa o polling/backoff de verdade |
| `GET /creditos/recargas` | 200 lista paginada |
| `GET /creditos/refeicoes` | 200 lista paginada, com códigos de filial reais (Anexo A) |

Validar o arquivo sem subir o servidor: `pnpm mock:validate`. Editar/adicionar rotas: abra `mock/mockoon-environment.json` direto, ou importe no [app desktop do Mockoon](https://mockoon.com/download/) pra editar visualmente e reexportar.

### Emulador Android

```bash
pnpm android
```

> **Nota:** O emulador precisa liberar tráfego HTTP puro pra `10.0.2.2` (Android bloqueia cleartext por padrão). Já está configurado via o plugin `withNetworkSecurityConfig` (`android:usesCleartextTraffic` + `network_security_config.xml`, restrito a esse IP — não libera cleartext geral).

### EAS Build

```bash
pnpm exec eas build --platform android
```

## Testes

```bash
pnpm test
```

Os testes unitários cobrem o algoritmo de polling, validação de CPF e lógica de limites de recarga.

## Estrutura do Projeto

| Diretório | Finalidade |
|-----------|------------|
| `app/` | Rotas Expo Router (file-based) |
| `features/auth/` | Login, gerenciamento de JWT |
| `features/balance/` | Exibição de saldo, status do consumidor |
| `features/recharge/` | Fluxo de pagamento PIX, QR Code, polling |
| `features/history/` | Histórico de recargas e refeições |
| `features/cardapio/` | Cardápio do dia (mock — sem endpoint na spec v2.0) |
| `features/profile/` | Perfil do usuário (dados do consumidor) |
| `shared/components/ui/` | Componentes reutilizáveis |
| `shared/hooks/` | Hooks React customizados |
| `shared/services/` | Cliente API, armazenamento, handler de mock |
| `config/` | Constantes, tokens de tema, erros |
| `mock/` | Ambiente Mockoon (`pnpm mock`) — ver seção "Modos de execução" |

## API

Conecta na API FUMP v2.0. Veja `src/config/constants.ts` para os endpoints.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/usuarios/login` | POST | Autenticar com CPF + senha |
| `/creditos/saldo` | GET | Obter saldo e dados do consumidor |
| `/creditos/pagamento` | POST | Criar pagamento PIX |
| `/creditos/pagamento/:id/status` | GET | Consultar status do pagamento |
| `/creditos/recargas` | GET | Histórico de recargas |
| `/creditos/refeicoes` | GET | Histórico de refeições |

## Licença

MIT License — Hackathon InovaRU 2026/01
