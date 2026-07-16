import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { Button, ErrorMessage, Text } from '@/shared/components/ui'
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

const PRESET_AMOUNTS = [5, 10, 20, 30, 50]

interface RechargeFormProps {
  currentBalance: number
  limiteRecarga?: number
  disabled?: boolean
  onSubmit: (valor: number) => void
  onAmountChange?: (valor: number) => void
  /** Erro 422 vindo da API ao criar o pagamento — renderizado inline, abaixo do input. */
  serverError?: string | null
}

export function RechargeForm({
  currentBalance,
  limiteRecarga,
  disabled,
  onSubmit,
  onAmountChange,
  serverError,
}: RechargeFormProps) {
  const themeColors = useThemeColors()
  const gradients = useGradientColors()
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
      setAmountError(validationError ?? `Valor mínimo é ${formatCurrency(MIN_VALUE)}.`)
      return
    }
    onSubmit(activeAmount)
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="text-2xl font-bold text-text-primary">Recarregar Saldo</Text>
        <Text className="text-sm text-text-secondary mt-1">
          Escolha o valor e gere um QR Code PIX
        </Text>
      </View>

      <View className="gap-3">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          Selecione o Valor
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
                accessibilityLabel={`Recarregar ${formatCurrency(amount)}`}
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
            placeholder="R$ Outro valor..."
            placeholderTextColor={themeColors.textDisabled}
            keyboardType="numeric"
            editable={!disabled}
            maxLength={MONEY_MAX_LENGTH}
            accessibilityLabel="Valor personalizado de recarga"
            accessibilityHint="Digite um valor entre o mínimo e o limite disponível para recarga"
            style={inputTextStyle}
            className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
          />
          <Text className="text-xs text-text-secondary">
            Mínimo {formatCurrency(MIN_VALUE)} · Máximo {formatCurrency(maxVal)}
          </Text>
        </View>

        {(amountError || validationError) && (
          <ErrorMessage message={amountError || validationError || 'Valor fora do limite.'} />
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
            <Text className="text-sm font-bold text-success">Aprovação em até 2 minutos</Text>
            <Text className="text-xs text-text-secondary mt-1">
              Seus créditos são liberados automaticamente após confirmação do PIX.
            </Text>
          </View>
        </View>
      </LinearGradient>

      <Button label="Gerar QR Code PIX" onPress={handleSubmit} disabled={!isValid || disabled} />
    </View>
  )
}
