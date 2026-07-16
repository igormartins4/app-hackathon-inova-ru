import { type ColorValue, Platform, PlatformColor } from 'react-native'

export interface MaterialYouColors {
  primary: ColorValue
  primaryContainer: ColorValue
  textInverse: ColorValue
}

function androidColor(attr: string): ColorValue {
  return PlatformColor(attr)
}

export function getMaterialYouColors(): MaterialYouColors | null {
  if (Platform.OS !== 'android') return null
  try {
    return {
      primary: androidColor('?attr/colorPrimary'),
      primaryContainer: androidColor('?attr/colorPrimaryContainer'),
      textInverse: androidColor('?attr/colorOnPrimary'),
    }
  } catch {
    return null
  }
}
