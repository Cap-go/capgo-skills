# iOS Logs and Crash Reports

Verified with Xcode 27.1 (`log help stream|show|collect`, `xcrun devicectl help`, `xcrun simctl help`).

## Channels

1. **stdout/stderr** of the app process: Capacitor `⚡️` lines, mirrored JS console, Swift `print`. Visible only when something is attached:
   - Xcode Run console.
   - `xcrun simctl launch --console-pty [--terminate-running-process] booted <bundleId>` (or `--stdout=/tmp/out.log --stderr=/tmp/err.log`).
   - `xcrun devicectl device process launch --console [--terminate-existing] --device <id> <bundleId>`; Ctrl+C is forwarded to the app.
2. **Unified log** (`os.Logger`, `os_log`, `NSLog`, system frameworks, WebKit networking): Console.app, `log stream`, `log show`, `log collect`.
3. **Crash reports** (`.ips`): Xcode Devices window, Console.app > Crash Reports, devicectl `systemCrashLogs` domain, `~/Library/Logs/DiagnosticReports/` for Simulator crashes.

## Simulator unified log

```bash
xcrun simctl spawn booted log stream --level debug --predicate 'process == "App"'
xcrun simctl spawn booted log stream --predicate 'subsystem == "com.example.app"' --style compact
xcrun simctl spawn booted log show --last 5m --predicate 'process == "App"' --info --debug
```

`--level` accepts `default | info | debug` only. `--style` accepts `default | syslog | json | ndjson | compact`. `--timeout 2m` stops streaming automatically (useful for agents).

## Physical device unified log

- Console.app: select the device in the sidebar, press Start, type `process:App` or `subsystem:com.example.app` in search. Enable Action > Include Info/Debug Messages.
- CLI snapshot (needs sudo, device unlocked and trusted):
  ```bash
  sudo log collect --device-udid <udid> --last 15m --output /tmp/device.logarchive
  log show /tmp/device.logarchive --predicate 'process == "App"' --info --debug --style compact
  ```
  `--device` picks the first connected device; `--device-name "<name>"` also works. Adding `--predicate` at collect time is allowed but slower.
- `devicectl` has no log streaming command. `xcrun devicectl device sysdiagnose --device <id>` gathers a full sysdiagnose when Apple or a plugin vendor asks for one.

## Predicate cheatsheet

```text
process == "App"
subsystem == "com.example.app" AND category == "Bridge"
eventMessage CONTAINS[c] "timeout"
messageType == error OR messageType == fault
process == "App" AND NOT (subsystem BEGINSWITH "com.apple")
senderImagePath CONTAINS "MyPlugin"            # messages emitted by a specific framework binary
```

Run `log help predicates` for every field. Time windows belong in `log show --last 10m` / `--start`, not in the predicate.

## Making plugin/app code visible without Xcode

`print` is invisible to Console.app. For logs that must survive on device, use the unified log:

```swift
import os

private let log = Logger(subsystem: "com.example.app", category: "MyPlugin")

log.info("started")                                  // visible with --info / Include Info
log.error("request failed: \(error.localizedDescription, privacy: .public)")
```

Interpolated values are `<private>` in device logs unless marked `privacy: .public`; never mark tokens or personal data public.

## Crash reports

```bash
# list crash logs on a device
xcrun devicectl device info files --device <id> --domain-type systemCrashLogs
# copy one locally
xcrun devicectl device copy from --device <id> --domain-type systemCrashLogs \
  --source <file-name-from-list>.ips --destination ./crashes/
# simulator crashes land on the Mac
ls ~/Library/Logs/DiagnosticReports/ | grep -i '^App'
```

- If the domain requires an identifier on your Xcode version, the command error says so; check `xcrun devicectl device copy from --help`.
- Symbolication: open the `.ips` in Xcode (Devices window) or Console.app with the matching `.dSYM` available (archive in Xcode Organizer). Unsymbolicated frames show only addresses.
- User-side retrieval: Settings > Privacy & Security > Analytics & Improvements > Analytics Data.
- Watchdog kills (`0x8badf00d`) mean the main thread blocked too long, often synchronous plugin work at launch.
- Memory (jetsam) terminations do not produce a normal crash stack; look for `JetsamEvent` reports in the same list.
