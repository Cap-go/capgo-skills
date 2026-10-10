---
name: capacitor-plugins
description: Pick, install, and wire up Capacitor plugins for native features (camera, filesystem, geolocation, biometrics, in-app purchases, social login, SQLite, calendar, contacts, health, BLE, NFC, etc.). Covers official @capacitor/* packages (Capacitor 8.5 stable, 9 alpha on next) plus the 136-package @capgo/* catalog, native permission keys (Info.plist, AndroidManifest, variables.gradle minSdk), npx cap sync / cap ls verification, and errors like '"Camera" plugin is not implemented on ios', 'unable to find plugin', UNIMPLEMENTED, and OS-PLUG-* codes. Use for "which plugin should I use for X", adding a plugin, or a plugin call failing after install. Do not use for push setup (capacitor-push-notifications), splash assets (capacitor-splash-screen), keyboard layout (capacitor-keyboard), deep links (capacitor-deep-linking), OTA updates (capgo-live-updates), upgrading plugin source code (capacitor-plugin-upgrades), or adding SPM to a plugin (capacitor-plugin-spm-support).
---

# Capacitor Plugins

Choose the right plugin, install it correctly, and prove it is linked natively.

## When to Use

TRIGGER when:

- User asks "which plugin should I use for X?" or compares plugin options.
- User needs a native capability (camera, files, location, biometrics, payments, auth, sensors, storage, media, calendar, contacts, health, on-device LLM).
- A plugin call fails after install: `"X" plugin is not implemented on ios|android|web`, `UNIMPLEMENTED`, `unable to find plugin`, or an `OS-PLUG-*` code.
- User needs the right `Info.plist` / `AndroidManifest.xml` / `variables.gradle` entries for a plugin.

Do not use (load the sibling skill instead):

- Push notification setup, FCM/APNs keys: `capacitor-push-notifications`
- Splash screen assets and timing: `capacitor-splash-screen`
- Keyboard overlap, accessory bar, resize: `capacitor-keyboard`
- Universal Links / App Links: `capacitor-deep-linking`
- OTA live updates: `capgo-live-updates`
- Migrating plugin *source code* across Capacitor majors: `capacitor-plugin-upgrades` (and `capacitor-plugin-upgrade-v8-to-v9`)
- Adding Swift Package Manager support to a plugin: `capacitor-plugin-spm-support`; moving an app to SPM: `cocoapods-to-spm`
- AppDelegate/SceneDelegate lifecycle changes: `capacitor-uiscene-migration`
- Upgrading the app's Capacitor major: `capacitor-app-upgrades`
- SQL storage migrations: `sqlite-to-fast-sql`

## Version Facts (October 2026)

- Capacitor stable: 8.5.x (`latest`). Capacitor 9 is `9.0.0-alpha` on the `next` dist-tag. Official plugins follow: most v8 plugins are `8.x` on `latest` and `9.0.0-alpha` on `next`.
- Plugin major must match the app's Capacitor major. Plugins for older majors use `latest-<major>` tags, e.g. `npm install @capacitor/camera@latest-7`.
- Some official plugins have independent versions (file-transfer 2.x, file-viewer 2.x, inappbrowser 4.x, privacy-screen 2.x, barcode-scanner 3.x, background-runner 3.x, calendar/contacts/health-fitness 1.x). Check `npm view <pkg> peerDependencies` instead of matching the number.
- `@capgo/*` plugins use the Capacitor major as their own major (8.x for Capacitor 8). LTS tags such as `lts-v7` exist on some packages.
- Capacitor 9: iOS 16 min, Android minSdk 26. Plugins that previously needed `minSdkVersion = 26` (inappbrowser, barcode-scanner) stop needing a bump.

## Procedure

1. **Inspect first.** Read `package.json` (`@capacitor/core` version), `capacitor.config.*`, and check whether iOS uses SPM (`ios/App/CapApp-SPM/Package.swift`) or CocoaPods (`ios/App/Podfile`). Run `npx cap ls` to see what is already linked.
2. **Pick the package.**
   - An official `@capacitor/*` package exists and covers the need: default to it. Load its reference from the index below.
   - No official package, or it lacks a required feature: load `references/capgo-plugin-catalog.md` and pick the exact `@capgo/*` name. State why it fits better.
   - Never recommend a package name that is not in a reference file without checking `npm view <pkg> version` first.
3. **Install with the matching major:**

   ```bash
   npm install @capacitor/<name>        # or @capgo/<name>
   npx cap sync
   ```

4. **Add native config** from the reference: usage-description keys, manifest permissions, `variables.gradle` minSdk/library versions, capabilities/entitlements, AppDelegate hooks. Missing iOS usage strings crash the app on first access.
5. **Ask the user** before raising `minSdkVersion`, adding entitlements (HealthKit, Push), or enabling exact alarms: these affect store review and device reach.
6. **Verify** (next section), then run on a real device for anything involving camera, health, LLM, BLE, or push.

## Verification

```bash
npx cap sync              # must finish without "[error]" lines
npx cap ls                # lists "Found N Capacitor plugins for ios/android"; plugin must appear for each platform
```

- Android: `android/app/capacitor.build.gradle` contains `implementation project(':capacitor-<name>')` and `android/capacitor.settings.gradle` has the matching `include`. Then `cd android && ./gradlew assembleDebug`.
- iOS SPM: `ios/App/CapApp-SPM/Package.swift` lists the plugin package. iOS CocoaPods: `ios/App/Podfile` has the pod and `pod install` succeeded. Build in Xcode or `npx cap run ios`.
- Grep for leftovers when replacing a plugin: `grep -rn "<old-package>" src android ios package.json`.
- Feature-detect at runtime: `Capacitor.isPluginAvailable('Camera')` and `Capacitor.getPlatform()`.

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `"Camera" plugin is not implemented on ios` (or `android`/`web`) | Native side not linked, or no web implementation | `npx cap sync`, rebuild the native app (live reload does not pick up new native code), check `npx cap ls`. On web, guard with `Capacitor.isNativePlatform()`. |
| `"Camera.takePhoto()" is not implemented on ios` | Plugin linked but JS and native versions differ, or method is platform-specific | Align JS and native versions, `npx cap sync`, clean build. Check the reference for platform-only methods. |
| `UNIMPLEMENTED` error code | Method not available on this platform/OS version | Branch on platform; see reference "Notes". |
| Android log `unable to find plugin : X` | Plugin class not registered/included | Confirm `capacitor.build.gradle` entry, re-sync, Gradle sync in Android Studio. |
| iOS log `Error loading plugin X for call. Check that the pluginId is correct` | Plugin not in the iOS build | Re-sync; check `Package.swift` (SPM) or Podfile; clean build folder. |
| App crashes on first camera/contacts/calendar/location access (iOS) | Missing `NS*UsageDescription` key | Add the key listed in the reference to `Info.plist`. |
| `Manifest merger failed : uses-sdk:minSdkVersion 24 cannot be smaller than version 26 declared in library [...]` | Plugin needs higher minSdk | Raise `minSdkVersion` in `android/variables.gradle` (ask the user first). |
| `OS-PLUG-*` codes (e.g. `OS-PLUG-CAMR-0003`) | Structured native errors in OutSystems-based official plugins | Look up the code in the plugin reference (camera, file-transfer, calendar, contacts list the common ones). |
| npm `ERESOLVE` peer `@capacitor/core` conflict | Plugin major does not match app major | Install the matching tag (`@latest-7`, `@next` for v9 alpha) or upgrade the app with `capacitor-app-upgrades`. |

## Reference Index

Only load a reference when its plugin is in play.

Official `@capacitor/*` packages (install, native config, usage, gotchas):

| Need | Reference |
|------|-----------|
| Action sheet | `references/capacitor-action-sheet.md` |
| Open other apps / check installed | `references/capacitor-app-launcher.md` |
| App state, back button, URL open events | `references/capacitor-app.md` |
| JS tasks in background | `references/capacitor-background-runner.md` |
| Barcode / QR scan | `references/capacitor-barcode-scanner.md` |
| OAuth-safe in-app browser (SFSafariViewController / Custom Tabs) | `references/capacitor-browser.md` |
| Calendar events | `references/capacitor-calendar.md` |
| Camera, gallery, video (8.1+ API, `getPhoto` migration) | `references/capacitor-camera.md` |
| Clipboard | `references/capacitor-clipboard.md` |
| Contacts | `references/capacitor-contacts.md` |
| Native cookies (core) | `references/capacitor-cookies.md` |
| Device info / id / battery | `references/capacitor-device.md` |
| Native alert/confirm/prompt | `references/capacitor-dialog.md` |
| Upload/download with progress | `references/capacitor-file-transfer.md` |
| Open/preview documents | `references/capacitor-file-viewer.md` |
| File read/write | `references/capacitor-filesystem.md` |
| Location (foreground) | `references/capacitor-geolocation.md` |
| Google Maps | `references/capacitor-google-maps.md` |
| HealthKit / Health Connect | `references/capacitor-health-fitness.md` |
| Haptics | `references/capacitor-haptics.md` |
| Native HTTP (core, CORS bypass) | `references/capacitor-http.md` |
| WebView / system / external browser | `references/capacitor-inappbrowser.md` |
| Keyboard API basics | `references/capacitor-keyboard.md` |
| On-device LLM (experimental) | `references/capacitor-local-llm.md` |
| Local notifications | `references/capacitor-local-notifications.md` |
| Accelerometer / orientation | `references/capacitor-motion.md` |
| Connectivity | `references/capacitor-network.md` |
| Key/value storage | `references/capacitor-preferences.md` |
| Hide app switcher snapshot / block screenshots | `references/capacitor-privacy-screen.md` |
| Push API summary | `references/capacitor-push-notifications.md` |
| Orientation lock | `references/capacitor-screen-orientation.md` |
| TalkBack / VoiceOver state, TTS | `references/capacitor-screen-reader.md` |
| Share sheet | `references/capacitor-share.md` |
| Splash API summary | `references/capacitor-splash-screen.md` |
| Status bar (legacy) | `references/capacitor-status-bar.md` |
| Edge-to-edge system bars (core, preferred on Android 16+) | `references/capacitor-system-bars.md` |
| WebView text zoom | `references/capacitor-text-zoom.md` |
| Toast | `references/capacitor-toast.md` |
| Apple Watch UI (experimental) | `references/capacitor-watch.md` |

Capgo plugins: `references/capgo-plugin-catalog.md` (136 packages, exact names, source links).

## Capgo Quick Picks

| Need | Package |
|------|---------|
| Background geolocation, geofencing | `@capgo/background-geolocation` |
| Custom camera preview / overlays | `@capgo/camera-preview` |
| Biometric login + secure credentials | `@capgo/capacitor-native-biometric` |
| Apple/Google/Facebook sign-in | `@capgo/capacitor-social-login` |
| Subscriptions / IAP | `@capgo/native-purchases` (revenue strategy: `subscription-app-revenue`) |
| Apple Pay / Google Pay | `@capgo/capacitor-pay` |
| Fast native SQLite | `@capgo/capacitor-fast-sql` |
| Native file ops / picking | `@capgo/capacitor-file`, `@capgo/capacitor-file-picker` |
| In-app browser with JS injection, `postMessage`, screenshots | `@capgo/capacitor-inappbrowser` |
| WebView killed in background, relaunch | `@capgo/capacitor-webview-guardian` |
| App Attest / Play Integrity | `@capgo/capacitor-app-attest` |
| OTA live updates | `@capgo/capacitor-updater` (setup: `capgo-live-updates`) |
| Dev live reload | `@capgo/capacitor-live-reload` |

Traps:

- Do not install two plugins that own the same native surface (e.g. two in-app browsers or two biometric plugins) without a reason; they can conflict on delegates and manifest entries.
- Firebase: install the individual `@capgo/capacitor-firebase-*` packages; there is no umbrella `@capgo/capacitor-firebase` package on npm.
- Cordova plugins still work but on Capacitor 9 they pull in the Cordova runtime; prefer a Capacitor-native equivalent (`cordova-to-capacitor`).

## Resources

- Official plugin docs: https://capacitorjs.com/docs/apis
- Capgo plugin docs: https://capgo.app/docs/plugins/
- Capgo GitHub: https://github.com/Cap-go
