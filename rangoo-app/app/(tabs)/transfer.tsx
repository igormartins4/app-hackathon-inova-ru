import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import type { BalanceResponse } from '@/features/balance'
import { useBalance, useConsumerStatus } from '@/features/balance'
import {
  createTransfer,
  TransferForm,
  TransferReceipt,
  type TransferResponse,
} from '@/features/transfer'
import { Card, ErrorMessage, LoadingSpinner, Text } from '@/shared/components/ui'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { useI18n } from '@/shared/i18n'
import { formatCurrency, getErrorMessage } from '@/shared/utils'

export default function TransferScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { data: balanceData, isLoading } = useBalance()
  const { isBlocked, isInactive, message: consumerMessage } = useConsumerStatus()
  const { isOffline } = useNetworkStatus()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<TransferResponse | null>(null)

  const currentBalance = balanceData?.saldo.credito_disponivel ?? 0
  const disabled = isBlocked || isInactive || isOffline

  async function handleSubmit(destinatario: string, valor: number) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await createTransfer({ destinatario, valor })
      queryClient.setQueryData<BalanceResponse>(['balance'], (old) =>
        old
          ? { ...old, saldo: { ...old.saldo, credito_disponivel: response.saldo_atualizado } }
          : old,
      )
      setSuccess(response)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingSpinner message={t.balanceLoading} />

  if (success) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerClassName="p-5 gap-4">
        <Card accessibilityRole="summary" accessibilityLabel={t.transferSuccessTitle}>
          <Text className="text-2xl font-bold text-text-primary">{t.transferSuccessTitle}</Text>
          <Text className="text-sm text-text-secondary mt-2">
            {t.transferCurrentBalance.replace(
              '{balance}',
              formatCurrency(success.saldo_atualizado),
            )}
          </Text>
        </Card>
        <TransferReceipt transfer={success} onBack={() => router.push('/(tabs)/home')} />
      </ScrollView>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-background" contentContainerClassName="p-5 gap-4">
        {disabled && (
          <View accessibilityRole="alert" className="bg-status-error/10 rounded-lg p-3">
            <Text className="text-center text-sm text-status-error">
              {isOffline ? t.transferConecteSe : consumerMessage}
            </Text>
          </View>
        )}
        {error ? <ErrorMessage message={error} /> : null}
        <TransferForm
          currentBalance={currentBalance}
          disabled={disabled}
          loading={isSubmitting}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
