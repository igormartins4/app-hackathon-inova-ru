import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { Button, ErrorMessage, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import {
  firstFieldError,
  formatCurrency,
  MAX_VALUE,
  MIN_VALUE,
  MONEY_MAX_LENGTH,
  maskMoneyInput,
  parseMoneyInput,
  rechargeSchema,
} from '@/shared/utils'
import { useScaledFontStyle } from '@/store/themeStore'

// 4 presets, not 5 — stays within the working-memory limit for a single
// decision point (Miller's Law / cognitive load guidance).
const PRESET_AMOUNTS = [5, 10, 20, 50]

interface RechargeFormProps {
  currentBalance: number
  limiteRecarga?: number
  disabled?: boolean
  isSubmitting?: boolean
  onSubmit: (valor: number) => void
  onAmountChange?: (valor: number) => void
  /** Erro 422 vindo da API ao criar o pagamento — renderizado inline, abaixo do input. */
  serverError?: string | null
}

export function RechargeForm({
  currentBalance,
  limiteRecarga,
  disabled,
  isSubmitting,
  onSubmit,
  onAmountChange,
  serverError,
}: RechargeFormProps) {
  const themeColors = useThemeColors()
  const gradients = useGradientColors()
  const { t } = useI18n()
  const inputTextStyle = useScaledFontStyle(16)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [amountError, setAmountError] = useState('')

  const customValue = parseMoneyInput(customAmount)
  const activeAmount = selectedAmount ?? (customValue >= MIN_VALUE ? customValue : 0)
  const maxVal = limiteRecarga ?? MAX_VALUE
  const validation = rechargeSchema(currentBalance, maxVal).safeParse({ amount: activeAmount })
  const validationError =
    activeAmount > 0 && !validation.success
      ? firstFieldError(validation.error.flatten().fieldErrors, 'amount')
      : undefined
  const isValid = activeAmount > 0 && validation.success

  useEffect(() => {
    onAmountChange?.(activeAmount)
  }, [activeAmount, onAmountChange])

  function handlePreset(value: number) {
    setSelectedAmount(value)
    setCustomAmount('')
    setAmountError('')
  }

  function handleCustomChange(text: string) {
    setCustomAmount(maskMoneyInput(text))
    setSelectedAmount(null)
    if (amountError) setAmountError('')
  }

  function handleSubmit() {
    if (disabled) return
    if (!isValid) {
      setAmountError(
        validationError ?? t.rechargeMinErrorPrefix.replace('{min}', formatCurrency(MIN_VALUE)),
      )
      return
    }
    onSubmit(activeAmount)
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="text-2xl font-bold text-text-primary">{t.rechargeFormTitle}</Text>
        <Text className="text-sm text-text-secondary mt-1">{t.rechargeFormSubtitle}</Text>
      </View>

      <View className="gap-3">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {t.rechargeSelectAmount}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {PRESET_AMOUNTS.map((amount) => {
            const wouldExceed = currentBalance + amount > maxVal
            const isSelected = selectedAmount === amount
            return (
              <Pressable
                key={amount}
                onPress={() => handlePreset(amount)}
                disabled={disabled || wouldExceed}
                accessibilityRole="button"
                accessibilityLabel={t.rechargePresetA11y.replace(
                  '{amount}',
                  formatCurrency(amount),
                )}
                accessibilityState={{
                  selected: isSelected,
                  disabled: disabled || wouldExceed,
                }}
                className={`min-h-[48px] min-w-[48px] items-center justify-center rounded-xl px-5 py-3.5 ${
                  isSelected ? 'bg-primary' : 'bg-surface border border-outline'
                } ${wouldExceed ? 'opacity-40' : ''}`}
                style={{ width: '47%' }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-text-inverse' : 'text-text-primary'
                  }`}
                >
                  {formatCurrency(amount)}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View className="gap-1.5">
          <TextInput
            value={customAmount}
            onChangeText={handleCustomChange}
            placeholder={t.rechargeCustomPlaceholder}
            placeholderTextColor={themeColors.textDisabled}
            keyboardType="numeric"
            editable={!disabled}
            maxLength={MONEY_MAX_LENGTH}
            accessibilityLabel={t.rechargeCustomA11yLabel}
            accessibilityHint={t.rechargeCustomA11yHint}
            style={inputTextStyle}
            className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
          />
          <Text className="text-xs text-text-secondary">
            {t.rechargeMinMax
              .replace('{min}', formatCurrency(MIN_VALUE))
              .replace('{max}', formatCurrency(maxVal))}
          </Text>
        </View>

        {(amountError || validationError) && (
          <ErrorMessage message={amountError || validationError || t.rechargeOutOfLimit} />
        )}
        {!amountError && !validationError && serverError && <ErrorMessage message={serverError} />}
      </View>

      <LinearGradient
        colors={gradients.infoBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 12 }}
      >
        <View className="flex-row items-start gap-3 p-4">
          <Ionicons name="flash" size={22} color={themeColors.warning} />
          <View className="flex-1">
            <Text className="text-sm font-bold text-success">{t.rechargeApprovalTime}</Text>
            <Text className="text-xs text-text-secondary mt-1">{t.rechargeApprovalDetail}</Text>
          </View>
        </View>
      </LinearGradient>

      <Button
        label={t.rechargeGenerateQr}
        onPress={handleSubmit}
        disabled={!isValid || disabled}
        loading={isSubmitting}
      />
    </View>
  )
}
