import { useBalance } from './useBalance'

interface ConsumerStatus {
  isBlocked: boolean
  isInactive: boolean
  isActive: boolean
  message: string | null
}

export function useConsumerStatus(): ConsumerStatus {
  const { data } = useBalance()
  const situacao = data?.consumidor?.situacao

  const isBlocked = situacao === 'B'
  const isInactive = situacao === 'I'
  const isActive = situacao === 'A'

  let message: string | null = null
  if (isBlocked || isInactive) {
    message = 'Conta inativa. Procure a FUMP para regularizar sua situação.'
  }

  return { isBlocked, isInactive, isActive, message }
}
