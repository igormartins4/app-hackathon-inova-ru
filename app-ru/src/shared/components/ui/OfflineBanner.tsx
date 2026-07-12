import { Text, View } from 'react-native'

interface OfflineBannerProps {
  visible: boolean
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      className="bg-red-600 px-4 py-3"
    >
      <Text className="text-center text-sm font-medium text-white">
        Sem conexão. Verifique sua internet e tente novamente.
      </Text>
    </View>
  )
}
