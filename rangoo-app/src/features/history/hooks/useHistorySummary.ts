import { useEffect, useMemo } from 'react'
import type { HistoryResponse } from '../types/history.types'

interface HistoryQueryLike<T> {
  data?: { pages: HistoryResponse<T>[] }
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

interface UseHistorySummaryOptions<T> {
  query: HistoryQueryLike<T>
  /** Reduz a lista completa de itens (já paginada até o fim) a um total. */
  reducer: (items: T[]) => number
  enabled?: boolean
}

/**
 * Soma um total sobre TODO o histórico (não só a página já carregada) —
 * dispara `fetchNextPage` em loop enquanto houver próxima página, porque a
 * lista de histórico usa paginação incremental via scroll e um resumo
 * calculado só sobre `items` já carregados subestimaria o total real quando
 * há mais páginas do que o usuário rolou até agora.
 */
export function useHistorySummary<T>({
  query,
  reducer,
  enabled = true,
}: UseHistorySummaryOptions<T>) {
  useEffect(() => {
    if (!enabled) return
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage()
    }
  }, [enabled, query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage])

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.data) ?? [], [query.data])
  const total = useMemo(() => reducer(items), [items, reducer])

  return { total, isComplete: !query.hasNextPage, itemCount: items.length }
}
