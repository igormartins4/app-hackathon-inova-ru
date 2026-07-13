import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, Card } from '@/shared/components/ui'

interface PaymentSuccessProps {
  newBalance: number
  onBack: () => void
}

export function PaymentSuccess({ newBalance, onBack }: PaymentSuccessProps) {
  const themeColors = useThemeColors()
  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Card
        accessibilityLabel={`Pagamento aprovado. Novo saldo: ${formatCurrency(newBalance)}`}
        className="w-full max-w-sm"
      >
        <View className="items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-status-success/10 items-center justify-center">
            <Ionicons name="checkmark-circle" size={48} color={themeColors.success} />
          </View>

          <Text className="text-2xl font-bold text-status-success">Pagamento Confirmado!</Text>

          <Text className="text-sm text-text-secondary text-center">
            Seu saldo foi atualizado automaticamente.
          </Text>

          <View className="w-full bg-status-success/10 rounded-xl p-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-text-secondary">Novo saldo:</Text>
              <Text className="text-lg font-bold text-status-success">
                {formatCurrency(newBalance)}
              </Text>
            </View>
          </View>

          <Button label="Voltar ao início" onPress={onBack} variant="primary" />
        </View>
      </Card>
    </View>
  )
}
