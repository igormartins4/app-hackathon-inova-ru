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
  useHistorySummary,
  useMealHistory,
  useRechargeHistory,
} from '@/features/history'
import { Card, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatCurrency } from '@/shared/utils'

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

  const summarizeRecharges = useCallback(
    (records: RechargeRecord[]) => records.reduce((sum, item) => sum + item.valor, 0),
    [],
  )
  const summarizeMeals = useCallback(
    (records: MealRecord[]) =>
      records.filter((item) => !item.gratuidade).reduce((sum, item) => sum + item.valor_total, 0),
    [],
  )
  const rechargeSummary = useHistorySummary({
    query: rechargeQuery,
    reducer: summarizeRecharges,
    enabled: activeTab === 'recargas',
  })
  const mealSummary = useHistorySummary({
    query: mealQuery,
    reducer: summarizeMeals,
    enabled: activeTab === 'refeicoes',
  })
  const summary = activeTab === 'recargas' ? rechargeSummary : mealSummary
  const periodLabel = selectedDays
    ? t.historySummaryPeriodDays.replace('{days}', String(selectedDays))
    : t.historySummaryPeriodAll

  const handleRefresh = useCallback(() => {
    activeQuery.refetch()
  }, [activeQuery])

  const hasActiveFilter = selectedDays !== null || (activeTab === 'refeicoes' && filial !== null)

  const handleClearFilter = useCallback(() => {
    setSelectedDays(null)
    setDateRange({ start: null, end: null })
    setFilial(null)
  }, [])

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-primary z-10 shadow-md mb-3">
        <View>
          <Text className="text-xl font-bold text-white">{t.historicoTitle}</Text>
          <Text className="text-xs text-white/80 mt-0.5">{t.historicoSubtitle}</Text>
        </View>
        <Pressable
          onPress={() => setShowFilter((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={
            hasActiveFilter ? `${t.historicoFiltrarPeriodo} (ativo)` : t.historicoFiltrarPeriodo
          }
          accessibilityState={{ selected: showFilter }}
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/25"
        >
          <Ionicons name="filter" size={18} color="#ffffff" />
          {hasActiveFilter && (
            <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400" />
          )}
        </Pressable>
      </View>

      <View className="flex-row px-4 gap-2 mb-3">
        {(
          [
            {
              key: 'recargas' as const,
              label: t.historicoRecargasTab,
              icon: 'card-outline' as const,
            },
            {
              key: 'refeicoes' as const,
              label: t.historicoRefeicoesTab,
              icon: 'restaurant-outline' as const,
            },
          ] as const
        ).map((tab) => {
          const selected = activeTab === tab.key
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected }}
              className="flex-1 flex-row items-center justify-center gap-2 py-3 min-h-[48px] rounded-xl border"
              style={{
                backgroundColor: selected ? themeColors.primary : themeColors.surface,
                borderColor: selected ? themeColors.primary : themeColors.outline,
              }}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={selected ? themeColors.textInverse : themeColors.textSecondary}
              />
              <Text
                className="text-sm font-bold"
                style={{
                  color: selected ? themeColors.textInverse : themeColors.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          )
        })}
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

      {!showFilter && hasActiveFilter && (
        <View className="flex-row items-center justify-between px-4 mb-2 py-2 bg-primary/10 rounded-xl mx-4">
          <Text className="text-xs font-medium text-primary flex-1" numberOfLines={1}>
            {selectedDays ? t.historyActiveFilterDays.replace('{days}', String(selectedDays)) : ''}
            {selectedDays && filial ? ' · ' : ''}
            {filial ? t.historyActiveFilterRu : ''}
          </Text>
          <Pressable
            onPress={handleClearFilter}
            accessibilityRole="button"
            accessibilityLabel={t.historyClearFilters}
            className="min-h-[48px] justify-center px-2"
          >
            <Text className="text-xs font-bold text-primary">{t.historyClearFilters}</Text>
          </Pressable>
        </View>
      )}

      <View className="px-4 mb-3">
        <Card className="bg-primary/5 border border-primary/20 gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              {activeTab === 'recargas' ? 'Total Recarregado' : 'Total em Refeições'}
            </Text>
            <Text className="text-xs text-text-secondary font-medium">
              {periodLabel}
            </Text>
          </View>
          <View className="flex-row items-baseline justify-between pt-1">
            <Text className="text-2xl font-extrabold text-text-primary">
              {formatCurrency(summary.total)}
            </Text>
            <Text className="text-xs text-text-secondary">
              {activeTab === 'recargas' ? 'Créditos adicionados' : 'Gasto em RUs'}
            </Text>
          </View>
          {!summary.isComplete && (
            <Text className="text-[10px] text-text-secondary">{t.historyLoading}</Text>
          )}
        </Card>
      </View>

      <HistoryList
        data={items}
        type={activeTab === 'recargas' ? 'recharge' : 'meal'}
        isLoading={activeQuery.isLoading}
        isError={activeQuery.isError}
        onRetry={() => activeQuery.refetch()}
        hasActiveFilter={hasActiveFilter}
        onClearFilter={handleClearFilter}
        isFetchingNextPage={activeQuery.isFetchingNextPage}
        hasNextPage={activeQuery.hasNextPage}
        fetchNextPage={activeQuery.fetchNextPage}
        onRefresh={handleRefresh}
        refreshing={activeQuery.isRefetching}
      />
    </View>
  )
}
