import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useI18n } from '@/shared/i18n'
import { ScaledText as Text } from './ScaledText'

interface OfflineBannerProps {
  visible: boolean
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  const insets = useSafeAreaInsets()
  const { t } = useI18n()

  if (!visible) return null

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={{ paddingTop: insets.top + 12 }}
      className="bg-status-error px-4 pb-3"
    >
      <Text className="text-center text-sm font-medium text-text-inverse">
        {t.offlineBannerMessage}
      </Text>
    </View>
  )
}
