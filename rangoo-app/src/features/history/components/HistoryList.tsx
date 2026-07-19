import { Ionicons } from '@expo/vector-icons'
import { memo, useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { AppDialog, Button, Card, FadeInView, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatCurrency, formatToLocalDate, formatToLocalTime } from '@/shared/utils'
import type { MealRecord, RechargeRecord } from '../types/history.types'

interface HistoryListProps {
  data: (RechargeRecord | MealRecord)[]
  type: 'recharge' | 'meal'
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  hasActiveFilter?: boolean
  onClearFilter?: () => void
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
  onRefresh?: () => void
  refreshing?: boolean
}

type SelectedRecord =
  | { type: 'recharge'; item: RechargeRecord }
  | { type: 'meal'; item: MealRecord }

function useTranslations() {
  const { t } = useI18n()
  return t
}

const RechargeItem = memo(function RechargeItem({
  item,
  onPress,
}: {
  item: RechargeRecord
  onPress: () => void
}) {
  const t = useTranslations()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t.historyDetailsRecharge} ${formatCurrency(item.valor)}`}
    >
      <FadeInView>
        <Card
          accessibilityLabel={`${t.historicoRecharges} ${formatCurrency(item.valor)} ${t.historyDate} ${formatToLocalDate(item.data_hora)} — ${item.status}`}
          className="mb-2"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text accessibilityRole="text" className="text-sm font-medium text-text-primary">
                {formatCurrency(item.valor)}
              </Text>
              <Text accessibilityRole="text" className="text-xs text-text-secondary">
                {formatToLocalDate(item.data_hora)} · {item.metodo}
              </Text>
            </View>
            <Text
              accessibilityRole="text"
              className={`text-xs font-medium ${
                item.status === 'aprovado' ? 'text-status-success' : 'text-text-secondary'
              }`}
            >
              {item.status === 'aprovado' ? t.historyApproved : item.status}
            </Text>
          </View>
        </Card>
      </FadeInView>
    </Pressable>
  )
})

const MealItem = memo(function MealItem({
  item,
  onPress,
}: {
  item: MealRecord
  onPress: () => void
}) {
  const t = useTranslations()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t.historyDetailsMeal} ${item.filial.nome}`}
    >
      <FadeInView>
        <Card
          accessibilityLabel={`${t.cardapioRestaurante} ${item.filial.nome} — ${formatCurrency(item.valor_total)}${item.gratuidade ? ` (${t.historyFree})` : ''}`}
          className="mb-2"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text accessibilityRole="text" className="text-sm font-medium text-text-primary">
                {item.filial.nome}
              </Text>
              <Text accessibilityRole="text" className="text-xs text-text-secondary">
                {formatToLocalDate(item.data_hora)} · {item.quantidade}x
              </Text>
            </View>
            <Text accessibilityRole="text" className="text-sm font-medium text-text-secondary">
              {item.gratuidade ? t.historyFree : formatCurrency(item.valor_total)}
            </Text>
          </View>
        </Card>
      </FadeInView>
    </Pressable>
  )
})

export function HistoryList({
  data,
  type,
  isLoading,
  isError,
  onRetry,
  hasActiveFilter,
  onClearFilter,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onRefresh,
  refreshing,
}: HistoryListProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const [selectedRecord, setSelectedRecord] = useState<SelectedRecord | null>(null)

  const renderItem = useCallback(
    ({ item }: { item: RechargeRecord | MealRecord }) =>
      type === 'recharge' ? (
        <RechargeItem
          item={item as RechargeRecord}
          onPress={() => setSelectedRecord({ type: 'recharge', item: item as RechargeRecord })}
        />
      ) : (
        <MealItem
          item={item as MealRecord}
          onPress={() => setSelectedRecord({ type: 'meal', item: item as MealRecord })}
        />
      ),
    [type],
  )

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage?.()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text accessibilityRole="text" className="text-sm text-text-secondary mt-2">
          {t.historyLoading}
        </Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-3 py-12 px-4">
        <Ionicons name="cloud-offline-outline" size={28} color={themeColors.textSecondary} />
        <Text accessibilityRole="alert" className="text-center text-base text-text-secondary">
          {t.historyError}
        </Text>
        {onRetry ? <Button label={t.retry} onPress={onRetry} variant="secondary" /> : null}
      </View>
    )
  }

  if (data.length === 0) {
    const emptyMsg = hasActiveFilter
      ? t.historyEmptyFiltered
      : type === 'recharge'
        ? t.historyEmptyRecharge
        : t.historyEmptyMeal
    return (
      <View className="flex-1 items-center justify-center gap-3 py-12 px-4">
        <Text accessibilityRole="alert" className="text-center text-base text-text-secondary">
          {emptyMsg}
        </Text>
        {hasActiveFilter && onClearFilter ? (
          <Button label={t.historyClearFilters} onPress={onClearFilter} variant="secondary" />
        ) : null}
      </View>
    )
  }

  const detail = selectedRecord ? getDetails(selectedRecord, t) : null

  return (
    <View className="flex-1">
      <FlatList
        data={data}
        keyExtractor={(item) => {
          if (type === 'recharge') return String((item as RechargeRecord).id)
          // A API não retorna id pra refeição (fora do contrato v2.0 mudar
          // isso) — compõe uma chave estável com todos os campos que
          // diferenciam um registro, em vez do índice do array.
          const meal = item as MealRecord
          return `${meal.data_hora}-${meal.filial.codigo}-${meal.tipo_consumidor}-${meal.quantidade}-${meal.valor_total}`
        }}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color={themeColors.primary} />
            </View>
          ) : null
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerClassName="p-4"
      />
      <AppDialog
        visible={selectedRecord !== null}
        title={detail?.title ?? ''}
        body={detail?.body}
        accessibilityLabel={detail?.title ?? ''}
        onClose={() => setSelectedRecord(null)}
        actions={[{ label: t.close, style: 'cancel', onPress: () => setSelectedRecord(null) }]}
      />
    </View>
  )
}

function getDetails(record: SelectedRecord, t: Record<string, string>) {
  if (record.type === 'recharge') {
    const { item } = record
    return {
      title: t.historyDetailsRecharge,
      body: [
        `${t.historyValue}: ${formatCurrency(item.valor)}`,
        `${t.historyDate}: ${formatToLocalDate(item.data_hora)}`,
        `${t.historyTime}: ${formatToLocalTime(item.data_hora)}`,
        `${t.historyMethod}: ${item.metodo.toUpperCase()}`,
        `${t.historyStatus}: ${item.status === 'aprovado' ? t.historyApproved : item.status}`,
        `${t.historyId}: #${item.id}`,
      ].join('\n'),
    }
  }

  const { item } = record
  return {
    title: t.historyDetailsMeal,
    body: [
      `${t.historyRestaurant}: ${item.filial.nome}`,
      `${t.historyDate}: ${formatToLocalDate(item.data_hora)}`,
      `${t.historyTime}: ${formatToLocalTime(item.data_hora)}`,
      `${t.historyQuantity}: ${item.quantidade}x`,
      item.gratuidade
        ? `${t.historyValue}: ${t.historyFree}`
        : `${t.historyValue}: ${formatCurrency(item.valor_total)}`,
      `${t.historyType}: ${item.tipo_consumidor}`,
    ].join('\n'),
  }
}
