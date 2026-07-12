import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchRechargeHistory } from '../services/historyApi'
import type { HistoryParams } from '../types/history.types'

const PAGE_SIZE = 20

export function useRechargeHistory(extraParams: Omit<HistoryParams, 'page' | 'perPage'> = {}) {
  return useInfiniteQuery({
    queryKey: ['history', 'recharges', extraParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchRechargeHistory({ ...extraParams, page: pageParam, perPage: PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.currentPage < lastPage.pagination.lastPage
        ? lastPage.pagination.currentPage + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  })
}
