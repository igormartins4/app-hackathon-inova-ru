import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import { BalanceCard } from '@/features/balance/components/BalanceCard'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { Card, ErrorMessage, LoadingSpinner } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { getErrorMessage } from '@/shared/utils'

export default function BalanceScreen() {
  const router = useRouter()
  const themeColors = useThemeColors()
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
      contentContainerClassName="gap-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row items-center gap-3 px-4 pt-4">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="w-10 h-10 rounded-full bg-surface items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color={themeColors.primary} />
        </Pressable>
        <Text className="text-2xl font-bold text-text-primary">Meu Saldo</Text>
      </View>

      {(isStale || isOffline) && (
        <Card
          accessibilityLabel={isOffline ? 'Sem conexão' : 'Aviso de dados aproximados'}
          className="mx-4"
        >
          <Text accessibilityRole="text" className="text-center text-xs text-warning">
            {isOffline
              ? 'Sem conexão — dados podem estar desatualizados'
              : 'Saldo estimado — puxe para atualizar'}
          </Text>
        </Card>
      )}

      {data && (
        <View className="px-4">
          <BalanceCard
            creditoDisponivel={data.saldo.credito_disponivel}
            limiteRecarga={data.saldo.limite_recarga}
          />
        </View>
      )}

      {data && (
        <Card accessibilityLabel="Dados do consumidor" accessibilityRole="summary" className="mx-4">
          <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
            Dados do Consumidor
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
                className={`text-sm font-bold uppercase ${data.consumidor.situacao === 'A' ? 'text-success' : 'text-status-error'}`}
              >
                {data.consumidor.situacao === 'A'
                  ? 'ATIVO'
                  : data.consumidor.situacao === 'B'
                    ? 'BLOQUEADO'
                    : 'INATIVO'}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <Pressable
        onPress={() => router.push('/(tabs)/recharge')}
        accessibilityRole="button"
        accessibilityLabel="Recarregar via PIX"
        className="mx-4 mb-4 flex-row items-center justify-center gap-2 bg-primary rounded-xl py-4 min-h-[52px]"
      >
        <Ionicons name="refresh-circle" size={20} color={themeColors.textInverse} />
        <Text className="text-base font-bold text-text-inverse">Recarregar via PIX</Text>
      </Pressable>

      <View className="h-4" />
    </ScrollView>
  )
}
