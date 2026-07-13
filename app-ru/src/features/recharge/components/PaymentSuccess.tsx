import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'
import { Button, Card } from '@/shared/components/ui'

interface PaymentSuccessProps {
  amount: number
  onPress: () => void
}

export function PaymentSuccess({ amount, onPress }: PaymentSuccessProps) {
  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Card
        accessibilityLabel={`Pagamento de ${formatCurrency(amount)} realizado com sucesso`}
        className="w-full max-w-sm"
      >
        <View className="items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-status-success/10 items-center justify-center">
            <Ionicons name="checkmark-circle" size={48} color="#34A853" />
          </View>

          <Text className="text-2xl font-bold text-status-success">Pagamento Confirmado!</Text>

          <Text className="text-sm text-text-secondary text-center">
            Seu saldo foi atualizado automaticamente.
          </Text>

          <View className="w-full bg-success/10 rounded-xl p-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-text-secondary">Valor creditado:</Text>
              <Text className="text-lg font-bold text-status-success">
                {formatCurrency(amount)}
              </Text>
            </View>
          </View>

          <Button label="Voltar ao início" onPress={onPress} variant="primary" />
        </View>
      </Card>
    </View>
  )
}
