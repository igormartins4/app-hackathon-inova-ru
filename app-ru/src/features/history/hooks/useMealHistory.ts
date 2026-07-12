import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchMealHistory } from '../services/historyApi'
import type { MealHistoryParams } from '../types/history.types'

const PAGE_SIZE = 20

export function useMealHistory(extraParams: Omit<MealHistoryParams, 'page' | 'perPage'> = {}) {
  return useInfiniteQuery({
    queryKey: ['history', 'meals', extraParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchMealHistory({ ...extraParams, page: pageParam, perPage: PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.currentPage < lastPage.pagination.lastPage
        ? lastPage.pagination.currentPage + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  })
}
