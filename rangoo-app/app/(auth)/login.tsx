import { LinearGradient } from 'expo-linear-gradient'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGradientColors } from '@/config'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth()
  const gradients = useGradientColors()

  const handleSubmit = async (cpf: string, password: string) => {
    await login(cpf, password)
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-1">
        <LinearGradient
          colors={gradients.loginHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <View className="items-center justify-center pt-12 pb-20">
            <View className="w-20 h-20 rounded-2xl bg-primary items-center justify-center mb-3 shadow-lg">
              <Text className="text-3xl font-bold text-text-inverse">ψq</Text>
            </View>
            <Text className="text-2xl font-bold text-primary-dark">Rangoo</Text>
          </View>
        </LinearGradient>

        <View
          style={{
            position: 'absolute',
            top: '30%',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 24,
          }}
        >
          <View className="bg-surface rounded-2xl p-6 shadow-lg">
            <View className="gap-5">
              <View className="gap-1">
                <Text accessibilityLabel="Rangoo" className="text-2xl font-bold text-text-primary">
                  Bem-vindo de volta
                </Text>
                <Text className="text-sm text-text-secondary">Entre com seus dados da FUMP</Text>
              </View>
              <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
            </View>
          </View>

          <Text className="text-center text-xs text-text-secondary mt-6">
            FUMP · Fundação Universitária Mendes Pimentel
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
