import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useThemeColors } from '@/config'
import type { FilialCode } from '@/features/cardapio'
import { MenuCalendar, RESTAURANTES_CARDAPIO, useCardapio } from '@/features/cardapio'
import { Card, LoadingSpinner, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { isToday } from '@/shared/utils'

type TipoRefeicao = 'almoco' | 'jantar'

const FAVORITES_KEY = '@rangoo_favorite_rus'

function formatDate(date: Date, days: string[], months: string[]): string {
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`
}

const WEEKDAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]
const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export default function CardapioScreen() {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const [restaurante, setRestaurante] = useState<FilialCode>('0003')
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicao>('almoco')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [favorites, setFavorites] = useState<FilialCode[]>([])
  const [showAll, setShowAll] = useState(true)
  const [showSourceBanner, setShowSourceBanner] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as FilialCode[]
          setFavorites(parsed)
          setShowAll(false)
        } catch {}
      }
    })
  }, [])

  const toggleFavorite = useCallback(
    async (code: FilialCode) => {
      const next = favorites.includes(code)
        ? favorites.filter((f) => f !== code)
        : [...favorites, code]
      setFavorites(next)
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      if (next.length > 0) setShowAll(false)
    },
    [favorites],
  )

  const visibleRestaurantes = showAll
    ? RESTAURANTES_CARDAPIO
    : RESTAURANTES_CARDAPIO.filter((r) => favorites.includes(r.key))

  const { data, isLoading, isError } = useCardapio({
    restaurante,
    tipoRefeicao,
    data: selectedDate,
  })
  const secoes = data?.secoes ?? []
  const today = isToday(selectedDate)

  const selectedRU = RESTAURANTES_CARDAPIO.find((r) => r.key === restaurante)
  const ruWithoutDinner = selectedRU && !selectedRU.hasDinner && tipoRefeicao === 'jantar'

  const getIconColor = useCallback(
    (icon: string) => {
      switch (icon) {
        case 'leaf':
          return themeColors.success
        case 'restaurant':
          return themeColors.primary
        case 'ice-cream':
          return themeColors.warning
        default:
          return themeColors.primary
      }
    },
    [themeColors],
  )

  const meals = [
    { key: 'almoco' as const, label: t.cardapioAlmoco, icon: 'sunny' },
    { key: 'jantar' as const, label: t.cardapioJantar, icon: 'moon' },
  ]

  if (isLoading) {
    return <LoadingSpinner message={t.cardapioLoading} />
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 gap-5">
      <View>
        <Text className="text-2xl font-bold text-text-primary">{t.cardapioTitle}</Text>
        <Text className="text-xs text-text-secondary mt-0.5">{t.cardapioSubtitleConsulte}</Text>
      </View>

      {showSourceBanner && (
        <View
          accessibilityRole="summary"
          accessibilityLabel={t.cardapioFonteNaoOficial}
          className="rounded-xl p-3"
          style={{ backgroundColor: `${themeColors.warning}15` }}
        >
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={20} color={themeColors.warning} />
            <View className="flex-1 gap-1">
              <Text
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: themeColors.warning }}
              >
                {t.cardapioFonteNaoOficial}
              </Text>
              <Text className="text-sm text-text-secondary">{t.cardapioFonteNaoOficialBody}</Text>
            </View>
            <Pressable
              onPress={() => setShowSourceBanner(false)}
              accessibilityRole="button"
              accessibilityLabel={t.close}
              hitSlop={16}
              className="mt-0.5"
            >
              <Ionicons name="close" size={16} color={themeColors.textSecondary} />
            </Pressable>
          </View>
        </View>
      )}

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-primary uppercase tracking-wider">
            {t.cardapioRestaurante}
          </Text>
          {favorites.length > 0 && (
            <Pressable
              onPress={() => setShowAll((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showAll ? t.cardapioMostrarFavoritos : t.cardapioMostrarTodos}
            >
              <Text className="text-xs font-semibold text-primary">
                {showAll ? t.cardapioFavoritos : t.cardapioTodos}
              </Text>
            </Pressable>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          {visibleRestaurantes.map((r) => {
            const isFav = favorites.includes(r.key)
            return (
              <View key={r.key} className="flex-row items-center gap-1">
                <Pressable
                  onPress={() => setRestaurante(r.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t.cardapioRestaurante} ${r.label}`}
                  accessibilityState={{ selected: restaurante === r.key }}
                  className={`flex-row items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] ${
                    restaurante === r.key ? 'bg-primary' : 'bg-surface border border-outline'
                  }`}
                >
                  {restaurante === r.key && (
                    <Ionicons name="checkmark" size={16} color={themeColors.textInverse} />
                  )}
                  <Text
                    className={`text-sm font-medium ${
                      restaurante === r.key ? 'text-text-inverse' : 'text-text-primary'
                    }`}
                  >
                    {r.label}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleFavorite(r.key)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isFav
                      ? `${t.back} ${r.label} ${t.cardapioFavoritos}`
                      : `${t.cardapioFavoritos} ${r.label}`
                  }
                  hitSlop={8}
                  className="w-8 h-8 rounded-full items-center justify-center"
                >
                  <Ionicons
                    name={isFav ? 'star' : 'star-outline'}
                    size={16}
                    color={isFav ? themeColors.warning : themeColors.textSecondary}
                  />
                </Pressable>
              </View>
            )
          })}
        </ScrollView>
        {favorites.length === 0 && !showAll && (
          <Text className="text-xs text-text-secondary">{t.cardapioNenhumFavorito}</Text>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {t.cardapioData}
        </Text>
        <MenuCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <Pressable
          onPress={() => !today && setSelectedDate(new Date())}
          accessibilityRole="button"
          accessibilityLabel={today ? t.cardapioHoje : t.cardapioVoltarParaHoje}
          className="flex-row items-center gap-1"
        >
          <Text className="text-sm font-medium text-text-primary">
            {formatDate(selectedDate, WEEKDAYS_PT, MONTHS_PT)}
          </Text>
          {today ? (
            <Text className="text-success text-xs font-bold"> · {t.cardapioHoje}</Text>
          ) : (
            <Text className="text-primary text-xs font-bold"> · {t.cardapioVoltarParaHoje}</Text>
          )}
        </Pressable>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {t.cardapioMeal}
        </Text>
        <View className="flex-row bg-surface-variant rounded-full p-1">
          {meals.map((m) => {
            const disabled =
              !RESTAURANTES_CARDAPIO.find((r) => r.key === restaurante)?.hasDinner &&
              m.key === 'jantar'
            return (
              <Pressable
                key={m.key}
                onPress={() => !disabled && setTipoRefeicao(m.key)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={m.label}
                accessibilityState={{ selected: tipoRefeicao === m.key, disabled }}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3 min-h-[48px] ${
                  tipoRefeicao === m.key ? 'bg-primary' : ''
                } ${disabled ? 'opacity-40' : ''}`}
              >
                {tipoRefeicao === m.key && (
                  <Ionicons name="checkmark" size={16} color={themeColors.textInverse} />
                )}
                <Ionicons
                  name={m.icon as React.ComponentProps<typeof Ionicons>['name']}
                  size={16}
                  color={
                    tipoRefeicao === m.key ? themeColors.textInverse : themeColors.textSecondary
                  }
                />
                <Text
                  className={`text-sm font-medium ${
                    tipoRefeicao === m.key ? 'text-text-inverse' : 'text-text-secondary'
                  }`}
                >
                  {m.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {isError && (
        <Card className="items-center gap-2 py-6">
          <Ionicons name="cloud-offline-outline" size={28} color={themeColors.textSecondary} />
          <Text className="text-sm font-medium text-text-primary text-center">
            {t.cardapioErro}
          </Text>
          <Text className="text-xs text-text-secondary text-center">{t.cardapioErroDetalhe}</Text>
        </Card>
      )}

      {!isError && !isLoading && ruWithoutDinner && (
        <Card className="items-center gap-2 py-6">
          <Ionicons name="moon-outline" size={28} color={themeColors.textSecondary} />
          <Text className="text-sm font-medium text-text-primary text-center">
            {t.cardapioSemJantar.replace('{ru}', selectedRU?.label ?? '')}
          </Text>
          <Text className="text-xs text-text-secondary text-center">
            {t.cardapioSemJantarDetalhe}
          </Text>
        </Card>
      )}

      {!isError && !isLoading && !ruWithoutDinner && secoes.length === 0 && (
        <Card className="items-center gap-2 py-6">
          <Ionicons name="calendar-outline" size={28} color={themeColors.textSecondary} />
          <Text className="text-sm font-medium text-text-primary text-center">
            {t.cardapioIndisponivel}
          </Text>
          <Text className="text-xs text-text-secondary text-center">
            {t.cardapioIndisponivelDetalhe}
          </Text>
        </Card>
      )}

      {secoes.map((secao) => (
        <View key={secao.titulo} className="gap-2">
          <View className="flex-row items-center gap-2 bg-primary/10 rounded-xl px-3 py-2">
            <Ionicons
              name={secao.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={18}
              color={getIconColor(secao.icon)}
            />
            <Text className="text-xs font-bold text-primary uppercase">{secao.titulo}</Text>
          </View>
          <Card className="p-0 overflow-hidden">
            {secao.itens.map((item, idx) => (
              <View
                key={item.nome}
                className={`flex-row items-center justify-between px-3 py-2 ${
                  idx < secao.itens.length - 1 ? 'border-b border-outline-variant' : ''
                }`}
              >
                <Text className="text-sm text-text-primary">{item.nome}</Text>
                {item.vegano && (
                  <View className="bg-success/10 rounded-full px-2 py-0.5">
                    <Text className="text-[10px] font-medium text-success">{t.cardapioVegano}</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        </View>
      ))}

      <View className="h-4" />
    </ScrollView>
  )
}
