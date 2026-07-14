import { apiClient } from '@/shared/services'
import type { CardapioParams, CardapioResponse } from '../types/cardapio.types'

export async function fetchCardapio(params: CardapioParams): Promise<CardapioResponse> {
  const response = await apiClient.get<CardapioResponse>('/cardapio', { params })
  return response.data
}
