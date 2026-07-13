import { Text, View } from 'react-native'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { BalanceCard } from '@/features/balance/components/BalanceCard'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useConsumerStatus } from '@/features/balance/hooks/useConsumerStatus'
import { Card, ErrorMessage, LoadingSpinner } from '@/shared/components/ui'
import { getErrorMessage } from '@/shared/utils'

export default function HomeScreen() {
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useBalance()
  const { isInactive, message } = useConsumerStatus()

  if (isLoading) {
    return <LoadingSpinner message="Carregando" />
  }

  if (isInactive) {
    return (
      <View className="flex-1 bg-background px-4 pt-8">
        <ErrorMessage message={message ?? 'Conta inativa. Procure a FUMP.'} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background px-4 pt-8">
        <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background p-4 gap-4">
      {/* Greeting */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-text-secondary">Bom dia,</Text>
          <Text
            accessibilityLabel={`Olá, ${user?.nome?.split(' ')[0] ?? 'Estudante'}`}
            className="text-2xl font-bold text-text-primary"
          >
            {user?.nome?.split(' ')[0] ?? 'Estudante'} 👋
          </Text>
        </View>
      </View>

      {/* Balance Card */}
      {data && (
        <BalanceCard
          creditoDisponivel={data.saldo.credito_disponivel}
          limiteRecarga={data.saldo.limite_recarga}
        />
      )}

      {/* Quick Actions */}
      <View className="flex-row gap-3">
        <Card className="flex-1 items-center py-4">
          <Text className="text-2xl mb-2">💰</Text>
          <Text className="text-sm font-medium text-text-primary">Saldo</Text>
        </Card>
        <Card className="flex-1 items-center py-4">
          <Text className="text-2xl mb-2">🍽️</Text>
          <Text className="text-sm font-medium text-text-primary">Cardápio</Text>
        </Card>
        <Card className="flex-1 items-center py-4">
          <Text className="text-2xl mb-2">📋</Text>
          <Text className="text-sm font-medium text-text-primary">Histórico</Text>
        </Card>
      </View>

      {/* Alert */}
      {message && (
        <Card accessibilityLabel="Alerta de conta" accessibilityRole="alert">
          <Text accessibilityRole="text" className="text-center text-sm text-status-error">
            {message}
          </Text>
        </Card>
      )}
    </View>
  )
}
