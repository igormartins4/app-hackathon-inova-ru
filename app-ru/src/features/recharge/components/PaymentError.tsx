import { View, Text, TouchableOpacity } from 'react-native';
import type { PaymentStatusResponse } from '../types/recharge.types';

const ERROR_MESSAGES: Record<string, string> = {
  rejected: 'Pagamento não autorizado.',
  cancelled: 'Pagamento cancelado.',
  expired: 'Código PIX expirado.',
  timeout: 'Tempo esgotado.',
};

interface PaymentErrorProps {
  status: PaymentStatusResponse['status'] | 'timeout';
  onRetry: () => void;
}

export function PaymentError({ status, onRetry }: PaymentErrorProps) {
  return (
    <View className="items-center gap-6 py-8">
      <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center">
        <Text className="text-3xl">✕</Text>
      </View>

      <Text className="text-xl font-bold text-red-700">
        {ERROR_MESSAGES[status] ?? 'Ocorreu um erro.'}
      </Text>

      <TouchableOpacity
        onPress={onRetry}
        accessibilityLabel="Tentar novamente"
        className="bg-emerald-600 rounded-lg px-8 py-4"
      >
        <Text className="text-white font-bold">Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
