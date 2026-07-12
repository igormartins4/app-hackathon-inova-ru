import { View, Text, ActivityIndicator } from 'react-native';
import { QrCodeDisplay } from './QrCodeDisplay';

interface PaymentStatusProps {
  qrCode: string;
  amount: number;
  expiration: string;
  isTimedOut: boolean;
}

export function PaymentStatus({ qrCode, amount, expiration, isTimedOut }: PaymentStatusProps) {
  return (
    <View className="gap-6 items-center">
      <QrCodeDisplay qrCode={qrCode} amount={amount} expiration={expiration} />

      {!isTimedOut && (
        <View className="items-center gap-2">
          <ActivityIndicator size="small" color="#059669" />
          <Text className="text-sm text-gray-500">Aguardando pagamento...</Text>
        </View>
      )}

      {isTimedOut && (
        <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" className="text-sm text-red-500">
          Tempo esgotado. O pagamento não foi confirmado.
        </Text>
      )}
    </View>
  );
}
