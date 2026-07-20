# Configuração Android — network_security_config

## Contexto

O Android bloqueia tráfego HTTP puro por padrão (cleartext), o que impediria o app de falar com o mock server local (`http://10.0.2.2:<porta>`) rodando no emulador durante o desenvolvimento.

Isso **já é automatizado** via config plugin — não precisa de passos manuais depois do `expo prebuild`.

## Como funciona

`rangoo-app/plugins/withNetworkSecurityConfig.js` gera automaticamente, a cada `expo prebuild`/build:

- `android/app/src/main/res/xml/network_security_config.xml`, liberando cleartext **somente** para `10.0.2.2` (o alias que o emulador Android usa pra falar com a máquina host) — nenhum outro domínio, nunca cleartext geral.
- A referência `android:networkSecurityConfig` no `AndroidManifest.xml`.

O plugin é registrado em `app.json` (`plugins: ["./plugins/withNetworkSecurityConfig", ...]`).

## Verificar

1. `pnpm android` (ou `expo start` → abrir no Android)
2. No emulador, o app deve conseguir fazer HTTP para `http://10.0.2.2:<porta-do-mock>`
3. Sem a config, o Logcat mostra `java.net.UnknownServiceException: CLEARTEXT communication not permitted` — se isso aparecer, confira se o plugin está listado em `app.json` e rode `expo prebuild --clean` pra regenerar o projeto nativo.

## Produção

HTTPS é obrigatório em produção (TLS 1.2+, seção 3 da especificação técnica) — este cleartext exception vale só pro `10.0.2.2` de desenvolvimento, nunca é ampliado para domínios de produção.
