import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import {
  DateFilter,
  HistoryList,
  type MealRecord,
  type RechargeRecord,
  useMealHistory,
  useRechargeHistory,
} from '@/features/history'

type Tab = 'recargas' | 'refeicoes'

export default function HistoricoScreen() {
  const params = useLocalSearchParams<{ tab?: string }>()
  const themeColors = useThemeColors()
  const [activeTab, setActiveTab] = useState<Tab>(
    params.tab === 'refeicoes' ? 'refeicoes' : 'recargas',
  )
  const [showFilter, setShowFilter] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })

  useEffect(() => {
    if (params.tab === 'refeicoes') setActiveTab('refeicoes')
    else if (params.tab === 'recargas') setActiveTab('recargas')
  }, [params.tab])

  const dateParams = {
    dataInicio: dateRange.start ?? undefined,
    dataFim: dateRange.end ?? undefined,
  }

  const rechargeQuery = useRechargeHistory(dateParams, { enabled: activeTab === 'recargas' })
  const mealQuery = useMealHistory(dateParams, { enabled: activeTab === 'refeicoes' })

  const activeQuery = activeTab === 'recargas' ? rechargeQuery : mealQuery
  const items: (RechargeRecord | MealRecord)[] = useMemo(
    () => activeQuery.data?.pages.flatMap((p) => p.data as (RechargeRecord | MealRecord)[]) ?? [],
    [activeQuery.data],
  )

  const handleRefresh = useCallback(() => {
    activeQuery.refetch()
  }, [activeQuery])

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <View>
          <Text className="text-2xl font-bold text-text-primary">Histórico</Text>
          <Text className="text-xs text-text-secondary mt-0.5">
            Suas recargas e refeições nos RUs
          </Text>
        </View>
        <Pressable
          onPress={() => setShowFilter((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Filtrar por período"
          accessibilityState={{ selected: showFilter }}
          className="w-10 h-10 rounded-full bg-surface items-center justify-center"
        >
          <Ionicons name="filter" size={20} color={themeColors.primary} />
        </Pressable>
      </View>

      <View className="flex-row px-4 gap-1 mb-2">
        {(
          [
            { key: 'recargas' as const, label: 'Recargas' },
            { key: 'refeicoes' as const, label: 'Refeições' },
          ] as const
        ).map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: activeTab === t.key }}
            className={`flex-1 items-center py-3 min-h-[48px] ${
              activeTab === t.key ? 'border-b-2 border-primary' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === t.key ? 'text-primary font-bold' : 'text-text-secondary'
              }`}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {showFilter && (
        <View className="px-4 mb-2">
          <DateFilter onFilter={(start, end) => setDateRange({ start, end })} />
        </View>
      )}

      <HistoryList
        data={items}
        type={activeTab === 'recargas' ? 'recharge' : 'meal'}
        isLoading={activeQuery.isLoading}
        isFetchingNextPage={activeQuery.isFetchingNextPage}
        hasNextPage={activeQuery.hasNextPage}
        fetchNextPage={activeQuery.fetchNextPage}
        onRefresh={handleRefresh}
        refreshing={activeQuery.isRefetching}
      />
    </View>
  )
}
