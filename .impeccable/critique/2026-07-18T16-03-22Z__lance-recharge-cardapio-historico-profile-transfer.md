---
target: "rangoo-app (app inteiro: login, home, balance, recharge, cardapio, historico, profile, transfer)"
total_score: 29
p0_count: 1
p1_count: 2
timestamp: 2026-07-18T16-03-22Z
slug: lance-recharge-cardapio-historico-profile-transfer
---
Method: dual-agent (A: design-review-subagent · B: detector-evidence-subagent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Falha de rede na recarga não deixa claro se o PIX pode ter ido mesmo assim |
| 2 | Match System / Real World | 4 | PIX, CPF, RU — vocabulário bate 100% com o estudante |
| 3 | User Control and Freedom | 2 | Transferência não tem review/undo antes do envio (recarga tem, transfer não) |
| 4 | Consistency and Standards | 4 | Button/Card/ScaledText uniformes nas 8 telas, confirmado por scan mecânico |
| 5 | Error Prevention | 1 | Transfer submete direto sem confirmar nome do destinatário antes |
| 6 | Recognition Rather Than Recall | 4 | Preset de valores, recargas recentes, RU favorito |
| 7 | Flexibility and Efficiency | 3 | Biometria + presets bons; transfer sem atalho pra destinatário recente |
| 8 | Aesthetic and Minimalist Design | 2 | Home (7+ blocos) e Cardápio (3 eixos de filtro) violam a própria regra de densidade baixa do produto |
| 9 | Error Recovery | 3 | Retry consistente, mas PaymentError não diferencia causa da falha |
| 10 | Help and Documentation | 3 | "Precisa de ajuda?" no login, AboutAppModal — cobertura mínima razoável |
| **Total** | | **29/40** | **Good — base sólida, áreas fracas específicas** |

## Anti-Patterns Verdict

**LLM assessment**: Limpo dos tells clássicos (sem gradiente em texto, sem glassmorphism, sem hero-metric). Ponto de homogeneidade real: o "eyebrow" uppercase-tracked se repete idêntico em toda seção das 8 telas — documentado no DESIGN.md, mas a repetição sem variação lê como templated.

**Deterministic scan**: 0 cor hex/Tailwind cru fora do arquivo de tokens, 0 `<Text>` fora de `ScaledText`, 0 touch target real abaixo de 48dp, 0 TODO/FIXME esquecido, 336:0 proporção token-semântico vs literal. Detector achou 6 hits, todos no próprio arquivo de definição de token (`theme.ts`) ou 1 classe arbitrária de fonte — não são violação de consumo.

## Overall Impression

App não parece "feito por IA" e tem disciplina de acessibilidade acima da média pra um hackathon. O problema real não é estética — é que a tela mais crítica (Home, sob pressão de fila) fica mais densa do que o próprio DESIGN.md manda, e a Transferência não tem a mesma rede de segurança que a Recarga já tem.

## What's Working

- Resiliência a interrupção: pagamento PIX pendente persiste no AsyncStorage e retoma (inclusive já-aprovado) após fechar o app — `recharge.tsx:75-97`.
- Acessibilidade medida, não estimada: contraste comentado com ratio real por token em `global.css`.
- Fidelidade ao contrato: `StatusBadge` renderiza `situacao` como texto exato (Anexo C).

## Priority Issues

**[P0] Transferência sem confirmação antes de mover dinheiro de verdade**
- Por que importa: `transfer.tsx:27-44` + `TransferForm.tsx:52-61` — toque no botão já chama `createTransfer` com `destinatario` numérico cru; nome só aparece DEPOIS do sucesso.
- Fix: passo de revisão que resolve e mostra o nome do destinatário antes da confirmação final.
- Comando sugerido: `/impeccable harden transfer.tsx`

**[P1] Countdown do PIX usa vermelho de alarme desde o segundo 1**
- Por que importa: `QrCodeDisplay.tsx:31-37` — contradiz o princípio do produto de "reduzir ansiedade de espera".
- Fix: estilo neutro/primary-container até faltar ~60s.
- Comando sugerido: `/impeccable quieter recharge`

**[P1] Home viola a própria regra de "poucos elementos por tela"**
- Por que importa: `home.tsx` empilha 7+ blocos competindo antes de scroll, na tela mais pressionada por tempo.
- Fix: colapsar notices/saldo-baixo num slot só, considerar tirar recargas recentes da landing.
- Comando sugerido: `/impeccable distill home.tsx`

**[P2] Cardápio empilha 3 eixos de filtro simultâneos antes de mostrar comida**
- Por que importa: `cardapio.tsx:128-261` — RU + calendário + refeição, tudo visível ao mesmo tempo.
- Fix: default pro RU/refeição mais provável, revelar resto progressivamente.
- Comando sugerido: `/impeccable onboard cardapio.tsx`

**[P3] Recarga tem 5 chips de valor preset**
- Por que importa: `RechargeForm.tsx:20` — ultrapassa teto de 4 opções.
- Fix: cortar pra 4 presets + custom.
- Comando sugerido: `/impeccable layout recharge.tsx`

## Persona Red Flags

**Jordan (primeira vez)**: Home com 7 blocos + carousel trocando a cada 8s sem onboarding. Teaser de "transferir" não explica formato do destinatário. `PaymentError.tsx` não diferencia causa da falha.

**Casey (distraído, rede ruim)**: Persistência de pagamento pendente é o melhor ponto pro cenário dele. Carousel auto-avançando é alvo móvel. Transfer é o pior cenário: uma mão, rede instável, sem confirmação antes do envio irreversível.

## Minor Observations

- `app/_layout.tsx:89-92` carrega fontes Lora/JetBrainsMono não documentadas no DESIGN.md (só "System").
- `StatusBadge.tsx:23` cai pra 'INATIVO' em qualquer situacao != 'A'/'B'.
- `BalancePreview.tsx:40-43` aninha Ionicons dentro de Text — testar em escala de fonte grande.
- Demo scenario switcher usa guard `USE_MOCK !== 'false'` — confirmar que nunca vaza pra produção.

## Questions to Consider

- Por que a ação mais urgente (recarregar) é a quarta coisa na Home, não a primeira?
- Transfer mexe com dinheiro sem confirmar nome — por que não pegar emprestado o padrão de confiança do próprio PIX?
- O countdown é vermelho de alarme desde o segundo 1 — e se a espera pudesse parecer calma até faltar 1 minuto?
