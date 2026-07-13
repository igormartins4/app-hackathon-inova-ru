import { Pressable, Text, View } from 'react-native'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { Button, Card, LoadingSpinner } from '@/shared/components/ui'
import { useThemeStore } from '@/store/themeStore'

const THEME_OPTIONS = [
  { value: 'system' as const, label: 'Sistema' },
  { value: 'light' as const, label: 'Claro' },
  { value: 'dark' as const, label: 'Escuro' },
]

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance()
  const { theme, setTheme } = useThemeStore()

  if (isBalanceLoading) {
    return <LoadingSpinner message="Carregando perfil" />
  }

  return (
    <View className="flex-1 bg-background p-4 gap-4">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
          <Text className="text-xl font-bold text-text-inverse">
            {user?.nome?.charAt(0) ?? '?'}
          </Text>
        </View>
        <View>
          <Text className="text-lg font-bold text-text-primary">{user?.nome ?? 'Estudante'}</Text>
          <Text className="text-sm text-text-secondary">{user?.email ?? 'email@ufmg.br'}</Text>
        </View>
      </View>

      {balanceData && (
        <Card accessibilityLabel="Informações da conta" accessibilityRole="summary">
          <View className="gap-3">
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Nome</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.nome}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Tipo</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.tipo_consumidor.descricao}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-sm text-text-secondary">Centro de Custo</Text>
              <Text className="text-sm font-medium text-text-primary">
                {balanceData.consumidor.centro_custo.descricao}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-text-secondary">Situação</Text>
              <Text
                className={`text-sm font-medium ${balanceData.consumidor.situacao === 'A' ? 'text-status-success' : 'text-status-error'}`}
              >
                {balanceData.consumidor.situacao === 'A' ? 'Ativo ✓' : 'Bloqueado'}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <Card accessibilityLabel="Preferências de tema" accessibilityRole="summary">
        <View className="gap-3">
          <Text className="text-sm font-semibold text-text-secondary">APARÊNCIA</Text>
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                accessibilityLabel={`Tema ${opt.label}`}
                accessibilityState={{ selected: theme === opt.value }}
                onPress={() => setTheme(opt.value)}
                className={`flex-1 items-center justify-center rounded-xl py-3 min-h-[48px] ${
                  theme === opt.value ? 'bg-primary' : 'bg-surface-variant border border-outline'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    theme === opt.value ? 'text-text-inverse' : 'text-text-primary'
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      <Button label="Sair" onPress={logout} variant="secondary" />
    </View>
  )
}
