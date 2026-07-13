import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { PAYMENT_POLL_MAX_MS } from '@/config/constants'
import { usePaymentStatus } from '@/features/recharge/hooks/usePaymentStatus'
import { Card } from '@/shared/components/ui'
import { usePolling } from '@/shared/hooks/usePolling'

interface QrCodeDisplayProps {
  paymentId: number
  qrCode: string
  qrCodeBase64: string
  amount: number
  onPollingSuccess: () => void
  onPollingError: (message: string) => void
}

export function QrCodeDisplay({
  paymentId,
  qrCode: _qrCode,
  qrCodeBase64: _qrCodeBase64,
  amount,
  onPollingSuccess,
  onPollingError,
}: QrCodeDisplayProps) {
  const { data, isLoading, isError, error } = usePaymentStatus(paymentId)
  const [elapsed, setElapsed] = useState(0)

  const handlePollingSuccess = useCallback(() => {
    onPollingSuccess()
  }, [onPollingSuccess])

  const handlePollingError = useCallback(
    (message: string) => {
      onPollingError(message)
    },
    [onPollingError],
  )

  usePolling(paymentId, handlePollingSuccess, handlePollingError)

  useEffect(() => {
    if (elapsed >= PAYMENT_POLL_MAX_MS) {
      onPollingError('Tempo esgotado. O pagamento não foi confirmado. Tente novamente.')
      return
    }

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [elapsed, onPollingError])

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`
  const remainingSeconds = Math.max(0, Math.ceil((PAYMENT_POLL_MAX_MS - elapsed) / 1000))
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Card accessibilityLabel="Erro ao verificar pagamento">
          <View className="items-center gap-3">
            <Ionicons name="alert-circle" size={48} color="#EA4335" />
            <Text className="text-lg font-semibold text-text-primary">
              Erro ao verificar pagamento
            </Text>
            <Text className="text-sm text-text-secondary text-center">
              {error instanceof Error
                ? error.message
                : 'Ocorreu um erro ao verificar o status do pagamento.'}
            </Text>
          </View>
        </Card>
      </View>
    )
  }

  if (data?.status === 'approved' && data?.creditado) {
    return null
  }

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Card
        accessibilityLabel={`Aguardando pagamento de ${formatCurrency(amount)}`}
        className="w-full max-w-sm"
      >
        <View className="items-center gap-4">
          <Text className="text-lg font-semibold text-text-primary">Escaneie o QR Code</Text>

          {/* QR Code placeholder - in production would render actual QR */}
          <View className="w-48 h-48 bg-white rounded-xl items-center justify-center border border-outline">
            <Text className="text-xs text-text-secondary text-center px-4">
              QR Code será gerado aqui
            </Text>
          </View>

          <View className="items-center gap-2">
            <Text className="text-sm text-text-secondary">Valor:</Text>
            <Text className="text-2xl font-bold text-primary">{formatCurrency(amount)}</Text>
          </View>

          <View className="items-center gap-2">
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#006A6A" />
                <Text className="text-sm text-text-secondary">Verificando pagamento...</Text>
              </View>
            ) : (
              <Text className="text-sm text-text-secondary">
                Tempo restante: {minutes.toString().padStart(2, '0')}:
                {seconds.toString().padStart(2, '0')}
              </Text>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar pagamento"
            onPress={() => {}}
            className="min-h-[48px] min-w-[48px] items-center justify-center rounded-xl px-6 py-3 bg-surface-variant"
          >
            <Text className="text-base font-semibold text-text-primary">Cancelar</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  )
}
