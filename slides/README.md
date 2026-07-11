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
├── presentation.tex          # Arquivo principal
├── beamerthemecookie.sty     # Tema Cookie (customizado InovaRU)
├── compilar.bat              # Script de compilação (Windows)
├── README.md                 # Este arquivo
└── images/
    ├── 1 - login.png
    ├── 2 - inicio.png
    ├── 3 - saldo.png
    ├── 4 - recarga.png
    ├── 5 - pix-qr-code.png
    ├── 6 - sucesso.png
    ├── 7 - cardapio.png
    ├── 8 - historico.png
    ├── 9 - perfil.png
    └── 10 - todas telas.png
```

## Slides

| # | Tela |
|---|------|
| 1 | Capa |
| 2 | O Problema — Filas nos RUs |
| 3 | Como Funciona — Fluxo de Uso |
| 4 | Login e Início |
| 5 | Saldo e Recarga |
| 6 | Pagamento PIX e Confirmação |
| 7 | Cardápio e Histórico |
| 8 | Perfil e Acessibilidade |
| 9 | Segurança e API |
| 10 | Tecnologias |
| 11 | Critérios de Avaliação |
| 12 | Encerramento |
