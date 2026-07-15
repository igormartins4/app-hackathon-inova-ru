import { apiClient } from '@/shared/services'
import type { TransferRequest, TransferResponse } from '../types/transfer.types'

export async function createTransfer(data: TransferRequest): Promise<TransferResponse> {
  const response = await apiClient.post<TransferResponse>('/creditos/transferir', data)
  return response.data
}
