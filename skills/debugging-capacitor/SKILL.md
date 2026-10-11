---
name: debugging-capacitor
description: Diagnoses and fixes runtime bugs in Capacitor iOS/Android apps - white/blank screen on launch, startup crashes, `"X" plugin is not implemented on ios/android`, `net::ERR_CLEARTEXT_NOT_PERMITTED`, App Transport Security blocks, CORS on capacitor://localhost, permission denials, live reload not connecting, and Capacitor 8.5+ UIScene regressions (appUrlOpen, universal links, pause/resume silent because AppDelegate callbacks stopped). Covers Safari Web Inspector, chrome://inspect, Xcode/LLDB, Android Studio, `npx cap run --url` (Capacitor 9) vs `-l --host` (8), `xcrun simctl openurl|privacy|push`, `xcrun devicectl device process launch|openURL`, `xctrace`. Do not use for only reading device logs (ios-android-logs), the UIScene migration itself (capacitor-uiscene-migration), deep-link setup (capacitor-deep-linking), speed (capacitor-performance), crash SDKs (capacitor-native-observability), tests (capacitor-testing), or upgrades/build errors (capacitor-app-upgrades, cocoapods-to-spm).
---

# Debugging Capacitor Apps

Find which layer is broken (web, bridge, native, OS config), prove it with the right inspector, then fix the smallest thing.

## When to Use

TRIGGER when:
- App shows a white/blank screen, crashes on launch, or freezes after a native call.
- Error `"<Name>" plugin is not implemented on ios|android` or `"<Name>.<method>()" is not implemented on ...`.
- Network calls fail on device only: `net::ERR_CLEARTEXT_NOT_PERMITTED`, ATS "requires the use of a secure connection", CORS errors.
- Permission prompts never appear or always deny.
- Live reload (`cap run --url`, `server.url`) shows a blank page or "Webpage not available".
- After updating to Capacitor 8.5+ / Xcode 27: `appUrlOpen` silent, universal links open the app but do nothing, JS `pause`/`resume` or custom AppDelegate code no longer runs.
- User asks "how do I debug / inspect my Capacitor app".

Do not use:
- Only need to stream, filter, or save logs or crash reports -> `ios-android-logs`.
- Performing the AppDelegate -> SceneDelegate migration itself -> `capacitor-uiscene-migration`.
- Setting up deep links, AASA, assetlinks from scratch -> `capacitor-deep-linking`.
- Jank, slow startup, bundle size, memory tuning -> `capacitor-performance`.
- Sentry / Crashlytics / Datadog in production -> `capacitor-native-observability`.
- Writing unit/E2E tests -> `capacitor-testing`. AI/MCP device automation -> `capacitor-mcp`.
- Gradle/Xcode build failures from version bumps -> `capacitor-app-upgrades`; Pods/SPM resolution -> `cocoapods-to-spm`.
- Push token/delivery issues -> `capacitor-push-notifications`; keyboard overlap -> `capacitor-keyboard`; notch/insets -> `safe-area-handling`.

## Triage Workflow

1. **Collect facts before touching code**: platform(s), simulator vs device, debug vs release, Capacitor version (`npx cap doctor`), what changed last (upgrade, plugin added, config edit), exact error text.
2. **Classify the layer**:
   - JS exception, failed fetch, bad route -> web layer: open the WebView inspector (Safari / `chrome://inspect`). See `references/webview-inspection.md`.
   - `plugin is not implemented` -> bridge/registration: the native code is not in the binary or JS cannot be injected. See Error Handling below.
   - Process dies / `EXC_BAD_ACCESS` / `FATAL EXCEPTION` -> native layer: run from Xcode / Android Studio with the debugger attached. See `references/native-debugging.md`.
   - Works on Android but not iOS after 8.5/Xcode 27, link/lifecycle related -> UIScene. See `references/uiscene-regressions.md`.
