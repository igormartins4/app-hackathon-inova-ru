import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGradientColors, useThemeColors } from '@/config'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBiometricAuth } from '@/features/auth/hooks/useBiometricAuth'
import { AboutAppModal, AppDialog, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth()
  const { hasPendingSession, pendingUserName, authenticateWithBiometrics } = useBiometricAuth()
  const gradients = useGradientColors()
  const themeColors = useThemeColors()
  const [biometricError, setBiometricError] = useState('')
  const [aboutVisible, setAboutVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(false)
  const { t } = useI18n()

  const handleSubmit = async (cpf: string, password: string) => {
    await login(cpf, password)
  }

  const handleBiometricLogin = async () => {
    setBiometricError('')
    const result = await authenticateWithBiometrics()
    if (!result.success) {
      setBiometricError(
        result.reason === 'unavailable' ? t.loginBiometricUnavailable : t.loginBiometricFailed,
      )
    }
  }

  const handleHelp = () => {
    // Cadastro e "site da FUMP" apontavam pra mesma URL — o app não cria
    // conta própria, então a única ação real pra quem esqueceu a senha ou
    // nunca se cadastrou é ir direto pro site institucional.
    setHelpVisible(true)
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
            <Image
              source={require('../../assets/icon.png')}
              accessibilityLabel={t.loginTitle}
              resizeMode="cover"
              style={{ width: 80, height: 80 }}
              className="rounded-2xl mb-3"
            />
            <Text className="text-2xl font-bold text-primary-dark">{t.loginTitle}</Text>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            position: 'absolute',
            top: '30%',
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <ScrollView contentContainerClassName="px-6" keyboardShouldPersistTaps="handled">
            <View className="bg-surface rounded-2xl p-6 shadow-sm">
              <View className="gap-5">
                <View className="gap-1">
                  <Text className="text-sm text-text-secondary">{t.loginSubtitle}</Text>
                </View>

                {hasPendingSession && (
                  <View className="gap-2">
                    <Pressable
                      onPress={handleBiometricLogin}
                      accessibilityRole="button"
                      accessibilityLabel={t.loginBiometricButton}
                      className="flex-row items-center justify-center gap-2 bg-surface-variant border border-outline rounded-xl py-3.5 min-h-[48px]"
                    >
                      <Ionicons name="finger-print" size={20} color={themeColors.primary} />
                      <Text className="text-sm font-semibold text-primary">
                        {t.loginBiometricButton}
                        {pendingUserName ? ` (${pendingUserName.split(' ')[0]})` : ''}
                      </Text>
                    </Pressable>
                    {biometricError ? (
                      <Text
                        accessibilityRole="alert"
                        accessibilityLiveRegion="assertive"
                        className="text-xs text-status-error text-center"
                      >
                        {biometricError}
                      </Text>
                    ) : null}
                    <View className="flex-row items-center gap-2">
                      <View className="flex-1 h-px bg-outline-variant" />
                      <Text className="text-xs text-text-secondary">{t.loginOrCpf}</Text>
                      <View className="flex-1 h-px bg-outline-variant" />
                    </View>
                  </View>
                )}

                <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
              </View>
            </View>

            <View className="gap-2 mt-6">
              <Pressable
                onPress={handleHelp}
                accessibilityRole="button"
                accessibilityLabel={t.loginHelpA11y}
                className="items-center py-2 min-h-[48px] justify-center"
              >
                <Text className="text-sm font-semibold text-primary">{t.loginHelpTitle}</Text>
              </Pressable>

              <Text className="text-center text-xs text-text-secondary">
                FUMP · Fundação Universitária Mendes Pimentel · {t.loginHackathon}
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <AboutAppModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
      <AppDialog
        visible={helpVisible}
        title={t.loginHelpTitle}
        body={t.loginHelpBody}
        accessibilityLabel={t.loginHelpTitle}
        onClose={() => setHelpVisible(false)}
        actions={[
          {
            label: t.loginFumpLink,
            onPress: () => {
              setHelpVisible(false)
              Linking.openURL('https://fump.ufmg.br')
            },
          },
          {
            label: t.loginHelpAbout,
            onPress: () => {
              setHelpVisible(false)
              setAboutVisible(true)
            },
          },
          { label: t.cancel, style: 'cancel', onPress: () => setHelpVisible(false) },
        ]}
      />
    </SafeAreaView>
  )
}
