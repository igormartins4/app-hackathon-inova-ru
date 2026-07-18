# Product

## Register

product

## Platform

android

## Team

| Name | Role |
|------|------|
| Igor de Oliveira Martins dos Santos | Development |
| Ítalo Leal Lana Santos | Development |
| Vitor Hugo Dias Santos | Development |

## Users

Estudantes da UFMG que usam os Restaurantes Universitários (RUs) e precisam recarregar créditos via PIX. Autenticam com CPF + senha institucional da FUMP — sem conta própria do app. Contexto de uso real: no ou perto do RU, muitas vezes sob rede móvel instável, tentando resolver a recarga rápido antes da fila andar ou o horário de refeição fechar.

## Product Purpose

O Rangoo Universitário existe pra eliminar o gargalo de fila nos RUs, permitindo que o estudante recarregue créditos, consulte saldo, acompanhe refeições e veja informações dos restaurantes (horários, avisos, cardápio) direto pelo celular, sem precisar de guichê. Sucesso é o estudante conseguir recarregar em menos de 30 segundos, de forma acessível e segura, mesmo com conectividade limitada.

## Positioning

O único jeito de recarregar crédito do RU pelo celular, com login institucional que a UFMG já usa — sem criar conta nova, sem depender de guichê, funcionando mesmo com internet ruim. Informações dos RUs (horários, avisos, cardápio) sempre à mão.

## Brand Personality

Confiável, rápido, acessível. O tom é de ferramenta séria que trata dado institucional e dinheiro com seriedade, mas sem soar como app bancário corporativo e frio — é feito pra estudante, no contexto de universidade, não de banco. Evitar qualquer estética "fintech genérica".

## Anti-references

Nada que pareça app bancário corporativo genérico (visual frio, distante, excesso de formalidade visual). Sem referência específica citada além dessa rejeição.

## Design Principles

- Rapidez percebida acima de tudo: cada tela do fluxo de recarga precisa comunicar progresso e reduzir ansiedade de espera (PIX, polling, confirmação).
- Confiança sem frieza: seriedade no tratamento de dado institucional e dinheiro, sem cair em estética bancária corporativa.
- Degradar graciosamente, nunca quebrar: rede instável no RU é o caso comum, não a exceção — todo estado precisa de loading, erro e retry explícitos.
- Uma fonte de verdade visual: cor nunca é hardcoded, sempre token semântico (`global.css` + `tailwind.config.js`), pra dark mode e alto contraste nunca divergirem.

## Accessibility & Inclusion

WCAG AA (contraste mínimo 4.5:1 pra texto normal) já é regra dura do projeto — todo texto novo precisa ser calculado contra o fundo real antes de aprovar, não estimado. Modo alto contraste e dark mode já existem como temas (`global.css`) e devem ser mantidos em qualquer componente novo. Toque mínimo 48x48dp (já definido em AGENTS.md) em todo elemento interativo. Tratar rede instável/lenta como caso normal de uso (loading states, retry, feedback claro de offline), não como exceção rara. Suporte a fontes do sistema maiores (Android font scale) sem quebrar layout — `ScaledText` escala fontSize e lineHeight proporcionalmente. Rótulos acessíveis (`accessibilityLabel`) em todo elemento interativo, especialmente em ícones sem texto. Dialogs nativos (`Alert.alert`) substituídos por `AppDialog` acessível e consistente com a marca. Redução de movimento respeita preferência do app + sistema (listener em tempo real via AccessibilityInfo). Tab bar expande para sidebar lateral em tablets. Qualquer decisão de acessibilidade nova deve respeitar o contrato de `docs/especificacao_tecnica.md` — nunca inventar comportamento de API pra resolver um caso de UI.
