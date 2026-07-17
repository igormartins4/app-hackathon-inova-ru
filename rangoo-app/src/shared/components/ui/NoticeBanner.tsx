import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { useI18n } from '@/shared/i18n'
import { ScaledText as Text } from './ScaledText'

export function NoticeBanner() {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={t.noticeTitle}
      className="mx-4 mb-4 rounded-xl p-3"
      style={{ backgroundColor: `${themeColors.warning}15` }}
    >
      <View className="flex-row items-start gap-3">
        <Ionicons name="information-circle" size={20} color={themeColors.warning} />
        <View className="flex-1 gap-1">
          <Text
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: themeColors.warning }}
          >
            {t.noticeTitle}
          </Text>
          <Text className="text-sm text-text-secondary">{t.noticePixBody}</Text>
          <Text className="text-sm text-text-secondary">{t.noticeCardapioBody}</Text>
        </View>
        <Pressable
          onPress={() => setDismissed(true)}
          accessibilityRole="button"
          accessibilityLabel={t.close}
          hitSlop={16}
          className="mt-0.5"
        >
          <Ionicons name="close" size={16} color={themeColors.textSecondary} />
        </Pressable>
      </View>
    </View>
  )
}
