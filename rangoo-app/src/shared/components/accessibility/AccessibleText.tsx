import { Text, type TextProps } from 'react-native'

export function AccessibleText(props: TextProps) {
  return <Text allowFontScaling={true} maxFontSizeMultiplier={2} {...props} />
}
