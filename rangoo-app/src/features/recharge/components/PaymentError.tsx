import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, Card, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import type { PaymentStatusResponse } from '../types/recharge.types'

interface PaymentErrorProps {
  status: PaymentStatusResponse['status'] | 'timeout'
  onRetry: () => void
}

export function PaymentError({ status, onRetry }: PaymentErrorProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()

  const STATUS_MESSAGES: Record<string, string> = {
    rejected: t.paymentErrorRejected,
    cancelled: t.paymentErrorCancelled,
    expired: t.paymentErrorExpired,
    timeout: t.paymentErrorTimeout,
  }

  const message = STATUS_MESSAGES[status] ?? t.paymentErrorGeneric

  return (
    <View className="flex-1 items-center justify-center bg-background p-4 gap-5">
      <View className="items-center gap-3">
        <View className="w-20 h-20 rounded-full bg-status-error/15 items-center justify-center">
          <Ionicons name="close-circle" size={56} color={themeColors.error} />
        </View>
        <Text className="text-2xl font-bold text-text-primary text-center">
          {t.paymentErrorTitle}
        </Text>
        <Text className="text-sm text-text-secondary text-center">{message}</Text>
      </View>

      <Card className="w-full max-w-sm">
        <View className="items-center gap-4">
          <View className="w-full gap-3">
            <Button label={t.paymentErrorRetry} onPress={onRetry} variant="primary" />
            <Button label={t.paymentErrorBack} onPress={onRetry} variant="secondary" />
          </View>
        </View>
      </Card>
    </View>
  )
}
