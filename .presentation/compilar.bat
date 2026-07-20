@echo off
echo === Compilacao do Presentation InovaRU ===
echo.
echo O tema Cookie e LuaLaTeX-first: lualatex e o compilador recomendado.
echo Verificando compilador LaTeX...
where lualatex >nul 2>&1
if %errorlevel%==0 (
    echo Usando lualatex...
    lualatex -interaction=nonstopmode presentation.tex
    lualatex -interaction=nonstopmode presentation.tex
    echo.
    echo PDF gerado: presentation.pdf
    goto :done
)

where xelatex >nul 2>&1
if %errorlevel%==0 (
    echo Usando xelatex...
    xelatex -interaction=nonstopmode presentation.tex
    xelatex -interaction=nonstopmode presentation.tex
    echo.
    echo PDF gerado: presentation.pdf
    goto :done
)

where pdflatex >nul 2>&1
if %errorlevel%==0 (
    echo AVISO: pdflatex encontrado, mas o tema Cookie funciona melhor com lualatex/xelatex.
    echo Usando pdflatex como ultimo recurso...
    pdflatex -interaction=nonstopmode presentation.tex
    pdflatex -interaction=nonstopmode presentation.tex
    echo.
    echo PDF gerado: presentation.pdf
    goto :done
)

echo.
echo ERRO: Nenhum compilador LaTeX encontrado!
echo.
echo Opcoes:
echo   1. Instale o MiKTeX: https://miktex.org/download
echo   2. Use o Overleaf: https://www.overleaf.com
echo   3. Copie a pasta slides/ para o Overleaf e compile la
echo.

:done
echo.
pause
