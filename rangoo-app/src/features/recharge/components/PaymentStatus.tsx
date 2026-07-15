import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { useThemeColors } from '@/config'
import { Text } from '@/shared/components/ui'
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
    <View className="gap-5">
      <View>
        <Text className="text-2xl font-bold text-text-primary">Pagar via PIX</Text>
        <Text className="text-sm text-text-secondary mt-1">
          Escanear o QR Code ou copie o código
        </Text>
      </View>

      <QrCodeDisplay
        qrCode={qrCode}
        qrCodeBase64={qrCodeBase64}
        ticketUrl={ticketUrl}
        amount={amount}
        expiration={expiration}
      />

      {isTimedOut && (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          className="flex-row items-center gap-3 bg-status-error/10 rounded-xl p-4"
        >
          <Ionicons name="warning" size={20} color={themeColors.error} />
          <Text className="text-sm text-status-error flex-1">
            Tempo esgotado. O pagamento não foi confirmado.
          </Text>
        </View>
      )}
    </View>
  )
}
