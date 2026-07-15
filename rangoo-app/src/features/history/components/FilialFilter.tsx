import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { RESTAURANTES_OFICIAIS } from '@/config'
import { Text } from '@/shared/components/ui'

interface FilialFilterProps {
  onFilter: (codigo: string | null) => void
}

export function FilialFilter({ onFilter }: FilialFilterProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handlePress = (codigo: string | null) => {
    setSelected(codigo)
    onFilter(codigo)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Filtro de restaurante"
      accessibilityRole="search"
    >
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Todos os restaurantes"
          accessibilityState={{ selected: selected === null }}
          onPress={() => handlePress(null)}
          className={`rounded-lg px-4 py-2.5 min-h-[48px] items-center justify-center ${
            selected === null ? 'bg-primary' : 'bg-surface-variant'
          }`}
        >
          <Text
            className={`text-sm font-medium ${selected === null ? 'text-text-inverse' : 'text-text-primary'}`}
          >
            Todos
          </Text>
        </Pressable>
        {RESTAURANTES_OFICIAIS.map((ru) => (
          <Pressable
            key={ru.codigo}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por ${ru.nome}`}
            accessibilityState={{ selected: selected === ru.codigo }}
            onPress={() => handlePress(ru.codigo)}
            className={`rounded-lg px-4 py-2.5 min-h-[48px] items-center justify-center ${
              selected === ru.codigo ? 'bg-primary' : 'bg-surface-variant'
            }`}
          >
            <Text
              className={`text-sm font-medium ${selected === ru.codigo ? 'text-text-inverse' : 'text-text-primary'}`}
            >
              {ru.nome}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
