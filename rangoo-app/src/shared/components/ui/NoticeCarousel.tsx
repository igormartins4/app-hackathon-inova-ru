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
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % TOTAL)
  }, [])

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + TOTAL) % TOTAL)
  }, [])

  useEffect(() => {
    if (dismissed) return
    timerRef.current = setInterval(goNext, 8000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [dismissed, goNext])

  if (dismissed) return null

  const notice = NOTICES[current]
  const { title, body } = notice.getText(t)

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={t.noticeCarouselAcessibilidade
        .replace('{index}', String(current + 1))
        .replace('{total}', String(TOTAL))}
      className="mx-4 mb-4 rounded-xl overflow-hidden"
      style={{ backgroundColor: `${themeColors.warning}12`, height: 140 }}
    >
      <View
        style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 }}
      >
        <Ionicons
          name={notice.icon}
          size={24}
          color={themeColors.warning}
          style={{ marginTop: 2 }}
        />
        <View style={{ flex: 1, gap: 4 }}>
          <Text className="text-sm font-bold" style={{ color: themeColors.warning }}>
            {title}
          </Text>
          <Text
            numberOfLines={2}
            className="text-sm text-text-secondary"
            style={{ lineHeight: 20 }}
          >
            {body}
          </Text>
        </View>
        <Pressable
          onPress={() => setDismissed(true)}
          accessibilityRole="button"
          accessibilityLabel={t.close}
          hitSlop={8}
          style={{ marginTop: 2 }}
        >
          <Ionicons name="close" size={16} color={themeColors.textSecondary} />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between px-4 pb-3">
        <Pressable
          onPress={goPrev}
          accessibilityRole="button"
          accessibilityLabel={t.back}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={themeColors.textSecondary} />
        </Pressable>

        <View className="flex-row gap-2">
          {NOTICES.map((n) => (
            <View
              key={n.key}
              className="rounded-full"
              style={{
                width: n.key === notice.key ? 20 : 8,
                height: 8,
                backgroundColor:
                  n.key === notice.key ? themeColors.primary : themeColors.outlineVariant,
              }}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel={t.cardapioGoToday}
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </Pressable>
      </View>
    </View>
  )
}
