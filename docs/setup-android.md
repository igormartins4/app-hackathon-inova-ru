# Configuração Android — network_security_config

## Contexto

O app usa Expo SDK 55. O diretório `android/` é gerado por `npx expo prebuild`. Após o prebuild, é necessário configurar o `network_security_config.xml` para permitir tráfego HTTP ao mock server local no emulador.

Sem essa configuração, o Android bloqueia requisições HTTP ao `10.0.2.2`.

## Passos (após `npx expo prebuild`)

### 1. Criar o arquivo de configuração de segurança de rede

Criar `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Permite HTTP apenas para o mock server local via emulator -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
</network-security-config>
```

### 2. Atualizar AndroidManifest.xml

Adicionar ao tag `<application>` em `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:allowBackup="false"
    android:theme="@style/AppTheme"
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true">
```

> `android:usesCleartextTraffic="true"` é necessário para debug. Em release, pode ser removido.

### 3. Verificar

1. `npx expo run:android` ou `npx expo start` → open Android
2. No emulador, o app deve conseguir fazer HTTP para `http://10.0.2.2:3000/mock/...`
3. Sem a config, o Logcat mostra: `java.net.UnknownServiceException: CLEARTEXT communication not permitted`
