import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useI18n } from '@/shared/i18n'
import { RECHARGE_LIMITS } from '@/shared/utils'
import { ScaledText as Text } from './ScaledText'

const LOW_BALANCE_THRESHOLD = RECHARGE_LIMITS.MIN * 2

export function LowBalanceBanner() {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const { data } = useBalance()
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  const saldo = data?.saldo?.credito_disponivel ?? 0
  if (dismissed || saldo >= LOW_BALANCE_THRESHOLD) return null

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={t.lowBalanceTitle}
      className="mx-4 mb-4 rounded-xl p-3"
      style={{ backgroundColor: `${themeColors.warning}15` }}
    >
      <View className="flex-row items-start gap-3">
        <Ionicons name="warning" size={20} color={themeColors.warning} style={{ marginTop: 2 }} />
        <View className="flex-1 gap-1">
          <Text
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: themeColors.warning }}
          >
            {t.lowBalanceTitle}
          </Text>
          <Text className="text-sm text-text-secondary">{t.lowBalanceBody}</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/recharge')}
            accessibilityRole="button"
            accessibilityLabel={t.homeRechargeButton}
            className="self-start mt-1"
          >
            <Text className="text-sm font-bold" style={{ color: themeColors.warning }}>
              {t.homeRechargeButton}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => setDismissed(true)}
          accessibilityRole="button"
          accessibilityLabel={t.close}
          hitSlop={8}
          className="mt-0.5"
        >
          <Ionicons name="close" size={16} color={themeColors.textSecondary} />
        </Pressable>
      </View>
    </View>
  )
}
