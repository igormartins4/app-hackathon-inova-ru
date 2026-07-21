import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useConsumerStatus } from '@/features/balance/hooks/useConsumerStatus'
import { useRechargeHistory } from '@/features/history'
import { AVISOS_FUNCIONAMENTO } from '@/features/restaurantes/data/avisosFuncionamento'
import { RU_INFO } from '@/features/restaurantes/data/ruInfo'
import type { Refeicao } from '@/features/restaurantes/types/restaurante.types'
import { getAvisoAtivo } from '@/features/restaurantes/utils/avisoAtivo'
import { getAvisoTexto } from '@/features/restaurantes/utils/avisoTexto'
import { getRUStatus } from '@/features/restaurantes/utils/ruStatus'
import {
  Card,
  ErrorMessage,
  FadeInView,
  LOW_BALANCE_THRESHOLD,
  LoadingSpinner,
  LowBalanceBanner,
  NoticeCarousel,
  Text,
} from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import {
  formatCurrency,
  formatFullWeekdayDate,
  formatToLocalDateTime,
  getErrorMessage,
  getGreetingPeriod,
  isToday,
  toTitleCase,
} from '@/shared/utils'
import { useFavoriteRUsStore } from '@/store'
import { useResolvedTheme, useThemeStore } from '@/store/themeStore'

const QUICK_ACTIONS = [
  { key: 'cardapio', labelKey: 'homeCardapio' as const, icon: 'book' as const },
  { key: 'historico', labelKey: 'homeHistorico' as const, icon: 'time' as const },
  {
    key: 'transfer',
    labelKey: 'homeTransferQuickAction' as const,
    icon: 'swap-horizontal' as const,
  },
]

