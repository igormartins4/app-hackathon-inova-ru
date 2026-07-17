import { Ionicons } from '@expo/vector-icons'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Text } from '@/shared/components/ui'

interface MenuCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

const WEEKDAYS = [
  { key: 'dom', label: 'D' },
  { key: 'seg', label: 'S' },
  { key: 'ter', label: 'T' },
  { key: 'qua', label: 'Q' },
  { key: 'qui', label: 'Q' },
  { key: 'sex', label: 'S' },
  { key: 'sab', label: 'S' },
] as const
const MONTH_LABELS = [
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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

interface CalendarCell {
  date: Date
  inMonth: boolean
}

/** Grade de semanas do mês — células fora do mês (padding de dias do mês
 * anterior/seguinte) usam a data real como chave estável, mas não são
 * selecionáveis, deixando claro que só dias do mês visível valem. */
function buildMonthGrid(monthDate: Date): CalendarCell[][] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const startWeekday = new Date(year, month, 1).getDay()

  const cells: CalendarCell[] = []
  for (let i = startWeekday; i > 0; i--) {
    cells.push({ date: new Date(year, month, 1 - i), inMonth: false })
  }
  for (let day = 1; day <= totalDays; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true })
  }
  let trailing = 1
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, trailing), inMonth: false })
    trailing++
  }

  const weeks: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

export function MenuCalendar({ selectedDate, onSelectDate }: MenuCalendarProps) {
  const themeColors = useThemeColors()
  const today = useMemo(() => new Date(), [])
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate))

  // Se o dia selecionado mudar pra outro mês por fora (ex.: botão "voltar
  // pra hoje"), o calendário acompanha em vez de continuar mostrando um mês
  // sem o dia marcado.
  useEffect(() => {
    setViewMonth((prev) => (isSameMonth(prev, selectedDate) ? prev : startOfMonth(selectedDate)))
  }, [selectedDate])

  const weeks = useMemo(() => buildMonthGrid(viewMonth), [viewMonth])

  const handlePreviousMonth = () => setViewMonth((d) => addMonths(d, -1))
  const handleNextMonth = () => setViewMonth((d) => addMonths(d, 1))

  return (
    <View
      accessibilityLabel="Calendário de cardápio"
      className="bg-surface border border-outline rounded-2xl p-3 gap-3"
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handlePreviousMonth}
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          hitSlop={6}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color={themeColors.textSecondary} />
        </Pressable>
        <Text className="text-sm font-bold text-text-primary">
          {MONTH_LABELS[viewMonth.getMonth()]} de {viewMonth.getFullYear()}
        </Text>
        <Pressable
          onPress={handleNextMonth}
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          hitSlop={6}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </Pressable>
      </View>

      <View className="flex-row justify-between">
        {WEEKDAYS.map((weekday) => (
          <View key={weekday.key} className="w-9 items-center">
            <Text className="text-xs text-text-secondary font-medium">{weekday.label}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={week[0].date.toISOString()} className="flex-row justify-between">
          {week.map((cell) => {
            if (!cell.inMonth) {
              return <View key={cell.date.toISOString()} className="w-9 h-9" />
            }
            const isSelected = isSameDay(cell.date, selectedDate)
            const isToday = isSameDay(cell.date, today)
            return (
              <Pressable
                key={cell.date.toISOString()}
                onPress={() => onSelectDate(cell.date)}
                accessibilityRole="button"
                accessibilityLabel={`Dia ${cell.date.getDate()} de ${MONTH_LABELS[cell.date.getMonth()]}${isToday ? ', hoje' : ''}`}
                accessibilityState={{ selected: isSelected }}
                hitSlop={6}
                className="items-center justify-center w-9 h-9"
              >
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    isSelected ? 'bg-primary' : isToday ? 'border border-primary' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? 'text-text-inverse'
                        : isToday
                          ? 'text-primary'
                          : 'text-text-primary'
                    }`}
                  >
                    {cell.date.getDate()}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      ))}
    </View>
  )
}
