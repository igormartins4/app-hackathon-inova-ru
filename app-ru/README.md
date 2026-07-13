# InovaRU — App de Créditos para Restaurantes Universitários

App Android para estudantes da UFMG que permite consultar saldo e recarregar créditos para uso nos Restaurantes Universitários (RUs) via PIX. Desenvolvido para o Hackathon InovaRU 2026/01.

## Stack Tecnológica

- **Runtime:** Expo SDK 54 (React Native 0.81.5, React 19.1)
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

``` html
src/
├── app/                    # Expo Router — rotas baseadas em arquivos
│   ├── _layout.tsx         # Layout raiz: autenticação
│   ├── (auth)/             # Rotas não autenticadas (login)
│   └── (tabs)/             # Rotas autenticadas (home, saldo, recarga, perfil)
├── features/
│   ├── auth/               # Login, gerenciamento de token
│   ├── balance/            # Exibição de saldo, dados do consumidor
│   ├── recharge/           # Fluxo PIX, QR Code, polling
│   ├── history/            # Histórico de recargas e refeições
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

### Executar

```bash
pnpm start
```

Escaneie o QR Code com o app Expo Go. Todas as dependências nativas vêm com o Expo Go — não precisa de build customizado.

### Credenciais de teste (modo mock)

Por padrão, o app roda em **modo mock** — não precisa de servidor. Use qualquer credencial para logar:

- **CPF:** `12345678901`
- **Senha:** qualquer valor (ex: `123456`)

O mock fornece dados fictícios de saldo, histórico de recargas e histórico de refeições.

Para usar a API real da FUMP, crie um arquivo `.env`:

``` json
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### Emulador Android

```bash
pnpm android
```

Ao usar a API real, o emulador conecta em `http://10.0.2.2:3000` (alias de localhost). Certifique-se de que o servidor mock está rodando na porta 3000.

> **Nota:** O emulador deve ter `android:usesCleartextTraffic="true"` para conexões HTTP. Já está configurado em builds de debug via o plugin `withNetworkSecurityConfig`.

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
| `features/profile/` | Perfil do usuário (dados do consumidor) |
| `shared/components/ui/` | Componentes reutilizáveis |
| `shared/hooks/` | Hooks React customizados |
| `shared/services/` | Cliente API, armazenamento, handler de mock |
| `config/` | Constantes, tokens de tema, erros |

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
