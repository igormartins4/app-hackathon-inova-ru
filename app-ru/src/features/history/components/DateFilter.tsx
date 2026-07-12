import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

interface DateFilterProps {
  onFilter: (start: string | null, end: string | null) => void
}

const QUICK_OPTIONS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: 'Todos', days: null },
] as const

export function DateFilter({ onFilter }: DateFilterProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const handlePress = (days: number | null) => {
    setSelected(days)
    if (days === null) {
      onFilter(null, null)
    } else {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days)
      onFilter(start.toISOString(), end.toISOString())
    }
  }

  return (
    <View
      accessibilityLabel="Filtro de período"
      accessibilityRole="search"
      className="flex-row gap-2"
    >
      {QUICK_OPTIONS.map((opt) => (
        <Pressable
          key={opt.label}
          accessibilityRole="button"
          accessibilityLabel={`Filtrar por ${opt.label}`}
          accessibilityState={{ selected: selected === opt.days }}
          onPress={() => handlePress(opt.days)}
          className={`rounded-lg px-4 py-2 ${
            selected === opt.days ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`text-sm font-medium ${selected === opt.days ? 'text-white' : 'text-gray-700'}`}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
