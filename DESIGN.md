---
name: Rangoo Universitário
description: App de recarga PIX e saldo pros RUs da UFMG — rápido, confiável, sem cara de banco
team:
  - Igor de Oliveira Martins dos Santos
  - Ítalo Leal Lana Santos
  - Vitor Hugo Dias Santos
colors:
  primary: "#1a5c4a"
  primary-light: "#4e9e9e"
  primary-container: "#d1e8e6"
  primary-dark: "#0f3d31"
  surface: "#ffffff"
  surface-variant: "#f0faf6"
  background: "#f0faf6"
  outline: "#6a8f80"
  outline-variant: "#e2f0e9"
  text-primary: "#1a2e28"
  text-secondary: "#4d6b61"
  text-disabled: "#5a6f65"
  text-inverse: "#ffffff"
  status-success: "#2e7d4f"
  status-error: "#c62828"
  status-warning: "#8a5a00"
  chip-selected: "#1a5c4a"
  chip-unselected: "#ffffff"
typography:
  display:
    fontFamily: "System"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: "48px"
  headline:
    fontFamily: "System"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "36px"
  title:
    fontFamily: "System"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
  body:
    fontFamily: "System"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "System"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.05em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.xl}"
    padding: "14px 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "14px 24px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.status-error}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.xl}"
    padding: "14px 24px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
    height: "48px"
---

# Design System: Rangoo Universitário

## 1. Overview

**Creative North Star: "O RU Digital de Confiança"**

