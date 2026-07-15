// Lista oficial de Restaurantes Universitarios (Anexo A da especificacao tecnica v2.0).
// Uso geral do app (Home, filtro de filial no historico) — nao confundir com a
// lista reduzida de src/features/cardapio/constants.ts, que so cobre os RUs com
// cardapio publicado no scraper nao-oficial da FUMP (ver docs/decisoes_ui.md).

export type RestauranteCode = '0001' | '0002' | '0003' | '0004' | '0005'

export interface Restaurante {
  codigo: RestauranteCode
  nome: string
  campus: string
}

export const RESTAURANTES_OFICIAIS: Restaurante[] = [
  { codigo: '0001', nome: 'RU Saúde/Direito', campus: 'Campus Saúde, Belo Horizonte' },
  { codigo: '0002', nome: 'RU Setorial 2', campus: 'Campus Pampulha, Belo Horizonte' },
  { codigo: '0003', nome: 'RU Setorial 1', campus: 'Campus Pampulha, Belo Horizonte' },
  { codigo: '0004', nome: 'RU ICA', campus: 'Campus Montes Claros' },
  { codigo: '0005', nome: 'RU HRTN', campus: 'Hospital Risoleta T. Neves, Belo Horizonte' },
]
