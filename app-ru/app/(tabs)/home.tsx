import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useGradientColors, useThemeColors } from '@/config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { useConsumerStatus } from '@/features/balance/hooks/useConsumerStatus'
import { Card, ErrorMessage, LoadingSpinner } from '@/shared/components/ui'
import { getErrorMessage } from '@/shared/utils'

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

const QUICK_ACTIONS = [
  { key: 'saldo', label: 'Saldo', icon: 'wallet' as const },
  { key: 'cardapio', label: 'Cardápio', icon: 'book' as const },
  { key: 'historico', label: 'Histórico', icon: 'time' as const },
]

const MOCK_RECARGAS = [
  { id: 1, valor: 20, data: 'Hoje, 07:30', status: 'aprovado' },
  { id: 2, valor: 15, data: 'Ontem, 13:15', status: 'aprovado' },
  { id: 3, valor: 30, data: '22/06, 09:00', status: 'aprovado' },
]

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useBalance()
  const { isInactive, message } = useConsumerStatus()
  const themeColors = useThemeColors()
  const gradients = useGradientColors()

  if (isLoading) {
    return <LoadingSpinner message="Carregando" />
  }

  if (isInactive) {
    return (
      <View className="flex-1 bg-background px-4 pt-8">
        <ErrorMessage message={message ?? 'Conta inativa. Procure a FUMP.'} />
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

  const handleQuickAction = (key: string) => {
    switch (key) {
      case 'saldo':
        router.push('/(tabs)/balance')
        break
      case 'cardapio':
        router.push('/(tabs)/cardapio')
        break
      case 'historico':
        router.push('/(tabs)/historico')
        break
    }
  }

  const QUICK_ACTION_COLORS = [
    gradients.quickActionSaldo,
    gradients.quickActionCardapio,
    gradients.quickActionHistorico,
  ]

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-text-secondary">Bom dia,</Text>
            <Text
              accessibilityLabel={`Olá, ${user?.nome?.split(' ')[0] ?? 'Estudante'}`}
              className="text-2xl font-bold text-text-primary"
            >
              {user?.nome?.split(' ')[0] ?? 'Estudante'} 👋
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificações"
            className="w-10 h-10 rounded-full bg-surface items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={22} color={themeColors.primary} />
          </Pressable>
        </View>
      </View>

      <View className="px-4 mb-4">
        <LinearGradient
          colors={gradients.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16 }}
        >
          <View className="p-5">
            <Text className="text-xs font-medium text-white/70 uppercase tracking-wider">
              Saldo Disponível
            </Text>
            <Text
              accessibilityLabel={`Saldo disponível: ${formatCurrency(saldo)}`}
              className="text-4xl font-bold text-white mt-2"
            >
              {formatCurrency(saldo)}
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/recharge')}
              accessibilityRole="button"
              accessibilityLabel="Recarregar via PIX"
              className="flex-row items-center gap-2 bg-white/20 rounded-full px-4 py-2.5 mt-4 self-start min-h-[44px]"
            >
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-sm font-semibold text-white">Recarregar via PIX</Text>
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
            accessibilityLabel={action.label}
            className="flex-1 items-center justify-center gap-2 rounded-xl py-4 min-h-[80px]"
            style={{ backgroundColor: QUICK_ACTION_COLORS[index] }}
          >
            <Ionicons name={action.icon} size={28} color={themeColors.primary} />
            <Text className="text-sm font-medium text-text-primary">{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-text-primary">Últimas recargas</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/historico')}
            accessibilityRole="button"
            accessibilityLabel="Ver todo o histórico"
          >
            <Text className="text-sm font-semibold text-primary">Ver tudo</Text>
          </Pressable>
        </View>

        <Card className="p-0 overflow-hidden">
          {MOCK_RECARGAS.map((recarga, idx) => (
            <Pressable
              key={recarga.id}
              onPress={() => router.push('/(tabs)/historico')}
              className={`flex-row items-center gap-3 px-4 py-3 ${
                idx < MOCK_RECARGAS.length - 1 ? 'border-b border-outline-variant' : ''
              }`}
            >
              <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center">
                <Ionicons name="card" size={20} color={themeColors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-primary">Recarga PIX</Text>
                <Text className="text-xs text-text-secondary">{recarga.data}</Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-text-primary">
                  +{formatCurrency(recarga.valor)}
                </Text>
                <Text className="text-xs font-medium text-success">Aprovado</Text>
              </View>
            </Pressable>
          ))}
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

      <View className="px-4 mb-4">
        <LinearGradient
          colors={gradients.ruBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 12 }}
        >
          <View className="flex-row items-center gap-3 p-4">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
              <Ionicons name="restaurant" size={20} color={themeColors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-text-primary">RU Pampulha</Text>
              <Text className="text-xs text-success font-medium">Aberto agora</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View className="h-4" />
    </View>
  )
}
