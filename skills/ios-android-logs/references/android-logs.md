# Android Logs, ANRs, and Crash Data

## Capacitor tags

- `Capacitor` - core bridge (`Logger` with no sub-tag).
- `Capacitor/Console` - mirrored JS console: `File: <url> - Line <n> - Msg: <text>`; level follows the JS level (error/warn/others).
- `Capacitor/Plugin`, `Capacitor/<Sub>` - plugin and bridge sub-tags (Capacitor's `Logger.tags(...)` joins with `/`).
- `chromium` - WebView internals (noisy; mostly ignorable unless debugging WebView crashes).
- `AndroidRuntime` - `FATAL EXCEPTION` stack traces for Java/Kotlin crashes.

Mirroring is controlled by `loggingBehavior` (root or `android.loggingBehavior`): `debug` default = debug builds only.

## adb logcat

```bash
adb logcat -c                                       # clear buffers before reproducing
adb logcat --pid="$(adb shell pidof -s com.example.app)"
adb logcat -s Capacitor:V Capacitor/Console:V AndroidRuntime:E
adb logcat '*:E'                                    # errors and above, quote the glob in zsh
adb logcat -e 'Capacitor|AndroidRuntime'            # regex on message+tag
adb logcat -b crash                                 # crash buffer only
adb logcat -b main -b system -b crash
adb logcat -d -t 500 > last500.log                  # dump last 500 lines and exit
adb logcat -T '10-10 09:30:00.000'                  # since a time
adb logcat -v threadtime -v color                   # threadtime is the default format
```

Priorities: `V D I W E F S`. A filterspec is `tag:priority`; `-s` silences everything not listed.

`--pid` is fixed at command start; the PID changes when the app restarts. For restart-proof filtering use Android Studio Logcat or wrap in a loop that re-resolves `pidof`.

## Android Studio Logcat (query syntax)

- `package:mine` - all processes of the open project.
- `package:com.example.app level:error`
- `tag:Capacitor` (substring match, so it includes `Capacitor/Console`); `tag:Capacitor/Console` for JS console only.
- `message:timeout`, `-tag:chromium` to exclude, `is:crash` for crashes.
- Save frequently used queries as favorites; the process restart is followed automatically.

## Crashes and ANRs

- Java/Kotlin crash: `adb logcat -b crash` or search `FATAL EXCEPTION`; the real cause is the last `Caused by:` block.
- Release-only `ClassNotFoundException` / `NoSuchMethodError`: R8 stripped plugin classes; see `debugging-capacitor` native reference.
- Native crash (`signal 11 (SIGSEGV)`): logcat shows `DEBUG` tag backtrace; full tombstones are in `/data/tombstones`, readable only on rooted/userdebug builds. On normal devices use:
  ```bash
  adb bugreport ./bugreport.zip     # includes tombstones, ANR traces, dumpsys
  ```
- ANR (`Application Not Responding`): logcat `ActivityManager: ANR in com.example.app`; traces are inside the bugreport (`FS/data/anr/`). Typical cause: blocking work on the main thread in a plugin method; move it to a background executor.
- Play Console > Android vitals shows production crashes/ANRs without an SDK.

## Other useful dumps

```bash
adb shell dumpsys meminfo com.example.app
adb shell dumpsys activity processes | grep com.example.app
adb shell dumpsys package com.example.app | grep -A3 "runtime permissions"
adb shell dumpsys webviewupdate                     # active WebView provider + version
```
