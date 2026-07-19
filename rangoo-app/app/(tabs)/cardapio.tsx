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

// Almoço nos RUs normalmente vai até meio da tarde; depois disso é mais
// provável que o estudante que abrir o cardápio esteja pensando na janta.
// Só um default — o toggle continua trocável a qualquer momento.
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
  const [showAll, setShowAll] = useState(true)
  const favorites = useFavoriteRUsStore((state) => state.favorites)
  const favoritesInitialized = useFavoriteRUsStore((state) => state.initialized)
  const initializeFavorites = useFavoriteRUsStore((state) => state.initialize)
  const toggleStoredFavorite = useFavoriteRUsStore((state) => state.toggle)

  useEffect(() => {
    if (!favoritesInitialized) initializeFavorites()
  }, [favoritesInitialized, initializeFavorites])

  const toggleFavorite = useCallback(
    async (code: FilialCode) => {
      await toggleStoredFavorite(code)
    },
    [toggleStoredFavorite],
  )

  const visibleRestaurantes = showAll
    ? RESTAURANTES_CARDAPIO
    : RESTAURANTES_CARDAPIO.filter((r) => favorites.includes(r.key))

  const { data, isLoading, isError, refetch } = useCardapio({
    restaurante,
    tipoRefeicao,
    data: selectedDate,
  })
  const secoes = data?.secoes ?? []
  // Ordem de leitura: proteína (com a opção vegetariana já na mesma seção) no
  // topo, acompanhamentos num bloco secundário mais discreto no meio, e
  // sobremesa por último.
  const secoesProteina = secoes.filter((secao) => PROTEINA_TITULOS.includes(secao.titulo))
  const secoesSobremesa = secoes.filter((secao) => SOBREMESA_TITULOS.includes(secao.titulo))
  const secoesSecundarias = secoes.filter(
    (secao) =>
      !PROTEINA_TITULOS.includes(secao.titulo) && !SOBREMESA_TITULOS.includes(secao.titulo),
  )
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
                  {/* Estrela DENTRO do balão do próprio RU — antes ficava como
                      um botão irmão ao lado, ambíguo sobre a qual chip
                      pertencia numa fileira horizontal com vários RUs. */}
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
            hitSlop={8}
            className="self-start min-h-[48px] justify-center"
          >
            <Text className="text-primary text-xs font-bold">{t.cardapioVoltarParaHoje}</Text>
          </Pressable>
        )}
        {showCalendar && (
          <MenuCalendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date)
              setShowCalendar(false)
            }}
          />
        )}
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
        <Card className="items-center gap-3 py-6">
          <Ionicons name="cloud-offline-outline" size={28} color={themeColors.textSecondary} />
          <Text className="text-sm font-medium text-text-primary text-center">
            {t.cardapioErro}
          </Text>
          <Text className="text-xs text-text-secondary text-center">{t.cardapioErroDetalhe}</Text>
          <Button label={t.retry} onPress={() => refetch()} variant="secondary" />
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

      {secoesProteina.map((secao) => (
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
                <Text className="flex-1 text-sm text-text-primary" numberOfLines={2}>
                  {item.nome}
                </Text>
                {item.vegano && (
                  <View className="bg-status-success/10 rounded-full px-2 py-0.5">
                    <Text className="text-[10px] font-medium text-status-success">
                      {t.cardapioVegano}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        </View>
      ))}

      {/* Acompanhamentos (entrada, arroz, feijão, bebida etc.) — bloco mais
          discreto no meio, entre a proteína em destaque acima e a sobremesa
          em destaque logo abaixo. */}
      {secoesSecundarias.length > 0 && (
        <View className="gap-2">
          <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {t.cardapioAcompanhamentos}
          </Text>
          <Card className="p-0 overflow-hidden">
            {secoesSecundarias.map((secao, secaoIdx) => (
              <View
                key={secao.titulo}
                className={
                  secaoIdx < secoesSecundarias.length - 1 ? 'border-b border-outline-variant' : ''
                }
              >
                <Text className="text-[10px] font-bold text-text-secondary uppercase px-3 pt-2">
                  {secao.titulo}
                </Text>
                {secao.itens.map((item, idx) => (
                  <View
                    key={item.nome}
                    className={`flex-row items-center justify-between px-3 py-2 ${
                      idx < secao.itens.length - 1 ? 'border-b border-outline-variant' : ''
                    }`}
                  >
                    <Text className="flex-1 text-sm text-text-secondary" numberOfLines={2}>
                      {item.nome}
                    </Text>
                    {item.vegano && (
                      <View className="bg-status-success/10 rounded-full px-2 py-0.5">
                        <Text className="text-[10px] font-medium text-status-success">
                          {t.cardapioVegano}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </Card>
        </View>
      )}

      {secoesSobremesa.map((secao) => (
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
                <Text className="flex-1 text-sm text-text-primary" numberOfLines={2}>
                  {item.nome}
                </Text>
                {item.vegano && (
                  <View className="bg-status-success/10 rounded-full px-2 py-0.5">
                    <Text className="text-[10px] font-medium text-status-success">
                      {t.cardapioVegano}
                    </Text>
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
