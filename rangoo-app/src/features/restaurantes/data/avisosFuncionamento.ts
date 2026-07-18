import type { AvisoFuncionamento } from '../types/restaurante.types'

// Avisos são adicionados somente após confirmação em fonte oficial, com período,
// URL e data de atualização explícitos. Nenhum aviso é inferido de APIs ou mocks.
export const AVISOS_FUNCIONAMENTO: AvisoFuncionamento[] = [
  {
    ruCodes: ['0001'],
    titulo: 'Funcionamento alterado nas férias',
    descricao: 'O prédio Direito está fechado. O RU Saúde funciona em dias úteis.',
    inicio: '2026-07-06',
    fim: '2026-08-02',
    fonteUrl:
      'https://fump.ufmg.br/noticia/funcionamento-dos-restaurantes-universitarios-nas-ferias-de-julho-da-ufmg-2/',
    atualizadoEm: '2026-07-18',
  },
  {
    ruCodes: ['0002'],
    titulo: 'Funcionamento alterado nas férias',
    descricao: 'O RU Setorial 2 está fechado até o início do segundo semestre.',
    inicio: '2026-07-06',
    fim: '2026-08-02',
    fonteUrl:
      'https://fump.ufmg.br/noticia/funcionamento-dos-restaurantes-universitarios-nas-ferias-de-julho-da-ufmg-2/',
    atualizadoEm: '2026-07-18',
    suspendeFuncionamento: true,
  },
  {
    ruCodes: ['0004'],
    titulo: 'Funcionamento alterado nas férias',
    descricao: 'O RU ICA serve apenas almoço, das 11h às 13h30.',
    inicio: '2026-07-06',
    fim: '2026-08-02',
    fonteUrl:
      'https://fump.ufmg.br/noticia/funcionamento-dos-restaurantes-universitarios-nas-ferias-de-julho-da-ufmg-2/',
    atualizadoEm: '2026-07-18',
  },
]
