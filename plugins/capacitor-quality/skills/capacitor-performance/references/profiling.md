# Profiling Capacitor Apps

Always profile a release-like build on a physical device.

## WebView (JavaScript, layout, paint)

### iOS - Safari Web Inspector
1. iPhone: Settings > Apps > Safari > Advanced > Web Inspector on.
2. Mac Safari: Settings > Advanced > Show features for web developers.
3. Release builds need `ios: { webContentsDebuggingEnabled: true }` in `capacitor.config.*` (turn it off again before shipping). Debug builds are inspectable by default (iOS 16.4+ `isInspectable`).
4. Develop menu > device > app page > Timelines > record, reproduce, stop. Look at JavaScript & Events (long tasks), Layout & Rendering (forced layouts), Memory.

### Android - Chrome DevTools
1. Debug builds are inspectable. For release, set `android: { webContentsDebuggingEnabled: true }` temporarily.
2. `chrome://inspect/#devices` > inspect > Performance > record. Use CPU throttling off (the device is already the real target).
3. Memory tab > Heap snapshot before/after a flow to find detached DOM and retained listeners.

## Native

### iOS - Instruments
- Product > Profile (Cmd-I) builds Release and opens Instruments.
- Templates: App Launch (cold start breakdown), Time Profiler (hot native code, plugin work on main thread), Allocations + VM Tracker (memory growth, WebContent pressure), Leaks.
- `xcrun xctrace list templates` lists templates; `xcrun xctrace record --template 'Time Profiler' --device <udid> --launch -- <path-to-.app>` records from the CLI.
- Field data: Xcode > Window > Organizer > Metrics (launch time, hangs, memory) for TestFlight/App Store builds.

### Android - Studio Profiler and adb
- View > Tool Windows > Profiler; profile a `profileable` or debuggable build.
- Cold start: `adb shell am force-stop <appId> && adb shell am start -W -n <appId>/.MainActivity` -> `TotalTime` ms. Repeat 5 times, use median.
- Frames: `adb shell dumpsys gfxinfo <appId> reset`, run the flow, `adb shell dumpsys gfxinfo <appId>` -> Janky frames.
- Memory: `adb shell dumpsys meminfo <appId>`.
- WebView provider/version: `adb shell dumpsys webviewupdate`.

## Bridge

- Debug builds print each call (`To Native ->` and result lines) in Xcode console / logcat when `loggingBehavior` allows. Count calls per screen; batch or cache repeated calls.
- Large payloads: in Safari/Chrome Network or Timeline you will see long `JSON.parse` / message handler tasks after plugin calls returning big strings.

## Reading results

| Observation | Likely cause |
|---|---|
| Long JS tasks at startup before first paint | Large bundle or synchronous init; split routes, defer SDK init. |
| Long tasks right after a plugin call resolves | Big bridge payload (base64, large JSON). |
| Native main thread busy during plugin call | Plugin doing work on main thread; move to background queue/thread. |
| Memory sawtooth then WebView reload | Image decoding / canvas peaks; downscale. |
| Fine on simulator, slow on device | GPU/memory limits or old Android WebView. |
