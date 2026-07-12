import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useState, useCallback } from 'react';
import { useBalance } from '@/features/balance/hooks/useBalance';
import { BalanceCard } from '@/features/balance/components/BalanceCard';
import { Card, ErrorMessage, LoadingSpinner } from '@/shared/components/ui';

export default function BalanceScreen() {
  const { data, isLoading, isError, error, refetch, isFetching, isStale } = useBalance();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return <LoadingSpinner message="Carregando saldo" />;
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 px-4 pt-8">
        <ErrorMessage
          message={error?.userMessage ?? 'Ocorreu um erro. Tente novamente em instantes.'}
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 gap-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {isStale && (
        <Card accessibilityLabel="Aviso de dados aproximados">
          <Text accessibilityRole="text" className="text-center text-xs text-amber-600">
            Dados aproximados
          </Text>
        </Card>
      )}
      {data && (
        <BalanceCard
          creditoDisponivel={data.saldo.credito_disponivel}
          limiteRecarga={data.saldo.limite_recarga}
        />
      )}
    </ScrollView>
  );
}
