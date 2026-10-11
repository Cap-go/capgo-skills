---
name: ios-android-logs
description: Gets, filters, streams, and saves logs and crash reports from Capacitor apps on iOS Simulator, iPhone, Android emulator and devices. Explains where Capacitor output goes (iOS bridge and mirrored JS console lines are stdout-only, so missing from Console.app and `log stream`; Android tags `Capacitor` and `Capacitor/Console`). Covers `xcrun simctl spawn booted log stream --predicate`, `simctl launch --console-pty`, `xcrun devicectl device process launch --console`, `log collect --device-udid`, Console.app, devicectl `systemCrashLogs`, `adb logcat --pid`, `-b crash`, Android Studio `package:mine`, tombstones, ANRs, `adb bugreport`. Use for "how do I see logs", "console.log not showing on device", "no logs in Console.app", "get the crash log", "logcat too noisy". Do not use for diagnosing the bug once logs are in hand (debugging-capacitor), production crash SDKs (capacitor-native-observability), MCP log tooling (capacitor-mcp), or profiling (capacitor-performance).
---

# iOS and Android Logs for Capacitor Apps

Pick the log channel that actually carries the message you need, filter to the app, capture to a file, hand off to diagnosis.

## When to Use

TRIGGER when:
- User asks how to view, stream, filter, or save device/simulator logs.
- `console.log` output or `⚡️` Capacitor lines are missing on iOS/Android.
- User needs a crash report (`.ips`, tombstone, ANR) from a device or simulator.
- Logcat or the unified log is too noisy; user wants only their app or plugin.
- A log command fails or misbehaves: `--level error` still shows everything, `unable to find utility "devicectl"`, `Error: Unexpected argument 'log'`, `adb: no devices/emulators found`.

Do not use:
- Interpreting the error and fixing the app -> `debugging-capacitor`.
- Production crash/ANR reporting (Sentry, Crashlytics, Datadog) -> `capacitor-native-observability`.
- AI agent log streaming via MCP servers -> `capacitor-mcp`.
- CPU/memory profiling -> `capacitor-performance`.
- UIScene lifecycle migration -> `capacitor-uiscene-migration`.

## Where Capacitor Output Goes (the main trap)

| Source | iOS | Android |
|---|---|---|
| Capacitor bridge messages (`⚡️  Loading app at ...`, `⚡️  To Native ->`, errors) | **stdout only** (`print`) | logcat tag `Capacitor` and `Capacitor/<Sub>` |
| JS `console.log/warn/error` mirrored natively | stdout as `⚡️  [log] - ...` | logcat tag `Capacitor/Console` as `File: ... - Line N - Msg: ...` |
| JS console, full fidelity (objects, stack traces) | Safari Web Inspector | `chrome://inspect` |
| Plugin/app code using `os.Logger` / `NSLog` | unified log (Console.app, `log stream`) | n/a |
| Plugin code using `android.util.Log` / Capacitor `Logger` | n/a | logcat |
| Native crash | `.ips` crash report | `FATAL EXCEPTION` in logcat + crash buffer; tombstone for native code |

Consequences:
- On iOS, Console.app and `log stream` will **not** show Capacitor's `⚡️` lines or mirrored JS console. Use Xcode's console, `xcrun simctl launch --console-pty`, or `xcrun devicectl device process launch --console`.
- Mirroring obeys `loggingBehavior` (`none` | `debug` | `production`, default `debug`): Release builds produce no Capacitor logs unless set to `production`.
- The iOS process name is the executable (`App` in the Capacitor template), not the display name. Filter with `process == "App"`.

## Quick Commands

