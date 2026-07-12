import { useQuery } from '@tanstack/react-query'
import { fetchBalance } from '../services/balanceApi'

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: fetchBalance,
    staleTime: 5 * 60 * 1000,
    networkMode: 'offlineFirst',
  })
}
