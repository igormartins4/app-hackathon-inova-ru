import { type ColorValue, Platform } from 'react-native'

export interface MaterialYouColors {
  primary: ColorValue
  primaryContainer: ColorValue
  textInverse: ColorValue
}

// ponytail: Material You dynamic colors require Theme.Material3 in styles.xml
// which is not available without the material-components-android dependency.
// Disabled — theming is handled via CSS variables in global.css.
export function getMaterialYouColors(): MaterialYouColors | null {
  if (Platform.OS !== 'android') return null
  return null
}
