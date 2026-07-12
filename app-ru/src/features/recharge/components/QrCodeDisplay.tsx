import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

interface QrCodeDisplayProps {
  qrCode: string;
  amount: number;
  expiration: string;
}

function getTimeLeft(expiration: string): string {
  const diff = new Date(expiration).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const min = Math.floor(diff / 60000);
  const sec = Math.floor((diff % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function QrCodeDisplay({ qrCode, amount, expiration }: QrCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiration));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(expiration)), 1000);
    return () => clearInterval(timer);
  }, [expiration]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [qrCode]);

  const formatCurrency = (v: number) =>
    `R$ ${v.toFixed(2).replace('.', ',')}`;

  return (
    <View className="items-center gap-4">
      <Text className="text-lg font-bold">Valor: {formatCurrency(amount)}</Text>

      <View className="bg-white p-4 rounded-xl">
        <QRCode value={qrCode} size={200} />
      </View>

      <Text className="text-sm text-gray-500">
        Expira em: <Text className="font-bold text-amber-600">{timeLeft}</Text>
      </Text>

      <Pressable
        onPress={handleCopy}
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Código copiado' : 'Copiar código PIX'}
        className="min-h-[48px] min-w-[48px] items-center justify-center bg-gray-100 rounded-lg px-6 py-3 w-full"
      >
        <Text className="text-sm font-semibold text-gray-700">
          {copied ? '✓ Código copiado!' : 'Copiar código'}
        </Text>
      </Pressable>
    </View>
  );
}
