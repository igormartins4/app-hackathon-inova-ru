const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('expo/config-plugins')
const fs = require('node:fs')
const path = require('node:path')

// Allows plain HTTP to the Android emulator's loopback alias (10.0.2.2), where the
// local mock server runs during the hackathon — production stays HTTPS-only.
// See PROJECT.md > Constraints > "Tráfego HTTP em Dev" and Especificação Técnica
// API InovaRU v2.0, seção 4.1.
const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">10.0.2.2</domain>
    </domain-config>
</network-security-config>
`

function withNetworkSecurityConfigFile(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const resXmlDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/xml')
      fs.mkdirSync(resXmlDir, { recursive: true })
      fs.writeFileSync(path.join(resXmlDir, 'network_security_config.xml'), NETWORK_SECURITY_CONFIG)
      return config
    },
  ])
}

function withNetworkSecurityConfigManifest(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults)
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config'
    mainApplication.$['android:usesCleartextTraffic'] = 'true'
    return config
  })
}

module.exports = function withNetworkSecurityConfig(config) {
  config = withNetworkSecurityConfigFile(config)
  config = withNetworkSecurityConfigManifest(config)
  return config
}
