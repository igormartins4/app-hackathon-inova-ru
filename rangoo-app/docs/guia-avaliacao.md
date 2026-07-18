# Guia de avaliação e manutenção

Este guia ajuda a equipe organizadora a navegar pelo Rangoo Universitário durante a avaliação do Hackathon InovaRU 2026/01.

**Equipe:** Igor de Oliveira Martins dos Santos · Ítalo Leal Lana Santos · Vitor Hugo Dias Santos

## O que avaliar no app

- Login com CPF e senha FUMP em modo mock.
- Consulta de saldo, limite de recarga e dados do consumidor.
- Recarga PIX com QR Code, copia-e-cola e polling até status final.
- Histórico de recargas e refeições com detalhes em dialog acessível.
- Cardápio do dia por RU, usando integração pública não-oficial da FUMP.
- Restaurantes: detalhes de cada RU com horários, avisos de férias, status em tempo real e como chegar.
- Favoritos na Home com status e horários dos restaurantes escolhidos.
- Transferência de saldo entre estudantes com comprovante compartilhável.
- Perfil com acessibilidade: tema claro/escuro, alto contraste, reduzir movimento (respeita o sistema), fonte e cores do sistema.
- Modo demonstração no Perfil para simular bloqueio, inatividade, rate limit, erro 500 e estados finais do PIX.
- Tab bar expande para sidebar lateral em tablets (>= 768px).
- Todos os alerts nativos substituídos por AppDialog acessível e consistente.

## Como rodar

```bash
pnpm install
pnpm start
```

`pnpm start` usa `expo start --offline` para evitar falhas em redes com certificado autoassinado. Para modo online da Expo CLI, use `pnpm start:online`.

## Login de demonstração

- CPF: use um CPF válido com 11 dígitos, por exemplo `52998224725`.
- Senha: qualquer valor não vazio no mock embutido.

## Onde localizar as partes principais

| Área | Caminho |
| --- | --- |
| Rotas/telas | `app/` |
| Login | `src/features/auth/` |
| Saldo | `src/features/balance/` |
| Recarga PIX | `src/features/recharge/` |
| Histórico | `src/features/history/` |
| Cardápio | `src/features/cardapio/` |
| Restaurantes | `src/features/restaurantes/` |
| Transferência bônus | `src/features/transfer/` |
| API/mock/cache | `src/shared/services/` |
| Máscaras e schemas | `src/shared/utils/` |
| UI base | `src/shared/components/ui/` |
| Tema e contraste | `global.css`, `tailwind.config.js`, `src/config/theme.ts` |
| Favoritos | `src/store/favoriteRUsStore.ts` |

## Regras de contrato

- A fonte oficial é `../docs/especificacao_tecnica.md`.
- Token JWT fica só no `expo-secure-store`.
- Senha nunca é persistida.
- CPF não é enviado em body/URL fora do login; o backend identifica usuário pelo JWT.
- QR Code autoritativo vem da API; geração local é apenas fallback para mock incompleto.

## Verificação técnica

```bash
pnpm exec tsc --noEmit
pnpm exec biome check .
pnpm exec jest
pnpm exec expo export --platform android
```

Se `expo-doctor` falhar com `self-signed certificate in certificate chain`, é problema de certificado da rede/local do Node. Workaround de diagnóstico:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; pnpm dlx expo-doctor --verbose
```
