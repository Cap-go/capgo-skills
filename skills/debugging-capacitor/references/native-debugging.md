# Native Debugging (Xcode, Android Studio, Profilers)

## iOS (Xcode 27)

- Open with `npx cap open ios`. SPM projects open `App.xcodeproj`; CocoaPods projects must open `App.xcworkspace`.
- Plugin sources: SPM packages appear under Package Dependencies; Pods under the `Pods` project. Breakpoints in plugin Swift files work once the package is resolved.
- Add an **Exception Breakpoint** (Breakpoint navigator > + > Exception Breakpoint) and a **Swift Error Breakpoint** to stop at the throw site instead of `main`.
- Useful LLDB: `bt` (backtrace), `po <expr>`, `v <var>` (frame variable, no code execution), `expr <code>`, `thread step-over` / `n`, `c`.
- Crash with `EXC_BAD_ACCESS`: enable Address Sanitizer or Zombie Objects in Scheme > Run > Diagnostics, reproduce, then turn them off.
- Main Thread Checker warnings (`UI API called on a background thread`) usually come from plugin code calling UIKit inside a `CAPPluginCall` handler; wrap in `DispatchQueue.main.async`.
- Capacitor's iOS messages go to stdout via `print` (prefixed `⚡️`). They show in Xcode's console but not in Console.app.
- Crash reports from a device: Window > Devices and Simulators > device > View Device Logs, or the CLI in `ios-android-logs`.

## Android (Android Studio)

- Open with `npx cap open android`. Wait for Gradle sync; `plugin is not implemented` right after adding a plugin often means sync did not run.
- Run > Debug 'app', or attach to a running process: Run > Attach Debugger to Android Process.
- Plugin code is in `node_modules/<plugin>/android`, surfaced as Gradle modules (`:capacitor-camera` etc.). Set breakpoints there.
- `FATAL EXCEPTION: main` in logcat gives the Java/Kotlin stack; `Caused by:` lines near the bottom are the real cause.
- Native (C/C++) crashes produce tombstones; read them via `adb bugreport` (see `ios-android-logs`).
- Release-only crash with `ClassNotFoundException` / `NoSuchMethodException`: R8/ProGuard stripped plugin classes. Capacitor core ships rules; add `-keep class <plugin.package>.** { *; }` for the offending plugin. In Capacitor 9, `proguard-android.txt` is gone; use `proguard-android-optimize.txt`.

## Profiling

- iOS: Product > Profile (Cmd+I) opens Instruments. CLI equivalent (Xcode 27):
  ```bash
  xcrun xctrace list templates
  xcrun xctrace record --template 'Time Profiler' --device <udid> --attach <AppName> --time-limit 30s --output app.trace
  ```
  `xcrun instruments` is gone; use `xctrace`. Templates relevant here: Time Profiler, Allocations, Leaks, Network, App Launch, Animation Hitches.
- Android: View > Tool Windows > Profiler (CPU, Memory, Network, Energy). For leak detection in debug builds, LeakCanary is the usual choice (check its current version).
- JS: Performance tab in Safari / Chrome inspector. Deeper tuning belongs in `capacitor-performance`.

## Plugin method debugging checklist

1. JS call reaches native? Breakpoint at the `@objc func method(_ call: CAPPluginCall)` / `@PluginMethod` entry.
2. Every path calls `call.resolve(...)` or `call.reject(...)`; a missing one leaves the JS promise pending forever.
3. Long-lived callbacks use `call.keepAlive = true` (iOS) / `call.setKeepAlive(true)` (Android) and are released later.
4. Permission-gated methods check status before acting; on Android use the plugin's `@Permission` aliases.
