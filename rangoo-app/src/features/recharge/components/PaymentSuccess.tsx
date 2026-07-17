import { Ionicons } from '@expo/vector-icons'
import * as Sharing from 'expo-sharing'
import { useCallback, useRef, useState } from 'react'
import { Share, View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { useThemeColors } from '@/config'
import { Button, Card, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatCurrency, formatTime, formatToLocalDate } from '@/shared/utils'

interface PaymentSuccessProps {
  newBalance: number
  amount: number
  onBack: () => void
}

export function PaymentSuccess({ newBalance, amount, onBack }: PaymentSuccessProps) {
  const themeColors = useThemeColors()
  const receiptRef = useRef<View>(null)
  const { t } = useI18n()
  const [isSharing, setIsSharing] = useState(false)

  const shareAsText = useCallback(async () => {
    const now = new Date()
    const dateStr = formatToLocalDate(now.toISOString())
    const timeStr = formatTime(now)
    try {
      await Share.share({
        message: [
          `${t.paymentSuccessTitle} — Rangoo`,
          ``,
          `${t.paymentSuccessValorRecarregado}: ${formatCurrency(amount)}`,
          `${t.historyDate}: ${dateStr} ${t.historyTime} ${timeStr}`,
          `${t.paymentSuccessMetodo}: PIX`,
          `${t.paymentSuccessNovoSaldo}: ${formatCurrency(newBalance)}`,
          ``,
          `Rangoo Universitário — Hackathon InovaRU 2026`,
        ].join('\n'),
      })
    } catch {}
  }, [amount, newBalance, t])

  const handleShare = useCallback(async () => {
    setIsSharing(true)
    try {
      const uri = await captureRef(receiptRef, { format: 'png', quality: 1, result: 'tmpfile' })
      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Rangoo Universitário`,
        })
      } else {
        await shareAsText()
      }
    } catch {
      await shareAsText()
    } finally {
      setIsSharing(false)
    }
  }, [shareAsText])

  return (
    <View className="flex-1 items-center justify-center bg-background p-4 gap-5">
      <View className="items-center gap-3">
        <View className="w-20 h-20 rounded-full bg-success/15 items-center justify-center">
          <Ionicons name="checkmark-circle" size={56} color={themeColors.success} />
        </View>
        <Text className="text-2xl font-bold text-text-primary text-center">
          {t.paymentSuccessTitle}
        </Text>
        <Text className="text-sm text-text-secondary text-center">{t.paymentSuccessSubtitle}</Text>
      </View>

      <View ref={receiptRef} collapsable={false} className="w-full max-w-sm">
        <Card className="bg-background">
          <View className="items-center gap-4">
            <View>
              <Text className="text-xs text-text-secondary text-center">
                {t.paymentSuccessValorRecarregado}
              </Text>
              <Text className="text-4xl font-bold text-success text-center mt-1">
                +{formatCurrency(amount)}
              </Text>
            </View>

            <View className="w-full h-px bg-outline-variant" />

            <View className="w-full gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-text-secondary">{t.paymentSuccessNovoSaldo}</Text>
                <Text className="text-sm font-bold text-text-primary">
                  {formatCurrency(newBalance)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-text-secondary">{t.paymentSuccessHorario}</Text>
                <Text className="text-sm font-bold text-text-primary">
                  {t.cardapioHoje}, {formatTime(new Date())}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-text-secondary">{t.paymentSuccessMetodo}</Text>
                <Text className="text-sm font-bold text-text-primary">PIX</Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      <View className="w-full max-w-sm gap-3">
        <Button
          label={t.paymentSuccessCompartilhar}
          onPress={handleShare}
          loading={isSharing}
          disabled={isSharing}
          variant="secondary"
        />
        <Button label={t.paymentSuccessVoltar} onPress={onBack} variant="primary" />
      </View>
    </View>
  )
}
