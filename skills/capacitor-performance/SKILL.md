---
name: capacitor-performance
description: Diagnoses and fixes performance problems specific to Capacitor apps - slow cold start or long splash, white screen after camera/backgrounding (WKWebView "WebView process terminated" reload, Android onRenderProcessGone), large base64 payloads over the native bridge (Camera, Filesystem.readFile, CapacitorHttp), jank in the WebView, memory growth from unremoved plugin listeners, oversized Preferences storage, slow Android WebView versions, and debug logging left on in release. Covers profiling with Safari Web Inspector, chrome://inspect, Xcode Instruments, Android Studio Profiler, and adb timing commands. Do not use for crash/stack-trace debugging (use debugging-capacitor or capacitor-native-observability), device log capture (use ios-android-logs), offline data architecture (use capacitor-offline-first / sqlite-to-fast-sql), splash configuration details (use capacitor-splash-screen), or generic web performance unrelated to Capacitor.
---

# Capacitor Performance

Find the bottleneck first (WebView JS, bridge, native, or network), then fix the specific cause. Generic web advice (code splitting, image compression, virtual lists) still applies; this skill focuses on what is different inside Capacitor.

## When to Use

TRIGGER when:
- Cold start is slow, splash stays long, or the first screen is blank for seconds.
- App "restarts" or shows a white screen after taking a photo, opening a big file, or returning from background.
- Native calls feel slow, especially with images, files, or large HTTP responses.
- Scrolling/animations jank only on device (often older Android WebView).
- Memory grows over time; listeners pile up.

Do not use:
- Crashes, native stack traces -> `debugging-capacitor`, `capacitor-native-observability`.
- Getting logs off a device -> `ios-android-logs`.
- Offline storage design / SQLite migration -> `capacitor-offline-first`, `sqlite-to-fast-sql`.
- Splash screen setup -> `capacitor-splash-screen`; keyboard resize jank -> `capacitor-keyboard`.
- OTA bundle size and delta updates -> `capgo-live-updates`.

## Procedure

1. **Reproduce on a real device in a release-like build.** Debug builds log every bridge call and disable optimizations; simulators hide memory and GPU limits.
2. **Classify** with the profiling table below: JS main thread busy, bridge payloads large, native thread busy, or waiting on network.
3. **Check the traps** list. Most Capacitor-specific regressions are one of these.
4. **Fix one thing, measure again** with the same command/trace. Report before/after numbers to the user.

## Profiling Quick Reference

| Question | Tool |
|---|---|
| JS long tasks, layout, paint (iOS) | Safari > Develop > device > app > Timelines. Requires `ios.webContentsDebuggingEnabled: true` for release builds (debug builds are inspectable by default on iOS 16.4+). |
| JS long tasks, memory heap (Android) | `chrome://inspect` > Performance / Memory. |
| Native CPU, allocations, leaks (iOS) | Xcode > Product > Profile > Time Profiler / Allocations / Leaks; field data in Xcode Organizer > Metrics. |
| Native CPU/memory (Android) | Android Studio > Profiler. |
| Android cold start time | `adb shell am force-stop <appId> && adb shell am start -W -n <appId>/.MainActivity` (read `TotalTime`). |
| Android frame stats | `adb shell dumpsys gfxinfo <appId>` (janky frames %). |
| Android WebView version | `adb shell dumpsys webviewupdate` (current provider and version). |

Details and recipes: `references/profiling.md`.

## Capacitor-Specific Traps

1. **Base64 over the bridge.** Every plugin call/response is JSON-serialized across the bridge. Multi-MB base64 strings stall both threads and can kill the WebView process.
   - Camera (`@capacitor/camera` 8.1+ API): use `takePhoto` / `chooseFromGallery` and display `result.webPath`; set `targetWidth`/`targetHeight`/`quality`. Avoid reading full-resolution base64 unless uploading. The older `getPhoto` / `pickImages` are deprecated.
   - Files: pass paths, use `Capacitor.convertFileSrc(uri)` for `<img>/<video>` src, `Filesystem.readFileInChunks` for large reads, `@capacitor/file-transfer` for uploads/downloads.
