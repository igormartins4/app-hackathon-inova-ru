export interface TransferRequest {
  destinatario: string
  valor: number
}

export interface TransferResponse {
  transfer_id: number
  status: 'approved'
  saldo_atualizado: number
  destinatario_nome: string
  destinatario_documento: string
  valor: number
  data_hora: string
}
