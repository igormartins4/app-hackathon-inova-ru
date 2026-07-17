import { Ionicons } from '@expo/vector-icons'
import { memo, useCallback } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, Card, FadeInView, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatCurrency, formatToLocalDate, formatToLocalTime } from '@/shared/utils'
import type { MealRecord, RechargeRecord } from '../types/history.types'

interface HistoryListProps {
  data: (RechargeRecord | MealRecord)[]
  type: 'recharge' | 'meal'
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
  onRefresh?: () => void
  refreshing?: boolean
}

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
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onRefresh,
  refreshing,
}: HistoryListProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()

  const renderItem = useCallback(
    ({ item }: { item: RechargeRecord | MealRecord }) =>
      type === 'recharge' ? (
        <RechargeItem
          item={item as RechargeRecord}
          onPress={() => showRechargeDetails(item as RechargeRecord, t)}
        />
      ) : (
        <MealItem
          item={item as MealRecord}
          onPress={() => showMealDetails(item as MealRecord, t)}
        />
      ),
    [type, t],
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
    const emptyMsg = type === 'recharge' ? t.historyEmptyRecharge : t.historyEmptyMeal
    return (
      <View className="flex-1 items-center justify-center py-12 px-4">
        <Text accessibilityRole="alert" className="text-center text-base text-text-secondary">
          {emptyMsg}
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) =>
        type === 'recharge' ? String((item as RechargeRecord).id) : `${item.data_hora}-${index}`
      }
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
  )
}

function showRechargeDetails(item: RechargeRecord, t: Record<string, string>) {
  Alert.alert(
    t.historyDetailsRecharge,
    [
      `${t.historyDate}: ${formatCurrency(item.valor)}`,
      `${t.historyDate}: ${formatToLocalDate(item.data_hora)}`,
      `${t.historyTime}: ${formatToLocalTime(item.data_hora)}`,
      `${t.historyMethod}: ${item.metodo.toUpperCase()}`,
      `${t.historyStatus}: ${item.status === 'aprovado' ? t.historyApproved : item.status}`,
      `${t.historyId}: #${item.id}`,
    ].join('\n'),
  )
}

function showMealDetails(item: MealRecord, t: Record<string, string>) {
  Alert.alert(
    t.historyDetailsMeal,
    [
      `${t.historyRestaurant}: ${item.filial.nome}`,
      `${t.historyDate}: ${formatToLocalDate(item.data_hora)}`,
      `${t.historyTime}: ${formatToLocalTime(item.data_hora)}`,
      `${t.historyQuantity}: ${item.quantidade}x`,
      item.gratuidade
        ? `${t.historyDate}: ${t.historyFree}`
        : `${t.historyDate}: ${formatCurrency(item.valor_total)}`,
      `${t.historyType}: ${item.tipo_consumidor}`,
    ].join('\n'),
  )
}
