# Slides InovaRU — Apresentação Hackathon

Apresentação em formato Beamer (LaTeX) para o pitch do projeto InovaRU.

## Como Compilar

### Opção 1: Local (MiKTeX ou TeX Live)

```bash
# Windows
compilar.bat

# Linux/macOS
pdflatex presentation.tex
pdflatex presentation.tex  # segunda passada para referências
```

### Opção 2: Overleaf (recomendado)

1. Acesse [overleaf.com](https://www.overleaf.com)
2. Crie um novo projeto
3. Copie todos os arquivos desta pasta para o Overleaf
4. Configure o compilador para **pdfLaTeX**
5. Compile

## Estrutura

```
slides/
├── presentation.tex          # Arquivo principal (tema Metropolis)
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

Tema: [Metropolis](https://github.com/matze/mtheme), com paleta FUMP/UFMG (`#1B4B9A` azul, `#FFB800` dourado).

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
| 16 | Fechamento | Encerramento |

Cada seção também gera uma página divisória automática (tema Metropolis).
