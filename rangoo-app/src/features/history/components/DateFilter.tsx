import { Pressable, View } from 'react-native'
import { Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { toDateParam } from '@/shared/utils'

interface DateFilterProps {
  /** Dias do preset atualmente aplicado no pai (null = "Todos"), pra este
   * componente nunca divergir do filtro que a query realmente usa. */
  selected: number | null
  onFilter: (days: number | null, start: string | null, end: string | null) => void
}

export function DateFilter({ selected, onFilter }: DateFilterProps) {
  const { t } = useI18n()
  const QUICK_OPTIONS = [
    { label: t.dateFilter7Days, days: 7 },
    { label: t.dateFilter30Days, days: 30 },
    { label: t.cardapioTodos, days: null },
  ] as const

  const handlePress = (days: number | null) => {
    if (days === null) {
      onFilter(null, null, null)
    } else {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days)
      onFilter(days, toDateParam(start), toDateParam(end))
    }
  }

  return (
    <View
      accessibilityLabel={t.historicoFiltrarPeriodo}
      accessibilityRole="search"
      className="flex-row gap-2"
    >
      {QUICK_OPTIONS.map((opt) => (
        <Pressable
          key={opt.label}
          accessibilityRole="button"
          accessibilityLabel={t.dateFilterByA11y.replace('{label}', opt.label)}
          accessibilityState={{ selected: selected === opt.days }}
          onPress={() => handlePress(opt.days)}
          className={`rounded-lg px-4 py-2.5 min-h-[48px] items-center justify-center ${
            selected === opt.days ? 'bg-primary' : 'bg-surface-variant'
          }`}
        >
          <Text
            className={`text-sm font-medium ${selected === opt.days ? 'text-text-inverse' : 'text-text-primary'}`}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
