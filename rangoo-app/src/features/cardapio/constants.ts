import type { FilialCode } from './types/cardapio.types'

// Lista de RUs selecionaveis na tela de Cardapio. Restrita aos 4 RUs que o
// scraper nao-oficial da FUMP (cardapioApi.ts / FILIAL_TO_FUMP_ID) realmente
// cobre — RU HRTN (0005) nao tem cardapio publicado. Ver docs/decisoes_ui.md.
export const RESTAURANTES_CARDAPIO: { key: FilialCode; label: string; hasDinner: boolean }[] = [
  { key: '0003', label: 'Setorial 1', hasDinner: true },
  { key: '0002', label: 'Setorial 2', hasDinner: false },
  { key: '0001', label: 'Saúde/Direito', hasDinner: true },
  { key: '0004', label: 'ICA', hasDinner: true },
]
