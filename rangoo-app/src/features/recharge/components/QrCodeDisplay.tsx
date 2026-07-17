import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { memo, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, Linking, Pressable, Share, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useThemeColors } from '@/config'
import { Text } from '@/shared/components/ui'
import { formatCurrency, getTimeLeft } from '@/shared/utils'

interface QrCodeDisplayProps {
  qrCode: string
  qrCodeBase64?: string
  ticketUrl?: string
  amount: number
  expiration: string
}

// ponytail: isolated countdown so its 1s ticker doesn't re-render the parent
// (and the expensive QR SVG) on every tick.
function CountdownText({ expiration }: { expiration: string }) {
  const themeColors = useThemeColors()
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiration))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(expiration)), 1000)
    return () => clearInterval(timer)
  }, [expiration])

  return (
    <View className="flex-row items-center gap-3 bg-status-error/10 rounded-xl px-4 py-3">
      <Ionicons name="time" size={20} color={themeColors.error} />
      <Text className="text-sm text-text-secondary flex-1">Expira em</Text>
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
  const [copied, setCopied] = useState(false)
  const [base64Failed, setBase64Failed] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(qrCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <Text className="text-sm text-text-secondary">Valor a pagar</Text>
        <Text className="text-3xl font-bold text-text-primary">{formatCurrency(amount)}</Text>

        <View className="bg-surface p-4 rounded-xl">
          {hasServerImage ? (
            <Image
              source={{ uri: `data:image/png;base64,${qrCodeBase64}` }}
              accessibilityLabel={`QR Code PIX para pagamento de ${formatCurrency(amount)}`}
              style={{ width: 220, height: 220 }}
              onError={() => setBase64Failed(true)}
            />
          ) : ticketUrl ? (
            <Pressable
              onPress={() => Linking.openURL(ticketUrl)}
              accessibilityRole="link"
              accessibilityLabel="Abrir cobrança PIX no MercadoPago"
              className="min-h-[48px] items-center justify-center px-4"
            >
              <Text className="text-sm font-semibold text-primary underline">
                Abrir cobrança no MercadoPago
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
          <Text className="text-sm text-text-secondary">Aguardando pagamento...</Text>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          PIX Copia e Cola
        </Text>
        <View className="flex-row items-center gap-2 bg-surface rounded-xl p-3">
          <Text className="flex-1 text-xs text-text-secondary font-mono" numberOfLines={2}>
            {qrCode}
          </Text>
          <Pressable
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel={copied ? 'Código copiado' : 'Copiar código PIX'}
            className="flex-row items-center gap-1.5 bg-primary/10 rounded-lg px-3 py-2 min-h-[48px]"
          >
            <Ionicons name={copied ? 'checkmark' : 'copy'} size={16} color={themeColors.primary} />
            <Text className="text-xs font-semibold text-primary">
              {copied ? 'Copiado!' : 'Copiar'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={handleShare}
        disabled={sharing}
        accessibilityRole="button"
        accessibilityLabel="Compartilhar código"
        accessibilityState={{ busy: sharing }}
        className={`flex-row items-center justify-center gap-2 bg-surface border border-outline rounded-xl py-3.5 min-h-[48px] ${sharing ? 'opacity-60' : ''}`}
      >
        {sharing ? (
          <ActivityIndicator size="small" color={themeColors.primary} />
        ) : (
          <Ionicons name="share-outline" size={20} color={themeColors.primary} />
        )}
        <Text className="text-sm font-semibold text-primary">Compartilhar código</Text>
      </Pressable>
    </View>
  )
}
