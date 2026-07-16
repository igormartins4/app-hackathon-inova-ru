# Especificação Técnica: API InovaRU - Integração do Aplicativo Móvel

---

## Página 1

### FUMP - Projeto InovaRU

**Fundação Universitária Mendes Pimentel (FUMP)** **Assistência Estudantil da UFMG** ---

# PROJETO INOVARU

## Hackathon de Créditos Universitários - 2026/01

### Especificação Técnica

**API InovaRU - Integração do Aplicativo Móvel** **Especificação Técnica - API InovaRU v2.0**

| Campo | Informação |
| --- | --- |
| **Versão** | 2.0 (final) evolui a versão preliminar 1.0 |
| **Data** | 03/07/2026 |
| **Emissor** | FUMP - Fundação Universitária Mendes Pimentel |
| **Backend** | Node.js + Express.js / Banco de dados SQL Server |
| **Gateway de pagamento** | MercadoPago (PIX) |
| **Contato técnico FUMP** | Leonardo Cunha - <leonardo.cunha@fump.ufmg.br> |
| **Contato DACompSI** | Raúl Simioni - <raulsimioni@dcc.ufmg.br> |
| **Documento complementar** | Documento Conceitual (fluxo de telas e wireframes) |

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 1 de 14*

---

## Página 2

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

## Sumário

