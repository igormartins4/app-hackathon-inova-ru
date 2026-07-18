import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Linking, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColors } from '@/config'
import { RESTAURANTES_OFICIAIS, type RestauranteCode } from '@/config/restaurantes'
import { AVISOS_FUNCIONAMENTO } from '@/features/restaurantes/data/avisosFuncionamento'
import { RU_INFO } from '@/features/restaurantes/data/ruInfo'
import type { HorarioSemana, Refeicao } from '@/features/restaurantes/types/restaurante.types'
import { getAvisoAtivo } from '@/features/restaurantes/utils/avisoAtivo'
import { getAvisoTexto } from '@/features/restaurantes/utils/avisoTexto'
import { getRUNotaTexto } from '@/features/restaurantes/utils/ruNotaTexto'
import { getRUStatus } from '@/features/restaurantes/utils/ruStatus'
import { Card, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatFullWeekdayDate, isToday } from '@/shared/utils'

function isRestauranteCode(value: string): value is RestauranteCode {
  return RESTAURANTES_OFICIAIS.some(({ codigo }) => codigo === value)
}

function Schedule({ horarios }: { horarios: HorarioSemana }) {
  const { t, locale } = useI18n()
  const meals: { key: Refeicao; label: string }[] = [
    { key: 'cafe', label: t.restaurantMealCafe },
    { key: 'almoco', label: t.restaurantMealAlmoco },
    { key: 'jantar', label: t.restaurantMealJantar },
  ]
  return (
    <View className="gap-2">
      {Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(1970, 0, 4 + index)),
      ).map((day, index) => {
        const schedule = horarios[index]
        const renderedMeals = schedule
          ? meals.flatMap(({ key, label }) => {
              const range = schedule[key]
              return range ? [`${label}: ${range.abre}–${range.fecha}`] : []
            })
          : []
        return (
          <View key={day} className="flex-row gap-3">
            <Text className="w-28 text-xs font-semibold text-text-primary">{day}</Text>
            <Text className="flex-1 text-xs text-text-secondary">
              {renderedMeals.length > 0 ? renderedMeals.join(' · ') : t.restaurantClosedDay}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

export default function RestauranteDetailScreen() {
  const router = useRouter()
  const { codigo: rawCode } = useLocalSearchParams<{ codigo?: string | string[] }>()
  const codigo = typeof rawCode === 'string' && isRestauranteCode(rawCode) ? rawCode : null
  const info = codigo ? RU_INFO[codigo] : null
  const themeColors = useThemeColors()
  const { t, locale } = useI18n()
  const [directionsError, setDirectionsError] = useState(false)
  const schedule = info?.horarios ?? info?.unidadesFisicas?.map(({ horarios }) => horarios)
  const status = useMemo(() => (schedule ? getRUStatus(schedule) : null), [schedule])
  const aviso = codigo ? getAvisoAtivo(AVISOS_FUNCIONAMENTO, codigo) : null
  const avisoTexto = aviso ? getAvisoTexto(aviso, t) : null

  const openDirections = async () => {
    if (!info) return
    const query = encodeURIComponent(info.endereco ?? info.mapsQuery)
    try {
      await Linking.openURL(`geo:0,0?q=${query}`)
    } catch {
      try {
        await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`)
      } catch {
        setDirectionsError(true)
      }
    }
  }

  if (!info) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background p-4 justify-center">
        <Card className="items-center gap-4">
          <Ionicons name="restaurant-outline" size={32} color={themeColors.textSecondary} />
          <Text className="text-base font-bold text-text-primary">{t.restaurantNotFound}</Text>
          <Text className="text-sm text-text-secondary text-center">
            {t.restaurantNotFoundBody}
          </Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t.back}
            className="min-h-[48px] justify-center px-4"
          >
            <Text className="text-sm font-bold text-primary">{t.back}</Text>
          </Pressable>
        </Card>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-4 pb-8">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t.back}
          className="self-start min-h-[48px] flex-row items-center gap-1 justify-center"
        >
          <Ionicons name="chevron-back" size={20} color={themeColors.primary} />
          <Text className="text-sm font-bold text-primary">{t.back}</Text>
        </Pressable>

        <View className="gap-1">
          <Text className="text-2xl font-bold text-text-primary">{info.nome}</Text>
          <Text className="text-sm text-text-secondary">{info.campus}</Text>
          {info.endereco && <Text className="text-sm text-text-secondary">{info.endereco}</Text>}
        </View>

        <Card className="gap-2">
          {aviso ? (
            <Text className="text-status-warning text-sm font-bold">
              {aviso.suspendeFuncionamento
                ? t.restaurantTemporaryClosed
                : t.restaurantScheduleChanged}
            </Text>
          ) : (
            <Text
              className={
                status?.aberto
                  ? 'text-status-success text-sm font-bold'
                  : 'text-status-error text-sm font-bold'
              }
            >
              {status
                ? status.aberto
                  ? t.restaurantOpen.replace(
                      '{meal}',
                      status.refeicaoAtual === 'almoco'
                        ? t.restaurantMealAlmoco
                        : status.refeicaoAtual === 'jantar'
                          ? t.restaurantMealJantar
                          : t.restaurantMealCafe,
                    )
                  : t.restaurantClosed
                : t.restaurantScheduleUnavailable}
            </Text>
          )}
          {!aviso && !status?.aberto && status?.proximaAbertura && (
            <Text className="text-xs text-text-secondary">
              {t.restaurantNextOpening
                .replace(
                  '{date}',
                  isToday(status.proximaAbertura.data)
                    ? t.cardapioHoje
                    : formatFullWeekdayDate(status.proximaAbertura.data, locale),
                )
                .replace(
                  '{meal}',
                  status.proximaAbertura.refeicao === 'almoco'
                    ? t.restaurantMealAlmoco
                    : status.proximaAbertura.refeicao === 'jantar'
                      ? t.restaurantMealJantar
                      : t.restaurantMealCafe,
                )
                .replace(
                  '{time}',
                  status.proximaAbertura.data.toLocaleTimeString(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                )}
            </Text>
          )}
          {aviso && (
            <Text accessibilityRole="alert" className="text-xs text-status-warning">
              {avisoTexto?.titulo}: {avisoTexto?.descricao}
            </Text>
          )}
        </Card>

        <Pressable
          onPress={openDirections}
          accessibilityRole="button"
          accessibilityLabel={t.restaurantDirectionsA11y.replace('{name}', info.nome)}
          className="min-h-[48px] flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3"
        >
          <Ionicons name="navigate" size={18} color={themeColors.textInverse} />
          <Text className="text-sm font-bold text-text-inverse">{t.restaurantDirections}</Text>
        </Pressable>
        {directionsError && (
          <Text accessibilityRole="alert" className="text-sm text-status-error">
            {t.restaurantDirectionsError}
          </Text>
        )}

        {(info.horarios || info.unidadesFisicas) && (
          <View className="gap-3">
            <Text className="text-base font-bold text-text-primary">{t.restaurantSchedules}</Text>
            {info.horarios ? (
              <Card>
                <Schedule horarios={info.horarios} />
              </Card>
            ) : (
              info.unidadesFisicas?.map((unidade) => (
                <Card key={unidade.nome} className="gap-3">
                  <Text className="text-sm font-bold text-text-primary">{unidade.nome}</Text>
                  <Schedule horarios={unidade.horarios} />
                </Card>
              ))
            )}
          </View>
        )}

        {info.nota && (
          <Card>
            <Text className="text-sm text-text-secondary">{getRUNotaTexto(info.codigo, t)}</Text>
          </Card>
        )}

        <View className="gap-1">
          <Text className="text-xs font-bold text-text-primary">{t.restaurantSource}</Text>
          <Text className="text-xs text-text-secondary">{info.fonteUrl}</Text>
          <Text className="text-xs text-text-secondary">
            {t.restaurantUpdatedAt.replace('{date}', info.atualizadoEm)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
