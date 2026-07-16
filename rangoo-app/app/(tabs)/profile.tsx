import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Linking, Pressable, ScrollView, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useMealHistory } from '@/features/history'
import {
  AboutAppModal,
  Button,
  Card,
  LoadingSpinner,
  StatusBadge,
  Text,
} from '@/shared/components/ui'
import { LOCALES, type Locale, useI18n } from '@/shared/i18n'
import {
  type DemoScenario,
  getMockScenario,
  resetMockState,
  setMockScenario,
} from '@/shared/services/mockHandler'
import { formatCurrency } from '@/shared/utils'
import { FONT_FAMILIES, FONT_STEPS, useResolvedTheme, useThemeStore } from '@/store/themeStore'

const DEMO_SCENARIOS: Array<{ key: DemoScenario; label: string; hint: string }> = [
  { key: 'normal', label: 'Normal', hint: 'Saldo, PIX aprovado e históricos funcionando' },
  { key: 'blocked', label: 'Bloqueado', hint: 'Recarga desabilitada por situação B' },
  { key: 'inactive', label: 'Inativo', hint: 'Saldo retorna 404 de consumidor inativo' },
  { key: 'pixExpired', label: 'PIX expira', hint: 'Polling termina como expired' },
  { key: 'pixRejected', label: 'PIX rejeita', hint: 'Polling termina como rejected' },
  { key: 'rateLimit', label: 'Rate limit', hint: 'Respostas 429 com Retry-After de 30s' },
  { key: 'serverError', label: 'Erro 500', hint: 'Simula indisponibilidade da API' },
]

