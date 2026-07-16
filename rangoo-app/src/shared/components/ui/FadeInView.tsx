import { View, type ViewProps } from 'react-native'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
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

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(140)}
      layout={Layout.duration(180)}
      {...props}
    >
      {children}
    </Animated.View>
  )
}
