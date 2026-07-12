import { apiClient } from '@/shared/services'
import type {
  HistoryParams,
  HistoryResponse,
  MealHistoryParams,
  MealRecord,
  RechargeRecord,
} from '../types/history.types'

export async function fetchRechargeHistory(
  params: HistoryParams = {},
): Promise<HistoryResponse<RechargeRecord>> {
  const response = await apiClient.get<HistoryResponse<RechargeRecord>>(
    '/creditos/historico-recargas',
    { params },
  )
  return response.data
}

export async function fetchMealHistory(
  params: MealHistoryParams = {},
): Promise<HistoryResponse<MealRecord>> {
  const response = await apiClient.get<HistoryResponse<MealRecord>>(
    '/creditos/historico-refeicoes',
    { params },
  )
  return response.data
}
