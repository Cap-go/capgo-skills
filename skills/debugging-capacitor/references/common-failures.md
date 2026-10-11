# Common Failures: Detailed Fixes

## White / blank screen on launch

Work top-down; stop at the first hit.
1. Native console: iOS `⚡️  ERROR: Unable to load .../public/index.html` or Android `Capacitor` errors -> web assets missing. Check `webDir` in `capacitor.config.*` equals the build output folder (`dist`, `build`, `www`, `out`), then `npm run build && npx cap copy`.
2. WebView console: first `SyntaxError` / `TypeError`. A `SyntaxError` only on older Android devices = WebView too old for your build target; lower the bundler target or ask users to update Android System WebView.
3. Assets 404 in the Network tab: absolute URLs to a CDN subpath or `<base href="/app/">`. Use `/` base for Capacitor builds.
4. Router: History-mode routes work because Capacitor serves `index.html` for unknown paths, but a hard-coded `file://` or `http://localhost:3000` fetch will fail.
5. Leftover `server.url` pointing at a dev machine that is off -> blank or "Webpage not available". Remove it and `npx cap copy`.
6. Splash screen never hides: `launchAutoHide: false` without calling `SplashScreen.hide()`, or JS crashed before reaching it (see `capacitor-splash-screen`).

## `"X" plugin is not implemented on <platform>`

The message comes from `@capacitor/core` when no native implementation is registered for that plugin name.
- Installed but not synced: `npx cap sync` (sync = copy + update native deps).
- iOS SPM: plugin must appear in `ios/App/CapApp-SPM/Package.swift` after sync. If it does not, the plugin may not ship SPM support yet (see `cocoapods-to-spm`).
- iOS CocoaPods: plugin pod present in `ios/App/Podfile` (Capacitor 8 template), then `pod install` via `npx cap sync ios`.
- iOS `WKAppBoundDomains` in Info.plist blocks script injection -> remove it, or set `ios.limitsNavigationsToAppBoundDomains: true`.
- Android: Gradle sync after `cap sync`; a service worker serving the page prevents bridge injection.
- Web: the plugin has no web implementation; guard with `Capacitor.isPluginAvailable('X')`.
- Name mismatch: custom plugin `registerPlugin('Name')` must match `jsName` (iOS) / `@CapacitorPlugin(name = "Name")` (Android).
- Method-level variant `"X.method()" is not implemented on ios` -> plugin loaded but that method is missing from `pluginMethods` (iOS `CAPBridgedPlugin`) or lacks `@PluginMethod` (Android).

## Networking

- Origins: iOS `capacitor://localhost`, Android `https://localhost` (`server.androidScheme` default `https`). Configure API CORS for both, or enable `plugins.CapacitorHttp.enabled: true` to patch `fetch`/XHR through native HTTP (no CORS; cookies handled by `CapacitorCookies`).
- `net::ERR_CLEARTEXT_NOT_PERMITTED` (Android API 28+): prefer HTTPS. Dev-only escape: `server.cleartext: true` or `android/app/src/main/res/xml/network_security_config.xml` with a `<domain-config cleartextTrafficPermitted="true">` for the dev host, referenced by `android:networkSecurityConfig`.
- iOS ATS: add `NSAppTransportSecurity > NSExceptionDomains > <host> > NSExceptionAllowsInsecureHTTPLoads` for the dev host only. Global `NSAllowsArbitraryLoads` needs App Review justification.
- Mixed content (HTTPS page loading HTTP resource) on Android: `android.allowMixedContent: true` is a dev crutch, not a fix.
- Emulator to host machine: `10.0.2.2`, or `adb reverse`. iOS Simulator shares the Mac's `localhost`; a physical iPhone does not.
- Requests fine in Safari inspector but blocked by a VPN/proxy profile on the device: test with a clean network.

## Permissions

- iOS crash `This app has crashed because it attempted to access privacy-sensitive data without a usage description` -> add the matching `NS<Service>UsageDescription` string to `ios/App/App/Info.plist`.
- iOS prompt never reappears after denial; reset with `xcrun simctl privacy booted reset all <bundleId>` or delete/reinstall on device.
- Android: declare `<uses-permission>` in `android/app/src/main/AndroidManifest.xml`. Android 13+ split media permissions (`READ_MEDIA_IMAGES` etc.) and `POST_NOTIFICATIONS` must be requested at runtime.
- Use each plugin's own `checkPermissions()` / `requestPermissions()`; there is no generic permissions API in `@capacitor/core`.

## Live reload does not connect

- Capacitor 9 removed `-l/--host/--port/--https`; using them errors as unknown options. Use `--url`.
- Dev server bound to `localhost` only -> bind to `0.0.0.0` (Vite: `--host`).
- macOS firewall blocking the dev server port; Wi-Fi client isolation on guest networks.
- HTTP dev server on Android: the CLI only injects `server.url`, not `cleartext`. If you see `net::ERR_CLEARTEXT_NOT_PERMITTED`, add `server.cleartext: true` temporarily (the live-reload docs do the same).
- After stopping live reload the app still loads the dev URL: `cap run` writes `server.url` into the copied native `capacitor.config.json` and reverts it on exit; if the process was killed, run `npx cap copy` to restore it.

## Version mismatch

`npx cap doctor` must show identical major/minor for `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`. Capacitor 8.5 is current stable (`latest`); Capacitor 9 is `@next` (alpha). Mixing `8.x` core with `9.0.0-alpha` platforms produces bridge errors at launch. Fix with `capacitor-app-upgrades`.
