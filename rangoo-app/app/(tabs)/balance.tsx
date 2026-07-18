import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { useThemeColors } from '@/config'
import { BalanceCard } from '@/features/balance/components/BalanceCard'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { Card, ErrorMessage, LoadingSpinner, Text } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { useI18n } from '@/shared/i18n'
import { getErrorMessage } from '@/shared/utils'

export default function BalanceScreen() {
  const router = useRouter()
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const { data, isLoading, isError, error, refetch, isStale, dataUpdatedAt } = useBalance()
  const { isOffline } = useNetworkStatus()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  if (isLoading) {
    return <LoadingSpinner message={t.balanceLoading} />
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
          accessibilityLabel={t.back}
          className="w-12 h-12 rounded-full bg-surface items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color={themeColors.primary} />
        </Pressable>
        <Text className="text-2xl font-bold text-text-primary">{t.balanceTitle}</Text>
      </View>

      {(isStale || isOffline) && (
        <Card
          accessibilityLabel={
            isOffline ? t.errorNoConnection : t.balanceCache.replace('{time}', '')
          }
          className="mx-4"
        >
          <Text accessibilityRole="text" className="text-center text-xs text-status-warning">
            {isOffline
              ? t.balanceOffline
              : t.balanceCache.replace(
                  '{time}',
                  new Date(dataUpdatedAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                )}
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
        accessibilityLabel={t.balanceRechargePix}
        className="mx-4 mb-4 flex-row items-center justify-center gap-2 bg-primary rounded-xl py-4 min-h-[52px]"
      >
        <Ionicons name="refresh-circle" size={20} color={themeColors.textInverse} />
        <Text className="text-base font-bold text-text-inverse">{t.balanceRechargePix}</Text>
      </Pressable>

      <View className="h-4" />
    </ScrollView>
  )
}
