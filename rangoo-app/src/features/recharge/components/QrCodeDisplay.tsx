import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, Linking, Pressable, Share, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useThemeColors } from '@/config'
import { Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatCurrency, getCountdownUrgency, getTimeLeft } from '@/shared/utils'

interface QrCodeDisplayProps {
  qrCode: string
  qrCodeBase64?: string
  ticketUrl?: string
  amount: number
  expiration: string
}

// ponytail: isolated countdown so its 1s ticker doesn't re-render the parent
// (and the expensive QR SVG) on every tick.
//
// Urgency escalates instead of alarming from second one: a 2-minute PIX wait
// is the expected happy path, not an emergency — see product principle
// "reduzir ansiedade de espera". Only the final minute (and expiry) read as
// warning/error; the rest of the wait reads calm.
const URGENCY_STYLES = {
  calm: { container: 'bg-surface-variant', icon: 'time-outline' as const },
  urgent: { container: 'bg-warning/10', icon: 'time' as const },
  expired: { container: 'bg-status-error/10', icon: 'time' as const },
}

function CountdownText({ expiration }: { expiration: string }) {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiration))
  const [urgency, setUrgency] = useState(() => getCountdownUrgency(expiration))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(expiration))
      setUrgency(getCountdownUrgency(expiration))
    }, 1000)
    return () => clearInterval(timer)
  }, [expiration])

  const style = URGENCY_STYLES[urgency]
  const iconColor =
    urgency === 'calm'
      ? themeColors.textSecondary
      : themeColors[urgency === 'urgent' ? 'warning' : 'error']

  return (
    <View className={`flex-row items-center gap-3 rounded-xl px-4 py-3 ${style.container}`}>
      <Ionicons name={style.icon} size={20} color={iconColor} />
      <Text className="text-sm text-text-secondary flex-1">{t.qrExpiresIn}</Text>
      <Text className="text-lg font-bold text-text-primary">{timeLeft}</Text>
    </View>
  )
}

const MemoizedQrCode = memo(function QrCodeImage({
  value,
  size,
  color,
  backgroundColor,
}: {
  value: string
  size: number
  color: string
  backgroundColor: string
}) {
  return <QRCode value={value} size={size} color={color} backgroundColor={backgroundColor} />
})

export function QrCodeDisplay({
  qrCode,
  qrCodeBase64,
  ticketUrl,
  amount,
  expiration,
}: QrCodeDisplayProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [base64Failed, setBase64Failed] = useState(false)
  const [sharing, setSharing] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(qrCode)
    setCopied(true)
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
  }, [qrCode])

  const handleShare = useCallback(async () => {
    setSharing(true)
    try {
      await Share.share({
        message: `PIX para recarga no Rangoo: ${qrCode}`,
      })
    } catch {
    } finally {
      setSharing(false)
    }
  }, [qrCode])

  const hasServerImage = !!qrCodeBase64 && !base64Failed

  return (
    <View className="gap-4">
      <CountdownText expiration={expiration} />

      <View className="bg-surface rounded-2xl p-6 items-center gap-4">
        <Text className="text-sm text-text-secondary">{t.qrValueToPay}</Text>
        <Text className="text-3xl font-bold text-text-primary">{formatCurrency(amount)}</Text>

        <View className="bg-surface p-4 rounded-xl">
          {hasServerImage ? (
            <Image
              source={{ uri: `data:image/png;base64,${qrCodeBase64}` }}
              accessibilityLabel={t.qrCodeImageA11y.replace('{amount}', formatCurrency(amount))}
              style={{ width: 220, height: 220 }}
              onError={() => setBase64Failed(true)}
            />
          ) : ticketUrl ? (
            <Pressable
              onPress={() => Linking.openURL(ticketUrl)}
              accessibilityRole="link"
              accessibilityLabel={t.qrMercadoPagoA11y}
              className="min-h-[48px] items-center justify-center px-4"
            >
              <Text className="text-sm font-semibold text-primary underline">
                {t.qrMercadoPagoOpen}
              </Text>
            </Pressable>
          ) : (
            <MemoizedQrCode
              value={qrCode}
              size={220}
              color={themeColors.textPrimary}
              backgroundColor={themeColors.surface}
            />
          )}
        </View>

        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={16} color={themeColors.textSecondary} />
          <Text className="text-sm text-text-secondary">{t.qrAwaitingPayment}</Text>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {t.qrCopyPasteTitle}
        </Text>
        <View className="flex-row items-center gap-2 bg-surface rounded-xl p-3">
          <Text className="flex-1 text-xs text-text-secondary font-mono" numberOfLines={2}>
            {qrCode}
          </Text>
          <Pressable
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel={copied ? t.qrCopyA11yCopied : t.qrCopyA11yDefault}
            className="flex-row items-center gap-1.5 bg-primary/10 rounded-lg px-3 py-2 min-h-[48px]"
          >
            <Ionicons name={copied ? 'checkmark' : 'copy'} size={16} color={themeColors.primary} />
            <Text className="text-xs font-semibold text-primary">
              {copied ? t.qrCopied : t.qrCopy}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={handleShare}
        disabled={sharing}
        accessibilityRole="button"
        accessibilityLabel={t.qrShareCode}
        accessibilityState={{ busy: sharing }}
        className={`flex-row items-center justify-center gap-2 bg-surface border border-outline rounded-xl py-3.5 min-h-[48px] ${sharing ? 'opacity-60' : ''}`}
      >
        {sharing ? (
          <ActivityIndicator size="small" color={themeColors.primary} />
        ) : (
          <Ionicons name="share-outline" size={20} color={themeColors.primary} />
        )}
        <Text className="text-sm font-semibold text-primary">{t.qrShareCode}</Text>
      </Pressable>
    </View>
  )
}