3. **Reproduce with a fresh sync**: `npm run build && npx cap sync` then rebuild native. Stale `public/` assets and un-synced plugins cause most "works in browser, broken on device" reports.
4. **Read the native console** for Capacitor's own messages. iOS prints `⚡️  Loading app at ...`, `⚡️  [log] - ...`, `⚡️  ERROR: Unable to load ...` to **stdout** (visible in Xcode's console, `simctl launch --console-pty`, `devicectl ... launch --console`; not in Console.app). Android logs under tag `Capacitor` and JS console under `Capacitor/Console`. Log commands live in `ios-android-logs`.
5. **Report the root cause and proposed fix to the user before invasive changes** (deleting `ios/`/`android/`, editing `project.pbxproj`, disabling ATS globally).
6. Apply the fix, then run the Verification steps.

## Tool Matrix

| Need | iOS | Android |
|------|-----|---------|
| Inspect DOM/JS/network | Safari > Develop > device > app | `chrome://inspect/#devices` |
| Native breakpoints | Xcode (`npx cap open ios`), LLDB | Android Studio debugger (`npx cap open android`) |
| Run on target from CLI | `npx cap run ios --target <id>` | `npx cap run android --target <id>` |
| List targets | `npx cap run ios --list` | `npx cap run android --list` |
| Open URL / deep link | `xcrun simctl openurl booted <url>`; device: `xcrun devicectl device process openURL --device <id> <url>` | `adb shell am start -W -a android.intent.action.VIEW -d "<url>" <appId>` |
| Reset/grant permissions (sim) | `xcrun simctl privacy booted reset all <appId>` | `adb shell pm revoke <appId> android.permission.CAMERA` / `adb shell pm clear <appId>` |
| Fake push (sim) | `xcrun simctl push booted <appId> payload.json` | send a real FCM message |
| Launch with stdout | `xcrun simctl launch --console-pty booted <appId>`; device: `xcrun devicectl device process launch --console --device <id> <appId>` | `adb logcat` |
| Profile | Instruments / `xcrun xctrace record --template 'Time Profiler'` | Android Studio Profiler |

Details and caveats: `references/device-cli.md`.

## Live Reload Quick Path

- Capacitor 9 (`@next`): `npx cap run ios --url http://192.168.1.68:5173`. The old `-l/--live-reload`, `--host`, `--port`, `--https` flags are removed.
- Capacitor 8.5 (stable): `npx cap run ios -l --host 192.168.1.68 --port 5173` (add `--https` for an https dev server).
- Android emulator/USB: `--forwardPorts 5173:5173` runs `adb reverse` so `http://localhost:5173` works.
- Dev server must bind to `0.0.0.0`; phone and Mac on the same Wi-Fi; iOS may ask for Local Network access; if denied the page never loads (re-enable in Settings > Privacy & Security > Local Network).
- Never ship `server.url` / `server.cleartext` in `capacitor.config.*`; grep before release.

## Error Handling

