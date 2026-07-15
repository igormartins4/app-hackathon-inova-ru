import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Linking, Pressable, ScrollView, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useMealHistory } from '@/features/history'
import { Button, Card, LoadingSpinner, StatusBadge, Text } from '@/shared/components/ui'
import { formatCurrency } from '@/shared/utils'
import { FONT_FAMILIES, FONT_STEPS, useResolvedTheme, useThemeStore } from '@/store/themeStore'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance()
  const { data: mealHistory } = useMealHistory()
  const {
    setTheme,
    fontSize,
    fontFamily,
    increaseFontSize,
    decreaseFontSize,
    nextFontFamily,
    highContrast,
    reducedMotion,
    useSystemColors,
    toggleHighContrast,
    toggleReducedMotion,
    toggleSystemColors,
  } = useThemeStore()
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
      <View>
        <Text className="text-2xl font-bold text-text-primary">Perfil</Text>
        <Text className="text-xs text-text-secondary mt-0.5">
          Seus dados, preferências e sobre o app
        </Text>
      </View>

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
            {balanceData?.consumidor?.situacao && (
              <View className="mt-1">
                <StatusBadge situacao={balanceData.consumidor.situacao} />
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {balanceData?.consumidor && (
        <Card accessibilityLabel="Dados do consumidor" accessibilityRole="summary">
          <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
            Dados do Consumidor
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Nome completo</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.nome}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Tipo</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.tipo_consumidor.descricao}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Centro de Custo</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.centro_custo.descricao}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-text-secondary">Situação</Text>
              <StatusBadge situacao={balanceData.consumidor.situacao} size="text-sm" />
            </View>
          </View>
        </Card>
      )}

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
          Acessibilidade
        </Text>

        <Pressable
          onPress={handleToggleDark}
          accessibilityRole="switch"
          accessibilityLabel="Modo escuro"
          accessibilityHint="Alterna entre tema claro e escuro"
          accessibilityState={{ checked: isDark }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-warning/15 items-center justify-center">
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={themeColors.warning} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">Tema escuro</Text>
              <Text className="text-xs text-text-secondary">Segue o sistema por padrão</Text>
            </View>
          </View>
          <View className={`w-12 h-7 rounded-full p-0.5 ${isDark ? 'bg-primary' : 'bg-outline'}`}>
            <View
              className={`w-6 h-6 rounded-full bg-text-inverse shadow ${isDark ? 'ml-5' : 'ml-0'}`}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={toggleHighContrast}
          accessibilityRole="switch"
          accessibilityLabel="Alto contraste"
          accessibilityHint="Aumenta o contraste entre texto e fundo para melhor leitura"
          accessibilityState={{ checked: highContrast }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Ionicons name="contrast" size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">Alto contraste</Text>
              <Text className="text-xs text-text-secondary">Texto mais forte e legível</Text>
            </View>
          </View>
          <View
            className={`w-12 h-7 rounded-full p-0.5 ${highContrast ? 'bg-primary' : 'bg-outline'}`}
          >
            <View
              className={`w-6 h-6 rounded-full bg-text-inverse shadow ${highContrast ? 'ml-5' : 'ml-0'}`}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={toggleReducedMotion}
          accessibilityRole="switch"
          accessibilityLabel="Reduzir movimento"
          accessibilityHint="Remove animações e transições não essenciais do aplicativo"
          accessibilityState={{ checked: reducedMotion }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Ionicons name="accessibility" size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">Reduzir movimento</Text>
              <Text className="text-xs text-text-secondary">Desativa animações suaves</Text>
            </View>
          </View>
          <View
            className={`w-12 h-7 rounded-full p-0.5 ${reducedMotion ? 'bg-primary' : 'bg-outline'}`}
          >
            <View
              className={`w-6 h-6 rounded-full bg-text-inverse shadow ${reducedMotion ? 'ml-5' : 'ml-0'}`}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={toggleSystemColors}
          accessibilityRole="switch"
          accessibilityLabel="Cores do sistema"
          accessibilityHint="Usa a cor de destaque do Android quando o tema está definido como sistema"
          accessibilityState={{ checked: useSystemColors }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Ionicons name="color-palette" size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">Cores do sistema</Text>
              <Text className="text-xs text-text-secondary">Material You simplificado</Text>
            </View>
          </View>
          <View
            className={`w-12 h-7 rounded-full p-0.5 ${useSystemColors ? 'bg-primary' : 'bg-outline'}`}
          >
            <View
              className={`w-6 h-6 rounded-full bg-text-inverse shadow ${useSystemColors ? 'ml-5' : 'ml-0'}`}
            />
          </View>
        </Pressable>

        <View className="py-3">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-sm font-bold text-primary">Aa</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary">Tamanho da fonte</Text>
              <Text className="text-xs text-text-secondary">
                {FONT_STEPS[fontSize].label} ({FONT_STEPS[fontSize].scale}×)
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-center gap-4 ml-[52px]">
            <Pressable
              onPress={decreaseFontSize}
              disabled={fontSize === 0}
              accessibilityRole="button"
              accessibilityLabel="Diminuir fonte"
              accessibilityHint="Reduz o tamanho do texto"
              className={`w-12 h-12 rounded-full items-center justify-center ${
                fontSize === 0 ? 'bg-outline/30' : 'bg-primary'
              }`}
            >
              <Ionicons
                name="remove"
                size={22}
                color={fontSize === 0 ? themeColors.textDisabled : themeColors.textInverse}
              />
            </Pressable>

            <View className="items-center min-w-[100px]">
              <Text className="text-lg font-bold text-text-primary">
                {FONT_STEPS[fontSize].scale}×
              </Text>
            </View>

            <Pressable
              onPress={increaseFontSize}
              disabled={fontSize === FONT_STEPS.length - 1}
              accessibilityRole="button"
              accessibilityLabel="Aumentar fonte"
              accessibilityHint="Aumenta o tamanho do texto"
              className={`w-12 h-12 rounded-full items-center justify-center ${
                fontSize === FONT_STEPS.length - 1 ? 'bg-outline/30' : 'bg-primary'
              }`}
            >
              <Ionicons
                name="add"
                size={22}
                color={
                  fontSize === FONT_STEPS.length - 1
                    ? themeColors.textDisabled
                    : themeColors.textInverse
                }
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={nextFontFamily}
          accessibilityRole="button"
          accessibilityLabel="Mudar fonte"
          accessibilityHint="Alterna entre as fontes disponíveis"
          className="flex-row items-center justify-between py-3 border-t border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-sm font-bold text-primary">Ff</Text>
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">Fonte</Text>
              <Text className="text-xs text-text-secondary">{FONT_FAMILIES[fontFamily].label}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
        </Pressable>
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
        onPress={() => Linking.openURL('https://github.com/igormartins4/app-hackathon-inova-ru')}
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
