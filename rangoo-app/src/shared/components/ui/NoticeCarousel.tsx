import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@/config'
import { type TranslationKeys, useI18n } from '@/shared/i18n'
import { ScaledText as Text } from './ScaledText'

interface NoticeItem {
  key: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  getText: (t: TranslationKeys) => { title: string; body: string }
}

const NOTICES: NoticeItem[] = [
  {
    key: 'pix',
    icon: 'time',
    getText: (t) => ({ title: t.noticePixTitle, body: t.noticePixBody }),
  },
  {
    key: 'cardapio',
    icon: 'book',
    getText: (t) => ({ title: t.noticeCardapioTitle, body: t.noticeCardapioBody }),
  },
  {
    key: 'dicas',
    icon: 'bulb',
    getText: (t) => ({ title: t.noticeDicasTitle, body: t.noticeDicasBody }),
  },
  {
    key: 'horario',
    icon: 'restaurant',
    getText: (t) => ({ title: t.noticeHorarioTitle, body: t.noticeHorarioBody }),
  },
]

const TOTAL = NOTICES.length

export function NoticeCarousel() {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const [current, setCurrent] = useState(0)
  const [isManual, setIsManual] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isManual) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TOTAL)
    }, 4000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isManual])

  const handleCardPress = useCallback(() => {
    setIsManual(true)
    setCurrent((prev) => (prev + 1) % TOTAL)
  }, [])

  const notice = NOTICES[current]
  const { title, body } = notice.getText(t)

  return (
    <Pressable
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body}. ${t.noticeCarouselAcessibilidade
        .replace('{index}', String(current + 1))
        .replace('{total}', String(TOTAL))}`}
      style={{ backgroundColor: themeColors.surfaceVariant, borderColor: themeColors.outline + '40' }}
      className="mx-4 mb-4 rounded-2xl overflow-hidden min-h-[136px] justify-between border p-4 shadow-sm"
    >
      <View className="flex-row items-start gap-3">
        <View
          style={{ backgroundColor: themeColors.primary + '1F' }}
          className="w-10 h-10 rounded-xl items-center justify-center mt-0.5"
        >
          <Ionicons name={notice.icon} size={20} color={themeColors.primary} />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-sm font-bold text-text-primary">{title}</Text>
          <Text className="text-xs text-text-secondary leading-relaxed font-medium" numberOfLines={3}>
            {body}
          </Text>
        </View>
      </View>

      <View
        style={{ borderTopColor: themeColors.outline + '30' }}
        className="flex-row items-center justify-between pt-2.5 border-t mt-1"
      >
        <View className="flex-row items-center gap-1.5">
          {NOTICES.map((n, idx) => (
            <View
              key={n.key}
              className={`rounded-full ${idx === current ? 'w-[18px]' : 'w-[6px]'}`}
              style={{
                height: 6,
                backgroundColor: idx === current ? themeColors.primary : themeColors.primary + '40',
              }}
            />
          ))}
        </View>
        <Text className="text-[10px] font-bold text-primary uppercase tracking-wider">TOQUE PARA AVANÇAR</Text>
      </View>
    </Pressable>
  )
}
