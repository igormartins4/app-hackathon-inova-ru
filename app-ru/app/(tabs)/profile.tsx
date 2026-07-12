import { useRouter } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBalance } from '@/features/balance/hooks/useBalance'
import { Button, Card, LoadingSpinner } from '@/shared/components/ui'

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text accessibilityRole="text" className="text-sm text-gray-500">
        {label}
      </Text>
      <Text
        accessibilityLabel={`${label}: ${value}`}
        accessibilityRole="text"
        className="text-sm font-medium text-gray-900"
      >
        {value}
      </Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { user } = useAuth()
  const { data, isLoading } = useBalance()
  const router = useRouter()

  if (isLoading) {
    return <LoadingSpinner message="Carregando perfil" />
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="p-4 gap-4">
      <Card accessibilityLabel="Dados do usuário" accessibilityRole="region">
        <Text accessibilityRole="text" className="text-lg font-semibold text-gray-900 mb-2">
          Dados Pessoais
        </Text>
        <DataRow label="Nome" value={user?.nome ?? '—'} />
        <DataRow label="E-mail" value={user?.email ?? '—'} />
      </Card>

      {data && (
        <Card accessibilityLabel="Dados do consumidor" accessibilityRole="region">
          <Text accessibilityRole="text" className="text-lg font-semibold text-gray-900 mb-2">
            Dados do Consumidor
          </Text>
          <DataRow label="Tipo" value={data.consumidor.tipo_consumidor.descricao} />
          <DataRow label="Centro de custo" value={data.consumidor.centro_custo.descricao} />
          <DataRow
            label="Situação"
            value={
              data.consumidor.situacao === 'A'
                ? 'Ativo'
                : data.consumidor.situacao === 'B'
                  ? 'Bloqueado'
                  : 'Inativo'
            }
          />
        </Card>
      )}

      <Button label="Ver Histórico" onPress={() => router.push('/history')} />
    </ScrollView>
  )
}
