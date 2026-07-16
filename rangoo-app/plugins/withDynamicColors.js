const { withDangerousMod } = require('expo/config-plugins')
const fs = require('node:fs')
const path = require('node:path')

// Material You / Dynamic Colors: ensures ?attr/colorPrimary and friends
// resolve to the device's wallpaper-derived palette on Android 12+.
// Falls back gracefully on older Android versions.
function withDynamicColorsTheme(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const resDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/values')
      const stylesPath = path.join(resDir, 'styles.xml')

      // Expo generates styles.xml with a base app theme.
      // We rewrite it to inherit from Theme.Material3.DayNight.DynamicColors.
      const content = fs.existsSync(stylesPath) ? fs.readFileSync(stylesPath, 'utf8') : ''

      // Replace the parent theme with the Material3 DynamicColors variant
      const updated = content.replace(
        /parent="[^"]*"/,
        'parent="Theme.Material3.DayNight.DynamicColors"',
      )

      if (updated !== content) {
        fs.mkdirSync(resDir, { recursive: true })
        fs.writeFileSync(stylesPath, updated)
      }

      return config
    },
  ])
}

module.exports = function withDynamicColors(config) {
  config = withDynamicColorsTheme(config)
  return config
}
