# Device Verification Loop

Use this after a UI-affecting change to confirm it works in the real app: build, install, launch, look, interact, look again, report.

If the agent can run subagents, give this loop to a subagent with the device or session id, so screenshots and hierarchy dumps stay out of the main context.

## 1. Pick the tools

| Capability | Preferred | Fallback |
|---|---|---|
| Build + install + launch | `npx cap run ios|android --target <id>` | `xcodebuild` + `simctl` / `devicectl`; `gradlew` + `adb` |
| Screenshot | Xcode MCP device tools; `xcrun simctl io booted screenshot` | `adb exec-out screencap -p` |
| UI hierarchy with tap points | Xcode MCP device tools; Appium page source | `adb shell uiautomator dump` |
| Tap / type / swipe | Xcode MCP device tools; Appium | `adb shell input ...` (Android) |
| Web DOM state | Safari Web Inspector / `chrome://inspect` | Appium `WEBVIEW_*` context |
| Logs | `ios-android-logs` skill | `xcrun simctl spawn booted log stream`, `adb logcat` |

Xcode's MCP tools (when the agent has them; tool names carry a server prefix that varies) build the workspace, install and run, capture screenshot and hierarchy with `hitPoint` coordinates, and synthesize touches. Prefer them on iOS. `simctl` has no tap or hierarchy command.

## 2. Build, install, launch

```bash
npm run build && npx cap sync

# List targets, then run (builds, installs, launches)
npx cap run ios --list
npx cap run ios --target <UDID>
npx cap run android --list
npx cap run android --target <device-id>
```

Live reload while iterating on web code:

```bash
# Capacitor 9
npx cap run ios --url http://192.168.1.20:5173
# Capacitor 8
npx cap run ios -l --host 192.168.1.20 --port 5173
# Android emulator, optional: forward the port instead of using the LAN IP
npx cap run android -l --host localhost --port 5173 --forwardPorts 5173:5173   # Capacitor 8
```

Bind the dev server to the LAN (`vite --host`). Check `npx cap run --help` for the installed CLI's flags.

Manual iOS path (simulator):

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -destination 'id=<UDID>' -derivedDataPath ios/build build      # -workspace for CocoaPods
xcrun simctl boot <UDID> 2>/dev/null || true
xcrun simctl install <UDID> ios/build/Build/Products/Debug-iphonesimulator/App.app
xcrun simctl launch --console-pty <UDID> <bundle-id>             # stdout/stderr in the terminal
```

Physical iOS device:

```bash
xcrun devicectl list devices
xcrun devicectl device install app --device <device-id> <path>/App.app
xcrun devicectl device process launch --device <device-id> <bundle-id>
```

Android:

```bash
cd android && ./gradlew assembleDebug && cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p <app-id> -c android.intent.category.LAUNCHER 1
```

## 3. Observe

Wait until the WebView has rendered (the first capture after launch often shows the splash screen). Then capture both a screenshot and the hierarchy:

```bash
xcrun simctl io booted screenshot /tmp/shot-1.png
adb exec-out screencap -p > /tmp/shot-1.png
adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml /tmp/ui.xml
```

WebView content appears in the native hierarchy only through accessibility. Some elements may show as one opaque or placeholder node. If an element you need is missing, give it an accessible name, or switch to WebView inspection.

## 4. Interact

- Tap at the hierarchy's computed tap point (`hitPoint` in Xcode tools, `bounds` center in uiautomator XML). Use screenshot-estimated coordinates only after a hierarchy tap was tried and failed.
- Android: `adb shell input tap <x> <y>`, `adb shell input text 'hello'`, `adb shell input keyevent KEYCODE_BACK`, `adb shell input swipe x1 y1 x2 y2 300`.
- After each interaction, capture again and compare. If nothing changed, recapture once (animation) and retry once. Then report the failure instead of looping.

Useful system actions:

```bash
xcrun simctl openurl booted 'myapp://orders/42'                       # deep link
adb shell am start -W -a android.intent.action.VIEW -d 'myapp://orders/42' <app-id>
xcrun simctl push booted <bundle-id> payload.apns                      # push (simulator)
xcrun simctl privacy booted grant camera <bundle-id>                   # skip permission prompt
xcrun simctl ui booted appearance dark
xcrun simctl location booted set 48.8566,2.3522
xcrun simctl status_bar booted override --time 9:41                    # clean screenshots
adb shell pm grant <app-id> android.permission.CAMERA
```

Test cold and warm paths for deep links and push taps: terminate the app (`xcrun simctl terminate booted <bundle-id>`, `adb shell am force-stop <app-id>`), then open the link.

## 5. Judge and report

Always report:
- Functional bugs: no response to a tap, wrong screen, missing data, crash or app exit (watch the process and the console output).
- Visual bugs: overlapping or truncated text, content under the status bar or home indicator, wrong colors, broken layout at the current window size.

Do not report:
- Transient states (spinners, animations, keyboard transitions). Capture again after they settle.
- Expected states: empty states, disabled buttons on incomplete forms, system permission dialogs.

Report format: steps run, screenshots (paths), what matched, what did not, suspected code location, and log excerpts for crashes.

## Close sessions

Shut down what you started: `xcrun simctl shutdown <UDID>`, stop live-reload servers, end Xcode MCP device sessions. They hold memory and ports.
