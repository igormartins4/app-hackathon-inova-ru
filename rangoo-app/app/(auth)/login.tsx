import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Linking, Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGradientColors, useThemeColors } from '@/config'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBiometricAuth } from '@/features/auth/hooks/useBiometricAuth'
import { Text } from '@/shared/components/ui'

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth()
  const { hasPendingSession, pendingUserName, authenticateWithBiometrics } = useBiometricAuth()
  const gradients = useGradientColors()
  const themeColors = useThemeColors()
  const [biometricError, setBiometricError] = useState('')

  const handleSubmit = async (cpf: string, password: string) => {
    await login(cpf, password)
  }

  const handleBiometricLogin = async () => {
    setBiometricError('')
    const result = await authenticateWithBiometrics()
    if (!result.success) {
      setBiometricError(
        result.reason === 'unavailable'
          ? 'Biometria não configurada neste aparelho.'
          : 'Não foi possível confirmar sua identidade.',
      )
    }
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
              <Text className="text-3xl font-bold text-text-inverse">R</Text>
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

              {hasPendingSession && (
                <View className="gap-2">
                  <Pressable
                    onPress={handleBiometricLogin}
                    accessibilityRole="button"
                    accessibilityLabel="Entrar com biometria"
                    className="flex-row items-center justify-center gap-2 bg-surface-variant border border-outline rounded-xl py-3.5 min-h-[48px]"
                  >
                    <Ionicons name="finger-print" size={20} color={themeColors.primary} />
                    <Text className="text-sm font-semibold text-primary">
                      Entrar com biometria
                      {pendingUserName ? ` (${pendingUserName.split(' ')[0]})` : ''}
                    </Text>
                  </Pressable>
                  {biometricError ? (
                    <Text
                      accessibilityRole="alert"
                      className="text-xs text-status-error text-center"
                    >
                      {biometricError}
                    </Text>
                  ) : null}
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 h-px bg-outline-variant" />
                    <Text className="text-xs text-text-secondary">ou entre com CPF e senha</Text>
                    <View className="flex-1 h-px bg-outline-variant" />
                  </View>
                </View>
              )}

              <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
            </View>
          </View>

          <View className="gap-3 mt-6">
            <Pressable
              onPress={() => Linking.openURL('https://fump.ufmg.br')}
              accessibilityRole="link"
              accessibilityLabel="Cadastre-se na FUMP"
              className="items-center py-2"
            >
              <Text className="text-sm text-primary">
                Não tem cadastro? <Text className="font-bold">Cadastre-se na FUMP</Text>
              </Text>
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL('https://fump.ufmg.br')}
              accessibilityRole="link"
              accessibilityLabel="Esqueceu a senha? Acesse o site da FUMP"
              className="items-center py-2"
            >
              <Text className="text-sm text-text-secondary">
                Esqueceu a senha?{' '}
                <Text className="font-bold text-primary">Acesse o site da FUMP</Text>
              </Text>
            </Pressable>

            <Text className="text-center text-xs text-text-secondary mt-2">
              FUMP · Fundação Universitária Mendes Pimentel
            </Text>

            <Pressable
              onPress={() =>
                Linking.openURL('https://github.com/igormartins4/app-hackathon-inova-ru')
              }
              accessibilityRole="link"
              accessibilityLabel="Sobre o Hackathon InovaRU"
              className="items-center py-2"
            >
              <Text className="text-center text-xs text-text-secondary">
                Hackathon InovaRU 2026/01 · Ver repositório do projeto
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
