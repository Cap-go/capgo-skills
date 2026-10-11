# Cordova Plugin Mapping

Pick per plugin: replace (preferred), keep as a Cordova plugin (works on Capacitor; on Capacitor 9 it also keeps the Cordova runtime in the app), or flag as blocker. Verify each replacement's API covers the features the app actually uses before swapping.

## Not needed in Capacitor (remove)

`cordova-plugin-ionic-webview`, `cordova-plugin-wkwebview-engine`, `cordova-plugin-whitelist`, `cordova-plugin-add-swift-support`, `cordova-plugin-compat`, `cordova-plugin-console`, `cordova-plugin-crosswalk-webview` (cannot change the WebView), `cordova-plugin-androidx`/`cordova-plugin-androidx-adapter` (Capacitor is AndroidX already).

## Known incompatible (skipped by `cap sync`)

Capacitor skips: `cordova-plugin-admobpro`, `cordova-plugin-braintree`, `cordova-plugin-code-push`, `cordova-plugin-fcm`, `cordova-plugin-firebase`, `cordova-plugin-ionic-keyboard`, `cordova-plugin-music-controls`, `cordova-plugin-qrscanner`, `cordova-plugin-splashscreen`, `cordova-plugin-statusbar`, `cordova-plugin-googlemaps` (iOS only), plus the not-needed list above. Source: capacitorjs.com/docs/plugins/cordova#known-incompatible-plugins.

## Replacements

| Cordova plugin | Replacement | Notes |
|---|---|---|
| `cordova-plugin-camera` | `@capacitor/camera` | `Camera.getPhoto`, `CameraResultType.Uri` for file paths |
| `cordova-plugin-geolocation` | `@capacitor/geolocation` | Background location needs a dedicated plugin |
| `cordova-plugin-device` | `@capacitor/device` | `Device.getId()` (identifier), `Device.getInfo()` (platform, model, OS) |
| `cordova-plugin-network-information` | `@capacitor/network` | Event `networkStatusChange` |
| `cordova-plugin-statusbar` | `@capacitor/status-bar` | Android edge-to-edge changes overlay behaviour; see `safe-area-handling` |
| `cordova-plugin-splashscreen` | `@capacitor/splash-screen` | Config under `plugins.SplashScreen` |
| `cordova-plugin-ionic-keyboard` / `cordova-plugin-keyboard` | `@capacitor/keyboard` | `resize` mode in config |
| `cordova-plugin-dialogs` | `@capacitor/dialog` | |
| `cordova-plugin-file` | `@capacitor/filesystem` | Different directory model (`Directory.Data`, `Directory.Documents`); old `cdvfile://` URLs do not exist |
| `cordova-plugin-file-transfer` | `@capacitor/file-transfer` | Or `Filesystem.downloadFile` |
| `cordova-plugin-file-opener2` | `@capacitor/file-viewer` | |
| `cordova-plugin-inappbrowser` | `@capacitor/browser` (system browser sheet) or `@capgo/inappbrowser` (embedded WebView with JS bridge, events) | Pick by whether the app injects JS or reads URLs |
| `cordova-plugin-media` | `@capgo/native-audio` (playback), `@capgo/capacitor-audio-recorder` (recording) | No official `@capacitor/media` |
| `cordova-plugin-vibration` | `@capacitor/haptics` | `Haptics.vibrate()` and impact styles |
| `cordova-plugin-local-notification` (katzer) | `@capacitor/local-notifications` | Re-create channels on Android |
| `phonegap-plugin-push` / `@havesource/cordova-plugin-push` | `@capacitor/push-notifications` | Token format differs on iOS (APNs vs FCM); see `capacitor-push-notifications` |
| `cordova-plugin-firebasex` / `cordova-plugin-firebase` | `@capacitor-firebase/*` (community) or `@capacitor/push-notifications` | Re-check Crashlytics/Analytics setup |
| `cordova-plugin-x-socialsharing` | `@capacitor/share` | |
| `cordova-clipboard` | `@capacitor/clipboard` | |
| `cordova-plugin-screen-orientation` | `@capacitor/screen-orientation` or `@capgo/capacitor-screen-orientation` | |
| `cordova-plugin-app-version` | `@capacitor/app` | `App.getInfo()` -> `version`, `build` |
| `cordova-plugin-fingerprint-aio` / `cordova-plugin-touch-id` | `@capgo/capacitor-native-biometric` | Credentials in Keychain/Keystore |
| `cordova-plugin-purchase` (cc.fovea) | `@capgo/native-purchases` | Re-test restore and receipt validation; see `subscription-app-revenue` |
| `cordova-plugin-googleplus`, `cordova-plugin-facebook-connect`, `cordova-plugin-sign-in-with-apple` | `@capgo/capacitor-social-login` | Register new redirect/bundle settings per provider |
| `cordova-sqlite-storage`, `cordova-plugin-sqlite-2` | `@capgo/capacitor-fast-sql` | Keep the same DB file name/location or migrate on first launch; see `sqlite-to-fast-sql` |
| `cordova-plugin-nativestorage` / `cordova-plugin-secure-storage-echo` | `@capacitor/preferences` (non-sensitive) / `@capgo/capacitor-native-biometric` or `@capgo/capacitor-data-storage-sqlite` (sensitive) | Read old values on first launch and write them to the new store |
| `phonegap-plugin-barcodescanner` / `cordova-plugin-qrscanner` | `@capacitor/barcode-scanner` | |
| `cordova-plugin-health` | `@capgo/capacitor-health` | |
| `cordova-plugin-code-push`, `cordova-plugin-ionic` (Appflow Deploy) | `@capgo/capacitor-updater` | See `capgo-live-updates` / `ionic-appflow-migration` |
| `cordova-plugin-privacyscreen` | `@capacitor/privacy-screen` | |

For anything not listed, search `capacitor-plugins` (Capgo catalog) before writing a custom plugin.

## Ionic Native / Awesome Cordova Plugins wrappers

`@ionic-native/*` and `@awesome-cordova-plugins/*` are thin JS wrappers around Cordova plugins. Keeping the wrapper means keeping the Cordova plugin. When replacing the plugin, delete the wrapper import and the Angular provider registration (`providers: [Camera]`) too.

## Keeping a Cordova plugin

- Install with npm (`npm install cordova-plugin-xyz`), then `npx cap sync`. Do not use `cordova plugin add`.
- Plugin `<variable>`s go in `capacitor.config.*` -> `cordova.preferences`.
- `<config-file>` edits for `Info.plist`/`AndroidManifest.xml` are applied by `cap sync` for many cases, but hooks are not run; check the plugin's `plugin.xml` and apply missing edits manually.
- Each kept Cordova plugin is a future upgrade risk (Capacitor majors, SPM-only iOS). Note it in the migration report.
