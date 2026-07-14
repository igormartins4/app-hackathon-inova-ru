import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import type { MenuSection } from '@/features/cardapio'
import { MenuCalendar } from '@/features/cardapio'
import { Card, LoadingSpinner } from '@/shared/components/ui'

// Códigos de filial conforme Anexo A da especificação técnica — nunca inventar código/nome de RU.
type Restaurante = '0001' | '0002' | '0003' | '0004' | '0005'
type TipoRefeicao = 'almoco' | 'jantar'

const RESTAURANTES: { key: Restaurante; label: string }[] = [
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

// Mock data — replace with useCardapio hook when API is available
const MOCK_MENU: Record<Restaurante, Record<TipoRefeicao, MenuSection[]>> = {
  '0003': {
    almoco: [
      {
        titulo: 'Entrada',
        icon: 'leaf',
        itens: [
          { nome: 'Salada de Alface', vegano: true },
          { nome: 'Salada de Tomate', vegano: true },
          { nome: 'Cenoura Ralada', vegano: true },
        ],
      },
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz Branco', vegano: true },
          { nome: 'Feijão Carioca', vegano: true },
          { nome: 'Frango Grelhado', vegano: false },
          { nome: 'Macarrão ao Molho', vegano: true },
        ],
      },
      {
        titulo: 'Sobremesa',
        icon: 'ice-cream',
        itens: [
          { nome: 'Pudim de Leite', vegano: false },
          { nome: 'Fruta da Temporada', vegano: true },
        ],
      },
    ],
    jantar: [
      {
        titulo: 'Entrada',
        icon: 'leaf',
        itens: [
          { nome: 'Sopa de Legumes', vegano: true },
          { nome: 'Salada Verde', vegano: true },
        ],
      },
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz Integral', vegano: true },
          { nome: 'Feijão Preto', vegano: true },
          { nome: 'Carne Moída', vegano: false },
          { nome: 'Omelete', vegano: false },
        ],
      },
    ],
  },
  '0002': {
    almoco: [
      {
        titulo: 'Entrada',
        icon: 'leaf',
        itens: [
          { nome: 'Salada de Repolho', vegano: true },
          { nome: 'Vinagrete', vegano: true },
        ],
      },
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz com Açafrão', vegano: true },
          { nome: 'Feijão Branco', vegano: true },
          { nome: 'Peixe Grelhado', vegano: false },
          { nome: 'Legumes Refogados', vegano: true },
        ],
      },
    ],
    jantar: [
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz', vegano: true },
          { nome: 'Feijão', vegano: true },
          { nome: 'Ovo Frito', vegano: false },
        ],
      },
    ],
  },
  '0001': {
    almoco: [
      {
        titulo: 'Entrada',
        icon: 'leaf',
        itens: [
          { nome: 'Salada Caesar', vegano: false },
          { nome: 'Sopa Minestrone', vegano: true },
        ],
      },
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz Integral', vegano: true },
          { nome: 'Feijão Carioca', vegano: true },
          { nome: 'Lombo Grelhado', vegano: false },
          { nome: 'Brócolis no Vapor', vegano: true },
        ],
      },
    ],
    jantar: [
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz', vegano: true },
          { nome: 'Feijão', vegano: true },
          { nome: 'Frango ao Molho', vegano: false },
        ],
      },
    ],
  },
  '0004': {
    almoco: [
      {
        titulo: 'Entrada',
        icon: 'leaf',
        itens: [{ nome: 'Salada Mix', vegano: true }],
      },
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz', vegano: true },
          { nome: 'Feijão', vegano: true },
          { nome: 'Carne Seca', vegano: false },
          { nome: 'Mandioca Cozida', vegano: true },
        ],
      },
    ],
    jantar: [
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz', vegano: true },
          { nome: 'Feijão', vegano: true },
          { nome: 'Sardinha', vegano: false },
        ],
      },
    ],
  },
  '0005': {
    almoco: [
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz', vegano: true },
          { nome: 'Feijão', vegano: true },
          { nome: 'Frango Assado', vegano: false },
        ],
      },
    ],
    jantar: [
      {
        titulo: 'Prato Principal',
        icon: 'restaurant',
        itens: [
          { nome: 'Arroz', vegano: true },
          { nome: 'Feijão', vegano: true },
          { nome: 'Sopa de Legumes', vegano: true },
        ],
      },
    ],
  },
}

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
  const [restaurante, setRestaurante] = useState<Restaurante>('0003')
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicao>('almoco')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading] = useState(false)

  // To use real API, replace MOCK_MENU with:
  // const { data } = useCardapio({ restaurante, tipoRefeicao, data: selectedDate })
  // const secoes = data?.secoes ?? []
  const secoes = MOCK_MENU[restaurante][tipoRefeicao]
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