1. [Visão geral](https://www.google.com/search?q=%231-vis%C3%A3o-geral) ..................................................................................................................................... 3

* [1.1. Componentes](https://www.google.com/search?q=%2311-componentes) .......................................................................................................................... 3
* [1.2. O que mudou em relação à versão preliminar (1.0)](https://www.google.com/search?q=%2312-o-que-mudou-em-rela%C3%A7%C3%A3o-%C3%A0-vers%C3%A3o-preliminar-10) ...................................................................... 3

1. [Arquitetura e fluxo principal](https://www.google.com/search?q=%232-arquitetura-e-fluxo-principal) ........................................................................................................ 3
2. [Convenções da API](https://www.google.com/search?q=%233-conven%C3%A7%C3%B5es-da-api) ........................................................................................................................ 4
3. [Ambientes e Base URL](https://www.google.com/search?q=%234-ambientes-e-base-url) ..................................................................................................................... 5

* [4.1. Simulando a API localmente (mock servers)](https://www.google.com/search?q=%2341-simulando-a-api-localmente-mock-servers) ............................................................................ 5

1. [Autenticação](https://www.google.com/search?q=%235-autentica%C3%A7%C3%A3o) ............................................................................................................................. 6
2. [Modelo de dados (dicionário)](https://www.google.com/search?q=%236-modelo-de-dados-dicion%C3%A1rio) ....................................................................................................... 6

* [6.1. Consumidor](https://www.google.com/search?q=%2361-consumidor) .......................................................................................................................... 6
* [6.2. Saldo](https://www.google.com/search?q=%2362-saldo) ............................................................................................................................... 6
* [6.3. Pagamento](https://www.google.com/search?q=%2363-pagamento) .......................................................................................................................... 6
* [6.4. Recarga (item de histórico)](https://www.google.com/search?q=%2364-recarga-item-de-hist%C3%B3rico) .................................................................................................. 7
* [6.5. Refeição (item de histórico)](https://www.google.com/search?q=%2365-refei%C3%A7%C3%A3o-item-de-hist%C3%B3rico) .................................................................................................. 7
* [6.6. Filial (Restaurante Universitário)](https://www.google.com/search?q=%2366-filial-restaurante-universit%C3%A1rio) ........................................................................................... 7
* [6.7. Usuário (retorno do login)](https://www.google.com/search?q=%2367-usu%C3%A1rio-retorno-do-login) .................................................................................................. 7
* [6.8. Paginação (envelope comum de listagens)](https://www.google.com/search?q=%2368-pagina%C3%A7%C3%A3o-envelope-comum-de-listagens) ............................................................................... 7

1. [Referência de endpoints](https://www.google.com/search?q=%237-refer%C3%AAncia-de-endpoints) ................................................................................................................ 8

* [7.1. Autenticar usuário](https://www.google.com/search?q=%2371-autenticar-usu%C3%A1rio) ............................................................................................................. 8
* [7.2. Consultar saldo e dados do consumidor](https://www.google.com/search?q=%2372-consultar-saldo-e-dados-do-consumidor) ...................................................................................... 8
* [7.3. Criar pagamento PIX (solicitar recarga)](https://www.google.com/search?q=%2373-criar-pagamento-pix-solicitar-recarga) ................................................................................... 9
* [7.4. Consultar status do pagamento (polling)](https://www.google.com/search?q=%2374-consultar-status-do-pagamento-polling) ................................................................................... 9
* [7.5. Histórico de recargas](https://www.google.com/search?q=%2375-hist%C3%B3rico-de-recargas) ...................................................................................................... 9
* [7.6. Histórico de refeições](https://www.google.com/search?q=%2376-hist%C3%B3rico-de-refei%C3%A7%C3%B5es) .................................................................................................... 10

1. [Máquina de estados do pagamento](https://www.google.com/search?q=%238-m%C3%A1quina-de-estados-do-pagamento) .............................................................................................. 11
2. [Códigos de erro](https://www.google.com/search?q=%239-c%C3%B3digos-de-erro) ............................................................................................................................. 11
3. [Segurança e autorização](https://www.google.com/search?q=%2310-seguran%C3%A7a-e-autoriza%C3%A7%C3%A3o) ........................................................................................................... 11

* [10.1. Autorização por ownership](https://www.google.com/search?q=%23101-autoriza%C3%A7%C3%A3o-por-ownership) .......................................................................................... 11
* [10.2. Rate limiting](https://www.google.com/search?q=%23102-rate-limiting) ................................................................................................................ 12
* [10.3. Comunicação](https://www.google.com/search?q=%23103-comunica%C3%A7%C3%A3o) ................................................................................................................ 12

1. [Recomendações de implementação (app)](https://www.google.com/search?q=%2311-recomenda%C3%A7%C3%B5es-de-implementa%C3%A7%C3%A3o-app) ........................................................................................... 12

* [11.1. Autenticação e segurança](https://www.google.com/search?q=%23111-autentica%C3%A7%C3%A3o-e-seguran%C3%A7a) ............................................................................................. 12
* [11.2. Fluxo de recarga PIX](https://www.google.com/search?q=%23112-fluxo-de-recarga-pix) ..................................................................................................... 12
* [11.3. Paginação, fuso e tecnologias](https://www.google.com/search?q=%23113-pagina%C3%A7%C3%A3o-fuso-e-tecnologias) ............................................................................................ 12

1. [Maturidade e evolução do contrato](https://www.google.com/search?q=%2312-maturidade-e-evolu%C3%A7%C3%A3o-do-contrato) .......................................................................................... 13
2. [Glossário](https://www.google.com/search?q=%2313-gloss%C3%A1rio) ............................................................................................................................. 13

### Anexos

* [Anexo A - Restaurantes Universitários](https://www.google.com/search?q=%23anexo-a---restaurantes-universit%C3%A1rios) ....................................................................................................... 13
* [Anexo B - Estados do pagamento](https://www.google.com/search?q=%23anexo-b---estados-do-pagamento) ............................................................................................................ 14
* [Anexo C - Situação do consumidor](https://www.google.com/search?q=%23anexo-c---situa%C3%A7%C3%A3o-do-consumidor) ............................................................................................................ 14
* [Anexo D - Limites de requisição](https://www.google.com/search?q=%23anexo-d---limites-de-requisi%C3%A7%C3%A3o) ........................................................................................................... 14

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 2 de 14*

---

## Página 3

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

## 1. Visão geral

A FUMP disponibiliza uma API RESTful para que o aplicativo móvel do Hackathon InovaRU realize a autenticação de usuários, a consulta de saldo e dados do consumidor, a geração de pagamentos PIX e a consulta de históricos de recargas e refeições nos Restaurantes Universitários (RUs) da UFMG.

O aplicativo é desenvolvido para Android e, ao final do hackathon, entregue à FUMP para implantação no ambiente institucional.

> **Papel do aplicativo:** O crédito no sistema RU é acionado pelo webhook do MercadoPago diretamente na API da FUMP; o aplicativo não credita saldo. O aplicativo apenas inicia o pagamento, exibe o QR Code PIX e faz polling do status até receber a confirmação.

### 1.1. Componentes

| Componente | Responsabilidade |
| --- | --- |
| **Aplicativo móvel (Android)** | Interface do usuário; consome a API via HTTPS; exibe QR Code e faz polling do pagamento. |
| **API FUMP (Node.js/Express)** | Autenticação JWT, regras de negócio, integração com o MercadoPago e com a base SQL Server. |
| **SQL Server** | Base institucional: consumidores, saldos, recargas e refeições. |
| **MercadoPago** | Gateway PIX: gera o QR Code e notifica a API por webhook quando o pagamento é aprovado. |

### 1.2. O que mudou em relação à versão preliminar (1.0)

Esta versão consolida e detalha o contrato já esboçado na versão preliminar 1.0 (25/04/2026). O conjunto de endpoints e o comportamento de negócio permanecem os mesmos; o foco desta revisão é dar clareza e completude suficientes para a implementação e a validação da integração.

| Item | Situação nesta versão |
| --- | --- |
| **Diagrama de sequência do fluxo principal** | Adicionado (substitui o esquema textual da 1.0). |
| **Dicionário de dados (entidades e campos)** | Adicionado. |
| **Máquina de estados do pagamento** | Adicionada, com transições e ação esperada do app. |
| **Exemplos de requisição/resposta por endpoint** | Detalhados, com tabelas de campos. |
| **Catálogo de erros e envelope padrão** | Detalhado. |
| **Recomendações de implementação do app** | Detalhadas (Keystore, polling, paginação, fuso). |
| **Recomendação de polling** | Unificada em backoff exponencial com jitter (a 1.0 citava também um intervalo fixo de 5 s na seção 4.3). |
| **Tabelas de apoio (RUs, status, limites)** | Consolidadas como anexos. |
| **Ambiente de testes** | Redefinido: desenvolvimento contra mock local do contrato (Mockoon, JSON Server ou Postman — ver seção 4.1). Produção permanece "a definir". |

## 2. Arquitetura e fluxo principal

O diagrama abaixo resume a jornada completa de uma recarga bem-sucedida: autenticação, consulta de saldo, criação do pagamento PIX, confirmação por webhook e acompanhamento por polling até o crédito do saldo.

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 3 de 14*

---

## Página 4

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

### Figura 1 - Fluxo principal de integração (caminho de sucesso)

```
       App Mobile                      API FUMP                     MercadoPago
        (Android)                (Node.js / SQL Server)            (Gateway PIX)
            |                               |                            |
            |--- 1. POST /usuarios/login -->|                            |
            |    (user, password)           |                            |
            |<-- 200 (token JWT, usuario)---|                            |
            |                               |                            |
            |--- 2. GET /creditos/saldo --->|                            |
            |<-- 200 (consumidor, saldo)----|                            |
            |                               |                            |
            |--- 3. POST /creditos/pagamento|                            |
            |    (valor) ------------------>|                            |
            |                               |--- cria pagamento PIX ---->|
            |                               |<-- qr_code, ticket_url, ---|
            |                               |    expiration              |
            |<-- 201 (payment_id, qr_code, -|                            |
            |    qr_code_base64, ...)       |                            |
            |                               |                            |
            | (Usuário copia o QR e paga)   |                            |
            | - - - - - - - - - - - - - - ->|                            |
            |                               |                            |
            |                               |<-- webhook: pgto aprovado--|
            |                               |    (API credita o saldo)   |
            |                               |                            |
            | [ loop polling ]              |                            |
            |--- 4. GET /creditos/pagamento/|                            |
            |    :id/status --------------->|                            |
            |<-- 200 (status, creditado)----|                            |
            | (intervalos: 3s, 5s, 8s...)   |                            |
            |                               |                            |
            | (status == approved &         |                            |
            |  creditado == true)           |                            |
            |                               |                            |
            | [ App exibe confirmação e ]   |                            |
            | [ atualiza o novo saldo    ]  |                            |
            v                               v                            v

```

#### Descrição Detalhada do Diagrama de Sequência

O diagrama ilustra o fluxo de ponta a ponta para a realização de uma recarga via PIX com sucesso, mapeando a interação entre o **App Mobile (Cliente)**, a **API FUMP (Servidor intermediário com banco SQL Server)** e o **MercadoPago (Gateway de pagamento)**:

1. **Autenticação:** O aplicativo móvel inicia o processo enviando uma requisição `POST /usuarios/login` com as credenciais `user` (CPF) e `password`. A API FUMP valida e responde com o código HTTP `200` acompanhado do token JWT e dados do usuário.
2. **Consulta de Saldo:** O aplicativo consome o endpoint `GET /creditos/saldo`. A API retorna `200` com os dados estruturados do consumidor e o saldo atual disponível.
3. **Solicitação de Recarga:** O usuário digita o valor e o aplicativo faz um `POST /creditos/pagamento` enviando o `valor` desejado. A API FUMP repassa essa solicitação internamente ao MercadoPago ("cria pagamento PIX"). O MercadoPago retorna as informações do PIX (`qr_code`, `ticket_url` e `expiration`). A API formata esses dados e devolve `201` ao app com o identificador do pagamento (`payment_id`) e as strings de representação do QR Code (incluindo o formato em Base64).
4. **Pagamento do Usuário:** O fluxo do aplicativo entra em espera enquanto o usuário copia o código PIX ("copia e cola") ou escaneia o QR Code para pagar no aplicativo de seu banco de preferência.
5. **Notificação (Webhook):** Assim que o pagamento é liquidado pelo banco do usuário, o MercadoPago notifica de forma assíncrona a API FUMP através de um webhook (`webhook: pagamento aprovado`). No recebimento desta notificação, a API FUMP atualiza internamente o saldo do usuário na base de dados (SQL Server).
6. **Polling do Aplicativo:** Paralelamente, o aplicativo inicia um ciclo periódico de consultas utilizando a rota `GET /creditos/pagamento/:id/status`. O intervalo entre as requisições utiliza um algoritmo de backoff exponencial com jitter (ex.: 3s, 5s, 8s, 13s, com variação aleatória de ±1s). O servidor responde `200` com os campos de status de pagamento (`status` e `creditado`).
7. **Conclusão:** Assim que a resposta do polling retornar `status = approved` e `creditado = true`, o aplicativo encerra as consultas de status, exibe a tela de confirmação de sucesso para o usuário e atualiza a interface com o novo saldo disponível.

> **Observação sobre o polling:** Após criar o pagamento, o app consulta periodicamente o status até que ele deixe de ser `pending` ou até atingir 2 minutos (o que ocorrer primeiro). O crédito do saldo é feito pela API ao receber o webhook de aprovação; o campo `creditado` indica quando o saldo já está disponível para uso nos RUs.

## 3. Convenções da API

| Aspecto | Convenção |
| --- | --- |
| **Estilo** | RESTful sobre HTTP; recursos no plural (ex.: `/creditos/recargas`). |
| **Protocolo** | HTTPS obrigatório (TLS 1.2+). Requisições HTTP são rejeitadas. |
| **Formato** | JSON em requisição e resposta (`Content-Type: application/json`). |
| **Codificação** | UTF-8. |
| **Datas e horas** | ISO 8601 com fuso de Brasília (-03:00). Ex.: `2026-04-27T10:30:00-03:00`. |
| **Valores monetários** | Decimais em reais (R$), ponto como separador decimal. Ex.: `45.50`. |
| **Autenticação** | JWT no header `Authorization: Bearer <token>` (exceto no login). |
| **Envelope de erro** | Objeto JSON com o campo `message` (ver seção 9). |
| **Paginação** | Listagens retornam o objeto `pagination` (ver seção 6.8). |

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 4 de 14*

---

## Página 5

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

## 4. Ambientes e Base URL

Durante o hackathon, a FUMP não disponibilizará um ambiente de homologação. O desenvolvimento e a demonstração do aplicativo devem ser feitos contra um mock local (servidor simulado), criado pela própria equipe, que reproduz fielmente a especificação descrita neste documento (ver seção 4.1).

| Ambiente | Base URL | Situação |
| --- | --- | --- |
| **Desenvolvimento (hackathon)** | Mock local da equipe (ex.: `http://localhost:3001`) | Simulado a partir deste documento (ver seção 4.1). |

* Todas as rotas descritas neste documento são relativas à Base URL do ambiente. Exemplo de composição: `https://<base-url>/creditos/saldo`.
* O certificado SSL válido será implementado no ambiente de produção.

### 4.1. Simulando a API localmente (mock servers)

Os exemplos de requisição e resposta das seções 5 e 7 podem ser copiados diretamente para a ferramenta de mock escolhida pela equipe. Sugestões consolidadas:

| Ferramenta | Tipo | Indicação |
| --- | --- | --- |
| **Mockoon** | Aplicativo desktop gratuito (GUI) | Caminho recomendado: rotas criadas visualmente, respostas sequenciais ou por regras para simular a transição `pending` -> `approved` do pagamento, além de latência e códigos de erro. |
| **JSON Server** | Pacote Node.js (npm) | Mock leve por linha de comando a partir de um arquivo `db.json`; prático para as listagens paginadas (recargas e refeições). |
| **Postman Mock Servers** | Nuvem (plano gratuito) | Mock hospedado a partir de uma collection; útil quando a equipe quer compartilhar a mesma URL de teste. |

#### Boas práticas ao usar o mock

* **Base URL configurável:** Deixe a Base URL parametrizada no app (ex.: `BuildConfig` / product flavors no Android) para alternar entre o mock e a produção sem alterar o código.
* **Simule também os erros e estados:** Cubra os códigos `401`, `422` e `429`, além da evolução do pagamento (`pending` -> `approved` / `expired`). O tratamento de erros é critério de avaliação do edital (item 6.2).
* **HTTP no mock é aceitável:** O requisito de HTTPS (seção 3) vale para a produção. Em desenvolvimento, libere o tráfego HTTP do app (`network security config` ou `usesCleartextTraffic`), pois o Android bloqueia cleartext por padrão.
* **Emulador Android:** Para acessar o mock rodando na máquina de desenvolvimento, use `http://10.0.2.2:<porta>`, pois o `localhost` do emulador aponta para o próprio dispositivo virtual.
* **Token de teste:** No mock, o JWT pode ser uma string fixa qualquer; o que importa é o app montar corretamente o header `Authorization: Bearer <token>`.

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 5 de 14*

---

## Página 6

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

## 5. Autenticação

Todas as requisições, exceto o login, devem incluir o token JWT no header HTTP:
`Authorization: Bearer <jwt>`

* O token é obtido no endpoint `POST /usuarios/login` e tem validade limitada.
* Quando o token expira, a API responde com `401`; o app deve solicitar um novo login ao usuário.
* O CPF do usuário é extraído automaticamente do token — não é necessário enviar o CPF no body ou na URL.
* A senha usada no login é a mesma do sistema institucional da FUMP (portal do aluno/colaborador).
* O app não cria contas, apenas autentica usuários já cadastrados.

## 6. Modelo de dados (dicionário)

As entidades abaixo descrevem os objetos trafegados pela API. Os endpoints da seção 7 referenciam estes campos.

### 6.1. Consumidor

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **nome** | string | Nome completo do consumidor. |
| **tipo_consumidor** | object | Categoria: `{ codigo, descricao }` (ex.: `01` - "Estudante Regular"). |
| **centro_custo** | object | Vínculo acadêmico: `{ tipo, descricao }` (ex.: Graduação - "Ciência da Computação"). |
| **situacao** | string | `"A"` = Ativo, `"1"` = Inativo, `"B"` = Bloqueado. |

### 6.2. Saldo

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **credito_disponivel** | decimal | Saldo em R$ disponível para uso nos RUs. |
| **limite_recarga** | decimal | Valor máximo que pode ser mantido como saldo. |

### 6.3. Pagamento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **payment_id** | int | Identificador do pagamento no Mercado Pago; chave usada no polling. |
| **status** | string | Estado do pagamento (ver máquina de estados, seção 8). |
| **status_detail** | string | Detalhe do status, quando disponível (ex.: `accredited`). |
| **qr_code** | string | Código PIX copia-e-cola. |
| **qr_code_base64** | string | Imagem PNG do QR Code em Base64 (para exibição no app). |
| **ticket_url** | string | URL do ticket de pagamento (fallback). |
| **expiration** | string | Data/hora de expiração do PIX (ISO 8601, -03:00). |

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 6 de 14*

---

## Página 7

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **creditado** | boolean | `true` quando o saldo já foi creditado no sistema RU. |

### 6.4. Recarga (item de histórico)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **id** | int | Identificador da recarga. |
| **valor** | decimal | Valor recarregado (R$). |
| **metodo** | string | Meio de pagamento (ex.: `pix`). |
| **status** | string | Situação da recarga (ex.: `aprovado`). |
| **data_hora** | string | Data/hora da recarga (ISO 8601, -03:00). |

### 6.5. Refeição (item de histórico)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **data_hora** | string | Data/hora da refeição (ISO 8601, -03:00). |
| **filial** | object | RU onde ocorreu a venda: `{ codigo, nome }`. |
| **quantidade** | int | Quantidade de refeições na venda. |
| **valor_total** | decimal | Valor pago na venda (R$). |
| **gratuidade** | boolean | `true` se a refeição foi gratuita. |
| **tipo_consumidor** | string | Categoria do consumidor no momento da venda. |

### 6.6. Filial (Restaurante Universitário)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **codigo** | string | Código do RU (`0001` a `0005` - ver Anexo A). |
| **nome** | string | Nome do RU. |

### 6.7. Usuário (retorno do login)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **nome** | string | Nome do usuário autenticado. |
| **email** | string | E-mail institucional. |
| **isAluno** | int | `1` se o usuário é aluno; caso contrário `0`. |
| **isColaborador** | int | `1` se o usuário é colaborador; caso contrário `0`. |

### 6.8. Paginação (envelope comum de listagens)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| **total** | int | Total de itens disponíveis. |
| **currentPage** | int | Página atual. |
| **perPage** | int | Itens por página. |
| **lastPage** | int | Última página disponível. |

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 7 de 14*

---

## Página 8

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

## 7. Referência de endpoints

Salvo o login, todos os endpoints exigem autenticação JWT (seção 5). O CPF é extraído do token; nenhuma rota recebe CPF no body ou na URL.

### 7.1. Autenticar usuário

`POST /usuarios/login`

Autentica o usuário com CPF e senha institucional e retorna o token JWT.

#### Requisição

```json
{
  "user": "12345678901",
  "password": "senha_do_usuario"
}

```

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| **user** | string | Sim | CPF do usuário (somente números, 11 dígitos). |
| **password** | string | Sim | Senha do sistema institucional da FUMP. |

#### Resposta 200 (sucesso)

```json
{
  "usuario": {
    "token": "eyJhbGciOiJIUzI1Nils...",
    "nome": "JOÃO DA SILVA",
    "email": "joao@ufmg.br",
    "isAluno": 1,
    "isColaborador": 0
  }
}

```

#### Resposta 401 (credenciais inválidas)

```json
{
  "message": "Usuário ou senha inválidos"
}

```

### 7.2. Consultar saldo e dados do consumidor

`GET /creditos/saldo`

Retorna os dados do consumidor e o saldo vinculados ao token.

#### Resposta 200 (sucesso)

```json
{
  "consumidor": {
    "nome": "JOÃO DA SILVA",
    "tipo_consumidor": { "codigo": "01", "descricao": "ESTUDANTE REGULAR" },
    "centro_custo": { "tipo": "Graduação", "descricao": "SISTEMAS DE INFORMAÇÃO" },
    "situacao": "A"
  },
  "saldo": {
    "credito_disponivel": 45.50,
    "limite_recarga": 500.00
  }
}

```

*Campos detalhados nas seções 6.1 (Consumidor) e 6.2 (Saldo).*

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 8 de 14*

---

## Página 9

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

#### Resposta 404 (consumidor não encontrado)

```json
{ 
  "message": "Consumidor não encontrado ou inativo." 
}

```

### 7.3. Criar pagamento PIX (solicitar recarga)

`POST /creditos/pagamento`

Cria um pagamento PIX no MercadoPago e retorna os dados do QR Code para exibição no app.

#### Requisição

```json
{ 
  "valor": 50.00 
}

```

| Campo | Tipo | Obrigatório | Validação |
| --- | --- | --- | --- |
| **valor** | decimal | Sim | Mínimo R$ 5,00 / Máximo R$ 500,00. |

#### Resposta 201 (pagamento criado)

```json
{
  "payment_id": 123456789,
  "status": "pending",
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "qr_code_base64": "iVBORw0KGgoAAAANSUhEUg...",
  "ticket_url": "https://www.mercadopago.com.br/payments/123456789/ticket",
  "expiration": "2026-04-27T11:00:00-03:00"
}

```

*Campos detalhados na seção 6.3 (Pagamento). O status inicial é sempre `pending`.*

#### Resposta 422 (valor fora do limite)

```json
{ 
  "message": "Valor fora do limite permitido. Mínimo: R$ 5,00, Máximo: R$ 500,00" 
}

```

### 7.4. Consultar status do pagamento (polling)

`GET /creditos/pagamento/:paymentId/status`

Verifica o estado de um pagamento criado pelo usuário. Deve ser consultado por polling após a exibição do QR Code (ver recomendações na seção 11).

| Parâmetro | Local | Tipo | Descrição |
| --- | --- | --- | --- |
| **paymentId** | path | int | ID retornado em `POST /creditos/pagamento`. |

#### Resposta 200 (estado atual)

```json
{
  "payment_id": 123456789,
  "status": "approved",
  "status_detail": "accredited",
  "creditado": true
}

```

*Valores possíveis de status e a ação esperada do app estão na seção 8.*

### 7.5. Histórico de recargas

`GET /creditos/recargas`

Retorna o histórico de recargas de crédito realizadas pelo app, com paginação e filtros opcionais por data.

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 9 de 14*

---

## Página 10

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

#### Parâmetros de consulta (query)

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
| --- | --- | --- | --- | --- |
| **page** | int | Não | 1 | Página de dados solicitada. |
| **perPage** | int | Não | 20 | Itens por página (máx. 100). |
| **dataInicio** | string | Não | - | Filtro de data início (YYYY-MM-DD). |
| **dataFim** | string | Não | - | Filtro de data fim (YYYY-MM-DD). |

#### Resposta 200 (lista paginada)

```json
{
  "data": [
    { 
      "id": 1, 
      "valor": 50.00, 
      "metodo": "pix",
      "status": "aprovado",
      "data_hora": "2026-04-27T10:30:00-03:00"
    },
    { 
      "id": 2, 
      "valor": 30.00, 
      "metodo": "pix",
      "status": "aprovado",
      "data_hora": "2026-04-20T14:15:00-03:00"
    }
  ],
  "pagination": { 
    "total": 15, 
    "currentPage": 1, 
    "perPage": 20, 
    "lastPage": 1 
  }
}

```

*Campos do item na seção 6.4 (Recarga); envelope de paginação na seção 6.8.*

### 7.6. Histórico de refeições

`GET /creditos/refeicoes`

Retorna o histórico de refeições/consumos do usuário nos RUs, com paginação e filtros opcionais.

#### Parâmetros de consulta (query)

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
| --- | --- | --- | --- | --- |
| **page** | int | Não | 1 | Página de dados solicitada. |
| **perPage** | int | Não | 20 | Itens por página (máx. 100). |
| **dataInicio** | string | Não | - | Filtro de data início (YYYY-MM-DD). |
| **dataFim** | string | Não | - | Filtro de data fim (YYYY-MM-DD). |
| **filial** | string | Não | - | Código do RU (ver Anexo A). |

#### Resposta 200 (lista paginada)

```json
{
  "data": [
    {
      "data_hora": "2026-04-25T12:05:33-03:00",
      "filial": { "codigo": "0003", "nome": "RU Setorial 1" },
      "quantidade": 1,
      "valor_total": 2.40,
      "gratuidade": false,
      "tipo_consumidor": "ESTUDANTE REGULAR"
    }
  ],
  "pagination": { 
    "total": 142, 
    "currentPage": 1, 
    "perPage": 20, 
    "lastPage": 8 
  }
}

```

*Campos do item na seção 6.5 (Refeição); envelope de paginação na seção 6.8.*

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 10 de 14*

---

## Página 11

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

## 8. Máquina de estados do pagamento

O campo `status` retornado no polling (seção 7.4) evolui conforme o pagamento ocorre. O app deve reagir da seguinte forma:

| Status | Significado | Ação do app |
| --- | --- | --- |
| **pending** | Aguardando pagamento. | Continuar o polling. |
| **approved** | Pagamento aprovado. | Parar o polling; exibir mensagem de sucesso e novo saldo. |
| **rejected** | Pagamento rejeitado. | Parar o polling; informar falha. |
| **cancelled** | Pagamento cancelado. | Parar o polling; permitir nova tentativa. |
| **expired** | PIX expirou sem pagamento. | Parar o polling; permitir nova tentativa. |

> **Nota:** O Mercado Pago pode retornar `cancelled` ou `expired` em situações de expiração. O app deve tratar ambos da mesma forma: informar o usuário e oferecer a opção de gerar um novo pagamento.
> Quando o status for `approved` e `creditado == true`, o saldo já está disponível para uso nos RUs.

## 9. Códigos de erro

As respostas de erro seguem um envelope único com o campo `message`:

```json
{ 
  "message": "Descrição legível do erro." 
}

```

| HTTP | Significado | Ação recomendada no app |
| --- | --- | --- |
| **400** | Requisição malformada. | Verificar o payload enviado. |
| **401** | Token ausente, inválido ou expirado. | Redirecionar para a tela de login. |
| **403** | Sem permissão para o recurso. | Informar o usuário (tentativa de acesso a recurso de outro CPF). |
| **404** | Consumidor não encontrado. | Informar que o CPF não está cadastrado. |
| **422** | Dados inválidos (ex.: valor fora do range). | Exibir mensagem de validação correspondente. |
| **429** | Limite de requisições excedido. | Aguardar o tempo indicado no cabeçalho e tentar novamente. |
| **500** | Erro interno do servidor. | Exibir mensagem genérica de erro. |

## 10. Segurança e autorização

### 10.1. Autorização por ownership

A API garante que o usuário autenticado só acesse recursos vinculados ao seu próprio CPF:

* `GET /creditos/saldo` retorna apenas os dados do CPF contido no token.
* `GET /creditos/pagamento/:paymentId/status` retorna apenas pagamentos criados pelo usuário autenticado; consultar pagamentos de terceiros resulta em `403`.
* `GET /creditos/recargas` e `GET /creditos/refeicoes` retornam apenas dados do CPF associado ao token.

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 11 de 14*

---

## Página 12

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

### 10.2. Rate limiting

| Endpoint | Limite | Observação |
| --- | --- | --- |
| **POST /usuarios/login** | 5 req/min por IP | Proteção contra ataques de força bruta. |
| **POST /creditos/pagamento** | 10 req/min por token | Evita criação excessiva de transações PIX. |
| **GET (consultas)** | 60 req/min por token | Limite geral de uso de rotas de consulta. |

Ao atingir o limite, a API responde com código `429` e inclui o header `Retry-After` (com os segundos restantes até a próxima requisição ser permitida). O app deve tratar o `429` exibindo uma mensagem amigável, por exemplo: *"Muitas tentativas, aguarde um momento"*.

### 10.3. Comunicação

* HTTPS obrigatório (TLS 1.2+). Requisições puramente HTTP são sumariamente rejeitadas.
* Um certificado SSL válido será devidamente implementado no ambiente de produção.

## 11. Recomendações de implementação (app)

### 11.1. Autenticação e segurança

* Nunca armazenar o token JWT em texto puro (por exemplo, no `SharedPreferences` padrão). Recomenda-se utilizar o Android Keystore ou `EncryptedSharedPreferences`.
* **Nunca persistir a senha do usuário no dispositivo, sob hipótese alguma.**
* Tratar tokens expirados (erro `401`) de forma elegante, redirecionando o usuário diretamente para a tela de login.
* Usar exclusivamente o cabeçalho HTTP `Authorization: Bearer <token>` para fins de autenticação.

### 11.2. Fluxo de recarga PIX

* Chamar o endpoint `POST /creditos/pagamento` com o valor desejado.
* Exibir o QR Code na tela decodificando a string retornada em `qr_code_base64` (Base64 -> PNG).
* Disponibilizar uma funcionalidade ou botão claro de "Copiar código PIX" associado ao campo `qr_code` (método copia-e-cola).
* Iniciar a rotina de polling no endpoint `GET /creditos/pagamento/:id/status` utilizando backoff exponencial com acréscimo de jitter: intervalos de 3s, 5s, 8s, 13s... acrescidos de uma variação aleatória de ±1s. Essa lógica é importante para evitar que múltiplos usuários sincronizem requisições simultâneas e sobrecarreguem o servidor de aplicação.
* Interromper imediatamente o polling quando o campo `status` diferir de `pending` ou após atingir o limite de 2 minutos (o que ocorrer primeiro).
* Se o status retornado for `approved` e o campo `creditado` for `true`, exibir uma tela de confirmação positiva e atualizar o saldo principal na interface do usuário.
* Se o polling expirar (tempo limite de 2 min) ou o status retornado for `cancelled`/`expired`, apresentar uma mensagem de erro e sugerir o botão "Tentar novamente".

### 11.3. Paginação, fuso e tecnologias

* Listagens de histórico retornam o objeto padrão de metadados `pagination`; implemente a interface com rolagem infinita ("infinite scroll") ou através de um botão explícito de "Carregar mais".
* Todas as datas enviadas pela API utilizam a formatação ISO 8601 com o fuso oficial de Brasília (-03:00); faça a devida conversão para o fuso local configurado no dispositivo móvel quando necessário.
* **Comunicação HTTP:** Recomendado o uso de bibliotecas consagradas como Retrofit (para Java/Kotlin) ou Ktor (Kotlin).
* **Renderização de QR Code:** Decodificar a String Base64 para um objeto Bitmap e atribuir à exibição em uma view apropriada (`ImageView`).
* **Cache offline de histórico (opcional):** Utilização da biblioteca Room do ecossistema Android Jetpack.

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 12 de 14*

---

## Página 13

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

* **Baixa conectividade:** Desenvolver o app prevendo cenários de rede instável, exibindo estados visuais de carregamento claros, mensagens de erro fáceis de compreender, permitindo novas tentativas e evitando travamentos ou bloqueios gerais de interface do usuário durante a execução do polling de pagamento.

## 12. Maturidade e evolução do contrato

Este documento adota o paradigma de **contract-first**: as interfaces e regras de comunicação entre o aplicativo e a API do backend são previamente definidas e estabelecidas de forma estável antes de finalizar a codificação do sistema backend. Isso confere previsibilidade e independência para as equipes implementarem o aplicativo móvel.

* O conjunto de endpoints, estruturas de payloads e regras de negócio descritos constitui a referência oficial máxima de desenvolvimento durante o hackathon.
* Ajustes pontuais e correções que se mostrem estritamente necessários durante a execução do desenvolvimento serão tempestivamente informados pela comissão organizadora.
* Conforme detalhado na seção 4.1, as etapas de desenvolvimento do aplicativo devem rodar contra mocks locais.
* A definição da Base URL real de produção e o fornecimento de certificados de criptografia SSL adequados serão disponibilizados na fase final de homologação e implantação oficial.

## 13. Glossário

| Termo | Descrição |
| --- | --- |
| **JWT** | *JSON Web Token*; padrão industrial para declarações de credenciais assinadas e criptografadas, trafegado via header `Authorization`. |
| **PIX** | Arranjo e meio de pagamento instantâneo brasileiro; gerido de forma automatizada no app por meio do MercadoPago. |
| **Webhook** | Modelo de envio de notificações ativas desencadeado pelo MercadoPago para comunicar alterações de status de pagamento à API. |
| **Polling** | Processo sistemático de requisições recorrentes enviadas pelo cliente ao servidor para consultar o estado de uma transação. |
| **Backoff/Jitter** | Mecanismo de aumento progressivo de intervalo de tempo (backoff) combinado com ruído aleatório (jitter) para mitigar sobrecarga de conexões concorrentes. |
| **Ownership** | Regra estrita de autorização lógica em nível de sistema que assegura que o usuário ativo só realize requisições de recursos atrelados a ele mesmo (via CPF). |
| **RU** | Restaurante Universitário. |
| **Consumidor** | Pessoa elegível e cadastrada ativamente no ecossistema do Restaurante Universitário, identificada de forma única através do CPF. |

## Anexos

### Anexo A - Restaurantes Universitários

| Código | Nome | Localização |
| --- | --- | --- |
| **0001** | RU Saúde/Direito | Campus Saúde, Belo Horizonte. |
| **0002** | RU Setorial 2 | Campus Pampulha, Belo Horizonte. |
| **0003** | RU Setorial 1 | Campus Pampulha, Belo Horizonte. |
| **0004** | RU ICA | Campus Montes Claros. |
| **0005** | RU HRTN | Hospital Risoleta T. Neves, Belo Horizonte. |

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 13 de 14*

---

## Página 14

### FUMP - Projeto InovaRU

**Especificação Técnica - API InovaRU v2.0**

### Anexo B - Estados do pagamento

| Status | Terminal? | Significado |
| --- | --- | --- |
| **pending** | Não | Aguardando conclusão do pagamento pelo usuário. |
| **approved** | Sim | Pagamento efetuado com sucesso; crédito efetivo confirmado através do campo de controle `creditado`. |
| **rejected** | Sim | Pagamento rejeitado ou negado pelo gateway/banco. |
| **cancelled** | Sim | Pagamento cancelado pelo gateway ou por expiração. |
| **expired** | Sim | Cobrança via PIX expirou por tempo limite excedido sem pagamento. |

### Anexo C - Situação do consumidor

| Código | Situação | Efeito |
| --- | --- | --- |
| **A** | Ativo | Uso perfeitamente normal do saldo e das rotinas de recarga. |
| **1** | Inativo | Consultas retornarão erro `404`; operações de crédito/venda desabilitadas. |
| **B** | Bloqueado | Operação de recarga temporariamente suspensa pelo sistema, exibindo tela de aviso. |

### Anexo D - Limites de requisição

| Endpoint | Limite | Escopo |
| --- | --- | --- |
| **POST /usuarios/login** | 5 req/min | Por endereço de IP. |
| **POST /creditos/pagamento** | 10 req/min | Por token JWT autenticado. |
| **GET (consultas)** | 60 req/min | Por token JWT autenticado. |

---

**Projeto InovaRU - Hackathon (DACompSI/UFMG | DCC/UFMG | FUMP) - 2026** *Documento assinado digitalmente no padrão gov.br* * **Signatário:** LEONARDO EUSTAQUIO GOMES DA CUNHA

* **Data da Assinatura:** 03/07/2026 10:10:05-0300
* **Validação:** Verifique a autenticidade das assinaturas acessando o portal oficial em: `https://validar.iti.gov.br`

---

*Fundação Universitária Mendes Pimentel | Belo Horizonte/MG* *Página 14 de 14*
