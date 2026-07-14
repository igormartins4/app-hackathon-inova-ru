import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { Button, Card, LoadingSpinner } from '@/shared/components/ui'
import { useThemeStore } from '@/store/themeStore'

const FONT_SIZES = [
  { key: 'p' as const, label: 'P' },
  { key: 'm' as const, label: 'M' },
  { key: 'g' as const, label: 'G' },
]

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance()
  const { theme, setTheme, fontSize, setFontSize } = useThemeStore()
  const themeColors = useThemeColors()
  const gradients = useGradientColors()

  const isDark = theme === 'dark'

  const initials =
    user?.nome
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '??'

  const handleToggleDark = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  if (isBalanceLoading) {
    return <LoadingSpinner message="Carregando perfil" />
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 gap-4">
      <Text className="text-2xl font-bold text-text-primary">Perfil</Text>

      <LinearGradient
        colors={gradients.profileCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16 }}
      >
        <View className="flex-row items-center gap-4 p-5">
          <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
            <Text className="text-2xl font-bold text-text-inverse">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-text-primary">{user?.nome ?? 'Estudante'}</Text>
            <Text className="text-sm text-text-secondary mt-0.5">
              {balanceData?.consumidor?.tipo_consumidor?.descricao ?? 'Estudante'}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <View className="w-2 h-2 rounded-full bg-success" />
              <Text className="text-xs font-medium text-success">
                {balanceData?.consumidor?.situacao === 'A' ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Card>
        <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
          Preferências
        </Text>

        <Pressable
          onPress={handleToggleDark}
          accessibilityRole="switch"
          accessibilityLabel="Modo escuro"
          accessibilityState={{ checked: isDark }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-warning/15 items-center justify-center">
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={themeColors.warning} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">Modo escuro</Text>
              <Text className="text-xs text-text-secondary">Segue o sistema por padrão</Text>
            </View>
          </View>
          <View className={`w-12 h-7 rounded-full p-0.5 ${isDark ? 'bg-primary' : 'bg-outline'}`}>
            <View className={`w-6 h-6 rounded-full bg-white shadow ${isDark ? 'ml-5' : 'ml-0'}`} />
          </View>
        </Pressable>

        <View className="py-3">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-sm font-bold text-primary">Aa</Text>
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">Tamanho da fonte</Text>
              <Text className="text-xs text-text-secondary">Override do sistema</Text>
            </View>
          </View>
          <View className="flex-row gap-2 ml-13">
            {FONT_SIZES.map((fs) => (
              <Pressable
                key={fs.key}
                onPress={() => setFontSize(fs.key)}
                accessibilityRole="button"
                accessibilityLabel={`Tamanho ${fs.label}`}
                accessibilityState={{ selected: fontSize === fs.key }}
                className={`w-10 h-10 rounded-lg items-center justify-center ${
                  fontSize === fs.key ? 'bg-primary' : 'bg-surface-variant border border-outline'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    fontSize === fs.key ? 'text-text-inverse' : 'text-text-primary'
                  }`}
                >
                  {fs.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
          Sobre o App
        </Text>

        <View className="gap-0">
          <View className="flex-row items-center justify-between py-3 border-b border-outline-variant">
            <Text className="text-sm text-text-primary">Versão</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-text-secondary">1.0.0</Text>
              <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Política de privacidade"
            className="flex-row items-center justify-between py-3 border-b border-outline-variant"
          >
            <Text className="text-sm text-text-primary">Política de privacidade</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Licença open source"
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-sm text-text-primary">Licença open source (MIT)</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
          </Pressable>
        </View>
      </Card>

      <LinearGradient
        colors={gradients.hackathonBadge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 12 }}
      >
        <View className="flex-row items-center gap-3 p-4">
          <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
            <Text className="text-sm font-bold text-text-inverse">F</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-text-primary">Hackathon InovaRU 2026/01</Text>
            <Text className="text-xs text-text-secondary">
              FUMP - Fundação Universitária Mendes Pimentel
            </Text>
          </View>
        </View>
      </LinearGradient>

      <Button label="Sair" onPress={logout} variant="secondary" />

      <View className="h-4" />
    </ScrollView>
  )
}
