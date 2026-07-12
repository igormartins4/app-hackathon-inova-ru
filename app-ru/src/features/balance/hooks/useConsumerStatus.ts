import { useBalance } from './useBalance'

interface ConsumerStatus {
  isBlocked: boolean
  isInactive: boolean
  isActive: boolean
  message: string | null
}

// Per the FUMP v2.0 contract (Anexo C), an inactive consumer never comes back
// as situacao "I" on a successful /creditos/saldo response — the endpoint
// responds 404 instead. Only "A" (Ativo) and "B" (Bloqueado) are ever seen
// in a 200 response, so inactivity must be read from the query error.
export function useConsumerStatus(): ConsumerStatus {
  const { data, isError, error } = useBalance()
  const situacao = data?.consumidor?.situacao
  const status = (error as { response?: { status?: number } } | null)?.response?.status

  const isBlocked = situacao === 'B'
  const isInactive = isError && status === 404
  const isActive = situacao === 'A'

  let message: string | null = null
  if (isBlocked) {
    message = 'Recarga indisponível: sua conta está bloqueada. Procure a FUMP.'
  } else if (isInactive) {
    message = 'Conta inativa. Procure a FUMP para regularizar sua situação.'
  }

  return { isBlocked, isInactive, isActive, message }
}
