import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useState } from 'react'
import { Linking, Pressable, ScrollView, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { type MealRecord, useHistorySummary, useMealHistory } from '@/features/history'
import {
  AboutAppModal,
  AppDialog,
  Button,
  Card,
  ErrorMessage,
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
import { formatCurrency, getErrorMessage } from '@/shared/utils'
import { FONT_FAMILIES, FONT_STEPS, type Theme, useThemeStore } from '@/store/themeStore'

// Chaves de cenário de demonstração só existem enquanto o app roda contra o
// mock local — nunca contra a API real da FUMP, onde não fariam sentido
// misturadas com dados reais de conta.
// __DEV__ is always false in a compiled release bundle regardless of env
// vars — the demo-scenario picker must never reach real students even if
// EXPO_PUBLIC_USE_MOCK is misconfigured (unset/typo'd) in a production build.
const USE_MOCK = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK !== 'false'

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
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    error: balanceError,
    refetch: refetchBalance,
  } = useBalance()
  const mealHistoryQuery = useMealHistory()
  const { isError: isMealHistoryError, refetch: refetchMealHistory } = mealHistoryQuery
  const {
    theme,
    setTheme,
    fontSize,
    fontFamily,
    increaseFontSize,
    decreaseFontSize,
    setFontFamily,
    reducedMotion,
    toggleReducedMotion,
  } = useThemeStore()
  const themeColors = useThemeColors()
  const gradients = useGradientColors()
  const [demoScenario, setDemoScenarioState] = useState(getMockScenario())
  const [aboutVisible, setAboutVisible] = useState(false)
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false)
  const { t, locale, setLocale } = useI18n()

  const initials =
    user?.nome
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '??'

  const THEME_OPTIONS: Array<{
    key: Theme
    label: string
    icon: React.ComponentProps<typeof Ionicons>['name']
  }> = [
    { key: 'light', label: t.profileThemeLight, icon: 'sunny' },
    { key: 'dark', label: t.profileThemeDark, icon: 'moon' },
    { key: 'high-contrast', label: t.profileThemeHighContrast, icon: 'contrast' },
  ]

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

  const handleLogout = () => setLogoutDialogVisible(true)

  const summarizeMonthMeals = useCallback((records: MealRecord[]) => {
    const now = new Date()
    return records
      .filter((item) => {
        const d = new Date(item.data_hora)
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          !item.gratuidade
        )
      })
      .reduce((sum, item) => sum + item.valor_total, 0)
  }, [])
  const { total: totalGastoMes } = useHistorySummary({
    query: mealHistoryQuery,
    reducer: summarizeMonthMeals,
  })

  if (isBalanceLoading) {
    return <LoadingSpinner message={t.loading} />
  }

  if (isBalanceError) {
    return (
      <View className="flex-1 bg-background px-4 pt-8">
        <ErrorMessage message={getErrorMessage(balanceError)} onRetry={refetchBalance} />
      </View>
    )
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
            <Text className="text-lg font-bold text-text-primary">
              {user?.nome ?? t.defaultStudentLabel}
            </Text>
            <Text className="text-sm text-text-secondary mt-0.5">{user?.email ?? ''}</Text>
            <Text className="text-xs text-text-secondary mt-0.5">
              {balanceData?.consumidor?.tipo_consumidor?.descricao ?? t.defaultStudentLabel} ·{' '}
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

      {isMealHistoryError && (
        <ErrorMessage message={t.profileMealHistoryError} onRetry={refetchMealHistory} />
      )}

      {!isMealHistoryError && totalGastoMes > 0 && (
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
        <Text
          accessibilityRole="header"
          className="text-xs font-bold text-primary mb-3 uppercase tracking-wider"
        >
          {t.profileThemeGroup}
        </Text>

        <Text className="text-xs text-text-secondary mb-3">{t.profileThemeHint}</Text>
        <View className="flex-row bg-surface-variant rounded-full p-1">
          {THEME_OPTIONS.map((option) => {
            const selected = theme === option.key
            return (
              <Pressable
                key={option.key}
                onPress={() => setTheme(option.key)}
                accessibilityRole="tab"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                className={`flex-1 min-h-[48px] flex-row items-center justify-center gap-1.5 rounded-full px-2 ${
                  selected ? 'bg-primary' : ''
                }`}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={selected ? themeColors.textInverse : themeColors.textSecondary}
                />
                <Text
                  numberOfLines={1}
                  className={`text-xs font-bold ${selected ? 'text-text-inverse' : 'text-text-primary'}`}
                >
                  {option.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </Card>

      <Card>
        <Text
          accessibilityRole="header"
          className="text-xs font-bold text-primary mb-3 uppercase tracking-wider"
        >
          {t.profileReadingGroup}
        </Text>

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
              accessibilityLabel={t.profileFontSizeDecrease}
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
              accessibilityLabel={t.profileFontSizeIncrease}
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
          {t.profilePricingTitle}
        </Text>
        <View className="gap-0">
          {(
            [
              ['profilePricingNivel1', t.profilePricingFree],
              ['profilePricingNivel23', 'R$ 1,00'],
              ['profilePricingNivel4a', 'R$ 2,00'],
              ['profilePricingNivel4b', 'R$ 2,90'],
              ['profilePricingRegular', 'R$ 5,60'],
              ['profilePricingTecnico', 'R$ 8,50'],
              ['profilePricingTerceirizado', 'R$ 8,50'],
              ['profilePricingDocente', 'R$ 13,00'],
              ['profilePricingVisitante', 'R$ 17,50'],
              ['profilePricingCafe', t.profilePricingFree],
            ] as const
          ).map(([labelKey, value], idx, arr) => (
            <View
              key={labelKey}
              className={`flex-row justify-between items-center py-2 gap-3 ${
                idx < arr.length - 1 ? 'border-b border-outline-variant' : ''
              }`}
            >
              <Text className="flex-1 text-sm text-text-secondary">{t[labelKey]}</Text>
              <Text className="text-sm font-medium text-text-primary">{value}</Text>
            </View>
          ))}
        </View>
        <Text className="text-xs text-text-secondary mt-3">{t.profilePricingSource}</Text>
      </Card>

      <Card>
        <Text className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
          {t.profileAbout}
        </Text>

        <View className="gap-0">
          <Pressable
            onPress={() => Linking.openURL('https://fump.ufmg.br')}
            accessibilityRole="link"
            accessibilityLabel={t.profilePrivacy}
            className="flex-row items-center justify-between py-3 border-b border-outline-variant"
          >
            <Text className="text-sm text-primary">{t.profilePrivacy}</Text>
            <Ionicons name="open-outline" size={16} color={themeColors.primary} />
          </Pressable>

          <View className="flex-row items-center justify-between py-3 border-b border-outline-variant">
            <Text className="text-sm text-text-primary">{t.version}</Text>
            <Text className="text-sm text-text-secondary">{t.profileAppVersion}</Text>
          </View>

          <Pressable
            onPress={() => Linking.openURL('https://opensource.org/licenses/MIT')}
            accessibilityRole="link"
            accessibilityLabel={t.profileLicense}
            className="flex-row items-center justify-between py-3 border-b border-outline-variant"
          >
            <Text className="text-sm text-primary">{t.profileLicense}</Text>
            <Ionicons name="open-outline" size={16} color={themeColors.primary} />
          </Pressable>

          <Pressable
            onPress={() => setAboutVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t.profileAboutButtonA11y}
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-sm text-primary">Sobre o Rangoo · {t.profileHackathon}</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
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
                className={`px-3 py-2 rounded-full border min-h-[48px] items-center justify-center ${
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

      {USE_MOCK && (
        <View className="rounded-2xl border border-dashed border-outline p-4 gap-3">
          <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            🛠 {t.profileDemoMode}
          </Text>
          <Text className="text-xs text-text-secondary">{t.profileDemoDescription}</Text>
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
            accessibilityLabel={t.profileResetDemo}
            accessibilityHint={t.profileResetDemoHint}
            className="flex-row items-center justify-between pt-3 min-h-[48px] border-t border-outline-variant"
          >
            <Text className="text-sm font-medium text-primary">{t.profileResetDemo}</Text>
            <Ionicons name="refresh" size={18} color={themeColors.primary} />
          </Pressable>
        </View>
      )}

      <Button label={t.logout} onPress={handleLogout} variant="secondary" />

      <View className="h-4" />
      <AboutAppModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
      <AppDialog
        visible={logoutDialogVisible}
        title={t.logoutConfirmTitle}
        body={t.logoutConfirmBody}
        accessibilityLabel={t.logoutConfirmTitle}
        onClose={() => setLogoutDialogVisible(false)}
        actions={[
          { label: t.cancel, style: 'cancel', onPress: () => setLogoutDialogVisible(false) },
          {
            label: t.logout,
            style: 'destructive',
            onPress: () => {
              setLogoutDialogVisible(false)
              logout()
            },
          },
        ]}
      />
    </ScrollView>
  )
}
