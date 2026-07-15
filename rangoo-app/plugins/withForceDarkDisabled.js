const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins')

// MIUI/Android 13 pode aplicar seu proprio "dark mode automatico" (inversao de
// cor) sobre views nativas (LinearGradient, SVG) que o app ja renderiza com as
// cores corretas via global.css/theme.ts — resultando em contraste quebrado.
// android:forceDarkAllowed="false" desliga essa inversao automatica do SO,
// deixando o dark mode inteiramente sob controle do app. Ver Ponto 31 do QA.
function withForceDarkDisabledManifest(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults)
    mainApplication.$['android:forceDarkAllowed'] = 'false'
    return config
  })
}

module.exports = function withForceDarkDisabled(config) {
  config = withForceDarkDisabledManifest(config)
  return config
}
