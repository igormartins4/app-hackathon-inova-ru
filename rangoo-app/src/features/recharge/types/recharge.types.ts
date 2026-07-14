export interface PaymentRequest {
  valor: number
}

export interface PaymentResponse {
  payment_id: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'
  qr_code: string
  qr_code_base64: string
  ticket_url: string
  expiration: string
}

export interface PaymentStatusResponse {
  payment_id: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'
  status_detail?: string
  creditado?: boolean
}
