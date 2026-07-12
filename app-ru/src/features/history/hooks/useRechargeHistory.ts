import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRechargeHistory } from '../services/historyApi';
import type { HistoryParams } from '../types/history.types';

const PAGE_SIZE = 20;

export function useRechargeHistory(extraParams: Omit<HistoryParams, 'pagina' | 'por_pagina'> = {}) {
  return useInfiniteQuery({
    queryKey: ['history', 'recharges', extraParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchRechargeHistory({ ...extraParams, pagina: pageParam, por_pagina: PAGE_SIZE }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.dados.length < PAGE_SIZE ? undefined : allPages.length + 1,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
}