| Error / symptom | Likely cause | Fix |
|---|---|---|
| `"Foo" plugin is not implemented on ios` | Plugin not in native project, or JS injection blocked | `npm i <plugin>` -> `npx cap sync ios`. SPM: check `ios/App/CapApp-SPM/Package.swift` lists it; CocoaPods: check `ios/App/Podfile`. Remove `WKAppBoundDomains` from Info.plist or set `ios.limitsNavigationsToAppBoundDomains: true`. |
| `"Foo" plugin is not implemented on android` | Gradle not synced, or a service worker intercepts the page | `npx cap sync android`, then File > Sync Project with Gradle Files. Disable/unregister service workers in the native build. |
| `"Foo.bar()" is not implemented on web` | Calling a native-only method in the browser | Guard with `Capacitor.isNativePlatform()` / `Capacitor.isPluginAvailable('Foo')`. |
| `⚡️  ERROR: Unable to load .../index.html` / white screen | `webDir` wrong or never copied | Build web, verify `webDir` matches output folder, `npx cap copy`. |
| White screen, no native error | JS crash before first render, or bad `<base href>` / absolute asset paths | Inspect WebView console; use relative/root paths that resolve under `capacitor://localhost` / `https://localhost`. |
| `net::ERR_CLEARTEXT_NOT_PERMITTED` | Android blocks HTTP (API 28+) | Use HTTPS. For dev only: `server.cleartext: true` or a `network_security_config.xml` scoped to the dev host. |
| "The resource could not be loaded because the App Transport Security policy requires the use of a secure connection." | iOS ATS | Use HTTPS. For dev only: `NSExceptionDomains` for the dev host, not global `NSAllowsArbitraryLoads`. |
| CORS error from API on device only | Origin is `capacitor://localhost` (iOS) / `https://localhost` (Android) | Allow those origins server-side, or enable `CapacitorHttp` (`plugins.CapacitorHttp.enabled: true`) to route `fetch`/XHR natively. |
| Crash on permission request (iOS, `This app has crashed because it attempted to access privacy-sensitive data without a usage description`) | Missing `NS*UsageDescription` | Add the key to `ios/App/App/Info.plist`. |
| Permission always `denied` on Android | Missing `<uses-permission>` or user chose "Don't allow" twice | Add to `AndroidManifest.xml`; guide user to settings. |
| `No such module 'Capacitor'` (Xcode) | Opened `.xcodeproj` with CocoaPods, or SPM packages not resolved | Pods: open `App.xcworkspace`, `npx cap sync ios`. SPM: File > Packages > Reset Package Caches. Deeper -> `cocoapods-to-spm`. |
| `Unable to boot device in current state: Booted` | Simulator already running | Not an error; use `booted` as the device id. |
| `appUrlOpen` / universal links silent on iOS only after 8.5 | AppDelegate `open url` / `continue userActivity` no longer called | See `references/uiscene-regressions.md`. |
| JS `pause`/`resume` stop firing | Custom SceneDelegate missing proxy forwarding, or logic left in `applicationDidEnterBackground` | See `references/uiscene-regressions.md`. |

More symptom-specific fixes: `references/common-failures.md`.

## Verification

After any fix, prove it:
1. `npx cap doctor` shows matching `@capacitor/core`, `cli`, `ios`, `android` versions.
2. `npm run build && npx cap sync` completes with no warnings about missing plugins.
3. Native console shows `⚡️  Loading app at capacitor://localhost...` (iOS) / no `Capacitor/Console` errors (Android).
4. WebView inspector console is clean on launch.
5. Re-run the exact repro on both a simulator/emulator and a physical device, in a **release** build if the bug was release-only (`cap run` builds Debug by default; iOS accepts `--configuration Release`, Android release builds go through Android Studio or Gradle).
6. For link/lifecycle fixes: test cold (app killed) and warm (app backgrounded) launch with `simctl openurl` / `adb shell am start`, and background/foreground once to see `pause` and `resume`.
7. Before shipping: `grep -n "server" capacitor.config.*` shows no `url`/`cleartext` left over.

## References

Only load a reference when its topic is in play.

| File | Load when |
|------|-----------|
| `references/webview-inspection.md` | Attaching Safari/Chrome inspectors, inspector shows no app, debugging release builds, early-startup JS errors |
| `references/native-debugging.md` | Native crash, breakpoints in plugins, LLDB, Android Studio debugger, Instruments/xctrace, memory leaks |
| `references/device-cli.md` | Driving simulators/devices from the terminal: install, launch, open URLs, permissions, push, app containers |
| `references/uiscene-regressions.md` | iOS deep links, universal links, cold-start URL, pause/resume, or AppDelegate code broken after Capacitor 8.5 / Xcode 27 |
| `references/common-failures.md` | Detailed fixes for white screen, plugin not implemented, networking, permissions, live reload |

## Resources

- https://capacitorjs.com/docs/ios/troubleshooting
- https://capacitorjs.com/docs/android/troubleshooting
- https://capacitorjs.com/docs/guides/live-reload
- https://capacitorjs.com/docs/updating/8-5
- https://capacitorjs.com/docs/cli/commands/run
