import { memo, useCallback } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Card } from '@/shared/components/ui'
import { formatCurrency, formatToLocalDate, formatToLocalTime } from '@/shared/utils'
import type { MealRecord, RechargeRecord } from '../types/history.types'

interface HistoryListProps {
  data: (RechargeRecord | MealRecord)[]
  type: 'recharge' | 'meal'
  isLoading?: boolean
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
  onRefresh?: () => void
  refreshing?: boolean
}

const EMPTY_MESSAGES = {
  recharge: 'Você ainda não fez recargas no período.',
  meal: 'Nenhuma refeição encontrada no período.',
}

function showRechargeDetails(item: RechargeRecord) {
  Alert.alert(
    'Detalhes da Recarga',
    [
      `Valor: ${formatCurrency(item.valor)}`,
      `Data: ${formatToLocalDate(item.data_hora)}`,
      `Horário: ${formatToLocalTime(item.data_hora)}`,
      `Método: ${item.metodo.toUpperCase()}`,
      `Status: ${item.status === 'aprovado' ? 'Aprovado' : item.status}`,
      `ID: #${item.id}`,
    ].join('\n'),
  )
}

function showMealDetails(item: MealRecord) {
  Alert.alert(
    'Detalhes da Refeição',
    [
      `Restaurante: ${item.filial.nome}`,
      `Data: ${formatToLocalDate(item.data_hora)}`,
      `Horário: ${formatToLocalTime(item.data_hora)}`,
      `Quantidade: ${item.quantidade}x`,
      item.gratuidade ? `Valor: Gratuita` : `Valor: ${formatCurrency(item.valor_total)}`,
      `Tipo: ${item.tipo_consumidor}`,
    ].join('\n'),
  )
}

const RechargeItem = memo(function RechargeItem({
  item,
  onPress,
}: {
  item: RechargeRecord
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Detalhes da recarga de ${formatCurrency(item.valor)}`}
    >
      <Card
        accessibilityLabel={`Recarga de ${formatCurrency(item.valor)} em ${formatToLocalDate(item.data_hora)} — ${item.status}`}
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
            {item.status}
          </Text>
        </View>
      </Card>
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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Detalhes da refeição em ${item.filial.nome}`}
    >
      <Card
        accessibilityLabel={`Refeição em ${item.filial.nome} — ${formatCurrency(item.valor_total)}${item.gratuidade ? ' (gratuita)' : ''}`}
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
            {item.gratuidade ? 'Gratuita' : formatCurrency(item.valor_total)}
          </Text>
        </View>
      </Card>
    </Pressable>
  )
})

export function HistoryList({
  data,
  type,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onRefresh,
  refreshing,
}: HistoryListProps) {
  const themeColors = useThemeColors()

  const renderItem = useCallback(
    ({ item }: { item: RechargeRecord | MealRecord }) =>
      type === 'recharge' ? (
        <RechargeItem
          item={item as RechargeRecord}
          onPress={() => showRechargeDetails(item as RechargeRecord)}
        />
      ) : (
        <MealItem item={item as MealRecord} onPress={() => showMealDetails(item as MealRecord)} />
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
          Carregando histórico
        </Text>
      </View>
    )
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12 px-4">
        <Text accessibilityRole="alert" className="text-center text-base text-text-secondary">
          {EMPTY_MESSAGES[type]}
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
