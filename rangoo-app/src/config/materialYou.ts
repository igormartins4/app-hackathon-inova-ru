import { type ColorValue, Platform, PlatformColor } from 'react-native'

export function getMaterialYouAccent(): ColorValue | null {
  if (Platform.OS !== 'android') return null
  try {
    return PlatformColor('?attr/colorAccent')
  } catch {
    return null
  }
}
