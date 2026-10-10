# Driving Simulators and Devices from the Terminal

Verified against Xcode 27.1 `xcrun simctl help` / `xcrun devicectl help`. If `xcrun` says `unable to find utility "devicectl"`, the active developer dir is Command Line Tools: run `sudo xcode-select -s /Applications/Xcode.app` (or prefix commands with `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`).

## Where `cap run` puts the build

`npx cap run ios` builds with `-derivedDataPath ios/DerivedData/<target-id>`; the app is at
`ios/DerivedData/<target-id>/Build/Products/Debug-iphonesimulator/App.app` (or `Debug-iphoneos` for devices, `App` = scheme). Reuse it with the commands below instead of rebuilding.

## iOS Simulator (`xcrun simctl`)

```bash
xcrun simctl list devices available            # find UDIDs
xcrun simctl boot "iPhone 18 Pro"              # "Unable to boot device in current state: Booted" = already running
xcrun simctl install booted path/to/App.app
xcrun simctl launch --console-pty booted com.example.app   # stdout/stderr incl. Capacitor ⚡️ logs
xcrun simctl launch --terminate-running-process booted com.example.app
xcrun simctl terminate booted com.example.app
xcrun simctl openurl booted "myapp://orders/42"           # custom scheme / universal link test
xcrun simctl privacy booted grant photos com.example.app  # also: revoke, reset; services: location, microphone, contacts, calendar, ...
xcrun simctl privacy booted reset all com.example.app     # re-trigger permission prompts
xcrun simctl push booted com.example.app payload.json     # payload must contain "aps", <= 4096 bytes
xcrun simctl get_app_container booted com.example.app data   # inspect files, localStorage/IndexedDB under Library/WebKit
xcrun simctl location booted set 48.8566,2.3522
xcrun simctl ui booted appearance dark
xcrun simctl diagnose                                     # bundle logs for a bug report
```

Notes:
- `privacy` has no `camera` service; the Simulator has no camera. Test camera on a device.
- Env vars for a launch: prefix with `SIMCTL_CHILD_`, e.g. `SIMCTL_CHILD_DEBUG=1 xcrun simctl launch ...`.
- Universal links via `openurl` only route into the app if the Associated Domains entitlement and AASA are valid; otherwise Safari opens.

## iOS physical device (`xcrun devicectl`, Xcode 15+)

```bash
xcrun devicectl list devices                                   # identifier / name / state
xcrun devicectl device info details --device <id>
xcrun devicectl device install app --device <id> path/to/App.app
xcrun devicectl device process launch --device <id> --console com.example.app   # attach stdout, wait for exit
xcrun devicectl device process launch --device <id> --terminate-existing com.example.app
xcrun devicectl device process launch --device <id> --payload-url "myapp://orders/42" com.example.app  # cold-start URL
xcrun devicectl device process openURL --device <id> "myapp://orders/42"         # warm URL open
xcrun devicectl device info processes --device <id>             # find PID
xcrun devicectl device process terminate --device <id> --pid <pid>
xcrun devicectl device process sendMemoryWarning --device <id> --pid <pid>
xcrun devicectl device info apps --device <id>
```

- `--device` accepts the UUID, UDID, ECID, serial, or the device name.
- Add `--json-output -` for machine-readable output (stable across releases); plain text is not.
- `devicectl` has no live log streaming subcommand. For unified logs use Console.app or `log collect --device` (see `ios-android-logs`).
- Device must be unlocked, trusted, and in Developer Mode (Settings > Privacy & Security > Developer Mode).

## Android (`adb`)

```bash
adb devices -l
npx cap run android --list
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.example.app/.MainActivity
adb shell am force-stop com.example.app
adb shell am start -W -a android.intent.action.VIEW -d "myapp://orders/42" com.example.app
adb shell pm get-app-links com.example.app        # App Links verification state (Android 12+)
adb shell pm grant com.example.app android.permission.CAMERA
adb shell pm revoke com.example.app android.permission.CAMERA
adb shell pm clear com.example.app                 # wipe data and runtime permission grants
adb reverse tcp:5173 tcp:5173                      # what --forwardPorts does
adb shell cmd uimode night yes
```
