import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import type { FilialCode } from '@/features/cardapio'
import { MenuCalendar, useCardapio } from '@/features/cardapio'
import { Card, LoadingSpinner } from '@/shared/components/ui'

type TipoRefeicao = 'almoco' | 'jantar'

// Códigos de filial conforme Anexo A da especificação técnica — nunca inventar código/nome de RU.
const RESTAURANTES: { key: FilialCode; label: string }[] = [
  { key: '0003', label: 'Setorial 1' },
  { key: '0002', label: 'Setorial 2' },
  { key: '0001', label: 'Saúde/Direito' },
  { key: '0004', label: 'ICA' },
  { key: '0005', label: 'HRTN' },
]

const MEALS: { key: TipoRefeicao; label: string; icon: string }[] = [
  { key: 'almoco', label: 'Almoço', icon: 'sunny' },
  { key: 'jantar', label: 'Jantar', icon: 'moon' },
]

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

  const { data, isLoading, isError } = useCardapio({
    restaurante,
    tipoRefeicao,
    data: selectedDate,
  })
  const secoes = data?.secoes ?? []
  const isToday = selectedDate.toDateString() === new Date().toDateString()

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
        <Text className="text-2xl font-bold text-text-primary">Cardápio</Text>
        <Text className="text-sm text-text-secondary mt-1">
          Consulte o menu do dia nos RUs da UFMG
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          Restaurante Universitário
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          {RESTAURANTES.map((r) => (
            <Pressable
              key={r.key}
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
          ))}
        </ScrollView>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">Data</Text>
        <MenuCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <Text className="text-sm font-medium text-text-primary">
          {formatDate(selectedDate)}
          {isToday && <Text className="text-success"> · Hoje</Text>}
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">Refeição</Text>
        <View className="flex-row bg-surface-variant rounded-full p-1">
          {MEALS.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => setTipoRefeicao(m.key)}
              accessibilityRole="button"
              accessibilityLabel={m.label}
              accessibilityState={{ selected: tipoRefeicao === m.key }}
              className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3 min-h-[48px] ${
                tipoRefeicao === m.key ? 'bg-primary' : ''
              }`}
            >
              {tipoRefeicao === m.key && (
                <Ionicons name="checkmark" size={16} color={themeColors.textInverse} />
              )}
              <Ionicons
                name={m.icon as React.ComponentProps<typeof Ionicons>['name']}
                size={16}
                color={tipoRefeicao === m.key ? themeColors.textInverse : themeColors.textSecondary}
              />
              <Text
                className={`text-sm font-medium ${
                  tipoRefeicao === m.key ? 'text-text-inverse' : 'text-text-secondary'
                }`}
              >
                {m.label}
              </Text>
            </Pressable>
          ))}
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

      {!isError && !isLoading && secoes.length === 0 && (
        <Card className="items-center gap-2 py-6">
          <Ionicons name="restaurant-outline" size={28} color={themeColors.textSecondary} />
          <Text className="text-sm font-medium text-text-primary text-center">
            Cardápio não disponível para este RU nesta data
          </Text>
        </Card>
      )}

      {secoes.map((secao) => (
        <View key={secao.titulo} className="gap-3">
          <View className="flex-row items-center gap-2 bg-primary/10 rounded-xl px-4 py-3">
            <Ionicons
              name={secao.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={20}
              color={getIconColor(secao.icon)}
            />
            <Text className="text-sm font-bold text-primary uppercase">{secao.titulo}</Text>
          </View>
          <Card className="p-0 overflow-hidden">
            {secao.itens.map((item, idx) => (
              <View
                key={item.nome}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  idx < secao.itens.length - 1 ? 'border-b border-outline-variant' : ''
                }`}
              >
                <Text className="text-sm text-text-primary">{item.nome}</Text>
                {item.vegano && (
                  <View className="bg-success/10 rounded-full px-3 py-1">
                    <Text className="text-xs font-medium text-success">Vegano</Text>
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
