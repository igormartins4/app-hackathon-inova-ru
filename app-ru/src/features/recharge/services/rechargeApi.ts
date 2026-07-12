import { apiClient } from '@/shared/services'
import type {
  PaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
} from '../types/recharge.types'

export async function createPayment(data: PaymentRequest): Promise<PaymentResponse> {
  const response = await apiClient.post<PaymentResponse>('/creditos/pagamento', data)
  return response.data
}

export async function getPaymentStatus(paymentId: number): Promise<PaymentStatusResponse> {
  const response = await apiClient.get<PaymentStatusResponse>(
    `/creditos/pagamento/${paymentId}/status`,
  )
  return response.data
}