2. **WebView process killed under memory pressure.** iOS logs `WebView process terminated`; Capacitor resets the bridge and reloads the page, so in-memory JS state is lost (looks like a restart). Android calls `onRenderProcessGone`; unless handled, the app is killed. Reduce peak memory (trap 1, large canvases, decoded images), persist critical state, restore on load.
3. **CapacitorHttp for large responses.** With `plugins.CapacitorHttp.enabled: true`, `fetch`/`XMLHttpRequest` are routed through native and bodies cross the bridge. Great for CORS/cookies, slower for big downloads or streaming. Use file-transfer for big files.
4. **Preferences as a database.** `@capacitor/preferences` (UserDefaults / SharedPreferences) is for small key/value data. Large JSON blobs are read/written whole and slow startup; use SQLite (for example `@capgo/capacitor-fast-sql`).
5. **Logging in release.** `loggingBehavior` defaults to `debug` (logs only in debug builds). If it was set to `production`, every bridge call is logged in release; set it back to `debug` or `none`.
6. **Dev server left in config.** `server.url` pointing to a LAN/live-reload server in a shipped build loads over network and fails offline. Remove before release; in Capacitor 9 use `npx cap run <platform> --url` for live reload instead of editing config.
7. **Old Android System WebView.** Performance and CSS support depend on the updatable WebView, not the OS version. `android.minWebViewVersion` (default 60) only shows an error/`server.errorPath`; it does not update anything. Expensive CSS (`backdrop-filter`, large `box-shadow`/`filter` on scrolling content) janks on low-end WebViews.
8. **Listener leaks.** `addListener` returns `Promise<PluginListenerHandle>`; await it and call `remove()` on unmount. Re-registering on every route change multiplies native callbacks (`appStateChange`, `keyboardWillShow`, geolocation `watchPosition` - clear with `clearWatch`).
9. **Startup sequencing.** Hide the splash only after first meaningful render (`launchAutoHide: false` + `SplashScreen.hide()`), and defer non-critical plugin calls (analytics init, permission checks) until after first paint. Note Capacitor 9 changes Android `launchFadeOutDuration` default from 200 to 0.
10. **Plugin imports are not the startup cost.** Importing `@capacitor/*` packages creates lightweight proxies; their web implementations are already lazy-loaded via `registerPlugin`. Lazy-load heavy JS libraries (charts, PDF, maps SDK JS) and routes instead.

## Verification

- Same device, same build type, before/after numbers: cold start `TotalTime` (Android) or Instruments App Launch / Organizer launch time (iOS), janky frame %, peak memory in Allocations/Profiler.
- Grep the release config: `grep -nE '"url"|loggingBehavior|webContentsDebuggingEnabled' capacitor.config.*` and confirm no dev `server.url`.
- For trap 1, grep for full-size base64 usage: `grep -rnE "resultType: *CameraResultType.Base64|readFile\(|getPhoto\(" src/`.
- Background the app, open the camera 10 times, return: the page must not reload (iOS) or crash (Android).

## Error Handling

| Message / symptom | Meaning | Fix |
|---|---|---|
| `WebView process terminated` (Xcode console) | WKWebView content process killed (memory) | Trap 1/2: lower peak memory, persist state. |
| Android logcat `Render process ... gone` / app exits after heavy page | Renderer crashed or killed | Reduce memory; implement handling via a `WebViewListener` `onRenderProcessGone` if recovery is required. |
| `ANR in <appId>` (logcat) | Main thread blocked > 5 s, often heavy plugin work on UI thread | Move native work off main thread in custom plugins; profile with Android Studio. |
| `Message from debugger: Terminated due to memory issue` | iOS jetsam killed the whole app | Allocations instrument; reduce image decoding and caches. |
| Logcat error about the WebView version being below `minWebViewVersion` | Device WebView too old | Ask user to update Android System WebView; show `server.errorPath` page. |

## References

Only load when needed:
- `references/profiling.md`: step-by-step traces (Safari Timelines, Chrome Performance, Instruments templates, Android Profiler, adb commands) and how to read them.
