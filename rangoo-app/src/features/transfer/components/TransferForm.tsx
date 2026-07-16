import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, ErrorMessage, Text } from '@/shared/components/ui'
import {
  firstFieldError,
  formatCurrency,
  MIN_VALUE,
  MONEY_MAX_LENGTH,
  maskMoneyInput,
  parseMoneyInput,
  sanitizeDigits,
  TRANSFER_DESTINATION_MAX_LENGTH,
  transferSchema,
} from '@/shared/utils'
import { useScaledFontStyle } from '@/store/themeStore'

interface TransferFormProps {
  currentBalance: number
  disabled?: boolean
  loading?: boolean
  onSubmit: (destinatario: string, valor: number) => void
}

export function TransferForm({ currentBalance, disabled, loading, onSubmit }: TransferFormProps) {
  const themeColors = useThemeColors()
  const inputTextStyle = useScaledFontStyle(16)
  const [destinatario, setDestinatario] = useState('')
  const [amount, setAmount] = useState('')
  const [destinatarioError, setDestinatarioError] = useState('')
  const [amountError, setAmountError] = useState('')
  const value = parseMoneyInput(amount)
  const result = transferSchema(currentBalance).safeParse({
    destination: destinatario,
    amount: value,
  })
  const canSubmit = result.success

  function handleDestinationChange(text: string) {
    setDestinatario(sanitizeDigits(text, TRANSFER_DESTINATION_MAX_LENGTH))
    if (destinatarioError) setDestinatarioError('')
  }

  function handleAmountChange(text: string) {
    setAmount(maskMoneyInput(text))
    if (amountError) setAmountError('')
  }

  function handleSubmit() {
    if (disabled || loading) return
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      setDestinatarioError(firstFieldError(errors, 'destination') ?? '')
      setAmountError(firstFieldError(errors, 'amount') ?? '')
      return
    }
    onSubmit(destinatario.trim(), value)
  }

  return (
    <View className="gap-4">
      <View>
        <Text className="text-2xl font-bold text-text-primary">Transferir saldo</Text>
        <Text className="text-sm text-text-secondary mt-1">
          Tranfira seus créditos da conta para outra pessoa.
        </Text>
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          Destinatário
        </Text>
        <TextInput
          value={destinatario}
          onChangeText={handleDestinationChange}
          placeholder="CPF ou matrícula do amigo"
          placeholderTextColor={themeColors.textDisabled}
          keyboardType="numeric"
          editable={!disabled && !loading}
          maxLength={TRANSFER_DESTINATION_MAX_LENGTH}
          accessibilityLabel="Identificador do destinatário"
          accessibilityHint="Informe o CPF ou matrícula da pessoa que receberá o saldo"
          style={inputTextStyle}
          className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
        />
        {destinatarioError ? (
          <Text accessibilityRole="alert" className="text-xs text-status-error">
            {destinatarioError}
          </Text>
        ) : null}
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">Valor</Text>
        <TextInput
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="R$ 5,00"
          placeholderTextColor={themeColors.textDisabled}
          keyboardType="numeric"
          editable={!disabled && !loading}
          maxLength={MONEY_MAX_LENGTH}
          accessibilityLabel="Valor da transferência"
          accessibilityHint={`Informe um valor entre ${formatCurrency(MIN_VALUE)} e ${formatCurrency(currentBalance)}`}
          style={inputTextStyle}
          className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
        />
        <Text className="text-xs text-text-secondary">
          Saldo disponível: {formatCurrency(currentBalance)}
        </Text>
      </View>

      {amountError ? <ErrorMessage message={amountError} /> : null}

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
