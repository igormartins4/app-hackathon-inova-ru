# Guia de avaliação e manutenção

Este guia ajuda a equipe organizadora a navegar pelo Rangoo Universitário durante a avaliação do Hackathon InovaRU 2026/01.

## O que avaliar no app

- Login com CPF e senha FUMP em modo mock.
- Consulta de saldo, limite de recarga e dados do consumidor.
- Recarga PIX com QR Code, copia-e-cola e polling até status final.
- Histórico de recargas e refeições.
- Cardápio do dia por RU, usando integração pública não-oficial da FUMP.
- Perfil com acessibilidade: tema claro/escuro, alto contraste, reduzir movimento, fonte e cores do sistema.
- Modo demonstração no Perfil para simular bloqueio, inatividade, rate limit, erro 500 e estados finais do PIX.

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
| Transferência bônus | `src/features/transfer/` |
| API/mock/cache | `src/shared/services/` |
| Máscaras e schemas | `src/shared/utils/` |
| UI base | `src/shared/components/ui/` |
| Tema e contraste | `global.css`, `tailwind.config.js`, `src/config/theme.ts` |

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
