import { apiClient } from '@/shared/services';
import type { BalanceResponse } from '../types/balance.types';

export async function fetchBalance(): Promise<BalanceResponse> {
  const response = await apiClient.get<BalanceResponse>('/creditos/saldo');
  return response.data;
}
