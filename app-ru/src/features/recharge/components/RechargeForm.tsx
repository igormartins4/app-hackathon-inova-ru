import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

const PRESET_AMOUNTS = [10, 20, 30, 50, 100, 200]
const MIN_VALUE = 5
const MAX_VALUE = 500

interface RechargeFormProps {
  currentBalance: number
  disabled?: boolean
  onSubmit: (valor: number) => void
}

export function RechargeForm({ currentBalance, disabled, onSubmit }: RechargeFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')

  const customValue = Number(customAmount.replace(',', '.'))
  const activeAmount = selectedAmount ?? (customValue >= MIN_VALUE ? customValue : 0)
  const exceedsLimit = currentBalance + activeAmount > MAX_VALUE
  const isValid = activeAmount >= MIN_VALUE && activeAmount <= MAX_VALUE && !exceedsLimit

  function handlePreset(value: number) {
    setSelectedAmount(value)
    setCustomAmount('')
  }

  function handleCustomChange(text: string) {
    // Allow only digits and one comma/dot
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
    <View className="gap-4">
      <Text className="text-sm text-gray-500">Saldo atual: {formatCurrency(currentBalance)}</Text>

      <View className="flex-row flex-wrap gap-2">
        {PRESET_AMOUNTS.map((amount) => {
          const wouldExceed = currentBalance + amount > MAX_VALUE
          return (
            <Pressable
              key={amount}
              onPress={() => handlePreset(amount)}
              disabled={disabled || wouldExceed}
              accessibilityRole="button"
              accessibilityLabel={`Recarregar ${formatCurrency(amount)}`}
              accessibilityState={{
                selected: selectedAmount === amount,
                disabled: disabled || wouldExceed,
              }}
              className={`min-h-[48px] min-w-[48px] items-center justify-center rounded-lg px-4 py-3 ${
                selectedAmount === amount ? 'bg-emerald-600' : 'bg-gray-100'
              } ${wouldExceed ? 'opacity-40' : ''}`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedAmount === amount ? 'text-white' : 'text-gray-700'
                }`}
              >
                {formatCurrency(amount)}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View>
        <Text className="text-sm text-gray-500 mb-1">Outro valor:</Text>
        <TextInput
          value={customAmount}
          onChangeText={handleCustomChange}
          placeholder="Ex: 25,00"
          keyboardType="numeric"
          editable={!disabled}
          accessibilityLabel="Valor personalizado de recarga"
          className="border border-gray-300 rounded-lg px-4 py-3 text-base"
        />
      </View>

      {exceedsLimit && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          className="text-sm text-red-500"
        >
          Valor fora do limite. Máximo R$ 500,00 (limite restante:{' '}
          {formatCurrency(MAX_VALUE - currentBalance)}).
        </Text>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={!isValid || disabled}
        accessibilityRole="button"
        accessibilityLabel={`Pagar com PIX${activeAmount > 0 ? ` — ${formatCurrency(activeAmount)}` : ''}`}
        accessibilityState={{ disabled: !isValid || disabled }}
        className={`min-h-[48px] items-center justify-center rounded-lg py-4 ${
          isValid && !disabled ? 'bg-emerald-600' : 'bg-gray-300'
        }`}
      >
        <Text
          className={`text-base font-bold ${isValid && !disabled ? 'text-white' : 'text-gray-500'}`}
        >
          Pagar com PIX — {activeAmount > 0 ? formatCurrency(activeAmount) : '—'}
        </Text>
      </Pressable>
    </View>
  )
}
