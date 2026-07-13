import { Text, View } from 'react-native'
import { Card } from '@/shared/components/ui'

export default function HistoryScreen() {
  return (
    <View className="flex-1 bg-background p-4 gap-4">
      <Text className="text-2xl font-bold text-text-primary">Histórico</Text>
      <Card accessibilityLabel="Histórico de transações" accessibilityRole="summary">
        <View className="items-center gap-3 py-4">
          <Text className="text-2xl">📋</Text>
          <Text className="text-sm font-medium text-text-primary">
            Nenhuma transação encontrada
          </Text>
          <Text className="text-xs text-text-secondary text-center">
            Suas recargas e refeições aparecerão aqui.
          </Text>
        </View>
      </Card>
    </View>
  )
}
