import { Pressable, ScrollView, View } from 'react-native'
import { RESTAURANTES_OFICIAIS } from '@/config'
import { Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'

interface FilialFilterProps {
  /** Código do RU atualmente aplicado no pai (null = "Todos"), pra este
   * componente nunca divergir do filtro que a query realmente usa. */
  selected: string | null
  onFilter: (codigo: string | null) => void
}

export function FilialFilter({ selected, onFilter }: FilialFilterProps) {
  const { t } = useI18n()
  const handlePress = (codigo: string | null) => {
    onFilter(codigo)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={t.filialFilterA11yLabel}
      accessibilityRole="search"
    >
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.filialFilterAllA11y}
          accessibilityState={{ selected: selected === null }}
          onPress={() => handlePress(null)}
          className={`rounded-lg px-4 py-2.5 min-h-[48px] items-center justify-center ${
            selected === null ? 'bg-primary' : 'bg-surface-variant'
          }`}
        >
          <Text
            className={`text-sm font-medium ${selected === null ? 'text-text-inverse' : 'text-text-primary'}`}
          >
            {t.cardapioTodos}
          </Text>
        </Pressable>
        {RESTAURANTES_OFICIAIS.map((ru) => (
          <Pressable
            key={ru.codigo}
            accessibilityRole="button"
            accessibilityLabel={t.filialFilterByA11y.replace('{nome}', ru.nome)}
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
