import { View, type ViewProps } from 'react-native'
import Animated, { FadeIn, FadeOut, Layout, ReduceMotion } from 'react-native-reanimated'
import { useEffectiveReducedMotion } from '@/store/themeStore'

interface FadeInViewProps extends ViewProps {
  children: React.ReactNode
}

export function FadeInView({ children, ...props }: FadeInViewProps) {
  const reducedMotion = useEffectiveReducedMotion()

  if (reducedMotion) {
    // ponytail: keep wrapper View so FlatList keys/className/style are preserved
    return <View {...props}>{children}</View>
  }

  return (
    <Animated.View
      entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(140).reduceMotion(ReduceMotion.System)}
      layout={Layout.duration(180).reduceMotion(ReduceMotion.System)}
      {...props}
    >
      {children}
    </Animated.View>
  )
}
