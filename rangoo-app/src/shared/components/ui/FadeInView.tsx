import { View, type ViewProps } from 'react-native'
import Animated, { FadeIn, FadeOut, Layout, ReduceMotion } from 'react-native-reanimated'
import { useThemeStore } from '@/store/themeStore'

interface FadeInViewProps extends ViewProps {
  children: React.ReactNode
}

export function FadeInView({ children, ...props }: FadeInViewProps) {
  const reducedMotion = useThemeStore((s) => s.reducedMotion)

  if (reducedMotion) {
    // ponytail: keep wrapper View so FlatList keys/className/style are preserved
    return <View {...props}>{children}</View>
  }

  // Reanimated defaults entering/exiting/layout to ReduceMotion.System, which
  // re-checks the OS accessibility flag independently of our own `reducedMotion`
  // state above. When the two disagree, Reanimated can skip the animation
  // without properly jumping to its final visible state, leaving the view
  // stuck invisible. We already own this decision via the branch above, so
  // force Reanimated to never apply its own system-level skip here.
  return (
    <Animated.View
      entering={FadeIn.duration(220).reduceMotion(ReduceMotion.Never)}
      exiting={FadeOut.duration(140).reduceMotion(ReduceMotion.Never)}
      layout={Layout.duration(180).reduceMotion(ReduceMotion.Never)}
      {...props}
    >
      {children}
    </Animated.View>
  )
}
