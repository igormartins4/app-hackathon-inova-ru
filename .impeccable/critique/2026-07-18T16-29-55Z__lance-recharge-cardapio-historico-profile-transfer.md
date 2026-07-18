---
target: "rangoo-app (app inteiro: login, home, balance, recharge, cardapio, historico, profile, transfer)"
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-07-18T16-29-55Z
slug: lance-recharge-cardapio-historico-profile-transfer
---
Method: dual-agent (A: design-review-subagent · B: detector-evidence-subagent)
Re-run after applying the 5 fixes from the previous critique.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Countdown com bandas de urgência, banners offline/stale, pagamento pendente persistido |
| 2 | Match System / Real World | 4 | CPF, PIX, RU — vocabulário direto |
| 3 | User Control and Freedom | 3 | Cancelar recarga com confirmação; retry não restaurava valor (corrigido agora) |
| 4 | Consistency and Standards | 4 | 0 cor literal fora de theme.ts, confirmado por scan mecânico |
| 5 | Error Prevention | 3 | Transfer já confirma antes de enviar; recarga não tem confirmação equivalente (assimetria aceitável — recarga só gera QR, não é irreversível) |
| 6 | Recognition Rather Than Recall | 4 | Presets, recargas recentes, favoritos de RU |
| 7 | Flexibility and Efficiency | 3 | Biometria, favoritos, locale — sem atalho de "repetir última recarga" |
| 8 | Aesthetic and Minimalist Design | 4 | Densidade média-baixa mantida; Home e Cardápio já resolvidos na rodada anterior |
| 9 | Error Recovery | 3 → correção aplicada | PaymentError tratava timeout igual a rejeitado — agora tem CTA extra pro histórico |
| 10 | Help and Documentation | 3 | AboutAppModal, ajuda no login — sem FAQ sobre PIX pago após timeout do app |
| **Total** | | **35/40** | **Good, quase Excellent — subiu de 29/40** |

## Anti-Patterns Verdict

**LLM assessment**: Não é AI slop. Sistema com decisões documentadas (comentários citando WCAG, Lei de Miller, peak-end). Os 5 fixes anteriores foram verificados no código, não só na descrição — todos confirmados.

**Deterministic scan**: 340 usos de token semântico vs 5 inline (todos via themeColors, não hex cru). 0 hex literal em JSX. 2 touch targets reais abaixo de 48dp encontrados (LoginForm toggle de senha 40dp sem hitSlop, "voltar pra hoje" do cardápio 44dp sem hitSlop) — ambos corrigidos nesta rodada.

## Overall Impression

Depois dos 5 fixes da rodada anterior, o app subiu de 29 pra 35/40. Os problemas que sobraram eram menores e mais espalhados: um ponto real de risco emocional (timeout tratado igual a rejeição, numa tela de pagamento), uma feature de dinheiro escondida demais (Transfer), e dois touch targets abaixo do mínimo. Todos corrigidos nesta rodada.

## What's Working

- Retomada de pagamento pendente entre fechamentos do app (`recharge.tsx:79-98`).
- Fallback em 3 camadas pro QR Code (base64 → link Mercado Pago → QR local gerado).
- Comprovante de recarga compartilhável via `captureRef` + share nativo.

## Priority Issues (encontrados e já corrigidos nesta rodada)

**[P1] PaymentError tratava timeout igual a pagamento rejeitado**
- Por que importava: timeout é um corte client-side (120s) independente do prazo real do PIX no banco — o pagamento pode ter sido confirmado depois. Tratar igual a "rejeitado" deixa o estudante sem saber se o dinheiro saiu.
- Fix aplicado: botão secundário "Ver histórico de recargas" só aparece no status timeout, direciona pro histórico de recargas antes de tentar de novo.

**[P2] Transferência era só um link opaco no fim da Home, sem presença na tab bar**
- Por que importava: recurso que mexe com dinheiro de verdade, mas ficava indiscoverable pro Jordan (primeira vez).
- Fix aplicado: promovido pro quick actions da Home (3 tiles: cardápio, histórico, transferir), teaser antigo removido.

**[P2] Chip de RU + estrela de favorito no cardápio com zona de toque apertada**
- Por que importava: risco de fat-finger pro Casey (uma mão, rede ruim) — favoritar sem querer ao tentar trocar de RU.
- Fix aplicado: mais espaço visual entre os dois (gap-1 → gap-2) e hitSlop assimétrico na estrela, sem invadir a área do chip.

**[P3] Retry da recarga perdia o valor selecionado**
- Por que importava: RechargeForm remonta ao voltar de polling/error, perdendo o estado interno — contradiz "reconhecimento em vez de memorização" e a meta de recarga em menos de 30s.
- Fix aplicado: `initialAmount` reidrata a seleção a partir do valor já guardado no componente pai.

**[P3] Seletor de cenário demo (7 botões) dependia só de env var, sem garantia em build de produção**
- Por que importava: build mal configurado (env var ausente/errada) poderia expor o seletor de demo pra estudante real.
- Fix aplicado: gate agora exige `__DEV__` também — nunca aparece num bundle de release, independente do env var.

**Touch targets abaixo de 48dp (achado do scan mecânico, não do LLM)**
- `LoginForm.tsx`: toggle de mostrar/ocultar senha, 40dp sem hitSlop.
- `cardapio.tsx`: link "voltar pra hoje", 44dp sem hitSlop.
- Fix aplicado: hitSlop de 8dp em ambos, atingindo o mínimo efetivo de 48dp+.

## Persona Red Flags (resolvidos)

**Jordan**: Não achava a Transferência (agora nos quick actions). Via a mesma tela de erro genérica pra timeout e rejeição (agora diferenciada).

**Casey**: Risco de favoritar RU sem querer ao trocar de restaurante (agora com mais espaço). Sem indicação de "ainda checando" durante o polling além do relógio — não corrigido nesta rodada, baixa prioridade.

## Minor Observations

- `Input.tsx` continua um arquivo vazio/vestigial — cada tela reimplementa seu próprio bloco de input. Não é bug, mas risco de manutenção.
- Frase de saudação usa `Math.random()` sobre um array de 1 elemento só — código morto inofensivo, sugere feature de frases rotativas nunca completada.
- Duas opções do menu de ajuda do login apontam pra mesma URL (fump.ufmg.br) — redundante.

## Questions to Consider

- Se o pagamento pendente sobrevive a um fechamento do app, por que o caminho de falha (timeout) não tinha a mesma filosofia de resiliência até agora?
- Vale a pena adicionar um indicador de "ainda verificando..." periódico durante o polling, além do relógio regressivo, pra tranquilizar quem está numa rede instável?
