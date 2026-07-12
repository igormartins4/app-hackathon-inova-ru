import { Text, View } from 'react-native';
import { useBalance } from '@/features/balance/hooks/useBalance';
import { useConsumerStatus } from '@/features/balance/hooks/useConsumerStatus';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { BalanceCard } from '@/features/balance/components/BalanceCard';
import { Card, LoadingSpinner, ErrorMessage } from '@/shared/components/ui';

export default function HomeScreen() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useBalance();
  const { isActive, message } = useConsumerStatus();

  if (isLoading) {
    return <LoadingSpinner message="Carregando" />;
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
    <View className="flex-1 bg-gray-50 p-4 gap-4">
      <Card accessibilityLabel="Boas-vindas">
        <Text accessibilityRole="text" className="text-lg font-semibold text-gray-900">
          Olá, {user?.nome?.split(' ')[0] ?? 'Estudante'}
        </Text>
      </Card>

      {message && (
        <Card accessibilityLabel="Alerta de conta" accessibilityRole="alert">
          <Text accessibilityRole="text" className="text-center text-sm text-red-600">
            {message}
          </Text>
        </Card>
      )}

      {data && (
        <BalanceCard
          creditoDisponivel={data.saldo.credito_disponivel}
          limiteRecarga={data.saldo.limite_recarga}
        />
      )}
    </View>
  );
}
