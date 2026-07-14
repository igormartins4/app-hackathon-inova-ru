import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { Button, ErrorMessage } from '@/shared/components/ui'
import { MAX_VALUE, MIN_VALUE, parseAmount, validateRechargeAmount } from '@/shared/utils'

const PRESET_AMOUNTS = [5, 10, 20, 30, 50]
const RECENT_AMOUNTS = [20, 15, 30]

interface RechargeFormProps {
  currentBalance: number
  disabled?: boolean
  onSubmit: (valor: number) => void
}

export function RechargeForm({ currentBalance, disabled, onSubmit }: RechargeFormProps) {
  const themeColors = useThemeColors()
  const gradients = useGradientColors()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')

  const customValue = parseAmount(customAmount)
  const activeAmount = selectedAmount ?? (customValue >= MIN_VALUE ? customValue : 0)
  const validation = validateRechargeAmount(activeAmount, currentBalance)
  const exceedsLimit = activeAmount > 0 && !validation.valid
  const isValid = activeAmount > 0 && validation.valid

  function handlePreset(value: number) {
    setSelectedAmount(value)
    setCustomAmount('')
  }

  function handleRecent(value: number) {
    setSelectedAmount(value)
    setCustomAmount('')
  }

  function handleCustomChange(text: string) {
    const cleaned = text.replace(/[^0-9.,]/g, '').replace(/([.,]).*?\1/, '$1')
    setCustomAmount(cleaned)
    setSelectedAmount(null)
  }

  function handleSubmit() {
    if (!isValid || disabled) return
    onSubmit(activeAmount)
  }

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

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
            const wouldExceed = currentBalance + amount > MAX_VALUE
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
          <Text className="text-xs text-text-secondary">Mínimo R$ 5,00 · Máximo R$ 500,00</Text>
        </View>

        {exceedsLimit && <ErrorMessage message={validation.error ?? 'Valor fora do limite.'} />}
      </View>

      <View className="gap-3">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          Usados Recentemente
        </Text>
        <View className="flex-row gap-2">
          {RECENT_AMOUNTS.map((amount) => (
            <Pressable
              key={amount}
              onPress={() => handleRecent(amount)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={`Recarregar ${formatCurrency(amount)}`}
              className="flex-row items-center gap-1.5 bg-primary/10 rounded-full px-4 py-2.5 min-h-[44px]"
            >
              <Ionicons name="time-outline" size={16} color={themeColors.primary} />
              <Text className="text-sm font-medium text-primary">{formatCurrency(amount)}</Text>
            </Pressable>
          ))}
        </View>
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
