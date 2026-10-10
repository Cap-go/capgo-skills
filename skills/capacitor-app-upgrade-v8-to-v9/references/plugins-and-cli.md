# Plugins, CLI and Config: Capacitor 8 -> 9 (app)

## Package versions

All official `@capacitor/*` plugins have 9.0.0 releases on the `next` tag while Capacitor 9 is prerelease:

```bash
npm i @capacitor/core@next @capacitor/ios@next @capacitor/android@next
npm i -D @capacitor/cli@next
npm i @capacitor/app@next @capacitor/push-notifications@next   # repeat for each installed official plugin
```

Community and `@capgo/*` plugins: check each for a release whose `peerDependencies` accepts `@capacitor/core` 9 (`npm view <pkg>@latest peerDependencies`, also try `@next`). A plugin that only allows `^8` may still build; if npm refuses, ask the user before using `--legacy-peer-deps`, and verify that plugin on device.

## Official plugin changes

Android variable bumps (set in `android/variables.gradle` if the app overrides them):

| Plugin | Variable -> new value |
|---|---|
| Action Sheet | `androidxMaterialVersion` 1.14.0 |
| Barcode Scanner | `kotlinxCoroutinesVersion` 1.11.0 |
| Browser | `androidxBrowserVersion` 1.10.0 |
| Camera | `androidxExifInterfaceVersion` 1.4.2, `androidxMaterialVersion` 1.14.0 |
| Geolocation | `playServicesLocationVersion` 21.4.0, `kotlinxCoroutinesVersion` 1.11.0 |
| Google Maps | `kotlinxCoroutinesVersion` 1.11.0, `googleMapsPlayServicesVersion` 20.0.0, `googleMapsUtilsVersion` 5.0.0, `googleMapsKtxVersion` / `googleMapsUtilsKtxVersion` 6.0.1 |
| InAppBrowser | `androidxBrowserVersion` 1.10.0 |

Behavior changes:

- **Push Notifications (iOS)**: the `alert` presentation option is gone. Use `banner` and/or `list`:

  ```diff
   PushNotifications: {
  -  presentationOptions: ['badge', 'sound', 'alert'],
  +  presentationOptions: ['badge', 'sound', 'banner', 'list'],
   }
  ```

  Without this, foreground notifications silently stop showing.
- **Splash Screen (Android)**: `launchFadeOutDuration` default changed 200 -> 0 (the old fade could block UI changes right after `SplashScreen.hide()`). To keep the fade, set `SplashScreen: { launchFadeOutDuration: 200 }` explicitly.

## CLI: `cap run` live reload

`-l` / `--live-reload`, `--host`, `--port`, `--https` were merged into `--url`:

```bash
# before
npx cap run android -l --host 192.168.1.181 --port 5173
# after: pass the URL the dev server prints
npx cap run android --url http://192.168.1.181:5173
```

Update `package.json` scripts, CI jobs and README snippets that use the old flags:

```bash
grep -rn --include=package.json --include=*.md --include=*.yml --include=*.yaml -E 'cap run .*(-l\b|--live-reload|--host|--port|--https)' . --exclude-dir=node_modules
```

## Cordova runtime is optional

`npx cap sync` now wires in the Cordova compatibility layer only when at least one Cordova plugin is installed (`npx cap ls` shows them). With none:

- Android: no `capacitor-cordova-android` / `capacitor-cordova-android-plugins` modules.
- iOS: no `CapacitorCordova` in Podfile or `Package.swift`.

No config option forces it on. Native code referencing those symbols must drop the reference, or the app keeps a Cordova plugin installed. Apps that do have Cordova plugins: `cordovaAndroidVersion = '15.0.0'` in `variables.gradle`.

## Node

Node 24+ (ships npm 11). Update `.nvmrc`, `engines`, CI images (`actions/setup-node` `node-version: 24`), and cloud build environments (for Capgo Cloud Build see `capgo-native-builds`).