export default function ProfileScreen() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance()
  const { data: mealHistory } = useMealHistory()
  const {
    setTheme,
    fontSize,
    fontFamily,
    increaseFontSize,
    decreaseFontSize,
    setFontFamily,
    highContrast,
    reducedMotion,
    useSystemColors,
    toggleHighContrast,
    toggleReducedMotion,
    toggleSystemColors,
  } = useThemeStore()
  const themeColors = useThemeColors()
  const gradients = useGradientColors()
  const [demoScenario, setDemoScenarioState] = useState(getMockScenario())
  const [aboutVisible, setAboutVisible] = useState(false)
  const { t, locale, setLocale } = useI18n()

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

  const refreshMockData = () => {
    queryClient.invalidateQueries()
  }

  const handleDemoScenario = (scenario: DemoScenario) => {
    setMockScenario(scenario)
    setDemoScenarioState(scenario)
    refreshMockData()
  }

  const handleResetDemo = () => {
    resetMockState()
    refreshMockData()
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
    return <LoadingSpinner message={t.loading} />
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 gap-4">
      <View>
        <Text className="text-2xl font-bold text-text-primary">{t.profileTitle}</Text>
        <Text className="text-xs text-text-secondary mt-0.5">{t.profileSubtitle}</Text>
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
        <Card accessibilityLabel={t.profileConsumerData} accessibilityRole="summary">
          <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
            {t.profileConsumerData}
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">{t.profileFullName}</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.nome}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">{t.profileType}</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.tipo_consumidor.descricao}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">{t.profileCostCenter}</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.centro_custo.descricao}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-text-secondary">{t.profileSituation}</Text>
              <StatusBadge situacao={balanceData.consumidor.situacao} size="text-sm" />
            </View>
          </View>
        </Card>
      )}

      {totalGastoMes > 0 && (
        <Card>
          <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
            {t.profileMonthlyExpenses}
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-text-secondary">{t.profileTotalMeals}</Text>
            <Text className="text-lg font-bold text-text-primary">
              {formatCurrency(totalGastoMes)}
            </Text>
          </View>
        </Card>
      )}

      <Card>
        <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
          {t.profileDemoMode}
        </Text>
        <Text className="text-xs text-text-secondary mb-3">{t.profileDemoDescription}</Text>
        <View className="flex-row flex-wrap gap-2">
          {DEMO_SCENARIOS.map((scenario) => {
            const selected = demoScenario === scenario.key
            return (
              <Pressable
                key={scenario.key}
                onPress={() => handleDemoScenario(scenario.key)}
                accessibilityRole="button"
                accessibilityLabel={`Cenário ${scenario.label}`}
                accessibilityHint={scenario.hint}
                accessibilityState={{ selected }}
                className={`px-3 py-2 rounded-full border ${
                  selected ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${selected ? 'text-text-inverse' : 'text-text-primary'}`}
                >
                  {scenario.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
        <Pressable
          onPress={handleResetDemo}
          accessibilityRole="button"
          accessibilityLabel="Resetar dados da demonstração"
          accessibilityHint="Restaura saldo, pagamentos e históricos do cenário atual"
          className="flex-row items-center justify-between pt-4 mt-4 border-t border-outline-variant"
        >
          <Text className="text-sm font-medium text-primary">{t.profileResetDemo}</Text>
          <Ionicons name="refresh" size={18} color={themeColors.primary} />
        </Pressable>
      </Card>

      <Card>
        <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
          {t.profileAccessibility}
        </Text>

        <Pressable
          onPress={handleToggleDark}
          accessibilityRole="switch"
          accessibilityLabel={t.profileDarkMode}
          accessibilityHint={t.profileDarkModeHint}
          accessibilityState={{ checked: isDark }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-warning/15 items-center justify-center">
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={themeColors.warning} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">{t.profileDarkMode}</Text>
              <Text className="text-xs text-text-secondary">{t.profileDarkModeHint}</Text>
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
          accessibilityLabel={t.profileHighContrast}
          accessibilityHint={t.profileHighContrastHint}
          accessibilityState={{ checked: highContrast }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Ionicons name="contrast" size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">{t.profileHighContrast}</Text>
              <Text className="text-xs text-text-secondary">{t.profileHighContrastHint}</Text>
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
          accessibilityLabel={t.profileReducedMotion}
          accessibilityHint={t.profileReducedMotionHint}
          accessibilityState={{ checked: reducedMotion }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Ionicons name="accessibility" size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">
                {t.profileReducedMotion}
              </Text>
              <Text className="text-xs text-text-secondary">{t.profileReducedMotionHint}</Text>
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
          accessibilityLabel={t.profileSystemColors}
          accessibilityHint={t.profileSystemColorsHint}
          accessibilityState={{ checked: useSystemColors }}
          className="flex-row items-center justify-between py-3 border-b border-outline-variant"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Ionicons name="color-palette" size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">{t.profileSystemColors}</Text>
              <Text className="text-xs text-text-secondary">{t.profileSystemColorsHint}</Text>
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
              <Text className="text-sm font-medium text-text-primary">{t.profileFontSize}</Text>
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
              accessibilityLabel={t.profileFontSize}
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
              accessibilityLabel={t.profileFontSize}
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

        <View className="py-3 border-t border-outline-variant">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-sm font-bold text-primary">Ff</Text>
            </View>
            <View>
              <Text className="text-sm font-medium text-text-primary">{t.profileFontFamily}</Text>
              <Text className="text-xs text-text-secondary">{t.profileFontHint}</Text>
            </View>
          </View>
          <View className="flex-row bg-surface-variant rounded-full p-1 ml-[52px]">
            {FONT_FAMILIES.map((font, index) => {
              const selected = fontFamily === index
              return (
                <Pressable
                  key={font.label}
                  onPress={() => setFontFamily(index)}
                  accessibilityRole="tab"
                  accessibilityLabel={`Fonte ${font.label}`}
                  accessibilityState={{ selected }}
                  className={`flex-1 min-h-[48px] rounded-full items-center justify-center px-2 ${
                    selected ? 'bg-primary' : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${selected ? 'text-text-inverse' : 'text-text-primary'}`}
                  >
                    {font.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </Card>

      <Card>
        <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
          {t.profileAbout}
        </Text>

        <View className="gap-0">
          <View className="flex-row items-center justify-between py-3 border-b border-outline-variant">
            <Text className="text-sm text-text-primary">{t.profilePrivacy}</Text>
            <Ionicons name="open-outline" size={16} color={themeColors.primary} />
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-outline-variant">
            <Text className="text-sm text-text-primary">{t.version}</Text>
            <Text className="text-sm text-text-secondary">{t.profileAppVersion}</Text>
          </View>

          <Pressable
            onPress={() => Linking.openURL('https://opensource.org/licenses/MIT')}
            accessibilityRole="link"
            accessibilityLabel={t.profileLicense}
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-sm text-primary">{t.profileLicense}</Text>
            <Ionicons name="open-outline" size={16} color={themeColors.primary} />
          </Pressable>
        </View>
      </Card>

      <Card>
        <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
          Idioma / Language
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {(Object.keys(LOCALES) as Locale[]).map((loc) => {
            const selected = locale === loc
            return (
              <Pressable
                key={loc}
                onPress={() => setLocale(loc)}
                accessibilityRole="button"
                accessibilityLabel={`${LOCALES[loc].flag} ${LOCALES[loc].label}`}
                accessibilityState={{ selected }}
                className={`px-3 py-2 rounded-full border ${
                  selected ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${selected ? 'text-text-inverse' : 'text-text-primary'}`}
                >
                  {LOCALES[loc].flag} {LOCALES[loc].label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </Card>

      <Pressable
        onPress={() => setAboutVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Sobre o Rangoo Universitário e o Hackathon InovaRU"
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
              <Text className="text-xs text-text-secondary">{t.profileHackathon}</Text>
            </View>
            <Ionicons name="logo-github" size={18} color={themeColors.textSecondary} />
          </View>
        </LinearGradient>
      </Pressable>

      <Button label={t.logout} onPress={logout} variant="secondary" />

      <View className="h-4" />
      <AboutAppModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
    </ScrollView>
  )
}
