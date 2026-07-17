import { Ionicons } from '@expo/vector-icons'
import { useMemo } from 'react'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Text } from '@/shared/components/ui'

interface MenuCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
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

function startOfWeek(date: Date): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - result.getDay())
  result.setHours(0, 0, 0, 0)
  return result
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function MenuCalendar({ selectedDate, onSelectDate }: MenuCalendarProps) {
  const themeColors = useThemeColors()
  const today = useMemo(() => new Date(), [])

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate])
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const handlePreviousWeek = () => onSelectDate(addDays(selectedDate, -7))
  const handleNextWeek = () => onSelectDate(addDays(selectedDate, 7))

  return (
    <View
      accessibilityLabel="Calendário de cardápio"
      className="bg-surface border border-outline rounded-2xl p-3 gap-3"
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handlePreviousWeek}
          accessibilityRole="button"
          accessibilityLabel="Semana anterior"
          hitSlop={6}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color={themeColors.textSecondary} />
        </Pressable>
        <Text className="text-sm font-bold text-text-primary">
          {MONTH_LABELS[selectedDate.getMonth()]} de {selectedDate.getFullYear()}
        </Text>
        <Pressable
          onPress={handleNextWeek}
          accessibilityRole="button"
          accessibilityLabel="Próxima semana"
          hitSlop={6}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </Pressable>
      </View>

      <View className="flex-row justify-between">
        {weekDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, today)
          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => onSelectDate(day)}
              accessibilityRole="button"
              accessibilityLabel={`${WEEKDAY_LABELS[idx]}, dia ${day.getDate()}${isToday ? ', hoje' : ''}`}
              accessibilityState={{ selected: isSelected }}
              hitSlop={6}
              className="items-center gap-1 w-10"
            >
              <Text className="text-xs text-text-secondary font-medium">{WEEKDAY_LABELS[idx]}</Text>
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
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      {!isSameDay(selectedDate, today) && (
        <Pressable
          onPress={() => onSelectDate(new Date())}
          accessibilityRole="button"
          accessibilityLabel="Voltar para hoje"
          className="self-center px-3 py-1"
        >
          <Text className="text-xs font-medium text-primary">Voltar para hoje</Text>
        </Pressable>
      )}
    </View>
  )
}
