import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useMealHistory } from '@/features/history'
import { Button, Card, LoadingSpinner } from '@/shared/components/ui'
import { formatCurrency } from '@/shared/utils'
import { useResolvedTheme, useThemeStore } from '@/store/themeStore'

const FONT_SIZES = [
  { key: 'p' as const, label: 'P' },
  { key: 'm' as const, label: 'M' },
  { key: 'g' as const, label: 'G' },
]

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance()
  const { data: mealHistory } = useMealHistory()
  const { setTheme, fontSize, setFontSize } = useThemeStore()
  const themeColors = useThemeColors()
  const gradients = useGradientColors()

  const isDark = useResolvedTheme() === 'dark'

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

  const totalGastoMes = (() => {
    if (!mealHistory?.pages) return 0
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    return mealHistory.pages
      .flatMap((p) => p.data)
      .filter((item) => {
        const d = new Date(item.data_hora)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && !item.gratuidade
      })
      .reduce((sum, item) => sum + item.valor_total, 0)
  })()

  if (isBalanceLoading) {
    return <LoadingSpinner message="Carregando perfil" />
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 gap-4">
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
            <Text className="text-sm text-text-secondary mt-0.5">{user?.email ?? ''}</Text>
            <Text className="text-xs text-text-secondary mt-0.5">
              {balanceData?.consumidor?.tipo_consumidor?.descricao ?? 'Estudante'} ·{' '}
              {balanceData?.consumidor?.centro_custo?.descricao ?? ''}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <View
                className={`w-2 h-2 rounded-full ${balanceData?.consumidor?.situacao === 'A' ? 'bg-success' : 'bg-status-error'}`}
              />
              <Text
                className={`text-xs font-bold uppercase ${balanceData?.consumidor?.situacao === 'A' ? 'text-success' : 'text-status-error'}`}
              >
                {balanceData?.consumidor?.situacao === 'A'
                  ? 'ATIVO'
                  : balanceData?.consumidor?.situacao === 'B'
                    ? 'BLOQUEADO'
                    : 'INATIVO'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {totalGastoMes > 0 && (
        <Card>
          <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
            Gastos do Mês
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-text-secondary">Total em refeições</Text>
            <Text className="text-lg font-bold text-text-primary">
              {formatCurrency(totalGastoMes)}
            </Text>
          </View>
        </Card>
      )}

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
            <View
              className={`w-6 h-6 rounded-full bg-text-inverse shadow ${isDark ? 'ml-5' : 'ml-0'}`}
            />
          </View>
        </Pressable>

        <View className="py-3">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-sm font-bold text-primary">Aa</Text>
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">Tamanho da fonte</Text>
              <Text className="text-xs text-text-secondary">
                {fontSize === 'p' ? 'Pequena' : fontSize === 'm' ? 'Média' : 'Grande'}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2 ml-[52px]">
            {FONT_SIZES.map((fs) => (
              <Pressable
                key={fs.key}
                onPress={() => setFontSize(fs.key)}
                accessibilityRole="button"
                accessibilityLabel={`Tamanho ${fs.label}`}
                accessibilityState={{ selected: fontSize === fs.key }}
                className={`w-12 h-12 rounded-lg items-center justify-center ${
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
            <Text className="text-sm text-text-secondary">1.0.0</Text>
          </View>

          <Pressable
            onPress={() => Linking.openURL('https://fump.ufmg.br')}
            accessibilityRole="link"
            accessibilityLabel="Política de privacidade"
            className="flex-row items-center justify-between py-3 border-b border-outline-variant"
          >
            <Text className="text-sm text-primary">Política de privacidade</Text>
            <Ionicons name="open-outline" size={16} color={themeColors.primary} />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL('https://opensource.org/licenses/MIT')}
            accessibilityRole="link"
            accessibilityLabel="Licença open source"
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-sm text-primary">Licença open source (MIT)</Text>
            <Ionicons name="open-outline" size={16} color={themeColors.primary} />
          </Pressable>
        </View>
      </Card>

      <Pressable
        onPress={() => Linking.openURL('https://github.com/seu-usuario/rangoo-app')}
        accessibilityRole="link"
        accessibilityLabel="Ver repositório no GitHub"
      >
        <LinearGradient
          colors={gradients.hackathonBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 12 }}
        >
          <View className="flex-row items-center gap-3 p-4">
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
              <Text className="text-sm font-bold text-text-inverse">R</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-text-primary">Rangoo Universitário</Text>
              <Text className="text-xs text-text-secondary">Hackathon InovaRU 2026/01 · FUMP</Text>
            </View>
            <Ionicons name="logo-github" size={18} color={themeColors.textSecondary} />
          </View>
        </LinearGradient>
      </Pressable>

      <Button label="Sair" onPress={logout} variant="secondary" />

      <View className="h-4" />
    </ScrollView>
  )
}
