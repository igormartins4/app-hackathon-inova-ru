import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, Card } from '@/shared/components/ui'
import type { PaymentStatusResponse } from '../types/recharge.types'

const STATUS_MESSAGES: Record<string, string> = {
  rejected: 'Pagamento não autorizado.',
  cancelled: 'Pagamento cancelado.',
  expired: 'Código PIX expirado.',
  timeout: 'Tempo esgotado. O pagamento não foi confirmado.',
}

interface PaymentErrorProps {
  status: PaymentStatusResponse['status'] | 'timeout'
  onRetry: () => void
}

export function PaymentError({ status, onRetry }: PaymentErrorProps) {
  const themeColors = useThemeColors()
  const message = STATUS_MESSAGES[status] ?? 'Ocorreu um erro.'

  return (
    <View className="flex-1 items-center justify-center bg-background p-4 gap-5">
      <View className="items-center gap-3">
        <View className="w-20 h-20 rounded-full bg-status-error/15 items-center justify-center">
          <Ionicons name="close-circle" size={56} color={themeColors.error} />
        </View>
        <Text className="text-2xl font-bold text-text-primary text-center">
          Pagamento Não Confirmado
        </Text>
        <Text className="text-sm text-text-secondary text-center">{message}</Text>
      </View>

      <Card className="w-full max-w-sm">
        <View className="items-center gap-4">
          <View className="w-full gap-3">
            <Button label="Tentar novamente" onPress={onRetry} variant="primary" />
            <Button label="Voltar ao início" onPress={onRetry} variant="secondary" />
          </View>
        </View>
      </Card>
    </View>
  )
}
