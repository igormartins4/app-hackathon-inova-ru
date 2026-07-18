import { Link, Stack } from 'expo-router'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'

export default function NotFoundScreen() {
  const { t } = useI18n()

  return (
    <>
      <Stack.Screen options={{ title: t.notFoundTitle }} />
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-lg font-semibold text-text-primary">{t.notFoundTitle}</Text>
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.notFoundBack}
              className="min-h-[48px] items-center justify-center px-4"
            >
              <Text className="text-base font-semibold text-primary">{t.notFoundBack}</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </>
  )
}
