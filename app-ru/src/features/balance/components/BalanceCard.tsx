import { Text, View } from 'react-native'
import { Card } from '@/shared/components/ui'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface BalanceCardProps {
  creditoDisponivel: number
  limiteRecarga: number
}

export function BalanceCard({ creditoDisponivel, limiteRecarga }: BalanceCardProps) {
  return (
    <Card accessibilityLabel="Cartão de saldo" accessibilityRole="summary">
      <View className="gap-3">
        <Text
          accessibilityLabel={`Saldo disponível: ${formatCurrency(creditoDisponivel)}`}
          accessibilityRole="text"
          className="text-sm text-gray-500"
        >
          Saldo disponível
        </Text>
        <Text
          accessibilityLabel={formatCurrency(creditoDisponivel)}
          accessibilityRole="text"
          className="text-3xl font-bold text-green-700"
        >
          {formatCurrency(creditoDisponivel)}
        </Text>
        <Text
          accessibilityLabel={`Limite de recarga: ${formatCurrency(limiteRecarga)}`}
          accessibilityRole="text"
          className="text-xs text-gray-400"
        >
          Limite de recarga: {formatCurrency(limiteRecarga)}
        </Text>
      </View>
    </Card>
  )
}
