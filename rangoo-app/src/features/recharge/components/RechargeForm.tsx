import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { Button, ErrorMessage, Text } from '@/shared/components/ui'
import {
  formatCurrency,
  MAX_VALUE,
  MIN_VALUE,
  parseAmount,
  sanitizeCurrencyInput,
  validateRechargeAmount,
} from '@/shared/utils'

const PRESET_AMOUNTS = [5, 10, 20, 30, 50]

interface RechargeFormProps {
  currentBalance: number
  limiteRecarga?: number
  disabled?: boolean
  onSubmit: (valor: number) => void
  /** Erro 422 vindo da API ao criar o pagamento — renderizado inline, abaixo do input. */
  serverError?: string | null
}

export function RechargeForm({
  currentBalance,
  limiteRecarga,
  disabled,
  onSubmit,
  serverError,
}: RechargeFormProps) {
  const themeColors = useThemeColors()
  const gradients = useGradientColors()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')

  const customValue = parseAmount(customAmount)
  const activeAmount = selectedAmount ?? (customValue >= MIN_VALUE ? customValue : 0)
  const maxVal = limiteRecarga ?? MAX_VALUE
  const validation = validateRechargeAmount(activeAmount, currentBalance, limiteRecarga)
  const exceedsLimit = activeAmount > 0 && !validation.valid
  const isValid = activeAmount > 0 && validation.valid

  function handlePreset(value: number) {
    setSelectedAmount(value)
    setCustomAmount('')
  }

  function handleCustomChange(text: string) {
    setCustomAmount(sanitizeCurrencyInput(text))
    setSelectedAmount(null)
  }

  function handleSubmit() {
    if (!isValid || disabled) return
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
            accessibilityLabel="Valor personalizado de recarga"
            className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
          />
          <Text className="text-xs text-text-secondary">
            Mínimo {formatCurrency(MIN_VALUE)} · Máximo {formatCurrency(maxVal)}
          </Text>
        </View>

        {exceedsLimit && <ErrorMessage message={validation.error ?? 'Valor fora do limite.'} />}
        {!exceedsLimit && serverError && <ErrorMessage message={serverError} />}
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
