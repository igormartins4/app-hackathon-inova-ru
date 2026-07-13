import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { Card } from '@/shared/components/ui'
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

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function RechargeItem({ item }: { item: RechargeRecord }) {
  return (
    <Card
      accessibilityLabel={`Recarga de ${formatCurrency(item.valor)} em ${formatDate(item.data_hora)} — ${item.status}`}
      className="mb-2"
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text accessibilityRole="text" className="text-sm font-medium text-text-primary">
            {formatCurrency(item.valor)}
          </Text>
          <Text accessibilityRole="text" className="text-xs text-text-secondary">
            {formatDate(item.data_hora)} · {item.metodo}
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
  )
}

function MealItem({ item }: { item: MealRecord }) {
  return (
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
            {formatDate(item.data_hora)} · {item.quantidade}x
          </Text>
        </View>
        <Text accessibilityRole="text" className="text-sm font-medium text-text-secondary">
          {item.gratuidade ? 'Gratuita' : formatCurrency(item.valor_total)}
        </Text>
      </View>
    </Card>
  )
}

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
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#006A6A" />
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
      renderItem={({ item }) =>
        type === 'recharge' ? (
          <RechargeItem item={item as RechargeRecord} />
        ) : (
          <MealItem item={item as MealRecord} />
        )
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage?.()
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="#006A6A" />
          </View>
        ) : null
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerClassName="p-4"
    />
  )
}
