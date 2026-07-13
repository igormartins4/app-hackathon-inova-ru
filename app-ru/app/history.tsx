import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  DateFilter,
  HistoryList,
  type MealRecord,
  type RechargeRecord,
  useMealHistory,
  useRechargeHistory,
} from '@/features/history'
import { Button } from '@/shared/components/ui'

type Tab = 'recharges' | 'meals'

export default function HistoryScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('recharges')
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })

  const dateParams = {
    dataInicio: dateRange.start ?? undefined,
    dataFim: dateRange.end ?? undefined,
  }

  const rechargeQuery = useRechargeHistory(dateParams)
  const mealQuery = useMealHistory(dateParams)

  const activeQuery = activeTab === 'recharges' ? rechargeQuery : mealQuery
  const items: (RechargeRecord | MealRecord)[] =
    activeQuery.data?.pages.flatMap((p) => p.data as (RechargeRecord | MealRecord)[]) ?? []

  const handleRefresh = useCallback(() => {
    activeQuery.refetch()
  }, [activeQuery])

  return (
    <SafeAreaView edges={['top', 'bottom']} accessibilityViewIsModal={true}>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Button label="Voltar" onPress={() => router.back()} variant="secondary" />
      </View>

      <View className="flex-row px-4 gap-2 mb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver recargas"
          accessibilityState={{ selected: activeTab === 'recharges' }}
          onPress={() => setActiveTab('recharges')}
          className={`flex-1 rounded-lg py-3 ${activeTab === 'recharges' ? 'bg-primary' : 'bg-surface-variant'}`}
        >
          <Text
            className={`text-center text-sm font-medium ${activeTab === 'recharges' ? 'text-text-inverse' : 'text-text-primary'}`}
          >
            Recargas
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver refeições"
          accessibilityState={{ selected: activeTab === 'meals' }}
          onPress={() => setActiveTab('meals')}
          className={`flex-1 rounded-lg py-3 ${activeTab === 'meals' ? 'bg-primary' : 'bg-surface-variant'}`}
        >
          <Text
            className={`text-center text-sm font-medium ${activeTab === 'meals' ? 'text-text-inverse' : 'text-text-primary'}`}
          >
            Refeições
          </Text>
        </Pressable>
      </View>

      <View className="px-4 mb-2">
        <DateFilter onFilter={(start, end) => setDateRange({ start, end })} />
      </View>

      <HistoryList
        data={items}
        type={activeTab === 'recharges' ? 'recharge' : 'meal'}
        isLoading={activeQuery.isLoading}
        isFetchingNextPage={activeQuery.isFetchingNextPage}
        hasNextPage={activeQuery.hasNextPage}
        fetchNextPage={activeQuery.fetchNextPage}
        onRefresh={handleRefresh}
        refreshing={activeQuery.isRefetching}
      />
    </SafeAreaView>
  )
}
