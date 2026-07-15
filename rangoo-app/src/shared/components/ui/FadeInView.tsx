import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import { useThemeStore } from '@/store/themeStore'

type FadeInViewProps = React.ComponentProps<typeof Animated.View>

export function FadeInView({ children, ...props }: FadeInViewProps) {
  const reducedMotion = useThemeStore((s) => s.reducedMotion)

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeIn.duration(220)}
      exiting={reducedMotion ? undefined : FadeOut.duration(140)}
      layout={reducedMotion ? undefined : Layout.duration(180)}
      {...props}
    >
      {children}
    </Animated.View>
  )
}
