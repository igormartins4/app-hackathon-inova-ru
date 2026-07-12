import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchMealHistory } from '../services/historyApi';
import type { MealHistoryParams } from '../types/history.types';

const PAGE_SIZE = 20;

export function useMealHistory(extraParams: Omit<MealHistoryParams, 'pagina' | 'por_pagina'> = {}) {
  return useInfiniteQuery({
    queryKey: ['history', 'meals', extraParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchMealHistory({ ...extraParams, pagina: pageParam, por_pagina: PAGE_SIZE }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.dados.length < PAGE_SIZE ? undefined : allPages.length + 1,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
}
