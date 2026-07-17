import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { useThemeColors } from '@/config'
import { ERROR_MESSAGES } from '@/config/errors'
import { useI18n } from '@/shared/i18n'
import { Button } from './Button'
import { ScaledText as Text } from './ScaledText'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

const DEFAULT_ERROR = ERROR_MESSAGES[500]

export function ErrorMessage({ message = DEFAULT_ERROR, onRetry }: ErrorMessageProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()

  return (
    <View className="gap-4 py-2">
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        className="flex-row items-start gap-3 rounded-xl border p-4"
        style={{
          backgroundColor: `${themeColors.error}1a`,
          borderColor: `${themeColors.error}55`,
        }}
      >
        <Ionicons name="alert-circle" size={22} color={themeColors.error} />
        <Text className="flex-1 text-sm font-semibold text-status-error">{message}</Text>
      </View>
      {onRetry ? <Button label={t.retry} onPress={onRetry} variant="secondary" /> : null}
    </View>
  )
}
