import { View, Text, TouchableOpacity } from 'react-native';

interface PaymentSuccessProps {
  newBalance: number;
  onBack: () => void;
}

export function PaymentSuccess({ newBalance, onBack }: PaymentSuccessProps) {
  const formatCurrency = (v: number) =>
    `R$ ${v.toFixed(2).replace('.', ',')}`;

  return (
    <View className="items-center gap-6 py-8">
      <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center">
        <Text className="text-3xl">✓</Text>
      </View>

      <View className="items-center gap-2">
        <Text className="text-xl font-bold text-emerald-700">Pagamento aprovado!</Text>
        <Text className="text-base text-gray-500">
          Novo saldo: <Text className="font-bold">{formatCurrency(newBalance)}</Text>
        </Text>
      </View>

      <TouchableOpacity
        onPress={onBack}
        accessibilityLabel="Voltar para tela de recarga"
        className="bg-emerald-600 rounded-lg px-8 py-4"
      >
        <Text className="text-white font-bold">Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
