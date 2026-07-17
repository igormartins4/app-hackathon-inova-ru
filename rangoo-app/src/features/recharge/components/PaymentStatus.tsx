import { Ionicons } from '@expo/vector-icons'
import { Alert, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { QrCodeDisplay } from './QrCodeDisplay'

interface PaymentStatusProps {
  qrCode: string
  qrCodeBase64?: string
  ticketUrl?: string
  amount: number
  expiration: string
  isTimedOut: boolean
  onCancel: () => void
}

export function PaymentStatus({
  qrCode,
  qrCodeBase64,
  ticketUrl,
  amount,
  expiration,
  isTimedOut,
  onCancel,
}: PaymentStatusProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()

  const handleCancelPress = () => {
    Alert.alert(t.qrCancelConfirmTitle, t.qrCancelConfirmBody, [
      { text: t.qrCancelConfirmBack, style: 'cancel' },
      { text: t.qrCancelRecharge, style: 'destructive', onPress: onCancel },
    ])
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="text-2xl font-bold text-text-primary">{t.qrPayViaPix}</Text>
        <Text className="text-sm text-text-secondary mt-1">{t.qrScanOrCopy}</Text>
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
          <Text className="text-sm text-status-error flex-1">{t.qrTimedOut}</Text>
        </View>
      )}

      <Button label={t.qrCancelRecharge} onPress={handleCancelPress} variant="secondary" />
    </View>
  )
}
