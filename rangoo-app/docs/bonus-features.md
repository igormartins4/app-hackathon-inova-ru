# Features bônus fora da API FUMP v2.0

Este arquivo separa o que foi implementado para demonstração do que pertence ao contrato assinado em `docs/especificacao_tecnica.md`.

## Fora do contrato

| Feature | Status | Observação |
| --- | --- | --- |
| Transferência de saldo | Mock local | A API FUMP v2.0 não define endpoint de transferência. O app usa `POST /creditos/transferir` apenas quando o mock local está ativo. |
| Material You simplificado | Parcial | Usa a cor de destaque nativa do Android para props nativas quando o tema está em `system`. Não altera o contrato nem payloads da API. |
| Animações com opção reduzir movimento | App-only | Reanimated é usado somente na UI. Pode ser desligado em Perfil > Acessibilidade. |
| Card de saldo projetado na recarga | App-only | Usa apenas `GET /creditos/saldo` e o valor selecionado localmente. Não credita saldo antes do webhook. |

## Dentro do contrato

- Login: `POST /usuarios/login`
- Saldo: `GET /creditos/saldo`
- PIX: `POST /creditos/pagamento`
- Polling: `GET /creditos/pagamento/:paymentId/status`
- Histórico: `GET /creditos/recargas` e `GET /creditos/refeicoes`

## Regra de demonstração

Transferência é bônus visual e deve ser apresentada como simulação. Para produção, a FUMP precisaria definir endpoint, regras de autorização, auditoria, limite, antifraude e histórico próprio.