const GREETING_PHRASES = ['homePhrase', 'homePhrase2', 'homePhrase3'] as const

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useBalance()
  const { isInactive, message } = useConsumerStatus()
  const { data: rechargeHistory } = useRechargeHistory()
  const themeColors = useThemeColors()
  const gradients = useGradientColors()
  const { t, locale } = useI18n()
  const restaurantMealLabels: Record<Refeicao, string> = {
    cafe: t.restaurantMealCafe,
    almoco: t.restaurantMealAlmoco,
    jantar: t.restaurantMealJantar,
  }
  const hideSensitiveData = useThemeStore((s) => s.hideSensitiveData)
  const toggleHideSensitiveData = useThemeStore((s) => s.toggleHideSensitiveData)
  const favorites = useFavoriteRUsStore((state) => state.favorites)
  const favoritesInitialized = useFavoriteRUsStore((state) => state.initialized)
  const initializeFavorites = useFavoriteRUsStore((state) => state.initialize)
  const resolvedTheme = useResolvedTheme()
  const isDark = resolvedTheme === 'dark'
  const actionTextColor = isDark ? '#FFFFFF' : '#1F2937'
  const recentRecharges = useMemo(
    () => rechargeHistory?.pages[0]?.data.slice(0, 3) ?? [],
    [rechargeHistory],
  )
  const phraseIndex = useMemo(() => Math.floor(Math.random() * GREETING_PHRASES.length), [])

  useEffect(() => {
    if (!favoritesInitialized) initializeFavorites()
  }, [favoritesInitialized, initializeFavorites])

  const handleQuickAction = useCallback(
    (key: string) => {
      switch (key) {
        case 'cardapio':
          router.push('/(tabs)/cardapio')
          break
        case 'historico':
          router.push('/(tabs)/historico')
          break
        case 'transfer':
          router.push('/(tabs)/transfer')
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
  const QUICK_ACTION_COLORS = [
    gradients.quickActionCardapio,
    gradients.quickActionHistorico,
    gradients.quickActionTransfer,
  ]

  const firstName = user?.nome ? toTitleCase(user.nome).split(' ')[0] : t.defaultStudentLabel
  const GREETING_KEYS = {
    morning: 'homeGreetingMorning',
    afternoon: 'homeGreetingAfternoon',
    evening: 'homeGreetingEvening',
  } as const
  const greeting = t[GREETING_KEYS[getGreetingPeriod()]]
  const phrase = t[GREETING_PHRASES[phraseIndex]]

  return (
    <View className="flex-1 bg-background">
      {/* Header Fixo */}
      <View className="px-4 pt-4 pb-3 bg-primary z-10 flex-row items-center justify-between shadow-md">
        <View>
          <Text className="text-xs font-medium text-white/80">{greeting},</Text>
          <Text
            accessibilityLabel={`${greeting}, ${firstName}`}
            className="text-xl font-bold text-white tracking-tight"
          >
            {firstName} 👋
          </Text>
        </View>

        <View className="bg-white/20 px-3 py-1.5 rounded-full border border-white/25">
          <Text className="text-xs font-bold text-white">{phrase}!</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-6 pt-4">
        {/* Card de Saldo Redesenhado */}
        <View className="px-4 mb-5">
          <LinearGradient
            colors={gradients.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20 }}
            className="shadow-sm overflow-hidden"
          >
            <View className="p-5 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-white/80 uppercase tracking-widest">
                  {t.homeBalanceTitle}
                </Text>
                <Pressable
                  onPress={toggleHideSensitiveData}
                  accessibilityRole="switch"
                  accessibilityLabel={hideSensitiveData ? t.showSensitiveData : t.hideSensitiveData}
                  accessibilityState={{ checked: hideSensitiveData }}
                  hitSlop={12}
                  className="p-1.5 rounded-full bg-black/10"
                >
                  <Ionicons
                    name={hideSensitiveData ? 'eye-off' : 'eye'}
                    size={18}
                    color="#ffffff"
                    style={{ opacity: 0.9 }}
                  />
                </Pressable>
              </View>

              <View className="flex-row items-baseline justify-between">
                <Text
                  accessibilityLabel={`${t.homeBalanceTitle}: ${hideSensitiveData ? t.hideSensitiveData : formatCurrency(saldo)}`}
                  className="text-4xl font-extrabold text-white tracking-tight"
                >
                  {hideSensitiveData ? '••••' : formatCurrency(saldo)}
                </Text>

                {saldo < LOW_BALANCE_THRESHOLD && (
                  <View className="flex-row items-center gap-2 bg-amber-500/25 border border-amber-300/40 rounded-xl p-2.5 mt-1">
                    <Ionicons name="warning" size={16} color="#fbbf24" />
                    <Text className="text-xs font-semibold text-amber-100 flex-1">
                      Saldo baixo! Recarregue para garantir suas refeições.
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={() => router.push('/(tabs)/recharge')}
                  accessibilityRole="button"
                  accessibilityLabel={t.homeRechargeButton}
                  className="flex-row items-center justify-center gap-2 bg-white rounded-xl py-3 px-5 mt-2 min-h-[48px] active:opacity-90 shadow-sm"
                >
                  <Ionicons name="add-circle" size={20} color={themeColors.primary} />
                  <Text className="text-sm font-bold text-primary">{t.homeRechargeButton}</Text>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Ações Rápidas */}
        <View className="flex-row px-4 gap-3 my-5">
          {QUICK_ACTIONS.map((action, index) => (
            <Pressable
              key={action.key}
              onPress={() => handleQuickAction(action.key)}
              accessibilityRole="button"
              accessibilityLabel={
                action.key === 'transfer' ? t.homeTransferTitle : t[action.labelKey]
              }
              accessibilityHint={action.key === 'transfer' ? t.homeTransferDescription : undefined}
              className="flex-1 items-center justify-center gap-2 rounded-xl py-4 min-h-[80px]"
              style={{ backgroundColor: QUICK_ACTION_COLORS[index] }}
            >
              <Ionicons name={action.icon} size={28} color={actionTextColor} />
              <Text
                className="text-sm font-bold text-center"
                style={{ color: actionTextColor }}
                numberOfLines={1}
              >
                {t[action.labelKey]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Restaurantes Favoritos */}
        <View className="px-4 mb-5 gap-3">
          <Text className="text-sm font-bold text-text-primary">
            {favorites.length === 1 ? t.restaurantFavoriteSingular : t.restaurantFavoritePlural}
          </Text>
          {favoritesInitialized && favorites.length > 0 ? (
            favorites.flatMap((favoriteRU) => {
              const favoriteInfo = RU_INFO[favoriteRU]
              if (!favoriteInfo) return []
              const schedule =
                favoriteInfo.horarios ?? favoriteInfo.unidadesFisicas?.map(({ horarios }) => horarios)
              const status = schedule ? getRUStatus(schedule) : null
              const notice = getAvisoAtivo(AVISOS_FUNCIONAMENTO, favoriteRU)
              const noticeText = notice ? getAvisoTexto(notice, t) : null
              const meal = status?.proximaAbertura
                ? restaurantMealLabels[status.proximaAbertura.refeicao]
                : ''
              const nextOpening = status?.proximaAbertura
                ? t.restaurantNextOpening
                    .replace(
                      '{date}',
                      isToday(status.proximaAbertura.data)
                        ? t.cardapioHoje
                        : formatFullWeekdayDate(status.proximaAbertura.data, locale),
                    )
                    .replace('{meal}', meal)
                    .replace(
                      '{time}',
                      status.proximaAbertura.data.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    )
                : ''
              const isClosingSoon = status?.aberto && status.minutosParaFechar !== null && status.minutosParaFechar <= 10

              const statusLabel = notice
                ? notice.suspendeFuncionamento
                  ? t.restaurantTemporaryClosed
                  : t.restaurantScheduleChanged
                : status
                  ? status.aberto
                    ? isClosingSoon
                      ? t.restaurantClosingSoon
                          .replace('{meal}', restaurantMealLabels[status.refeicaoAtual ?? 'cafe'])
                          .replace('{minutes}', String(status.minutosParaFechar))
                      : t.restaurantOpen.replace(
                          '{meal}',
                          restaurantMealLabels[status.refeicaoAtual ?? 'cafe'],
                        )
                    : t.restaurantClosed
                  : t.restaurantScheduleUnavailable

              const now = new Date()
              const todaySchedule = Array.isArray(schedule)
                ? schedule[0]?.[now.getDay()]
                : schedule?.[now.getDay()]
              const activeMeal = status?.aberto && status.refeicaoAtual && todaySchedule
                ? todaySchedule[status.refeicaoAtual]
                : null
              const activeMealHours = activeMeal
                ? `${activeMeal.abre} às ${activeMeal.fecha}`
                : null

              return (
                <Pressable
                  key={favoriteRU}
                  onPress={() => router.push(`/restaurante/${favoriteInfo.codigo}`)}
                  accessibilityRole="button"
                  accessibilityLabel={t.restaurantDetailsA11y
                    .replace('{name}', favoriteInfo.nome)
                    .replace('{status}', nextOpening || statusLabel)}
                  className="min-h-[48px]"
                >
                  <Card className="gap-2">
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-1 flex-row items-center gap-1.5 flex-wrap">
                        <Text className="text-base font-bold text-text-primary">
                          {favoriteInfo.nome}
                        </Text>
                        <Text className="text-xs text-text-secondary">
                          · {favoriteInfo.campus}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
                    </View>

                    {notice ? (
                      <Text className="text-status-warning text-xs font-semibold">{statusLabel}</Text>
                    ) : (
                      <Text
                        className={
                          status?.aberto
                            ? isClosingSoon
                              ? 'text-status-warning text-xs font-semibold'
                              : 'text-status-success text-xs font-semibold'
                            : 'text-status-error text-xs font-semibold'
                        }
                      >
                        {status?.aberto
                          ? `${restaurantMealLabels[status.refeicaoAtual ?? 'cafe']}${activeMealHours ? ` (${activeMealHours})` : ''} · ${isClosingSoon ? `Quase fechando (${status.minutosParaFechar} min)` : 'Aberto'}`
                          : statusLabel}
                      </Text>
                    )}

                    {!notice && status?.aberto && favoriteInfo.temCardapio && (
                      <View className="mt-1 border-t border-outline-variant pt-2 gap-1.5">
                        <Text className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          Prato Principal / Proteínas
                        </Text>
                        <View className="gap-1.5">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-xs text-text-primary pr-2 flex-1">
                              {favoriteInfo.codigo === '0002' ? 'Peixe grelhado' : favoriteInfo.codigo === '0001' ? 'Carne moída ao molho' : favoriteInfo.codigo === '0004' ? 'Strogonoff de frango' : 'Frango grelhado'}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-xs text-text-primary pr-2 flex-1">
                              {favoriteInfo.codigo === '0002' ? 'Risoto de cogumelos' : favoriteInfo.codigo === '0001' ? 'Wrap de grão-de-bico' : favoriteInfo.codigo === '0004' ? 'Proteína de soja' : 'Grão-de-bico ao curry'}
                            </Text>
                            <View className="bg-status-success/10 rounded-full px-2 py-0.5 flex-row items-center gap-1">
                              <Ionicons name="leaf" size={10} color={themeColors.success} />
                              <Text className="text-[9px] font-bold text-status-success">Vegano</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                    {!notice && !status?.aberto && status?.proximaAbertura && (
                      <Text className="text-xs text-text-secondary">{nextOpening}</Text>
                    )}
                    {notice && (
                      <Text accessibilityRole="alert" className="text-xs text-status-warning">
                        {noticeText?.titulo}: {noticeText?.descricao}
                      </Text>
                    )}
                  </Card>
                </Pressable>
              )
            })
          ) : favoritesInitialized ? (
            <Card className="gap-3">
              <Text className="text-sm text-text-secondary">{t.restaurantEmptyFavorites}</Text>
              <Pressable
                onPress={() => router.push('/(tabs)/cardapio')}
                accessibilityRole="button"
                accessibilityLabel={t.restaurantChooseFavoriteA11y}
                className="self-start min-h-[48px] justify-center"
              >
                <Text className="text-sm font-bold text-primary">{t.restaurantChooseInMenu}</Text>
              </Pressable>
            </Card>
          ) : null}
        </View>

        {/* Dicas Rangoo - Reposicionado entre Favoritos e Últimas Recargas */}
        <NoticeCarousel />

      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-text-primary">{t.homeRecentRecharges}</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/historico?tab=recargas')}
            accessibilityRole="button"
            accessibilityLabel={t.homeSeeAll}
            className="min-h-[48px] justify-center px-2"
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
                  <View className="w-10 h-10 rounded-full bg-status-success/10 items-center justify-center">
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
                    <Text className="text-xs font-medium text-status-success">
                      {recarga.status === 'aprovado' ? t.historyApproved : recarga.status}
                    </Text>
                  </View>
                </Pressable>
              </FadeInView>
            ))
          )}
        </Card>
      </View>

      {message && (
        <Card
          accessibilityLabel={t.homeAccountAlert}
          accessibilityRole="alert"
          className="mx-4 mb-4"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="information-circle" size={20} color={themeColors.primary} />
            <Text accessibilityRole="text" className="flex-1 text-sm text-text-secondary">
              {message}
            </Text>
          </View>
        </Card>
      )}

      <View className="h-4" />
      </ScrollView>
    </View>
  )
}
