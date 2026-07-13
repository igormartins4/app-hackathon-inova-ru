import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { BalanceCard } from '@/features/balance/components/BalanceCard'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { Card, ErrorMessage, LoadingSpinner } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { getErrorMessage } from '@/shared/utils'

export default function BalanceScreen() {
  const { data, isLoading, isError, error, refetch, isStale } = useBalance()
  const { isOffline } = useNetworkStatus()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  if (isLoading) {
    return <LoadingSpinner message="Carregando saldo" />
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background px-4 pt-8">
        <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 gap-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text className="text-2xl font-bold text-text-primary">Meu Saldo</Text>

      {(isStale || isOffline) && (
        <Card accessibilityLabel={isOffline ? 'Sem conexão' : 'Aviso de dados aproximados'}>
          <Text accessibilityRole="text" className="text-center text-xs text-status-warning">
            {isOffline ? 'Sem conexão — dados podem estar desatualizados' : 'Dados aproximados'}
          </Text>
        </Card>
      )}

      {data && (
        <BalanceCard
          creditoDisponivel={data.saldo.credito_disponivel}
          limiteRecarga={data.saldo.limite_recarga}
        />
      )}

      {data && (
        <Card accessibilityLabel="Dados do consumidor" accessibilityRole="summary">
          <Text className="text-sm font-semibold text-text-secondary mb-3">
            DADOS DO CONSUMIDOR
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Nome completo</Text>
              <Text className="text-sm font-medium text-text-primary">{data.consumidor.nome}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Tipo</Text>
              <Text className="text-sm font-medium text-text-primary">
                {data.consumidor.tipo_consumidor.descricao}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Centro de Custo</Text>
              <Text className="text-sm font-medium text-text-primary">
                {data.consumidor.centro_custo.descricao}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-text-secondary">Situação</Text>
              <Text
                className={`text-sm font-medium ${data.consumidor.situacao === 'A' ? 'text-status-success' : 'text-status-error'}`}
              >
                {data.consumidor.situacao === 'A'
                  ? 'Ativo ✓'
                  : data.consumidor.situacao === 'B'
                    ? 'Bloqueado'
                    : 'Inativo'}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  )
}
