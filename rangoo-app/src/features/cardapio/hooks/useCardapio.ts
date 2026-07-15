import { useQuery } from '@tanstack/react-query'
import { fetchCardapio } from '../services/cardapioApi'
import type { CardapioParams } from '../types/cardapio.types'

export function useCardapio(params: CardapioParams) {
  const dataKey = params.data.toISOString().slice(0, 10)

  return useQuery({
    queryKey: ['cardapio', params.restaurante, params.tipoRefeicao, dataKey],
    queryFn: () => fetchCardapio(params),
    staleTime: 15 * 60 * 1000,
    retry: 1,
    enabled: !!params.restaurante && !!params.tipoRefeicao,
  })
}
