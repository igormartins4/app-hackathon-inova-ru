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
    <Card accessibilityLabel="Cartão de saldo" accessibilityRole="summary" className="bg-primary">
      <View className="gap-3">
        <Text
          accessibilityLabel={`Saldo disponível: ${formatCurrency(creditoDisponivel)}`}
          accessibilityRole="text"
          className="text-sm font-medium text-text-inverse opacity-80"
        >
          SALDO DISPONÍVEL
        </Text>
        <Text
          accessibilityLabel={formatCurrency(creditoDisponivel)}
          accessibilityRole="text"
          className="text-balance font-bold text-text-inverse"
        >
          R$ {creditoDisponivel.toFixed(2).replace('.', ',')}
        </Text>
        <View className="flex-row gap-4">
          <View className="flex-1 bg-white/20 rounded-lg p-3">
            <Text className="text-xs text-text-inverse opacity-70">Limite de recarga</Text>
            <Text className="text-sm font-semibold text-text-inverse">
              {formatCurrency(limiteRecarga)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  )
}
