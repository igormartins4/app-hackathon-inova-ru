# InovaRU

**Hackathon InovaRU 2026/01 — UFMG**

App mobile para recarga de créditos e gestão de uso nos Restaurantes Universitários (RUs) da UFMG, integrado à API RESTful da FUMP com pagamentos via PIX (MercadoPago).

---

## Visão Geral

O InovaRU resolve os gargalos de fila nos RUs da UFMG ao permitir que estudantes recarreguem créditos, consultem saldos e acompanhem refeições diretamente pelo celular. A autenticação utiliza CPF + senha do sistema institucional da FUMP, sem necessidade de criar contas.

---

## Telas do Protótipo

| Tela | Descrição |
|------|-----------|
| **Login** | Autenticação via CPF + senha FUMP. Token JWT armazenado com Android Keystore. |
| **Início** | Dashboard com saldo disponível, ações rápidas (Saldo, Cardápio, Histórico) e últimas recargas. |
| **Saldo** | Detalhes do saldo atual, limite de recarga, dados do consumidor (nome, tipo, centro de custo, situação). |
| **Recarga** | Seleção de valor (R$ 5,00 a R$ 500,00) com opções predefinidas e campo personalizado. Valores usados recentemente. |
| **PIX QR Code** | Exibição do QR Code PIX com código copia-e-cola, timer de expiração e botão de compartilhamento. Polling de status com backoff exponencial. |
| **Sucesso** | Confirmação da recarga com valor adicionado, novo saldo e horário. Compartilhamento de comprovante. |
| **Cardápio** | Cardápio do dia por RU (Setorial I, Setorial II, Saúde, Direito), com filtro por data e tipo de refeição (Almoço/Jantar). Itens com tags (Vegano, etc). |
| **Histórico** | Abas de Recargas e Refeições com filtros por data. Paginação e scroll infinito. |
| **Perfil** | Dados do usuário, preferências (modo escuro, tamanho da fonte), informações do app e licença. |

**Modo escuro** disponível em todas as telas, seguindo o sistema por padrão.

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

## Integrção com a API

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

- Token JWT armazenado em `EncryptedSharedPreferences` / Android Keystore
- Nunca persistir senha no dispositivo
- Tratamento de HTTP 401 → redireciona para login
- Tratamento de HTTP 429 → mensagem amigável com `Retry-After`
- HTTPS obrigatório (TLS 1.2+)

---

## Estrutura de Telas

```
docs/telas/
├── 1 - login.png
├── 2 - inicio.png
├── 3 - saldo.png
├── 4 - recarga.png
├── 5 - pix-qr-code.png
├── 6 - sucesso.png
├── 7 - cardapio.png
├── 8 - historico.png
├── 9 - perfil.png
└── 10 - todas telas.png
```

---

## Tecnologias (Propostas)

| Camada | Tecnologia |
|--------|------------|
| Mobile | Kotlin + Jetpack Compose |
| Design System | Material Design 3 (Material You) |
| HTTP | Retrofit |
| QR Code | Decodificação Base64 → Bitmap |
| Armazenamento Local | Room (cache offline opcional) |
| Segurança | Android Keystore / EncryptedSharedPreferences |

---

## Acessibilidade e Conectividade

- **Baixa conectividade**: Cache local de dados essenciais (saldo, histórico) para uso em contextos de sinal fraco nos campi
- **Interface acessível**: Navegação por botões grandes, contraste adequado, suporte a tamanho de fonte (P/M/G), modo escuro
- **Letramento digital**: Fluxo simples e direto, linguagem clara, feedback visual em cada etapa

---

## Licença

MIT License — Software Livre conforme exigido pelo edital (Seção 8.1).

---
