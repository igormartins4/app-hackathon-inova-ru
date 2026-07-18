import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, Card, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import type { PaymentStatusResponse } from '../types/recharge.types'

interface PaymentErrorProps {
  status: PaymentStatusResponse['status'] | 'timeout' | 'pendingCredit'
  onRetry: () => void
  /** Só usado quando status === 'timeout' ou 'pendingCredit' — o app desistiu
   * de esperar, mas o PIX pode ter sido confirmado no servidor depois do
   * corte client-side. */
  onCheckHistory?: () => void
}

export function PaymentError({ status, onRetry, onCheckHistory }: PaymentErrorProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()

  // Pagamento aprovado, aguardando crédito — não é uma falha, então usa tom
  // de aviso (não erro) e mensagem/título distintos (não implicar que o
  // pagamento em si falhou).
  const isPendingCredit = status === 'pendingCredit'

  const STATUS_MESSAGES: Record<string, string> = {
    rejected: t.paymentErrorRejected,
    cancelled: t.paymentErrorCancelled,
    expired: t.paymentErrorExpired,
    timeout: t.paymentErrorTimeout,
    pendingCredit: t.paymentPendingCreditMessage,
  }

  const message = STATUS_MESSAGES[status] ?? t.paymentErrorGeneric
  const title = isPendingCredit ? t.paymentPendingCreditTitle : t.paymentErrorTitle

  return (
    <View className="flex-1 items-center justify-center bg-background p-4 gap-5">
      <View className="items-center gap-3">
        <View
          className={`w-20 h-20 rounded-full items-center justify-center ${isPendingCredit ? 'bg-status-warning/15' : 'bg-status-error/15'}`}
        >
          <Ionicons
            name={isPendingCredit ? 'time' : 'close-circle'}
            size={56}
            color={isPendingCredit ? themeColors.warning : themeColors.error}
          />
        </View>
        <Text className="text-2xl font-bold text-text-primary text-center">{title}</Text>
        <Text className="text-sm text-text-secondary text-center">{message}</Text>
      </View>

      <Card className="w-full max-w-sm">
        <View className="items-center gap-4">
          <View className="w-full gap-3">
            {(status === 'timeout' || isPendingCredit) && onCheckHistory && (
              <Button
                label={t.paymentErrorCheckHistory}
                onPress={onCheckHistory}
                variant="secondary"
              />
            )}
            <Button label={t.paymentErrorBack} onPress={onRetry} variant="primary" />
          </View>
        </View>
      </Card>
    </View>
  )
}
