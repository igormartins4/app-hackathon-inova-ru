import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import type { BalanceResponse } from '@/features/balance'
import { useBalance, useConsumerStatus } from '@/features/balance'
import { PaymentError } from '@/features/recharge/components/PaymentError'
import { PaymentStatus } from '@/features/recharge/components/PaymentStatus'
import { PaymentSuccess } from '@/features/recharge/components/PaymentSuccess'
import { RechargeForm } from '@/features/recharge/components/RechargeForm'
import { usePolling } from '@/features/recharge/hooks/usePolling'
import { createPayment } from '@/features/recharge/services/rechargeApi'
import type { PaymentStatusResponse } from '@/features/recharge/types/recharge.types'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'

type FlowStep = 'amount' | 'polling' | 'success' | 'error'

export default function RechargeScreen() {
  const queryClient = useQueryClient()
  const { data: balanceData } = useBalance()
  const { isBlocked, isInactive, message: consumerMessage } = useConsumerStatus()
  const { isOffline } = useNetworkStatus()

  const [step, setStep] = useState<FlowStep>('amount')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentData, setPaymentData] = useState<{
    paymentId: number
    qrCode: string
    qrCodeBase64: string
    ticketUrl: string
    amount: number
    expiration: string
  } | null>(null)
  const [errorStatus, setErrorStatus] = useState<PaymentStatusResponse['status'] | 'timeout'>(
    'timeout',
  )
  const [newBalance, setNewBalance] = useState(0)

  const handleApproved = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ['balance'] })
    const latest = queryClient.getQueryData<BalanceResponse>(['balance'])
    setNewBalance(latest?.saldo?.credito_disponivel ?? 0)
    setStep('success')
  }, [queryClient])

  const handleTerminal = useCallback((status: PaymentStatusResponse['status']) => {
    setErrorStatus(status)
    setStep('error')
  }, [])

  const handleTimeout = useCallback(() => {
    setErrorStatus('timeout')
    setStep('error')
  }, [])

  usePolling({
    paymentId: paymentData?.paymentId ?? null,
    onApproved: handleApproved,
    onTerminal: handleTerminal,
    onTimeout: handleTimeout,
  })

  const consumerDisabled = isBlocked || isInactive || isOffline

  const handleSubmit = useCallback(
    async (valor: number) => {
      if (isSubmitting) return // No idempotency — never retry POST
      setIsSubmitting(true)
      try {
        const res = await createPayment({ valor })
        setPaymentData({
          paymentId: res.payment_id,
          qrCode: res.qr_code,
          qrCodeBase64: res.qr_code_base64,
          ticketUrl: res.ticket_url,
          amount: valor,
          expiration: res.expiration,
        })
        setStep('polling')
      } catch {
        setErrorStatus('timeout')
        setStep('error')
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting],
  )

  const handleRetry = useCallback(() => {
    setStep('amount')
    setPaymentData(null)
  }, [])

  const handleBack = useCallback(() => {
    setStep('amount')
    setPaymentData(null)
  }, [])

  const currentBalance = balanceData?.saldo?.credito_disponivel ?? 0

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-5">
      {step === 'amount' && (
        <>
          {(isBlocked || isInactive) && (
            <View accessibilityRole="alert" className="bg-status-error/10 rounded-lg p-3">
              <Text className="text-center text-sm text-status-error">{consumerMessage}</Text>
            </View>
          )}
          {isOffline && (
            <View accessibilityRole="alert" className="bg-status-error/10 rounded-lg p-3">
              <Text className="text-center text-sm text-status-error">
                Conecte-se à internet para recarregar
              </Text>
            </View>
          )}
          <RechargeForm
            currentBalance={currentBalance}
            disabled={consumerDisabled || isSubmitting}
            onSubmit={handleSubmit}
          />
        </>
      )}

      {step === 'polling' && paymentData && (
        <PaymentStatus
          qrCode={paymentData.qrCode}
          qrCodeBase64={paymentData.qrCodeBase64}
          ticketUrl={paymentData.ticketUrl}
          amount={paymentData.amount}
          expiration={paymentData.expiration}
          isTimedOut={false}
        />
      )}

      {step === 'success' && (
        <PaymentSuccess
          newBalance={newBalance}
          amount={paymentData?.amount ?? 0}
          onBack={handleBack}
        />
      )}

      {step === 'error' && <PaymentError status={errorStatus} onRetry={handleRetry} />}
    </ScrollView>
  )
}
