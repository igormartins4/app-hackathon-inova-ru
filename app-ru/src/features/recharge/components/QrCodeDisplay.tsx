import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useState } from 'react'
import { Image, Linking, Pressable, Share, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useThemeColors } from '@/config'

interface QrCodeDisplayProps {
  qrCode: string
  qrCodeBase64?: string
  ticketUrl?: string
  amount: number
  expiration: string
}

function getTimeLeft(expiration: string): string {
  const diff = new Date(expiration).getTime() - Date.now()
  if (diff <= 0) return '00:00'
  const min = Math.floor(diff / 60000)
  const sec = Math.floor((diff % 60000) / 1000)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function QrCodeDisplay({
  qrCode,
  qrCodeBase64,
  ticketUrl,
  amount,
  expiration,
}: QrCodeDisplayProps) {
  const themeColors = useThemeColors()
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiration))
  const [base64Failed, setBase64Failed] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(expiration)), 1000)
    return () => clearInterval(timer)
  }, [expiration])

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(qrCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [qrCode])

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `PIX para recarga no InovaRU: ${qrCode}`,
      })
    } catch {}
  }, [qrCode])

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  const hasServerImage = !!qrCodeBase64 && !base64Failed

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3 bg-status-error/10 rounded-xl px-4 py-3">
        <Ionicons name="time" size={20} color={themeColors.error} />
        <Text className="text-sm text-text-secondary flex-1">Expira em</Text>
        <Text className="text-lg font-bold text-text-primary">{timeLeft}</Text>
      </View>

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
            <QRCode
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
            className="flex-row items-center gap-1.5 bg-primary/10 rounded-lg px-3 py-2 min-h-[40px]"
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
        accessibilityRole="button"
        accessibilityLabel="Compartilhar código"
        className="flex-row items-center justify-center gap-2 bg-surface border border-outline rounded-xl py-3.5 min-h-[48px]"
      >
        <Ionicons name="share-outline" size={20} color={themeColors.primary} />
        <Text className="text-sm font-semibold text-primary">Compartilhar código</Text>
      </Pressable>
    </View>
  )
}
