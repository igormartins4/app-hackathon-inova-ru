import { View, Text, Pressable } from 'react-native';

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

      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar para tela de recarga"
        className="min-h-[48px] min-w-[48px] items-center justify-center bg-emerald-600 rounded-lg px-8 py-4"
      >
        <Text className="text-white font-bold">Voltar</Text>
      </Pressable>
    </View>
  );
}
