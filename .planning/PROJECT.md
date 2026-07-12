# InovaRU — App de Créditos para Restaurantes Universitários

## What This Is

App Android para estudantes da UFMG que permite consultar saldo e recarregar créditos para uso nos Restaurantes Universitários (RUs) via PIX. Desenvolvido para o Hackathon InovaRU 2026/01, o app integra com a API RESTful da FUMP para autenticação, consulta de saldo e geração de pagamentos PIX via MercadoPago. Foco em acessibilidade extrema, animações fluidas e experiência simples para estudantes com diferentes níveis de letramento digital.

## Core Value

O estudante consegue recarregar créditos no RU em menos de 30 segundos, de forma acessível e segura, mesmo com conectividade limitada.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] App Android com React Native (Expo)
- [ ] Login com CPF + senha via API FUMP
- [ ] Armazenamento seguro do token JWT (EncryptedSharedPreferences/Keystore)
- [ ] Consulta de saldo e dados do consumidor
- [ ] Fluxo de recarga PIX completo: valor → QR Code → copia-e-cola → polling → confirmação
- [ ] Tratamento de status: pending, approved, rejected, cancelled, expired
- [ ] Polling com backoff exponencial (3s, 5s, 8s, 13s ± jitter)
- [ ] Timeout de 2 minutos no polling com mensagem amigável
- [ ] Interface acessível: screen reader, contraste WCAG AA, touch targets generosos, fonte ajustável, switch access
- [ ] Navegação por bottom tabs: Home, Saldo, Recarga, Perfil
- [ ] Design criativo e original (não genérico)
- [ ] Animações e microinterações fluidas
- [ ] Tratamento de erros: retry automático, fallback manual, mensagens claras
- [ ] Cache parcial para baixa conectividade (saldo e histórico offline)
- [ ] README.md detalhado com tecnologias e instruções de instalação
- [ ] Código versionado no GitHub com commits contínuos
- [ ] APK gerado via EAS Build

### Out of Scope

- Backend próprio — a API é fornecida pela FUMP, não precisamos criar
- Cadastro de usuários — o app apenas autentica, não cria contas
- Pagamento por outros métodos — apenas PIX
- Suporte a iOS — edital pede Android
- Publicação na Play Store — entrega é APK + código
- Multi-idioma — português apenas

## Context

- **Projeto**: Hackathon InovaRU UFMG 2026/01
- **Supervisão**: Prof. João Eduardo Montandon de Araujo Filho (DCC/UFMG)
- **Parceria**: FUMP (Fundação Universitária Mendes Pimentel)
- **API**: RESTful Node.js/Express + SQL Server, fornecida pela FUMP
- **Cronograma**:
  - Ideação: concluída
  - Pitch do Conceito: apresentado
  - Desenvolvimento: 12/07 a 18/07 (início hoje)
  - Entrega: 18/07
- **Referência técnica**: Projeto interno-rotas-master (React 19, Vite, Tailwind, feature-based architecture)
- **Equipe**: 2-3 pessoas (Dev + Designer)
- **Entrega**: APK + repositório GitHub público com README

## Constraints

- **Timeline**: 1 semana de desenvolvimento (12/07 a 18/07)
- **Plataforma**: Android apenas (React Native/Expo)
- **API**: Fornecida pela FUMP, não podemos modificar. Contrato estabilizado em v2.0 (03/07/2026)
- **Mock Local Obrigatório**: Não há ambiente de homologação/staging da FUMP. Todo desenvolvimento e teste é 100% contra mocks locais (Mockoon, JSON Server ou Postman)
- **Tráfego HTTP em Dev**: O Android bloqueia texto puro por padrão. O `AndroidManifest.xml` deve habilitar `usesCleartextTraffic="true"` em debug para permitir conexões HTTP ao mock local
- **Rede do Emulador**: Requisições do emulador Android ao mock na máquina hospedeira usam `http://10.0.2.2:<porta>` (não `localhost`)
- **Segurança**: Token JWT em expo-secure-store nunca em texto puro. Nunca persistir senha
- **Licenciamento**: Software Livre (obrigatório pelo edital)
- **Acessibilidade**: WCAG AA mínimo, suporte a TalkBack, Switch Access, fonte ajustável
- **Conectividade**: App deve funcionar parcialmente offline (cache de saldo/histórico)
- **Competição**: Equipes que trouxerem projetos prontos antes do desenvolvimento serão desclassificadas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native (Expo) | Familiaridade com React (interno-rotas), build Android rápido via EAS | ✓ Decidido |
| Feature-based architecture | Padrão validado no interno-rotas, organização clara | ✓ Decidido |
| Zustand + TanStack Query | Comprovado no interno-rotas, simples e eficiente | ✓ Decidido |
| Bottom tabs navigation | Padrão mobile natural, fácil acesso às funções principais | ✓ Decidido |
| Mock API primeiro | Permite desenvolver sem dependência da FUMP, integra depois | ✓ Decidido |
| Acessibilidade extrema | Diferencial competitivo + exigência do edital | ✓ Decidido |
| Design criativo próprio | Originalidade é critério de avaliação | ✓ Decidido |
| EAS Build para APK | Mais simples que build local com Android Studio | ✓ Decidido |
| QR Code via Base64 nativo | Usar decodificação Base64 do campo `qr_code_base64` da API, sem renderização vetorial local | ✓ Decidido |
| Sem ambiente staging FUMP | Desenvolvimento 100% contra mocks locais — não existe homologação fornecida pela FUMP | ✓ Decidido |
| Network security config XML | Criar `network_security_config.xml` para permitir HTTP em debug ao mock local | ✓ Decidido |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-12 — FUMP API v2.0 contract integration + date reset*
