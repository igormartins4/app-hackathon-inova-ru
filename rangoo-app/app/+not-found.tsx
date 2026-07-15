import { Link, Stack } from 'expo-router'
import { View } from 'react-native'
import { Text } from '@/shared/components/ui'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text className="text-lg font-semibold text-text-primary">Página não encontrada</Text>
        <Link href="/" className="text-base text-primary">
          Voltar ao início
        </Link>
      </View>
    </>
  )
}
