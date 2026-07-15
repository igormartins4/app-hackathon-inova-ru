import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, ErrorMessage, Text } from '@/shared/components/ui'
import {
  formatCurrency,
  MIN_VALUE,
  parseAmount,
  sanitizeCurrencyInput,
  validateRechargeAmount,
} from '@/shared/utils'

interface TransferFormProps {
  currentBalance: number
  disabled?: boolean
  loading?: boolean
  onSubmit: (destinatario: string, valor: number) => void
}

export function TransferForm({ currentBalance, disabled, loading, onSubmit }: TransferFormProps) {
  const themeColors = useThemeColors()
  const [destinatario, setDestinatario] = useState('')
  const [amount, setAmount] = useState('')
  const value = parseAmount(amount)
  const validation = validateRechargeAmount(value, 0, currentBalance)
  const canSubmit = destinatario.trim().length >= 3 && value >= MIN_VALUE && validation.valid

  function handleSubmit() {
    if (!canSubmit || disabled || loading) return
    onSubmit(destinatario.trim(), value)
  }

  return (
    <View className="gap-4">
      <View>
        <Text className="text-2xl font-bold text-text-primary">Transferir saldo</Text>
        <Text className="text-sm text-text-secondary mt-1">
          Demonstração bônus para ajudar outro estudante na hora da refeição.
        </Text>
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          Destinatário
        </Text>
        <TextInput
          value={destinatario}
          onChangeText={setDestinatario}
          placeholder="CPF ou matrícula do amigo"
          placeholderTextColor={themeColors.textDisabled}
          keyboardType="numeric"
          editable={!disabled && !loading}
          accessibilityLabel="Identificador do destinatário"
          accessibilityHint="Informe o CPF ou matrícula da pessoa que receberá o saldo"
          className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">Valor</Text>
        <TextInput
          value={amount}
          onChangeText={(text) => setAmount(sanitizeCurrencyInput(text))}
          placeholder="R$ 5,00"
          placeholderTextColor={themeColors.textDisabled}
          keyboardType="numeric"
          editable={!disabled && !loading}
          accessibilityLabel="Valor da transferência"
          accessibilityHint={`Informe um valor entre ${formatCurrency(MIN_VALUE)} e ${formatCurrency(currentBalance)}`}
          className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
        />
        <Text className="text-xs text-text-secondary">
          Saldo disponível: {formatCurrency(currentBalance)}
        </Text>
      </View>

      {value > 0 && !validation.valid ? (
        <ErrorMessage message={validation.error ?? 'Valor fora do saldo disponível.'} />
      ) : null}

      <View className="flex-row items-start gap-3 bg-surface-variant rounded-xl p-4">
        <Ionicons name="flask" size={20} color={themeColors.primary} />
        <Text className="flex-1 text-xs text-text-secondary">
          Esta tela é mockada e não faz parte da API FUMP v2.0 assinada.
        </Text>
      </View>

      <Button
        label="Transferir saldo"
        onPress={handleSubmit}
        disabled={!canSubmit || disabled || loading}
        loading={loading}
      />
    </View>
  )
}
