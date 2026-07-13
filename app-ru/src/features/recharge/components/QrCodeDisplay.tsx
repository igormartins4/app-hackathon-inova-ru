import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useState } from 'react'
import { Image, Linking, Pressable, Text, View } from 'react-native'
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
  if (diff <= 0) return 'Expirado'
  const min = Math.floor(diff / 60000)
  const sec = Math.floor((diff % 60000) / 1000)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// PAY-03 / FUMP contract: the server-provided qr_code_base64 PNG is the
// authoritative image — never generate the QR client-side. ticket_url is the
// documented fallback. The react-native-qrcode-svg render only kicks in if
// both server assets are unavailable (e.g. local mock without base64).
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

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  const hasServerImage = !!qrCodeBase64 && !base64Failed

  return (
    <View className="items-center gap-4">
      <Text className="text-lg font-bold text-text-primary">Valor: {formatCurrency(amount)}</Text>

      <View className="bg-surface p-4 rounded-xl">
        {hasServerImage ? (
          <Image
            source={{ uri: `data:image/png;base64,${qrCodeBase64}` }}
            accessibilityLabel={`QR Code PIX para pagamento de ${formatCurrency(amount)}`}
            style={{ width: 200, height: 200 }}
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
            size={200}
            color={themeColors.textPrimary}
            backgroundColor={themeColors.surface}
          />
        )}
      </View>

      <Text className="text-sm text-text-secondary">
        Expira em: <Text className="font-bold text-status-warning">{timeLeft}</Text>
      </Text>

      <Pressable
        onPress={handleCopy}
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Código copiado' : 'Copiar código PIX'}
        className="min-h-[48px] min-w-[48px] items-center justify-center bg-surface-variant rounded-xl px-6 py-3 w-full"
      >
        <Text className="text-sm font-semibold text-text-primary">
          {copied ? '✓ Código copiado!' : 'Copiar código'}
        </Text>
      </Pressable>
    </View>
  )
}
