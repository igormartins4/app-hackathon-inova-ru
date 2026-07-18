import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { useI18n } from '@/shared/i18n'
import { RECHARGE_LIMITS } from '@/shared/utils'
import { ScaledText as Text } from './ScaledText'

export const LOW_BALANCE_THRESHOLD = RECHARGE_LIMITS.MIN * 2

export function LowBalanceBanner() {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

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
            hitSlop={8}
            className="self-start mt-1 min-h-[48px] justify-center"
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
          hitSlop={16}
          className="w-12 h-12 -mr-2 -mt-2 items-center justify-center"
        >
          <Ionicons name="close" size={16} color={themeColors.textSecondary} />
        </Pressable>
      </View>
    </View>
  )
}
