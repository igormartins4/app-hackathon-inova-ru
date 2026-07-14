import { Ionicons } from '@expo/vector-icons'
import { useCallback } from 'react'
import { Share, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, Card } from '@/shared/components/ui'

interface PaymentSuccessProps {
  newBalance: number
  amount: number
  onBack: () => void
}

function formatCurrency(v: number): string {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function PaymentSuccess({ newBalance, amount, onBack }: PaymentSuccessProps) {
  const themeColors = useThemeColors()

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Recarga de ${formatCurrency(amount)} no InovaRU confirmada! Novo saldo: ${formatCurrency(newBalance)}`,
      })
    } catch {}
  }, [amount, newBalance])

  return (
    <View className="flex-1 items-center justify-center bg-background p-4 gap-5">
      <View className="items-center gap-3">
        <View className="w-20 h-20 rounded-full bg-success/15 items-center justify-center">
          <Ionicons name="checkmark-circle" size={56} color={themeColors.success} />
        </View>
        <Text className="text-2xl font-bold text-text-primary text-center">
          Recarga confirmada!
        </Text>
        <Text className="text-sm text-text-secondary text-center">
          Seus créditos foram adicionados com sucesso
        </Text>
      </View>

      <Card className="w-full max-w-sm">
        <View className="items-center gap-4">
          <View>
            <Text className="text-xs text-text-secondary text-center">Valor recarregado</Text>
            <Text className="text-4xl font-bold text-success text-center mt-1">
              +{formatCurrency(amount)}
            </Text>
          </View>

          <View className="w-full h-px bg-outline-variant" />

          <View className="w-full gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-text-secondary">Novo saldo</Text>
              <Text className="text-sm font-bold text-text-primary">
                {formatCurrency(newBalance)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-text-secondary">Horário</Text>
              <Text className="text-sm font-bold text-text-primary">
                Hoje, {formatTime(new Date())}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      <View className="w-full max-w-sm gap-3">
        <Button label="Compartilhar comprovante" onPress={handleShare} variant="secondary" />
        <Button label="Voltar ao início" onPress={onBack} variant="primary" />
      </View>
    </View>
  )
}
