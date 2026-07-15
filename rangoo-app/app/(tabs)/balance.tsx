import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { useThemeColors } from '@/config'
import { BalanceCard } from '@/features/balance/components/BalanceCard'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { Card, ErrorMessage, LoadingSpinner, Text } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { getErrorMessage } from '@/shared/utils'

export default function BalanceScreen() {
  const router = useRouter()
  const themeColors = useThemeColors()
  const { data, isLoading, isError, error, refetch, isStale, dataUpdatedAt } = useBalance()
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
          accessibilityLabel={isOffline ? 'Sem conexão' : 'Aviso de saldo em cache'}
          className="mx-4"
        >
          <Text accessibilityRole="text" className="text-center text-xs text-warning">
            {isOffline
              ? 'Sem conexão — exibindo o último saldo salvo no aparelho'
              : `Exibindo saldo salvo em ${new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — puxe para atualizar`}
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
