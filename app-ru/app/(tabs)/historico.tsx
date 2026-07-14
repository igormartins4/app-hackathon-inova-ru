import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useThemeColors } from '@/config'
import { LoadingSpinner } from '@/shared/components/ui'

type Tab = 'recargas' | 'refeicoes'

interface RecargaItem {
  id: number
  valor: number
  status: 'aprovado' | 'expirado' | 'rejeitado'
  data: string
  hora: string
}

interface RefeicaoItem {
  id: number
  local: string
  valor: number
  data: string
  hora: string
  quantidade: number
}

const MOCK_RECARGAS: RecargaItem[] = [
  { id: 1, valor: 20, status: 'aprovado', data: 'Hoje', hora: '09:53' },
  { id: 2, valor: 15, status: 'aprovado', data: 'Ontem', hora: '13:15' },
  { id: 3, valor: 30, status: 'aprovado', data: '22/06', hora: '09:00' },
  { id: 4, valor: 10, status: 'expirado', data: '20/06', hora: '18:22' },
  { id: 5, valor: 25, status: 'aprovado', data: '18/06', hora: '11:05' },
]

const MOCK_REFEICOES: RefeicaoItem[] = [
  { id: 1, local: 'Setorial I', valor: 0, data: 'Hoje', hora: '12:30', quantidade: 1 },
  { id: 2, local: 'Setorial II', valor: 0, data: 'Ontem', hora: '19:15', quantidade: 1 },
  { id: 3, local: 'Saúde', valor: 0, data: '22/06', hora: '12:00', quantidade: 1 },
  { id: 4, local: 'Setorial I', valor: 0, data: '21/06', hora: '18:45', quantidade: 1 },
]

const STATUS_CONFIG = {
  aprovado: { color: 'text-success', bg: 'bg-success/10', icon: 'checkmark-circle' as const },
  expirado: { color: 'text-status-error', bg: 'bg-status-error/10', icon: 'close-circle' as const },
  rejeitado: {
    color: 'text-status-error',
    bg: 'bg-status-error/10',
    icon: 'close-circle' as const,
  },
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

export default function HistoricoScreen() {
  const themeColors = useThemeColors()
  const [activeTab, setActiveTab] = useState<Tab>('recargas')
  const [isLoading] = useState(false)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'recargas', label: 'Recargas' },
    { key: 'refeicoes', label: 'Refeições' },
  ]

  const renderRecarga = useCallback(
    ({ item }: { item: RecargaItem }) => {
      const config = STATUS_CONFIG[item.status]
      return (
        <View
          accessibilityLabel={`Recarga de ${formatCurrency(item.valor)} — ${item.status}`}
          className="flex-row items-center gap-3 px-1 py-3"
        >
          <View className={`w-10 h-10 rounded-full ${config.bg} items-center justify-center`}>
            <Ionicons
              name={config.icon}
              size={22}
              color={themeColors[config.color === 'text-success' ? 'success' : 'error']}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-text-primary">Recarga PIX</Text>
            <Text className="text-xs text-text-secondary">
              {item.data}, {item.hora}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-text-primary">
              {formatCurrency(item.valor)}
            </Text>
            <Text className={`text-xs font-medium ${config.color}`}>
              {item.status === 'aprovado' ? 'Aprovado' : 'Expirado'}
            </Text>
          </View>
        </View>
      )
    },
    [themeColors],
  )

  const renderRefeicao = useCallback(
    ({ item }: { item: RefeicaoItem }) => (
      <View
        accessibilityLabel={`Refeição em ${item.local}`}
        className="flex-row items-center gap-3 px-1 py-3"
      >
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
          <Ionicons name="restaurant" size={22} color={themeColors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-text-primary">{item.local}</Text>
          <Text className="text-xs text-text-secondary">
            {item.data}, {item.hora}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-bold text-text-primary">Gratuita</Text>
        </View>
      </View>
    ),
    [themeColors],
  )

  if (isLoading) {
    return <LoadingSpinner message="Carregando histórico" />
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-text-primary">Histórico</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filtrar"
          className="w-10 h-10 rounded-full bg-surface items-center justify-center"
        >
          <Ionicons name="filter" size={20} color={themeColors.primary} />
        </Pressable>
      </View>

      <View className="flex-row px-4 gap-1 mb-2">
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: activeTab === t.key }}
            className={`flex-1 items-center py-3 min-h-[48px] ${
              activeTab === t.key ? 'border-b-2 border-primary' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === t.key ? 'text-primary font-bold' : 'text-text-secondary'
              }`}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'recargas' ? (
        <FlatList
          data={MOCK_RECARGAS}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRecarga}
          contentContainerClassName="px-4"
          ItemSeparatorComponent={() => <View className="h-px bg-outline-variant mx-1" />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-center text-text-secondary">
                Você ainda não fez recargas no período.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={MOCK_REFEICOES}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRefeicao}
          contentContainerClassName="px-4"
          ItemSeparatorComponent={() => <View className="h-px bg-outline-variant mx-1" />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-center text-text-secondary">
                Nenhuma refeição encontrada no período.
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}
