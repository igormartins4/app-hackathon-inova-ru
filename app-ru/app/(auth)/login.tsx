import { Text, View } from 'react-native'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth()

  const handleSubmit = async (cpf: string, password: string) => {
    await login(cpf, password)
    // AuthGate no _layout.tsx detecta isAuthenticated e navega para (tabs)
  }

  return (
    <View className="flex-1 justify-center bg-white px-8">
      <View className="gap-8">
        <View className="items-center gap-2">
          <Text accessibilityLabel="InovaRU" className="text-3xl font-bold text-gray-900">
            InovaRU
          </Text>
          <Text className="text-base text-gray-500">Acesse sua conta para recarregar créditos</Text>
        </View>
        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      </View>
    </View>
  )
}
