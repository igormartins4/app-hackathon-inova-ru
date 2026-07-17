import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import {
  DateFilter,
  FilialFilter,
  HistoryList,
  type MealRecord,
  type RechargeRecord,
  useMealHistory,
  useRechargeHistory,
} from '@/features/history'
import { Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'

type Tab = 'recargas' | 'refeicoes'

export default function HistoricoScreen() {
  const params = useLocalSearchParams<{ tab?: string }>()
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>(
    params.tab === 'refeicoes' ? 'refeicoes' : 'recargas',
  )
  const [showFilter, setShowFilter] = useState(false)
  const [selectedDays, setSelectedDays] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })
  const [filial, setFilial] = useState<string | null>(null)

  useEffect(() => {
    if (params.tab === 'refeicoes') setActiveTab('refeicoes')
    else if (params.tab === 'recargas') setActiveTab('recargas')
  }, [params.tab])

  const dateParams = useMemo(
    () => ({
      dataInicio: dateRange.start ?? undefined,
      dataFim: dateRange.end ?? undefined,
    }),
    [dateRange.start, dateRange.end],
  )

  const rechargeQuery = useRechargeHistory(dateParams, { enabled: activeTab === 'recargas' })
  const mealQuery = useMealHistory(
    { ...dateParams, filial: filial ?? undefined },
    { enabled: activeTab === 'refeicoes' },
  )

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
          <Text className="text-2xl font-bold text-text-primary">{t.historicoTitle}</Text>
          <Text className="text-xs text-text-secondary mt-0.5">{t.historicoSubtitle}</Text>
        </View>
        <Pressable
          onPress={() => setShowFilter((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={t.historicoFiltrarPeriodo}
          accessibilityState={{ selected: showFilter }}
          className="w-12 h-12 rounded-full bg-surface items-center justify-center"
        >
          <Ionicons name="filter" size={20} color={themeColors.primary} />
        </Pressable>
      </View>

      <View className="flex-row px-4 gap-1 mb-2">
        {(
          [
            { key: 'recargas' as const, label: t.historicoRecargasTab },
            { key: 'refeicoes' as const, label: t.historicoRefeicoesTab },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: activeTab === tab.key }}
            className={`flex-1 items-center py-3 min-h-[48px] ${
              activeTab === tab.key ? 'border-b-2 border-primary' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab.key ? 'text-primary font-bold' : 'text-text-secondary'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {showFilter && (
        <View className="px-4 mb-2 gap-2">
          <DateFilter
            selected={selectedDays}
            onFilter={(days, start, end) => {
              setSelectedDays(days)
              setDateRange({ start, end })
            }}
          />
          {activeTab === 'refeicoes' && <FilialFilter selected={filial} onFilter={setFilial} />}
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
