import { useState } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useRechargeHistory } from '@/features/history/hooks/useRechargeHistory'
import { useRecharge } from '@/features/recharge/hooks/useRecharge'
import { Card } from '@/shared/components/ui'
import { usePolling } from '@/shared/hooks/usePolling'
import { getErrorMessage } from '@/shared/utils'
import { PaymentError } from './PaymentError'
import { PaymentSuccess } from './PaymentSuccess'
import { QrCodeDisplay } from './QrCodeDisplay'
import { RechargeForm } from './RechargeForm'

type PaymentStep = 'form' | 'qr_code' | 'success' | 'error'

export function RechargeFormContainer() {
  const [step, setStep] = useState<PaymentStep>('form')
  const [paymentId, setPaymentId] = useState<number | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [qrCodeBase64, setQrCodeBase64] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [rechargedAmount, setRechargedAmount] = useState(0)
  const { data: balanceData, refetch: refetchBalance } = useBalance()
  const { startPolling, stopPolling } = usePolling()
  const { mutate: recharge, isPending } = useRecharge()
  const { refetch: refetchHistory } = useRechargeHistory({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  const handleSelectAmount = (amount: number) => {
    Alert.alert(
      'Confirmar Recarga',
      `Deseja recarregar R$ ${amount.toFixed(2).replace('.', ',')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () =>
            recharge(amount, {
              onSuccess: (data) => {
                setPaymentId(data.payment_id)
                setQrCode(data.qr_code)
                setQrCodeBase64(data.qr_code_base64)
                setRechargedAmount(amount)
                setStep('qr_code')
                startPolling(data.payment_id)
              },
              onError: (error) => {
                setPaymentError(getErrorMessage(error))
                setStep('error')
              },
            }),
        },
      ],
    )
  }

  const handlePollingSuccess = async () => {
    stopPolling()
    await Promise.all([refetchBalance(), refetchHistory()])
    setStep('success')
  }

  const handlePollingError = (message: string) => {
    stopPolling()
    setPaymentError(message)
    setStep('error')
  }

  const handleRetry = () => {
    setStep('form')
    setPaymentId(null)
    setQrCode('')
    setQrCodeBase64('')
    setPaymentError('')
  }

  const handleDismiss = () => {
    setStep('form')
    setPaymentId(null)
  }

  if (step === 'qr_code' && paymentId) {
    return (
      <QrCodeDisplay
        paymentId={paymentId}
        qrCode={qrCode}
        qrCodeBase64={qrCodeBase64}
        amount={rechargedAmount}
        onPollingSuccess={handlePollingSuccess}
        onPollingError={handlePollingError}
      />
    )
  }

  if (step === 'success') {
    return <PaymentSuccess amount={rechargedAmount} onPress={handleDismiss} />
  }

  if (step === 'error') {
    return <PaymentError message={paymentError} onRetry={handleRetry} />
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 gap-4">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
              <View className="w-2 h-2 rounded-full bg-text-inverse" />
            </View>
            <View className="flex-1 h-0.5 bg-primary" />
            <View className="w-8 h-8 rounded-full bg-outline-variant items-center justify-center">
              <View className="w-2 h-2 rounded-full bg-text-disabled" />
            </View>
            <View className="flex-1 h-0.5 bg-outline-variant" />
            <View className="w-8 h-8 rounded-full bg-outline-variant items-center justify-center">
              <View className="w-2 h-2 rounded-full bg-text-disabled" />
            </View>
            <View className="flex-1 h-0.5 bg-outline-variant" />
            <View className="w-8 h-8 rounded-full bg-outline-variant items-center justify-center">
              <View className="w-2 h-2 rounded-full bg-text-disabled" />
            </View>
          </View>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-xs font-medium text-primary">PIX</Text>
          <Text className="text-xs text-text-disabled">QR Code</Text>
          <Text className="text-xs text-text-disabled">Pagamento</Text>
          <Text className="text-xs text-text-disabled">Confirmação</Text>
        </View>
      </View>

      {balanceData && (
        <RechargeForm
          currentBalance={balanceData.saldo.credito_disponivel}
          disabled={isPending}
          onSubmit={handleSelectAmount}
        />
      )}

      <Card className="bg-primary/10">
        <View className="gap-1">
          <Text className="text-sm font-semibold text-primary">⚡ Recarga instantânea via PIX</Text>
          <Text className="text-xs text-text-secondary">
            Escaneie o QR Code abaixo e confirme o pagamento no app do seu banco. Seu saldo será
            atualizado em instantes.
          </Text>
        </View>
      </Card>
    </ScrollView>
  )
}