Rangoo é o guichê do RU virando app: precisa ter a seriedade de quem mexe com dado institucional (CPF, JWT, dinheiro) e a leveza de quem é feito pra estudante correndo entre aulas, não pra cliente de agência bancária. O teal profundo (#1a5c4a) carrega a confiança; o fundo verde-claro (#f0faf6) e a tipografia direta carregam a leveza universitária. O sistema rejeita explicitamente qualquer estética "fintech corporativa fria" — sem navy escuro solene, sem excesso de formalidade visual, sem distância entre o app e quem usa.

Densidade é média-baixa: telas de fluxo crítico (login, recarga, PIX) priorizam poucos elementos por tela e hierarquia clara, porque o app é usado sob pressão de tempo e, com frequência, rede instável dentro do RU.

**Key Characteristics:**
- Verde-teal institucional como âncora de confiança, nunca decorativo
- Cards com sombra suave (não flat, não dramática) — profundidade discreta
- Estados de carregamento, erro e retry são cidadãos de primeira classe, não exceção
- Cor nunca hardcoded — sempre token semântico, refletido em claro/escuro/alto-contraste

## 2. Colors

Paleta de um único acento comprometido (teal institucional) sobre fundo neutro esverdeado, com estados semânticos claros para sucesso/erro/aviso.

### Primary
- **Verde Universitário** (`#1a5c4a`): âncora da marca. Botões primários, header do saldo, ícone de status ativo, elementos que representam ação principal ou "isso é seguro". Em dark mode vira mais claro e saturado (`#34d399`) pra manter contraste sem perder identidade.
- **Verde Universitário Claro** (`#4e9e9e`): variante de apoio, superfícies secundárias com leve tom de marca.
- **Verde Universitário Container** (`#d1e8e6`): fundo de destaque suave atrás de badges/containers ligados à marca.

### Neutral
- **Superfície** (`#ffffff` / `#1a2e28` no dark): fundo de cards e inputs.
- **Superfície Variante** (`#f0faf6` / `#1f3830`): fundo de página e botões secundários — mesmo tom do background, discretamente mais escuro que a superfície.
- **Contorno** (`#6a8f80` / `#628a76`): bordas de input e divisores — medido e confirmado ≥3:1 contra a superfície real (WCAG 1.4.11, limite não-textual pra contornos de componente interativo).
- **Texto Primário** (`#1a2e28` / `#f0faf6`): corpo de texto e labels.
- **Texto Secundário** (`#4d6b61` / `#a8d5c5`): texto de apoio — medido e confirmado ≥4.5:1 contra o fundo real, nunca estimado.
- **Texto Desabilitado** (`#5a6f65` / `#82a597`): placeholders e estados inativos — mesmo assim ≥4.5:1, porque também é usado como cor de placeholder de input.

### Status
- **Sucesso** (`#2e7d4f` / `#4ade80`): conta ativa, pagamento aprovado.
- **Erro** (`#c62828` / `#f87171`): bloqueio, falha de pagamento, validação.
- **Aviso** (`#8a5a00` / `#fbbf24`): avisos informativos (ex.: banner de integração não-oficial do cardápio). No modo alto contraste, vira `#663f00` (claro) / `#ffbb00` (escuro) — precisa ficar mais forte que o normal, nunca mais fraco.

### Named Rules
**A Regra do Token Único.** Nenhuma cor literal (`#RRGGBB`) ou classe de paleta Tailwind crua (`bg-gray-500`, `bg-blue-600`) em componente. Toda cor vem de `global.css` (CSS vars) + `tailwind.config.js` (classes semânticas) via `className`, ou de `useThemeColors()` pra props nativas que não aceitam `className`. Mudou uma cor? Muda nos dois lugares (`global.css` e `src/config/theme.ts`) — eles espelham o mesmo valor.

**A Regra do Contraste Medido.** Todo texto novo é calculado contra o fundo real antes de aprovar — não "parece escuro o suficiente". Auditoria completa dos 4 modos (claro, escuro, alto contraste claro, alto contraste escuro) já corrigiu: `text-secondary` (4.38:1 → 5.49:1+), `text-disabled`/placeholder (2.17:1 → 5.06:1+), `outline` de borda (1.28:1 → 3.59:1+) e o `warning` do alto contraste claro, que media pior (2.96:1) que o modo normal — bug real, corrigido pra 9.23:1.

**A Regra do Alto Contraste Sempre Mais Forte.** Nenhum token do modo alto contraste pode medir pior que o equivalente do modo normal. Se medir, é bug — não uma variação de gosto.

## 3. Typography

**Display/Body/Label Font:** System (fonte nativa do SO — sem fonte customizada carregada)

**Character:** Uma única família em pesos variados — direto, sem enfeite tipográfico, deixando cor e hierarquia de tamanho fazerem o trabalho de "sério mas acessível".

### Hierarchy
- **Display** (700, 40px/48px): valor de saldo em destaque na tela de Saldo/Início — o número que o estudante veio ver.
- **Headline** (700, 28px/36px): títulos de tela e valores secundários de destaque.
- **Title** (600, 20px/28px): títulos de seção e cabeçalhos de card.
- **Body** (400, 16px/24px): texto corrido, labels de input, conteúdo padrão. Limite de leitura ~65-75ch onde aplicável (telas largas/tablet).
- **Label** (700, 12px/16px, tracking 0.05em, uppercase): rótulos de status (`StatusBadge`, badges de aviso) — sempre caixa alta, nunca ícone/emoji substituindo o texto (regra do Anexo C: `situacao` é renderizado como texto puro).

### Named Rules
**A Regra do Texto Escalável.** Todo texto de conteúdo passa por `ScaledText`, nunca `Text` puro do React Native — o app respeita a escala de fonte do sistema (Android font scale) sem quebrar layout. `ScaledText` escala tanto `fontSize` quanto `lineHeight` proporcionalmente, usando o mapa `CLASS_LINE_HEIGHTS` para alinhar com as classes Tailwind.

## 4. Elevation

Sistema usa sombra ambiente sutil, não flat. Cards (`shadow-sm`) flutuam discretamente sobre o fundo — presença suficiente pra separar conteúdo de ação sem competir com a paleta de cor. Não há elevação em camadas múltiplas (sem `shadow-md`/`shadow-lg` documentado); um único nível de sombra é usado consistentemente.

### Shadow Vocabulary
- **Card ambiente** (`shadow-sm`, padrão NativeWind/Tailwind): usado em todo `Card` — separa conteúdo do fundo `background`/`surface-variant`.

### Named Rules
**A Regra da Sombra Única.** Um nível de elevação para superfícies de conteúdo (cards). Nada mais dramático — o sistema não usa elevação pra hierarquia de importância, só pra separação de camada.

## 5. Components

### Buttons
- **Shape:** cantos arredondados (12px, `rounded-xl`), altura mínima 48px (alvo de toque mínimo).
- **Primary:** fundo `primary` (#1a5c4a / var), texto `text-inverse`, padding `px-6 py-3.5`.
- **Secondary:** fundo `surface-variant`, texto `text-primary` — usado quando a ação não é a principal da tela.
- **Danger:** fundo `status-error`, texto `text-inverse` — ações destrutivas/de risco.
- **Hover/Active:** `active:opacity-80` — feedback por opacidade, sem transform.
- **Disabled:** `opacity-50`, `accessibilityState.disabled` true.
- **Loading:** troca o label por `ActivityIndicator` na cor de texto do variant — nunca desabilita sem indicar estado.

### Chips / Badges
- **StatusBadge:** texto em caixa alta, negrito, cor semântica (`success` pra ativo, `status-error` pra bloqueado/inativo) — nunca ícone substituindo o texto, é o valor exato de `situacao` do contrato.
- **Chip selecionável** (ex.: seleção de valor de recarga): fundo `chip-selected`/`chip-unselected`, ambos com contraste garantido em claro e escuro.

### Cards / Containers
- **Corner Style:** 24px (`rounded-2xl`).
- **Background:** `surface`.
- **Shadow Strategy:** `shadow-sm` ambiente, ver Elevation.
- **Internal Padding:** 16px (`p-4`).

### Inputs / Fields
- **Style:** borda `outline` 1px, fundo transparente, `rounded-xl`, altura mínima 48px.
- **Focus/Error:** borda troca pra `status-error` quando há erro; mensagem de erro abaixo com `accessibilityRole="alert"` e `accessibilityLiveRegion="assertive"`.
- **Placeholder:** cor `text-disabled` — mas sempre conferida contra 4.5:1, nunca o cinza padrão "porque é placeholder".

### Dialogs (AppDialog)
- **Estilo:** fundo `surface`, borda `outline-variant`, cantos 24px (`rounded-2xl`), padding 20px.
- **Overlay:** preto 80% de opacidade (`${themeColors.black}CC`) — escurece o fundo sem esconder completamente.
- **Ações:** botões empilhados verticalmente, cada um com `min-h-[48px]`. Variante `cancel` (texto), `destructive` (vermelho), ou padrão (primário).
- **Acessibilidade:** `accessibilityLabel` no Modal, `accessibilityRole="dialog"`, foco gerenciado.
- **Substitui:** todos os `Alert.alert` nativos — consistência visual e acessibilidade garantidas.

### Banners (Notice / Offline / Low Balance)
- **Style:** fundo em tom semântico com baixa opacidade (`${themeColors.warning}15`), ícone + texto, rounded-xl.
- **LowBalanceBanner:** self-contained (gerencia estado de dismiss internamente), botão de fechar com `min-h-[48px]`.
- **NoticeCarousel:** auto-rotate com timer, controles de navegação e pausa, todos com `min-h-[48px]`.
- **Uso:** avisos informativos (cardápio não-oficial), estado offline, saldo baixo — sempre com `accessibilityLabel`.

## 6. Do's and Don'ts

### Do:
- **Do** usar sempre token semântico (`bg-primary`, `text-status-error`) ou `useThemeColors()` — nunca hex solto ou classe crua do Tailwind (`bg-gray-500`).
- **Do** calcular contraste real (≥4.5:1 texto normal) antes de aprovar qualquer cor de texto nova, inclusive placeholder.
- **Do** manter alvo de toque mínimo 48x48dp em todo elemento interativo.
- **Do** tratar rede instável como caso normal: todo fluxo precisa de loading, erro e retry explícitos, nunca uma tela travada sem feedback.
- **Do** usar `ScaledText` em todo texto, pra respeitar escala de fonte do sistema.
- **Do** manter sombra `shadow-sm` única e sutil em cards — não escalar pra elevações mais dramáticas.
- **Do** usar `AppDialog` em vez de `Alert.alert` pra qualquer confirmação ou informação que o app precisa mostrar ao usuário.
- **Do** respeitar a redução de movimento do sistema via `useEffectiveReducedMotion()` — não só a preferência do app.
- **Do** usar `ScaledText` que escala lineHeight proporcionalmente ao fontSize.

### Don't:
- **Don't** usar hex literal ou classe Tailwind crua de cor em componente (`#006A6A` direto, `bg-blue-600`) — quebra dark mode e alto contraste.
- **Don't** projetar telas com estética "fintech corporativa fria" (navy solene, excesso de formalismo visual, distância institucional) — o app é pra estudante, não pra cliente de banco.
- **Don't** usar gradiente em texto ou glassmorphism decorativo — não faz parte do vocabulário visual do app.
- **Don't** esconder estado de carregamento/erro atrás de tela em branco — rede ruim no RU é o caso comum.
- **Don't** substituir o texto de `situacao`/status por ícone ou emoji — o contrato exige o valor textual exato (Anexo C).
- **Don't** usar `Alert.alert` nativo — usar `AppDialog` que é acessível e consistente com a marca.
