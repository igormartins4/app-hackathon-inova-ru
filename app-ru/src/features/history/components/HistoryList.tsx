import { FlatList, Text, View, ActivityIndicator } from 'react-native';
import { Card } from '@/shared/components/ui';

type HistoryItem = {
  id: number;
  data: string;
  valor: number;
  status?: string;
  restaurante?: string;
  filial?: string;
};

interface HistoryListProps {
  data: HistoryItem[];
  type: 'recharge' | 'meal';
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const EMPTY_MESSAGES = {
  recharge: 'Você ainda não fez recargas no período.',
  meal: 'Nenhuma refeição encontrada no período.',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function RechargeItem({ item }: { item: HistoryItem }) {
  return (
    <Card accessibilityLabel={`Recarga de ${formatCurrency(item.valor)} em ${formatDate(item.data)} — ${item.status}`} className="mb-2">
      <View className="flex-row justify-between items-center">
        <View>
          <Text accessibilityRole="text" className="text-sm font-medium text-gray-900">
            {formatCurrency(item.valor)}
          </Text>
          <Text accessibilityRole="text" className="text-xs text-gray-500">
            {formatDate(item.data)}
          </Text>
        </View>
        <Text
          accessibilityRole="text"
          className={`text-xs font-medium ${
            item.status === 'aprovado' ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {item.status}
        </Text>
      </View>
    </Card>
  );
}

function MealItem({ item }: { item: HistoryItem }) {
  return (
    <Card accessibilityLabel={`Refeição em ${item.restaurante} — ${formatCurrency(item.valor)}`} className="mb-2">
      <View className="flex-row justify-between items-center">
        <View>
          <Text accessibilityRole="text" className="text-sm font-medium text-gray-900">
            {item.restaurante}
          </Text>
          <Text accessibilityRole="text" className="text-xs text-gray-500">
            {item.filial} · {formatDate(item.data)}
          </Text>
        </View>
        <Text accessibilityRole="text" className="text-sm font-medium text-gray-700">
          {formatCurrency(item.valor)}
        </Text>
      </View>
    </Card>
  );
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
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text accessibilityRole="text" className="text-sm text-gray-500 mt-2">
          Carregando histórico
        </Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12 px-4">
        <Text accessibilityRole="alert" className="text-center text-base text-gray-500">
          {EMPTY_MESSAGES[type]}
        </Text>
      </View>
    );
  }

  const renderItem = type === 'recharge' ? RechargeItem : MealItem;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage?.();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="#1a73e8" />
          </View>
        ) : null
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerClassName="p-4"
    />
  );
}
