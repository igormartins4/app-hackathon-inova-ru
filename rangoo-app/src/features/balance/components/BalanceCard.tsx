import { Ionicons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Card, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatCurrency } from '@/shared/utils'
import { useThemeStore } from '@/store/themeStore'

interface BalanceCardProps {
  creditoDisponivel: number
  limiteRecarga: number
}

export function BalanceCard({ creditoDisponivel, limiteRecarga }: BalanceCardProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const hideSensitiveData = useThemeStore((s) => s.hideSensitiveData)
  const toggleHideSensitiveData = useThemeStore((s) => s.toggleHideSensitiveData)

  return (
    <Card accessibilityLabel="Cartão de saldo" accessibilityRole="summary" className="bg-primary">
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text
            accessibilityLabel={`Saldo disponível: ${hideSensitiveData ? t.hideSensitiveData : formatCurrency(creditoDisponivel)}`}
            accessibilityRole="text"
            className="text-sm font-medium text-text-inverse opacity-80"
          >
            SALDO DISPONÍVEL
          </Text>
          <Pressable
            onPress={toggleHideSensitiveData}
            accessibilityRole="switch"
            accessibilityLabel={hideSensitiveData ? t.showSensitiveData : t.hideSensitiveData}
            accessibilityState={{ checked: hideSensitiveData }}
            hitSlop={8}
            className="p-1"
          >
            <Ionicons
              name={hideSensitiveData ? 'eye-off' : 'eye'}
              size={18}
              color={themeColors.textInverse}
              style={{ opacity: 0.7 }}
            />
          </Pressable>
        </View>
        <Text
          accessibilityLabel={
            hideSensitiveData ? t.hideSensitiveData : formatCurrency(creditoDisponivel)
          }
          accessibilityRole="text"
          className="text-balance font-bold text-text-inverse"
        >
          {hideSensitiveData ? '••••' : formatCurrency(creditoDisponivel)}
        </Text>
        <View className="flex-row gap-4">
          <View className="flex-1 bg-text-inverse/20 rounded-lg p-3">
            <Text className="text-xs text-text-inverse opacity-70">Limite de recarga</Text>
            <Text className="text-sm font-semibold text-text-inverse">
              {hideSensitiveData ? '••••' : formatCurrency(limiteRecarga)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  )
}
