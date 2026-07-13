import { Text, View } from 'react-native'
import { ERROR_MESSAGES } from '@/config/errors'
import { Button } from './Button'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

const DEFAULT_ERROR = ERROR_MESSAGES[500]

export function ErrorMessage({ message = DEFAULT_ERROR, onRetry }: ErrorMessageProps) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      className="items-center gap-4 py-8"
    >
      <Text className="text-center text-base text-status-error">{message}</Text>
      {onRetry ? <Button label="Tentar novamente" onPress={onRetry} variant="secondary" /> : null}
    </View>
  )
}
