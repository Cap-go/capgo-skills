# Release Checklist

Run top to bottom before a store build. Each item names the skill that owns the deep check.

## Config
- [ ] No `server.url`, `server.cleartext`, dev `allowNavigation`, or `webContentsDebuggingEnabled: true` in the synced `capacitor.config.json` (both platforms).
- [ ] `appId`, `appName`, and `webDir` correct; the web build is fresh (`npm run build && npx cap sync` from a clean shell or CI).
- [ ] Only one of `capacitor.config.ts|js|json` exists.

## Versions
- [ ] `@capacitor/core`, `cli`, `ios`, `android` on the same version; plugin majors match (`npx cap doctor`).
- [ ] No Capacitor 9 `next` packages in a production release unless the team has accepted alpha risk.

## Security (`capacitor-security`)
- [ ] `npx @capgo/capgo-sec@latest scan --ci` passes or findings are triaged.
- [ ] No secrets in the built bundle; tokens stored in Keychain/Keystore, not Preferences/localStorage.
- [ ] No `NSAllowsArbitraryLoads`, no `usesCleartextTraffic="true"`; `allowBackup` reviewed.

## iOS
- [ ] UIScene lifecycle adopted (required for Xcode 27 builds) and custom AppDelegate code moved (`capacitor-uiscene-migration`).
- [ ] Every permission the plugins use has an `NS*UsageDescription` string.
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) present and accurate (`capacitor-apple-review-preflight`).
- [ ] SPM in use or migration planned before CocoaPods Trunk goes read-only (`cocoapods-to-spm`).
- [ ] Version (`MARKETING_VERSION`) and build number (`CURRENT_PROJECT_VERSION`) bumped.

## Android
- [ ] `targetSdkVersion` meets current Google Play policy; matches the Capacitor major's template.
- [ ] Release build signed with the upload key; keystore not in git.
- [ ] R8 decision made; if enabled, all plugin features tested on a release build.
- [ ] `versionCode` incremented, `versionName` set.

## Behavior on real devices
- [ ] Each plugin feature works, including permission denial and "denied forever" paths.
- [ ] Offline and poor network handled (`capacitor-offline-first`).
- [ ] Background/foreground (`resume`/`pause`) and cold start from a deep link or notification (`capacitor-deep-linking`, `capacitor-push-notifications`).
- [ ] Safe areas, keyboard, splash screen behave (`safe-area-handling`, `capacitor-keyboard`, `capacitor-splash-screen`).
- [ ] Crash reporting wired (`capacitor-native-observability`).

## Live updates (`capgo-live-updates`)
- [ ] `CapacitorUpdater.notifyAppReady()` called on every launch so failed bundles roll back.
- [ ] Channel for this native build set; bundles encrypted if the content is sensitive.
- [ ] Native-only changes (new plugins, permissions, SDK bumps) shipped through the store, not OTA.

## Submission
- [ ] Store metadata, screenshots, and review notes (`capacitor-app-store`, `capacitor-apple-review-preflight`).
