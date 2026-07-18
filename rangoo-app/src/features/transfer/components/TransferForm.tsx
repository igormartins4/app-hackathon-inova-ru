import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { useThemeColors } from '@/config'
import { AppDialog, Button, ErrorMessage, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
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
  const { t } = useI18n()
  const inputTextStyle = useScaledFontStyle(16)
  const [destinatario, setDestinatario] = useState('')
  const [amount, setAmount] = useState('')
  const [destinatarioError, setDestinatarioError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false)
  const value = parseMoneyInput(amount)
  const result = transferSchema(currentBalance).safeParse({
    destination: destinatario,
    amount: value,
  })
  const canSubmit = result.success
  const projectedBalance = Math.max(0, currentBalance - value)

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

    setConfirmDialogVisible(true)
  }

  return (
    <View className="gap-4">
      <View>
        <Text className="text-2xl font-bold text-text-primary">{t.transferTitle}</Text>
        <Text className="text-sm text-text-secondary mt-1">{t.transferSubtitle}</Text>
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {t.transferRecipientLabel}
        </Text>
        <TextInput
          value={destinatario}
          onChangeText={handleDestinationChange}
          placeholder={t.transferRecipientPlaceholder}
          placeholderTextColor={themeColors.textDisabled}
          keyboardType="numeric"
          editable={!disabled && !loading}
          maxLength={TRANSFER_DESTINATION_MAX_LENGTH}
          accessibilityLabel={t.transferRecipientLabel}
          accessibilityHint={t.transferRecipientA11yHint}
          style={inputTextStyle}
          className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
        />
        {destinatarioError ? (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            className="text-xs text-status-error"
          >
            {destinatarioError}
          </Text>
        ) : null}
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {t.transferAmountLabel}
        </Text>
        <TextInput
          value={amount}
          onChangeText={handleAmountChange}
          placeholder={t.transferAmountPlaceholder}
          placeholderTextColor={themeColors.textDisabled}
          keyboardType="numeric"
          editable={!disabled && !loading}
          maxLength={MONEY_MAX_LENGTH}
          accessibilityLabel={t.transferAmountLabel}
          accessibilityHint={t.transferAmountA11yHint
            .replace('{min}', formatCurrency(MIN_VALUE))
            .replace('{max}', formatCurrency(currentBalance))}
          style={inputTextStyle}
          className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
        />
        <View accessibilityRole="text" className="gap-1">
          <Text className="text-xs text-text-secondary">
            {t.transferCurrentBalance.replace('{balance}', formatCurrency(currentBalance))}
          </Text>
          <Text className="text-xs text-text-secondary">
            {t.transferMinimum.replace('{amount}', formatCurrency(MIN_VALUE))}
          </Text>
          <Text className="text-xs text-text-secondary">
            {t.transferMaximum.replace('{amount}', formatCurrency(currentBalance))}
          </Text>
          <Text className="text-xs text-text-secondary">
            {t.transferProjectedBalance.replace('{balance}', formatCurrency(projectedBalance))}
          </Text>
        </View>
      </View>

      {amountError ? <ErrorMessage message={amountError} /> : null}

      <View className="flex-row items-start gap-3 bg-surface-variant rounded-xl p-4">
        <Ionicons name="flask" size={20} color={themeColors.primary} />
        <Text className="flex-1 text-xs text-text-secondary">{t.transferMockNotice}</Text>
      </View>

      <Button
        label={t.transferButton}
        onPress={handleSubmit}
        disabled={!canSubmit || disabled || loading}
        loading={loading}
      />
      <AppDialog
        visible={confirmDialogVisible}
        title={t.transferConfirmTitle}
        body={t.transferConfirmBody
          .replace('{amount}', formatCurrency(value))
          .replace('{recipient}', destinatario.trim())}
        accessibilityLabel={t.transferConfirmTitle}
        onClose={() => setConfirmDialogVisible(false)}
        actions={[
          {
            label: t.transferConfirmBack,
            style: 'cancel',
            onPress: () => setConfirmDialogVisible(false),
          },
          {
            label: t.transferConfirmSend,
            onPress: () => {
              setConfirmDialogVisible(false)
              onSubmit(destinatario.trim(), value)
            },
          },
        ]}
      />
    </View>
  )
}
