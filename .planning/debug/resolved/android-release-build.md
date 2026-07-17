---
status: resolved
trigger: "Debug and fix the Android release build end-to-end, then produce and validate an APK on the connected moto_g84_5G."
created: 2026-07-17
updated: 2026-07-17
---

## Symptoms

- Expected: A locally built release APK installs, cold-launches, stays alive, and emits no fatal crash on the connected moto_g84_5G.
- Actual: The prior EAS APK crashed from an incompatible @expo/dom-webview; after upgrading it and regenerating Android, the local release build fails while bundling JavaScript because @babel/plugin-transform-react-jsx cannot be resolved.
- Error: `:app:createBundleReleaseJsAndAssets` fails with `Cannot find module '@babel/plugin-transform-react-jsx'`.
- Timeline: The dom-webview mismatch is already corrected; the missing Babel plugin is the current blocker.
- Reproduction: Run `NODE_ENV=production ./android/gradlew -p android app:assembleRelease` from `rangoo-app`.

## Current Focus

- hypothesis: pnpm 11 strict resolution does not expose babel-preset-expo's JSX transform plugin to the release bundler.
- test: add the exact plugin as a direct dev dependency and verify require.resolve before rebuilding.
- expecting: Metro resolves the plugin and Gradle advances past createBundleReleaseJsAndAssets.
- next_action: apply the smallest direct dependency fix and run all requested validation gates.

## Evidence

- timestamp: 2026-07-17T00:00:00Z
  observation: `pnpm why` reports only @expo/dom-webview 57.0.1, and the lockfile no longer contains version 55.
- timestamp: 2026-07-17T00:00:01Z
  observation: top-level require.resolve for @babel/plugin-transform-react-jsx fails although babel-preset-expo declares it transitively.
- timestamp: 2026-07-17T03:00:00-03:00
  observation: Adding @babel/plugin-transform-react-jsx 7.29.7 as a direct dev dependency made require.resolve succeed and Metro complete the production bundle.
- timestamp: 2026-07-17T03:10:00-03:00
  observation: The first Gradle attempt lost its daemon under parallel four-ABI native compilation; the same task succeeded with two workers and parallel execution disabled.
- timestamp: 2026-07-17T03:20:00-03:00
  observation: The release APK installed on moto_g84_5G, cold-launched MainActivity, retained PID 15291 for at least 30 seconds, and produced an empty crash buffer with no fatal or linkage errors.

## Eliminated

- hypothesis: The installed stale APK is still interfering.
  reason: `adb shell pm list packages -U | rg com.rangoo.app` returns no package.

## Resolution

- root_cause: pnpm 11 did not expose babel-preset-expo's transitive @babel/plugin-transform-react-jsx to Metro's top-level production resolution.
- fix: Added @babel/plugin-transform-react-jsx 7.29.7 as a direct dev dependency; no preset alignment was needed.
- verification: require.resolve passed; TypeScript, Biome, and 84 Jest tests passed; assembleRelease succeeded; APK installed and cold-launched without a crash on moto_g84_5G.
- files_changed: rangoo-app/package.json, rangoo-app/pnpm-lock.yaml
