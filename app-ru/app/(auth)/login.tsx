import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth()

  const handleSubmit = async (cpf: string, password: string) => {
    await login(cpf, password)
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <View className="flex-1">
        {/* Header with gradient background */}
        <View className="items-center justify-center py-12 bg-primary-container">
          <View className="w-20 h-20 rounded-2xl bg-primary items-center justify-center mb-4">
            <Text className="text-3xl text-text-inverse font-bold">ψq</Text>
          </View>
          <Text className="text-2xl font-bold text-primary">InovaRU</Text>
        </View>

        {/* Form */}
        <View className="flex-1 justify-center px-8">
          <View className="gap-8">
            <View className="gap-2">
              <Text accessibilityLabel="InovaRU" className="text-3xl font-bold text-text-primary">
                Bem-vindo de volta
              </Text>
              <Text className="text-base text-text-secondary">Entre com seus dados da FUMP</Text>
            </View>
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
            <Text className="text-center text-sm text-text-secondary">
              FUMP · Fundação Universitária Mendes Pimentel
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
