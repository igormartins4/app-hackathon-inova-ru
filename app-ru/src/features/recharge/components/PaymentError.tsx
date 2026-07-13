import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'
import { Button, Card } from '@/shared/components/ui'

interface PaymentErrorProps {
  message: string
  onRetry: () => void
}

export function PaymentError({ message, onRetry }: PaymentErrorProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Card
        accessibilityLabel="Erro no pagamento"
        accessibilityRole="alert"
        className="w-full max-w-sm"
      >
        <View className="items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-status-error/10 items-center justify-center">
            <Ionicons name="close-circle" size={48} color="#EA4335" />
          </View>

          <Text className="text-2xl font-bold text-status-error">Pagamento Não Confirmado</Text>

          <Text className="text-sm text-text-secondary text-center">{message}</Text>

          <View className="w-full gap-3">
            <Button label="Tentar novamente" onPress={onRetry} variant="primary" />
            <Button label="Voltar" onPress={onRetry} variant="secondary" />
          </View>
        </View>
      </Card>
    </View>
  )
}
