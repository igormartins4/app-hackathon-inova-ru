import { useQuery } from '@tanstack/react-query'
import { fetchCardapio } from '../services/cardapioApi'
import type { CardapioParams } from '../types/cardapio.types'

export function useCardapio(params: CardapioParams) {
  return useQuery({
    queryKey: ['cardapio', params],
    queryFn: () => fetchCardapio(params),
    staleTime: 30 * 60 * 1000,
    enabled: !!params.restaurante && !!params.tipoRefeicao,
  })
}
