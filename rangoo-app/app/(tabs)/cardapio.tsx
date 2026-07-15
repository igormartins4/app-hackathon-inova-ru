import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import type { FilialCode } from '@/features/cardapio'
import { MenuCalendar, useCardapio } from '@/features/cardapio'
import { Card, LoadingSpinner } from '@/shared/components/ui'
import { isToday } from '@/shared/utils'

type TipoRefeicao = 'almoco' | 'jantar'

const RESTAURANTES: { key: FilialCode; label: string; hasDinner: boolean }[] = [
  { key: '0003', label: 'Setorial 1', hasDinner: true },
  { key: '0002', label: 'Setorial 2', hasDinner: false },
  { key: '0001', label: 'Saúde/Direito', hasDinner: true },
  { key: '0004', label: 'ICA', hasDinner: true },
  { key: '0005', label: 'HRTN', hasDinner: false },
]

const MEALS: { key: TipoRefeicao; label: string; icon: string }[] = [
  { key: 'almoco', label: 'Almoço', icon: 'sunny' },
  { key: 'jantar', label: 'Jantar', icon: 'moon' },
]

const FAVORITES_KEY = '@rangoo_favorite_rus'

function formatDate(date: Date): string {
  const days = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ]
  const months = [
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
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`
}

export default function CardapioScreen() {
  const themeColors = useThemeColors()
  const [restaurante, setRestaurante] = useState<FilialCode>('0003')
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicao>('almoco')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [favorites, setFavorites] = useState<FilialCode[]>([])
  const [showAll, setShowAll] = useState(true)

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
    ? RESTAURANTES
    : RESTAURANTES.filter((r) => favorites.includes(r.key))

  const { data, isLoading, isError } = useCardapio({
    restaurante,
    tipoRefeicao,
    data: selectedDate,
  })
  const secoes = data?.secoes ?? []
  const today = isToday(selectedDate)

  const selectedRU = RESTAURANTES.find((r) => r.key === restaurante)
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

  if (isLoading) {
    return <LoadingSpinner message="Carregando cardápio" />
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 gap-5">
      <View>
        <Text className="text-xs text-text-secondary">Consulte o menu do dia nos RUs da UFMG</Text>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-primary uppercase tracking-wider">
            Restaurante Universitário
          </Text>
          {favorites.length > 0 && (
            <Pressable
              onPress={() => setShowAll((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showAll ? 'Mostrar favoritos' : 'Mostrar todos'}
            >
              <Text className="text-xs font-semibold text-primary">
                {showAll ? 'Favoritos' : 'Todos'}
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
                  accessibilityLabel={`Restaurante ${r.label}`}
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
                    isFav ? `Remover ${r.label} dos favoritos` : `Favoritar ${r.label}`
                  }
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
          <Text className="text-xs text-text-secondary">
            Nenhum favorito selecionado. Toque na estrela para favoritar.
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">Data</Text>
        <MenuCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <Pressable
          onPress={() => !today && setSelectedDate(new Date())}
          accessibilityRole="button"
          accessibilityLabel={today ? 'Data de hoje' : 'Voltar para hoje'}
          className="flex-row items-center gap-1"
        >
          <Text className="text-sm font-medium text-text-primary">{formatDate(selectedDate)}</Text>
          {today ? (
            <Text className="text-success text-xs font-bold"> · Hoje</Text>
          ) : (
            <Text className="text-primary text-xs font-bold"> · Voltar para hoje</Text>
          )}
        </Pressable>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">Refeição</Text>
        <View className="flex-row bg-surface-variant rounded-full p-1">
          {MEALS.map((m) => {
            const disabled =
              !showAll &&
              !RESTAURANTES.find((r) => r.key === restaurante)?.hasDinner &&
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
            Não foi possível carregar o cardápio agora
          </Text>
          <Text className="text-xs text-text-secondary text-center">
            O cardápio vem direto do site da FUMP e pode estar temporariamente indisponível.
          </Text>
        </Card>
      )}

      {!isError && !isLoading && ruWithoutDinner && (
        <Card className="items-center gap-2 py-6">
          <Ionicons name="moon-outline" size={28} color={themeColors.textSecondary} />
          <Text className="text-sm font-medium text-text-primary text-center">
            {selectedRU?.label} não serve janta
          </Text>
          <Text className="text-xs text-text-secondary text-center">
            Selecione outro restaurante para ver o cardápio do jantar.
          </Text>
        </Card>
      )}

      {!isError && !isLoading && !ruWithoutDinner && secoes.length === 0 && (
        <Card className="items-center gap-2 py-6">
          <Ionicons name="restaurant-outline" size={28} color={themeColors.textSecondary} />
          <Text className="text-sm font-medium text-text-primary text-center">
            Cardápio não disponível para este RU nesta data
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
                    <Text className="text-[10px] font-medium text-success">Vegano</Text>
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
