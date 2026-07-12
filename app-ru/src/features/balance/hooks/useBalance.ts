import { useQuery } from '@tanstack/react-query'
import { fetchBalance } from '../services/balanceApi'

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: fetchBalance,
    staleTime: 5 * 60 * 1000,
    networkMode: 'offlineFirst',
    // 4xx responses (e.g. 404 for an inactive account) are deterministic — retrying wastes calls.
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) return false
      return failureCount < 3
    },
  })
}
