# Decisões de UI — divergências e escolhas de implementação

Este documento registra decisões de produto/UI tomadas durante a refatoração do app, especialmente onde a interface diverge de algo listado na "Especificação Técnica - API InovaRU v2.0" (`docs/especificacao_tecnica.md`, documento assinado — **nunca editado** para refletir estas decisões). Sempre que houver conflito real de contrato de API, a especificação técnica prevalece; o que está aqui são apenas ajustes de UI/mock que não alteram o contrato.

## Lista de Restaurantes Universitários (RUs)

O Anexo A da especificação lista 5 RUs (códigos `0001` a `0005`, incluindo `0005` RU HRTN). Esse conjunto de 5 é a lista **oficial**, usada em qualquer lugar do app que reflita dados reais vindos da API (filtro de `filial` no histórico de refeições, exibição de `filial.nome` retornado pela API, banners gerais).

A tela de **Cardápio**, no entanto, não é sustentada por um endpoint oficial da API InovaRU (a especificação não define endpoint de cardápio — ver seção 1.1/2 do documento). Ela consome um scraper não-oficial do site da FUMP, que só publica cardápio para 4 RUs: `RU Setorial 1`, `RU Setorial 2`, `RU Saúde/Direito` (combinado) e `RU ICA`. O RU HRTN (`0005`) não possui cardápio publicado nesse scraper, então não aparece como opção selecionável na tela de Cardápio.

Por isso o app mantém **duas listas de RUs**, propositalmente diferentes:

- `rangoo-app/src/config/restaurantes.ts` → `RESTAURANTES_OFICIAIS` (5 itens, nomes exatos do Anexo A) — uso geral do app.
- `rangoo-app/src/features/cardapio/constants.ts` → `RESTAURANTES_CARDAPIO` (4 itens, sem HRTN) — uso exclusivo da tela de Cardápio, espelhando `FILIAL_TO_FUMP_ID` em `cardapioApi.ts`.

Isso não é uma alteração do contrato da API — é apenas a UI reconhecendo que a fonte de dados do Cardápio (mock/scraper) tem cobertura menor que o conjunto oficial de RUs do Anexo A.
