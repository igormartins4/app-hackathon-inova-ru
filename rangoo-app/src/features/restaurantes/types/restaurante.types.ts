import type { RestauranteCode } from '@/config/restaurantes'

export type Refeicao = 'cafe' | 'almoco' | 'jantar'

export interface FaixaHorario {
  abre: string // "HH:MM"
  fecha: string // "HH:MM"
}

export type HorarioDia = Partial<Record<Refeicao, FaixaHorario>>

/** Chave 0 = domingo .. 6 = sábado (mesmo índice de Date.getDay()). `null` = fechado nesse dia. */
export type HorarioSemana = Record<number, HorarioDia | null>

export interface UnidadeFisica {
  nome: string
  horarios: HorarioSemana
}

export interface RUInfo {
  codigo: RestauranteCode
  nome: string
  campus: string
  /** `null` quando o endereço exato não está publicado nas páginas oficiais consultadas. */
  endereco: string | null
  /** Usado para montar a busca no app de mapas (Linking) quando `endereco` é null. */
  mapsQuery: string
  temCardapio: boolean
  /** Horário regular principal — usado no cálculo de status quando não há `unidadesFisicas`. */
  horarios: HorarioSemana | null
  /** Só para RUs cujo código oficial agrega mais de um prédio físico com horários
   * diferentes (ex.: 0001 = Saúde + Direito). O status "aberto/fechado" considera
   * a união de todas; o detalhe da unidade lista cada prédio separadamente. */
  unidadesFisicas?: UnidadeFisica[]
  /** Ressalva pontual sobre o horário (ex.: café gratuito só para assistidos). */
  nota?: string
  fonteUrl: string
  atualizadoEm: string // "YYYY-MM-DD"
}

export interface AvisoFuncionamento {
  ruCodes: RestauranteCode[]
  titulo: string
  descricao: string
  inicio: string // "YYYY-MM-DD"
  fim: string // "YYYY-MM-DD"
  fonteUrl: string
  atualizadoEm: string // "YYYY-MM-DD"
  suspendeFuncionamento?: boolean
}

export interface RUStatusResult {
  aberto: boolean
  refeicaoAtual: Refeicao | null
  minutosParaFechar: number | null
  proximaAbertura: { data: Date; refeicao: Refeicao } | null
}
