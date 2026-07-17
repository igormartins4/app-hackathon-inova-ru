import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useConsumerStatus } from '@/features/balance/hooks/useConsumerStatus'
import { useRechargeHistory } from '@/features/history'
import {
  Card,
  ErrorMessage,
  FadeInView,
  LoadingSpinner,
  LowBalanceBanner,
  NoticeCarousel,
  Text,
} from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import {
  formatCurrency,
  formatToLocalDateTime,
  getErrorMessage,
  getGreetingPeriod,
  toTitleCase,
} from '@/shared/utils'
import { useThemeStore } from '@/store/themeStore'

const QUICK_ACTIONS = [
  { key: 'cardapio', labelKey: 'homeCardapio' as const, icon: 'book' as const },
  { key: 'historico', labelKey: 'homeHistorico' as const, icon: 'time' as const },
]

const GREETING_PHRASES = ['homePhrase'] as const

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useBalance()
  const { isInactive, message } = useConsumerStatus()
  const { data: rechargeHistory } = useRechargeHistory()
  const themeColors = useThemeColors()
  const gradients = useGradientColors()
  const { t } = useI18n()
  const hideSensitiveData = useThemeStore((s) => s.hideSensitiveData)
  const toggleHideSensitiveData = useThemeStore((s) => s.toggleHideSensitiveData)
  const recentRecharges = useMemo(
    () => rechargeHistory?.pages[0]?.data.slice(0, 3) ?? [],
    [rechargeHistory],
  )
  const phraseIndex = useMemo(() => Math.floor(Math.random() * GREETING_PHRASES.length), [])

  const handleQuickAction = useCallback(
    (key: string) => {
      switch (key) {
        case 'cardapio':
          router.push('/(tabs)/cardapio')
          break
        case 'historico':
          router.push('/(tabs)/historico')
          break
      }
    },
    [router],
  )

  if (isLoading) {
    return <LoadingSpinner message={t.loading} />
  }

  if (isInactive) {
    return (
      <View className="flex-1 bg-background px-4 pt-8">
        <ErrorMessage message={message ?? t.errorInactiveAccount} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background px-4 pt-8">
        <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />
      </View>
    )
  }

  const saldo = data?.saldo?.credito_disponivel ?? 0

  const QUICK_ACTION_COLORS = [gradients.quickActionCardapio, gradients.quickActionHistorico]

  const firstName = user?.nome ? toTitleCase(user.nome).split(' ')[0] : t.defaultStudentLabel
  const GREETING_KEYS = {
    morning: 'homeGreetingMorning',
    afternoon: 'homeGreetingAfternoon',
    evening: 'homeGreetingEvening',
  } as const
  const greeting = t[GREETING_KEYS[getGreetingPeriod()]]
  const phrase = t[GREETING_PHRASES[phraseIndex]]

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-4">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-sm text-text-secondary">{greeting},</Text>
        <Text
          accessibilityLabel={`${greeting}, ${firstName}`}
          className="text-2xl font-bold text-text-primary"
        >
          {firstName} 👋
        </Text>
        <Text className="text-xs text-text-secondary mt-0.5">{phrase}!</Text>
      </View>

      <NoticeCarousel />

      <LowBalanceBanner />

      <View className="px-4 mb-4">
        <LinearGradient
          colors={gradients.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16 }}
        >
          <View className="p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-medium text-text-inverse/70 uppercase tracking-wider">
                {t.homeBalanceTitle}
              </Text>
              <Pressable
                onPress={toggleHideSensitiveData}
                accessibilityRole="switch"
                accessibilityLabel={hideSensitiveData ? t.showSensitiveData : t.hideSensitiveData}
                accessibilityState={{ checked: hideSensitiveData }}
                hitSlop={8}
                className="p-1"
              >
                <Ionicons
                  name={hideSensitiveData ? 'eye-off' : 'eye'}
                  size={18}
                  color={themeColors.textInverse}
                  style={{ opacity: 0.7 }}
                />
              </Pressable>
            </View>
            <Text
              accessibilityLabel={`${t.homeBalanceTitle}: ${hideSensitiveData ? t.hideSensitiveData : formatCurrency(saldo)}`}
              className="text-4xl font-bold text-text-inverse mt-2"
            >
              {hideSensitiveData ? '••••' : formatCurrency(saldo)}
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/recharge')}
              accessibilityRole="button"
              accessibilityLabel={t.homeRechargeButton}
              className="flex-row items-center gap-2 bg-surface rounded-full px-5 py-3 mt-4 self-start min-h-[48px] active:opacity-80"
            >
              <Ionicons name="add" size={18} color={themeColors.primary} />
              <Text className="text-sm font-bold text-primary">{t.homeRechargeButton}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <View className="flex-row px-4 gap-3 mb-5">
        {QUICK_ACTIONS.map((action, index) => (
          <Pressable
            key={action.key}
            onPress={() => handleQuickAction(action.key)}
            accessibilityRole="button"
            accessibilityLabel={t[action.labelKey]}
            className="flex-1 items-center justify-center gap-2 rounded-xl py-4 min-h-[80px]"
            style={{ backgroundColor: QUICK_ACTION_COLORS[index] }}
          >
            <Ionicons name={action.icon} size={28} color={themeColors.primary} />
            <Text className="text-sm font-medium text-text-primary">{t[action.labelKey]}</Text>
          </Pressable>
        ))}
      </View>

      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-text-primary">{t.homeRecentRecharges}</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/historico?tab=recargas')}
            accessibilityRole="button"
            accessibilityLabel={t.homeSeeAll}
          >
            <Text className="text-sm font-semibold text-primary">{t.homeSeeAll}</Text>
          </Pressable>
        </View>

        <Card className="p-0 overflow-hidden">
          {recentRecharges.length === 0 ? (
            <Text className="text-sm text-text-secondary text-center py-4">
              {t.homeEmptyRecharges}
            </Text>
          ) : (
            recentRecharges.map((recarga, idx) => (
              <FadeInView key={recarga.id}>
                <Pressable
                  onPress={() => router.push('/(tabs)/historico?tab=recargas')}
                  accessibilityRole="button"
                  accessibilityLabel={`${t.homeRechargePix} ${formatCurrency(recarga.valor)} ${formatToLocalDateTime(recarga.data_hora)}`}
                  className={`flex-row items-center gap-3 px-4 py-3 ${
                    idx < recentRecharges.length - 1 ? 'border-b border-outline-variant' : ''
                  }`}
                >
                  <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center">
                    <Ionicons name="card" size={20} color={themeColors.success} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-text-primary">
                      {t.homeRechargePix}
                    </Text>
                    <Text className="text-xs text-text-secondary">
                      {formatToLocalDateTime(recarga.data_hora)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-text-primary">
                      +{formatCurrency(recarga.valor)}
                    </Text>
                    <Text className="text-xs font-medium text-success">
                      {recarga.status === 'aprovado' ? 'Aprovado' : recarga.status}
                    </Text>
                  </View>
                </Pressable>
              </FadeInView>
            ))
          )}
        </Card>
      </View>

      {message && (
        <Card accessibilityLabel="Alerta de conta" accessibilityRole="alert" className="mx-4 mb-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="information-circle" size={20} color={themeColors.primary} />
            <Text accessibilityRole="text" className="flex-1 text-sm text-text-secondary">
              {message}
            </Text>
          </View>
        </Card>
      )}

      <Pressable
        onPress={() => router.push('/(tabs)/transfer')}
        accessibilityRole="button"
        accessibilityLabel={t.homeTransferTitle}
        accessibilityHint={t.homeTransferDescription}
        className="mx-4 mb-4 opacity-70"
      >
        <View className="flex-row items-center gap-3 py-2">
          <Ionicons name="swap-horizontal" size={18} color={themeColors.textSecondary} />
          <View className="flex-1">
            <Text className="text-xs font-medium text-text-secondary">{t.homeTransferTitle}</Text>
            <Text className="text-xs text-text-secondary">{t.homeTransferDescription}</Text>
          </View>
        </View>
      </Pressable>

      <View className="h-4" />
    </ScrollView>
  )
}
