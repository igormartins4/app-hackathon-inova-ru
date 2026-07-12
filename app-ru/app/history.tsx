import { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useRechargeHistory, useMealHistory, HistoryList, DateFilter } from '@/features/history';
import { Button } from '@/shared/components/ui';

type Tab = 'recharges' | 'meals';

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('recharges');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });

  const rechargeQuery = useRechargeHistory();
  const mealQuery = useMealHistory();

  const activeQuery = activeTab === 'recharges' ? rechargeQuery : mealQuery;
  const items = activeQuery.data?.pages.flatMap((p) => p.dados) ?? [];

  const handleRefresh = useCallback(() => {
    activeQuery.refetch();
  }, [activeQuery]);

  return (
    <View accessibilityViewIsModal={true} className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Button label="Voltar" onPress={() => router.back()} variant="secondary" />
      </View>

      <View className="flex-row px-4 gap-2 mb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver recargas"
          accessibilityState={{ selected: activeTab === 'recharges' }}
          onPress={() => setActiveTab('recharges')}
          className={`flex-1 rounded-lg py-3 ${activeTab === 'recharges' ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <Text className={`text-center text-sm font-medium ${activeTab === 'recharges' ? 'text-white' : 'text-gray-700'}`}>
            Recargas
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver refeições"
          accessibilityState={{ selected: activeTab === 'meals' }}
          onPress={() => setActiveTab('meals')}
          className={`flex-1 rounded-lg py-3 ${activeTab === 'meals' ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <Text className={`text-center text-sm font-medium ${activeTab === 'meals' ? 'text-white' : 'text-gray-700'}`}>
            Refeições
          </Text>
        </Pressable>
      </View>

      <View className="px-4 mb-2">
        <DateFilter
          onFilter={(start, end) => setDateRange({ start, end })}
        />
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
    </View>
  );
}