```bash
# iOS Simulator: Capacitor + JS console (stdout), relaunching the app
xcrun simctl launch --console-pty --terminate-running-process booted com.example.app

# iOS Simulator: unified log for the app (os_log / NSLog / system messages)
xcrun simctl spawn booted log stream --level debug --predicate 'process == "App"'

# iPhone: install + launch with stdout attached (Xcode 15+ devicectl)
xcrun devicectl list devices
xcrun devicectl device process launch --console --terminate-existing --device <id> com.example.app

# iPhone: unified log snapshot of the last 10 minutes
sudo log collect --device-udid <udid> --last 10m --output /tmp/iphone.logarchive
log show /tmp/iphone.logarchive --predicate 'process == "App"' --info --debug

# Android: only this app (re-run after each app restart, PID changes)
adb logcat --pid="$(adb shell pidof -s com.example.app)"

# Android: Capacitor + JS console only
adb logcat -s Capacitor:V Capacitor/Console:V

# Android: crashes only
adb logcat -b crash
```

## Procedure

1. **Identify target**: Simulator/emulator vs physical device; Debug vs Release; which layer emitted the message (table above).
2. **Check connectivity**: `xcrun simctl list devices booted`, `xcrun devicectl list devices` (device must be unlocked, trusted, Developer Mode on), `adb devices -l`.
3. **Clear and reproduce**: `adb logcat -c` on Android; on iOS start the stream before relaunching the app.
4. **Filter early** by process/PID, then by subsystem/tag, then by text. Never paste unfiltered system logs into a conversation.
5. **Save** to a file (`> app.log`, `.logarchive`, `adb bugreport`) when the user needs to share it; redact tokens, emails, and auth headers before sharing outside the team.
6. **Hand off** the relevant lines to `debugging-capacitor` for root-cause work.

## Error Handling

| Message | Fix |
|---|---|
| `--level error` still shows every message | `log stream --level` only understands `default`, `info`, `debug` (it sets the floor, not a ceiling). Filter errors with `--predicate 'messageType == error OR messageType == fault'`. |
| `xcrun: error: unable to find utility "devicectl"` | Active dev dir is Command Line Tools. `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`. |
| `Error: Unexpected argument 'log'` (devicectl) | `devicectl` has no log streaming subcommand. Use `--console` for stdout, Console.app or `log collect --device-udid` for unified logs. |
| `log collect` fails with a permission error | Run with `sudo`; device must be unlocked and trusted. |
| `No devices are booted.` (simctl) | `xcrun simctl boot "<device name>"` or open Simulator. |
| `adb: no devices/emulators found` / `unauthorized` | Enable USB debugging, accept the RSA prompt, `adb kill-server && adb start-server`. |
| `adb logcat --pid=` prints everything / errors | App not running so `pidof` returned nothing. Launch the app first. |
| No `Capacitor/Console` lines on Android | `loggingBehavior: 'none'`, or Release build with default `debug`. |
| JS logs show but objects print as `[object Object]` | Native mirroring stringifies; use the WebView inspector for structured output. |

## Verification

- iOS sim: launch with `--console-pty`, see `⚡️  Loading app at capacitor://localhost` and a test `console.log('log-check')` as `⚡️  [log] - log-check`.
- iOS device: same via `devicectl device process launch --console`.
- Android: `adb logcat -s Capacitor/Console:V` shows `Msg: log-check`.
- Unified log: a plugin `Logger(subsystem: "com.example.app", category: "test").info("log-check")` appears with `--predicate 'subsystem == "com.example.app"' --level info`.

## References

Only load a reference when its topic is in play.

| File | Load when |
|---|---|
| `references/ios-logs.md` | Unified log predicates, Console.app, `log collect`/`log show`, iOS crash reports via devicectl/Xcode, adding `os.Logger` to a plugin |
| `references/android-logs.md` | logcat buffers/formats/filters, Android Studio Logcat queries, ANRs, tombstones, bugreports, WebView (`chromium`) noise |

## Resources

- https://developer.apple.com/documentation/os/logging
- https://developer.apple.com/documentation/xcode/acquiring-crash-reports-and-diagnostic-logs
- https://developer.android.com/tools/logcat
- https://developer.android.com/studio/debug/logcat
- https://capacitorjs.com/docs/config
