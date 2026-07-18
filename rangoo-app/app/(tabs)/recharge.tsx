import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import type { BalanceResponse } from '@/features/balance'
import { useBalance, useConsumerStatus } from '@/features/balance'
import { BalancePreview } from '@/features/recharge/components/BalancePreview'
import { PaymentError } from '@/features/recharge/components/PaymentError'
import { PaymentStatus } from '@/features/recharge/components/PaymentStatus'
import { PaymentSuccess } from '@/features/recharge/components/PaymentSuccess'
import { RechargeForm } from '@/features/recharge/components/RechargeForm'
import { usePolling } from '@/features/recharge/hooks/usePolling'
import { createPayment } from '@/features/recharge/services/rechargeApi'
import type { PaymentStatusResponse } from '@/features/recharge/types/recharge.types'
import { TIMEOUT_MS } from '@/features/recharge/utils/polling'
import { Text } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { useI18n } from '@/shared/i18n'
import { getErrorMessage } from '@/shared/utils'

type FlowStep = 'amount' | 'polling' | 'success' | 'error'

const PENDING_PAYMENT_KEY = '@rangoo_pending_payment'

interface PaymentData {
  paymentId: number
  qrCode: string
  qrCodeBase64: string
  ticketUrl: string
  amount: number
  expiration: string
  createdAt: number
  /** Presente só depois de aprovado — permite a tela de sucesso sobreviver a
   * um refresh/app fechado, em vez de perder o comprovante e cair de volta
   * pra tela de valor. Só é limpo quando o usuário sai da tela de sucesso. */
  status?: 'approved'
  newBalance?: number
}

async function savePendingPayment(data: PaymentData) {
  await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(data))
}

async function saveApprovedPayment(data: PaymentData, newBalance: number) {
  await AsyncStorage.setItem(
    PENDING_PAYMENT_KEY,
    JSON.stringify({ ...data, status: 'approved', newBalance }),
  )
}

async function clearPendingPayment() {
  await AsyncStorage.removeItem(PENDING_PAYMENT_KEY)
}

export default function RechargeScreen() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useI18n()
  const { data: balanceData } = useBalance()
  const { isBlocked, isInactive, message: consumerMessage } = useConsumerStatus()
  const { isOffline } = useNetworkStatus()

  const [step, setStep] = useState<FlowStep>('amount')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [errorStatus, setErrorStatus] = useState<PaymentStatusResponse['status'] | 'timeout'>(
    'timeout',
  )
  const [newBalance, setNewBalance] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedAmount, setSelectedAmount] = useState(0)

  // Retoma um pagamento pendente (app fechado/tela trocada em pleno polling)
  // em vez de perder a referência ao payment_id e deixar o usuário achar que
  // nada estava em andamento.
  useEffect(() => {
    ;(async () => {
      const raw = await AsyncStorage.getItem(PENDING_PAYMENT_KEY)
      if (!raw) return
      const pending = JSON.parse(raw) as PaymentData
      if (pending.status === 'approved') {
        setPaymentData(pending)
        setNewBalance(pending.newBalance ?? 0)
        setStep('success')
        return
      }
      const elapsed = Date.now() - pending.createdAt
      if (elapsed >= TIMEOUT_MS) {
        await clearPendingPayment()
        setErrorStatus('timeout')
        setStep('error')
        return
      }
      setPaymentData(pending)
      setStep('polling')
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApproved = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ['balance'] })
    const latest = queryClient.getQueryData<BalanceResponse>(['balance'])
    const balance = latest?.saldo?.credito_disponivel ?? 0
    setNewBalance(balance)
    if (paymentData) await saveApprovedPayment(paymentData, balance)
    setStep('success')
  }, [queryClient, paymentData])

  const handleTerminal = useCallback((status: PaymentStatusResponse['status']) => {
    clearPendingPayment()
    setErrorStatus(status)
    setStep('error')
  }, [])

  const handleTimeout = useCallback(() => {
    clearPendingPayment()
    setErrorStatus('timeout')
    setStep('error')
  }, [])

  usePolling({
    paymentId: paymentData?.paymentId ?? null,
    startedAt: paymentData?.createdAt,
    onApproved: handleApproved,
    onTerminal: handleTerminal,
    onTimeout: handleTimeout,
  })

  const consumerDisabled = isBlocked || isInactive || isOffline

  const handleSubmit = useCallback(
    async (valor: number) => {
      if (isSubmitting) return // No idempotency — never retry POST
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        const res = await createPayment({ valor })
        const data: PaymentData = {
          paymentId: res.payment_id,
          qrCode: res.qr_code,
          qrCodeBase64: res.qr_code_base64,
          ticketUrl: res.ticket_url,
          amount: valor,
          expiration: res.expiration,
          createdAt: Date.now(),
        }
        await savePendingPayment(data)
        setPaymentData(data)
        setStep('polling')
      } catch (err: unknown) {
        // Nenhuma falha de criação (rede, 429, 500 ou 422) chega a gerar um
        // pagamento de verdade — todas ficam inline, ao lado do input, nunca
        // navegam pra PaymentError (que implica um pagamento que existiu e
        // falhou depois).
        setSubmitError(getErrorMessage(err))
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
    clearPendingPayment()
    setStep('amount')
    setPaymentData(null)
  }, [])

  const handleCheckHistory = useCallback(() => {
    clearPendingPayment()
    router.push('/(tabs)/historico?tab=recargas')
  }, [router])

  const currentBalance = balanceData?.saldo?.credito_disponivel ?? 0
  const limiteRecarga = balanceData?.saldo?.limite_recarga

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
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
                <Text className="text-center text-sm text-status-error">{t.rechargeConecteSe}</Text>
              </View>
            )}
            <BalancePreview currentBalance={currentBalance} amount={selectedAmount} />
            <RechargeForm
              currentBalance={currentBalance}
              limiteRecarga={limiteRecarga}
              disabled={consumerDisabled || isSubmitting}
              isSubmitting={isSubmitting}
              onAmountChange={setSelectedAmount}
              onSubmit={handleSubmit}
              serverError={submitError}
              initialAmount={selectedAmount || undefined}
            />
          </>
        )}

        {step === 'polling' && paymentData && (
          <PaymentStatus
            qrCode={paymentData.qrCode}
            qrCodeBase64={paymentData.qrCodeBase64}
            ticketUrl={paymentData.ticketUrl}
            amount={paymentData.amount}
            // O app desiste do polling em TIMEOUT_MS independente do prazo real
            // do PIX no banco — mostrar a contagem real do servidor faria o
            // relógio contradizer o corte abrupto de "tempo esgotado".
            expiration={new Date(
              Math.min(
                new Date(paymentData.expiration).getTime(),
                paymentData.createdAt + TIMEOUT_MS,
              ),
            ).toISOString()}
            isTimedOut={false}
            onCancel={handleBack}
          />
        )}

        {step === 'success' && (
          <PaymentSuccess
            newBalance={newBalance}
            amount={paymentData?.amount ?? 0}
            onBack={handleBack}
          />
        )}

        {step === 'error' && (
          <PaymentError
            status={errorStatus}
            onRetry={handleRetry}
            onCheckHistory={handleCheckHistory}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
