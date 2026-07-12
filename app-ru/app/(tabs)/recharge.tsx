import { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useBalance, useConsumerStatus } from '@/features/balance';
import { RechargeForm } from '@/features/recharge/components/RechargeForm';
import { PaymentStatus } from '@/features/recharge/components/PaymentStatus';
import { PaymentSuccess } from '@/features/recharge/components/PaymentSuccess';
import { PaymentError } from '@/features/recharge/components/PaymentError';
import { createPayment } from '@/features/recharge/services/rechargeApi';
import { usePolling } from '@/features/recharge/hooks/usePolling';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import type { PaymentStatusResponse } from '@/features/recharge/types/recharge.types';

type FlowStep = 'amount' | 'polling' | 'success' | 'error';

export default function RechargeScreen() {
  const queryClient = useQueryClient();
  const { data: balanceData } = useBalance();
  const { isBlocked, isInactive } = useConsumerStatus();
  const { isOffline } = useNetworkStatus();

  const [step, setStep] = useState<FlowStep>('amount');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: number;
    qrCode: string;
    amount: number;
    expiration: string;
  } | null>(null);
  const [errorStatus, setErrorStatus] = useState<PaymentStatusResponse['status'] | 'timeout'>('timeout');
  const [newBalance, setNewBalance] = useState(0);

  const handleApproved = useCallback(async () => {
    const res = await queryClient.refetchQueries({ queryKey: ['balance'] });
    const latest = res.queries[0]?.state.data as { saldo?: { credito_disponivel?: number } } | undefined;
    setNewBalance(latest?.saldo?.credito_disponivel ?? 0);
    setStep('success');
  }, [queryClient]);

  const handleTerminal = useCallback((status: PaymentStatusResponse['status']) => {
    setErrorStatus(status);
    setStep('error');
  }, []);

  const handleTimeout = useCallback(() => {
    setErrorStatus('timeout');
    setStep('error');
  }, []);

  usePolling({
    paymentId: paymentData?.paymentId ?? null,
    onApproved: handleApproved,
    onTerminal: handleTerminal,
    onTimeout: handleTimeout,
  });

  const consumerDisabled = isBlocked || isInactive || isOffline;

  const handleSubmit = useCallback(async (valor: number) => {
    if (isSubmitting) return; // No idempotency — never retry POST
    setIsSubmitting(true);
    try {
      const res = await createPayment({ valor });
      setPaymentData({
        paymentId: res.payment_id,
        qrCode: res.qr_code,
        amount: valor,
        expiration: res.expiration,
      });
      setStep('polling');
    } catch {
      setErrorStatus('timeout');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const handleRetry = useCallback(() => {
    setStep('amount');
    setPaymentData(null);
  }, []);

  const handleBack = useCallback(() => {
    setStep('amount');
    setPaymentData(null);
  }, []);

  const currentBalance = balanceData?.saldo?.credito_disponivel ?? 0;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6 gap-6">
        {step === 'amount' && (
          <>
            {isOffline && (
              <View accessibilityRole="alert" className="bg-red-50 rounded-lg p-3">
                <Text className="text-center text-sm text-red-600">
                  Conecte-se à internet para recarregar
                </Text>
              </View>
            )}
            <RechargeForm
              currentBalance={currentBalance}
              disabled={consumerDisabled || isSubmitting}
              onSubmit={handleSubmit}
            />
          </>
        )}

        {step === 'polling' && paymentData && (
          <PaymentStatus
            qrCode={paymentData.qrCode}
            amount={paymentData.amount}
            expiration={paymentData.expiration}
            isTimedOut={false}
          />
        )}

        {step === 'success' && (
          <PaymentSuccess newBalance={newBalance} onBack={handleBack} />
        )}

        {step === 'error' && (
          <PaymentError status={errorStatus} onRetry={handleRetry} />
        )}
      </View>
    </ScrollView>
  );
}
