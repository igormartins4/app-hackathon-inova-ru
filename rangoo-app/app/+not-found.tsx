import { Link, Stack } from 'expo-router'
import { View } from 'react-native'
import { Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'

export default function NotFoundScreen() {
  const { t } = useI18n()

  return (
    <>
      <Stack.Screen options={{ title: t.notFoundTitle }} />
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text className="text-lg font-semibold text-text-primary">{t.notFoundTitle}</Text>
        <Link href="/" className="text-base text-primary">
          {t.notFoundBack}
        </Link>
      </View>
    </>
  )
}
