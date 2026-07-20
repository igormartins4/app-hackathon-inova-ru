import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useThemeColors } from '@/config'
import type { FilialCode } from '@/features/cardapio'
import { MenuCalendar, RESTAURANTES_CARDAPIO, useCardapio } from '@/features/cardapio'
import { RU_INFO } from '@/features/restaurantes/data/ruInfo'
import { Button, Card, LoadingSpinner, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatFullWeekdayDate, isToday } from '@/shared/utils'
import { useFavoriteRUsStore } from '@/store'

type TipoRefeicao = 'almoco' | 'jantar'

function defaultMealForNow(): TipoRefeicao {
  return new Date().getHours() < 15 ? 'almoco' : 'jantar'
}

const PROTEINA_TITULOS = ['Prato Principal']
const SOBREMESA_TITULOS = ['Sobremesa']

export default function CardapioScreen() {
  const themeColors = useThemeColors()
  const { t, locale } = useI18n()
  const [restaurante, setRestaurante] = useState<FilialCode>('0003')
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicao>(defaultMealForNow)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const favorites = useFavoriteRUsStore((s) => s.favorites)
  const toggleFavorite = useFavoriteRUsStore((s) => s.toggle)
  const [showAll, setShowAll] = useState(false)

  const today = isToday(selectedDate)

  const visibleRestaurantes =
    favorites.length > 0 && !showAll
      ? RESTAURANTES_CARDAPIO.filter((r) => favorites.includes(r.key))
      : RESTAURANTES_CARDAPIO

  useEffect(() => {
    if (visibleRestaurantes.length > 0) {
      if (!visibleRestaurantes.some((r) => r.key === restaurante)) {
        setRestaurante(visibleRestaurantes[0].key)
      }
    }
  }, [visibleRestaurantes, restaurante])

  const selectedRU = RESTAURANTES_CARDAPIO.find((r) => r.key === restaurante)
  const ruWithoutDinner = selectedRU && !selectedRU.hasDinner && tipoRefeicao === 'jantar'

  const { data, isLoading, isError, refetch } = useCardapio({
    restaurante,
    tipoRefeicao,
    data: selectedDate,
  })

  const secoes = data?.secoes ?? []
  const secoesProteina = secoes.filter((secao) => PROTEINA_TITULOS.includes(secao.titulo))
  const secoesSobremesa = secoes.filter((secao) => SOBREMESA_TITULOS.includes(secao.titulo))
  const secoesSecundarias = secoes.filter(
    (secao) =>
      !PROTEINA_TITULOS.includes(secao.titulo) && !SOBREMESA_TITULOS.includes(secao.titulo),
  )

  const meals = [
    { key: 'almoco' as const, label: t.cardapioAlmoco, icon: 'sunny' },
    { key: 'jantar' as const, label: t.cardapioJantar, icon: 'moon' },
  ]

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-3 bg-primary z-10 shadow-md">
        <Text className="text-xl font-bold text-white">{t.cardapioTitle}</Text>
        <Text className="text-xs text-white/80 mt-0.5">{t.cardapioSubtitleConsulte}</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-5">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              {t.cardapioRestaurante}
            </Text>
            {favorites.length > 0 && (
              <View className="flex-row bg-surface-variant p-0.5 rounded-full border border-outline/20">
                <Pressable
                  onPress={() => setShowAll(true)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: showAll }}
                  className={`px-2.5 py-1 rounded-full ${showAll ? 'bg-primary' : ''}`}
                >
                  <Text className={`text-[11px] font-bold ${showAll ? 'text-white' : 'text-text-secondary'}`}>
                    Todos
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowAll(false)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: !showAll }}
                  className={`px-2.5 py-1 rounded-full flex-row items-center gap-1 ${!showAll ? 'bg-primary' : ''}`}
                >
                  <Ionicons name="star" size={11} color={!showAll ? '#ffffff' : themeColors.warning} />
                  <Text className={`text-[11px] font-bold ${!showAll ? 'text-white' : 'text-text-secondary'}`}>
                    Favoritos ({favorites.length})
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <View className="flex-row gap-2">
              {visibleRestaurantes.map((r) => {
                const isFav = favorites.includes(r.key)
                const selected = restaurante === r.key
                return (
                  <Pressable
                    key={r.key}
                    onPress={() => setRestaurante(r.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.cardapioRestaurante} ${r.label}`}
                    accessibilityState={{ selected }}
                    className={`flex-row items-center gap-1.5 rounded-full pl-4 pr-1.5 py-1.5 min-h-[48px] ${
                      selected ? 'bg-primary' : 'bg-surface border border-outline'
                    }`}
                  >
                    {selected && (
                      <Ionicons name="checkmark" size={16} color={themeColors.textInverse} />
                    )}
                    <Text
                      numberOfLines={1}
                      className={`text-sm font-medium ${
                        selected ? 'text-text-inverse' : 'text-text-primary'
                      }`}
                    >
                      {r.label}
                    </Text>
                    <Pressable
                      onPress={() => toggleFavorite(r.key)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isFav
                          ? `${t.back} ${r.label} ${t.cardapioFavoritos}`
                          : `${t.cardapioFavoritos} ${r.label}`
                      }
                      hitSlop={8}
                      className="w-9 h-9 rounded-full items-center justify-center"
                    >
                      <Ionicons
                        name={isFav ? 'star' : 'star-outline'}
                        size={16}
                        color={
                          isFav
                            ? themeColors.warning
                            : selected
                              ? themeColors.textInverse
                              : themeColors.textSecondary
                        }
                      />
                    </Pressable>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>
          {selectedRU && (
            <Text className="text-xs text-text-secondary" numberOfLines={1}>
              {RU_INFO[selectedRU.key]?.endereco ?? RU_INFO[selectedRU.key]?.campus}
            </Text>
          )}
          {favorites.length === 0 && !showAll && (
            <Text className="text-xs text-text-secondary">{t.cardapioNenhumFavorito}</Text>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-xs font-bold text-primary uppercase tracking-wider">
            {t.cardapioData}
          </Text>
          <Pressable
            onPress={() => setShowCalendar((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={`${formatFullWeekdayDate(selectedDate, locale)}${today ? ` · ${t.cardapioHoje}` : ''}`}
            accessibilityState={{ expanded: showCalendar }}
            className="flex-row items-center justify-between bg-surface border border-outline rounded-xl px-4 py-3 min-h-[48px]"
          >
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-text-primary">
                {formatFullWeekdayDate(selectedDate, locale)}
              </Text>
              {today && (
                <Text className="text-status-success text-xs font-bold"> · {t.cardapioHoje}</Text>
              )}
            </View>
            <Ionicons
              name={showCalendar ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={themeColors.textSecondary}
            />
          </Pressable>
          {!today && !showCalendar && (
            <Pressable
              onPress={() => setSelectedDate(new Date())}
              accessibilityRole="button"
              accessibilityLabel={t.cardapioVoltarParaHoje}
              className="self-start"
            >
              <Text className="text-xs font-semibold text-primary">{t.cardapioVoltarParaHoje}</Text>
            </Pressable>
          )}
          {showCalendar && (
            <Card className="p-3">
              <MenuCalendar
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d)
                  setShowCalendar(false)
                }}
              />
            </Card>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-xs font-bold text-primary uppercase tracking-wider">
            {t.cardapioMeal}
          </Text>
          <View className="flex-row gap-2">
            {meals.map((meal) => {
              const selected = tipoRefeicao === meal.key
              return (
                <Pressable
                  key={meal.key}
                  onPress={() => setTipoRefeicao(meal.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t.cardapioMeal} ${meal.label}`}
                  accessibilityState={{ selected }}
                  className="flex-1 flex-row items-center justify-center gap-2 py-3 min-h-[48px] rounded-xl border"
                  style={{
                    backgroundColor: selected ? themeColors.primary : themeColors.surface,
                    borderColor: selected ? themeColors.primary : themeColors.outline,
                  }}
                >
                  {selected && (
                    <Ionicons name="checkmark" size={16} color={themeColors.textInverse} />
                  )}
                  <Ionicons
                    name={meal.icon as React.ComponentProps<typeof Ionicons>['name']}
                    size={18}
                    color={selected ? themeColors.textInverse : themeColors.textSecondary}
                  />
                  <Text
                    className={`text-sm font-bold ${
                      selected ? 'text-text-inverse' : 'text-text-primary'
                    }`}
                  >
                    {meal.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {ruWithoutDinner && (
          <Card className="p-4 gap-1.5 border-amber-500/30 bg-amber-500/5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="alert-circle" size={18} color={themeColors.warning} />
              <Text className="text-sm font-bold text-text-primary">
                {t.cardapioSemJantar.replace('{ru}', selectedRU?.label ?? '')}
              </Text>
            </View>
            <Text className="text-xs text-text-secondary">{t.cardapioSemJantarDetalhe}</Text>
          </Card>
        )}

        {isLoading && <LoadingSpinner message={t.cardapioLoading} />}

        {isError && !ruWithoutDinner && (
          <Card className="p-4 gap-3">
            <Text className="text-sm font-bold text-status-error text-center">
              {t.cardapioErro}
            </Text>
            <Text className="text-xs text-text-secondary text-center">
              {t.cardapioErroDetalhe}
            </Text>
            <Button label={t.retry} onPress={() => refetch()} variant="secondary" />
          </Card>
        )}

        {!isLoading && !isError && secoes.length === 0 && !ruWithoutDinner && (
          <Card className="p-4 gap-1.5">
            <Text className="text-sm font-bold text-text-primary text-center">
              {t.cardapioIndisponivel}
            </Text>
            <Text className="text-xs text-text-secondary text-center">
              {t.cardapioIndisponivelDetalhe}
            </Text>
          </Card>
        )}

        {/* Cardápio do Dia — Bloco Único Consolidado */}
        {secoes.length > 0 && (
          <View className="gap-2">
            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              {t.cardapioTitle ?? 'Cardápio do Dia'}
            </Text>
            <Card className="p-0 overflow-hidden">
              {/* Prato Principal / Proteínas */}
              {secoesProteina.flatMap((s) => s.itens).map((item) => (
                <View
                  key={item.nome}
                  className="flex-row items-center justify-between px-4 py-3 border-b border-outline-variant"
                >
                  <Text className="flex-1 text-sm text-text-primary pr-3">
                    {item.nome}
                  </Text>
                  {item.vegano && (
                    <View className="bg-status-success/10 rounded-full px-2.5 py-1 flex-row items-center gap-1">
                      <Ionicons name="leaf" size={12} color={themeColors.success} />
                      <Text className="text-[10px] font-bold text-status-success">
                        {t.cardapioVegano}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Sobremesa */}
              {secoesSobremesa.flatMap((s) => s.itens).map((item) => (
                <View
                  key={item.nome}
                  className="flex-row items-center justify-between px-4 py-3 border-b border-outline-variant"
                >
                  <Text className="flex-1 text-sm text-text-primary pr-3">
                    {item.nome}
                  </Text>
                  {item.vegano && (
                    <View className="bg-status-success/10 rounded-full px-2.5 py-1 flex-row items-center gap-1">
                      <Ionicons name="leaf" size={12} color={themeColors.success} />
                      <Text className="text-[10px] font-bold text-status-success">
                        {t.cardapioVegano}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Acompanhamentos e Guarnições */}
              {secoesSecundarias.flatMap((s) => s.itens).map((item, idx, arr) => (
                <View
                  key={item.nome}
                  className={`flex-row items-center justify-between px-4 py-3 ${
                    idx < arr.length - 1 ? 'border-b border-outline-variant' : ''
                  }`}
                >
                  <Text className="flex-1 text-sm text-text-primary pr-3">
                    {item.nome}
                  </Text>
                  {item.vegano && (
                    <View className="bg-status-success/10 rounded-full px-2.5 py-1 flex-row items-center gap-1">
                      <Ionicons name="leaf" size={12} color={themeColors.success} />
                      <Text className="text-[10px] font-bold text-status-success">
                        {t.cardapioVegano}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </Card>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>
    </View>
  )
}
