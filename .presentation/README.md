# Slides InovaRU — Apresentação Hackathon

Apresentação em formato Beamer (LaTeX) para o pitch do projeto InovaRU.

## Como Compilar

O tema **Cookie** é LuaLaTeX-first. Compile com `lualatex` (ou `xelatex`); `pdflatex` funciona como último recurso, mas sem as fontes corretas do tema.

### Opção 1: Local (MiKTeX ou TeX Live)

```bash
# Windows
compilar.bat

# Linux/macOS
lualatex presentation.tex
lualatex presentation.tex  # segunda passada para seções/rodapé
```

### Opção 2: Overleaf (recomendado)

1. Acesse [overleaf.com](https://www.overleaf.com)
2. Crie um novo projeto
3. Copie todos os arquivos desta pasta para o Overleaf
4. Configure o compilador para **LuaLaTeX** (menu Overleaf: Menu → Compiler → LuaLaTeX)
5. Compile

## Estrutura

```
slides/
├── presentation.tex          # Arquivo principal (tema Cookie)
├── beamerthemecookie.sty     # Tema Cookie (vendorizado, ver crédito abaixo)
├── compilar.bat              # Script de compilação (Windows)
├── README.md                 # Este arquivo
└── images/
    ├── 01-login.png
    ├── 02-inicio.png
    ├── 03-saldo.png
    ├── 04-recarga.png
    ├── 05-pix-qr-code.png
    ├── 06-sucesso.png
    ├── 07-cardapio.png
    ├── 08-historico.png
    ├── 09-perfil.png
    └── 10-todas-telas.png
```

Tema: [Cookie](https://github.com/SeniorMars/dotfiles/tree/main/latex_template/cookie-beamer) (LuaLaTeX-first, BSD-3-Clause, por Charlie Cruz e colaboradores), com paleta FUMP/UFMG (`#1B4B9A` azul).

## Slides

| # | Seção | Tela |
|---|-------|------|
| 1 | — | Capa |
| 2 | O Problema e a Solução | O Problema & Nossa Solução |
| 3 | O Problema e a Solução | Como Funciona — Jornada do Estudante |
| 4 | Por Dentro do PIX | Fluxo PIX — Passo a Passo Técnico |
| 5 | Por Dentro do PIX | Integração com a API FUMP |
| 6 | O Protótipo | Login e Início |
| 7 | O Protótipo | Saldo e Recarga |
| 8 | O Protótipo | PIX e Confirmação |
| 9 | O Protótipo | Cardápio e Histórico |
| 10 | O Protótipo | Perfil |
| 11 | O Protótipo | Todas as Telas |
| 12 | Como Construímos | Stack Tecnológica e Segurança |
| 13 | Como Construímos | Acessibilidade |
| 14 | Como Construímos | Originalidade |
| 15 | Fechamento | Critérios de Avaliação e Equipe |
| 16 | Fechamento | Encerramento (automática, `closing=contact`) |

Cada seção também gera uma página divisória automática (tema Cookie).
