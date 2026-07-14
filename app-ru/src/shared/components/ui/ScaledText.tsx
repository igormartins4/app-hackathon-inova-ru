import { Text, type TextProps } from 'react-native'
import { useFontScale } from '@/store/themeStore'

interface ScaledTextProps extends TextProps {
  children: React.ReactNode
}

export function ScaledText({ children, style, ...props }: ScaledTextProps) {
  const fontScale = useFontScale()

  return (
    <Text
      allowFontScaling={true}
      maxFontSizeMultiplier={fontScale}
      minimumFontScale={0.8}
      style={style}
      {...props}
    >
      {children}
    </Text>
  )
}
