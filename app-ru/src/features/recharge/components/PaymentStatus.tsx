import { ActivityIndicator, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import { QrCodeDisplay } from './QrCodeDisplay'

interface PaymentStatusProps {
  qrCode: string
  qrCodeBase64?: string
  ticketUrl?: string
  amount: number
  expiration: string
  isTimedOut: boolean
}

export function PaymentStatus({
  qrCode,
  qrCodeBase64,
  ticketUrl,
  amount,
  expiration,
  isTimedOut,
}: PaymentStatusProps) {
  const themeColors = useThemeColors()

  return (
    <View className="gap-6 items-center">
      <QrCodeDisplay
        qrCode={qrCode}
        qrCodeBase64={qrCodeBase64}
        ticketUrl={ticketUrl}
        amount={amount}
        expiration={expiration}
      />

      {!isTimedOut && (
        <View className="items-center gap-2">
          <ActivityIndicator size="small" color={themeColors.primary} />
          <Text className="text-sm text-text-secondary">Aguardando pagamento...</Text>
        </View>
      )}

      {isTimedOut && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          className="text-sm text-status-error"
        >
          Tempo esgotado. O pagamento não foi confirmado.
        </Text>
      )}
    </View>
  )
}
