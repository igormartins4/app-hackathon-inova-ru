export interface RechargeRecord {
  id: number
  valor: number
  metodo: string
  status: string
  data_hora: string
}

export interface MealRecord {
  data_hora: string
  filial: { codigo: string; nome: string }
  quantidade: number
  valor_total: number
  gratuidade: boolean
  tipo_consumidor: string
}

export interface Pagination {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

export interface HistoryResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface HistoryParams {
  page?: number
  perPage?: number
  dataInicio?: string
  dataFim?: string
}

export interface MealHistoryParams extends HistoryParams {
  filial?: string
}
