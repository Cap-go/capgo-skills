---
name: capacitor-testing
description: Testing guide for Capacitor apps and plugins. Covers web-layer unit and component tests with Vitest and mocked Capacitor plugins (`vi.mock('@capacitor/core')`, `registerPlugin`), Playwright for the web build, Appium E2E with NATIVE_APP / WEBVIEW context switching, native plugin unit tests with Swift Testing vs XCTest (what can migrate, `CAPPluginCall` patterns, `xcodebuild test` on a simulator) and Android JUnit, plus an agent-driven verification loop on simulators and devices (build, install, launch, screenshot, UI hierarchy, tap, logs) with `xcrun simctl`, `xcrun devicectl`, `adb`, Xcode MCP device tools, and live reload via `npx cap run --url` (Capacitor 9) or `-l --host --port` (Capacitor 8). Use when adding tests, mocking plugins, "does it work on device", verifying a UI change on a simulator, migrating XCTest to Swift Testing, or setting up test CI. Do not use for crash log capture (ios-android-logs), WebView debugging sessions (debugging-capacitor), or build pipelines (capacitor-ci-cd).
---

# Testing Capacitor Apps and Plugins

A Capacitor app has three layers to test: the web app (most logic), the native bridge and plugins (Swift/Kotlin), and the running app on a device. Pick the cheapest layer that can catch the bug.

## When to Use

TRIGGER when:
- Adding unit, component or E2E tests to a Capacitor app
- Mocking Capacitor or plugin APIs in Vitest / Jest
- Writing or modernizing native unit tests for a plugin (Swift Testing, XCTest, JUnit)
- Verifying a change on a simulator, emulator or device ("test this", "does it work", "check on device")
- E2E tests that cannot find web elements in the app (WebView context)
- Setting up test jobs in CI

Do not use:
- Reading device or crash logs: `ios-android-logs`
- Safari Web Inspector / Chrome DevTools debugging: `debugging-capacitor`
- Build, signing and release pipelines: `capacitor-ci-cd`
- App Intents tests: `capacitor-app-intents` (AppIntentsTesting)

## Choose the layer

| What changed | Test with | Reference |
|---|---|---|
| Business logic, state, services that call plugins | Vitest with mocked plugins | [references/web-unit-tests.md](references/web-unit-tests.md) |
| Components (React, Vue, Angular, Svelte) | Testing Library on Vitest | [references/web-unit-tests.md](references/web-unit-tests.md) |
| Web flows (routing, forms) | Playwright against the dev server or `dist` | [references/e2e.md](references/e2e.md) |
| Plugin native code (Swift / Kotlin) | Swift Testing or XCTest; JUnit | [references/native-plugin-tests.md](references/native-plugin-tests.md) |
| Full app on device, native UI, permissions, deep links | Agent verification loop; Appium or Maestro for repeatable suites | [references/device-verification-loop.md](references/device-verification-loop.md), [references/e2e.md](references/e2e.md) |
| CI jobs | GitHub Actions matrix | [references/ci.md](references/ci.md) |

Only load a reference when its layer is in play.

## Facts that save time

- **Plugins in jsdom run their web implementation**, or throw `unimplemented` when there is none. `Capacitor.isNativePlatform()` returns `false` in tests unless you mock `@capacitor/core`. Mock at the plugin package boundary, not deep inside the app.
- **E2E tools see the WebView as one native element.** Appium must switch to the `WEBVIEW_*` context to find DOM elements. Capacitor makes the WebView inspectable in debug builds; for release builds set `ios.webContentsDebuggingEnabled` / `android.webContentsDebuggingEnabled` in `capacitor.config`. Never ship release builds with it on by accident.
- **Detox is not an option.** It targets React Native and does not drive Capacitor WebView content.
- **Swift Testing cannot replace all XCTest.** UI tests (XCUIApplication) and `measure {}` performance tests stay XCTest. Unit tests can migrate one class at a time; a file can hold both.
- **iOS-only plugin packages cannot use `swift test`** because they depend on UIKit and Capacitor. Run `xcodebuild test -scheme <Package> -destination 'platform=iOS Simulator,...'`.
- **Capacitor 9 removed the deprecated Swift APIs.** Tests that build calls with the old `CAPPluginCall(callbackId:options:success:error:)` initializer or `CAPPlugin(bridge:pluginId:pluginName:)` must move to `CAPPluginCall(callbackId:methodName:options:success:error:)` and a plain `init()`.
- **Live reload flags changed in Capacitor 9.** Capacitor 9: `npx cap run ios --url http://<lan-ip>:5173`. Capacitor 8: `npx cap run ios -l --host <lan-ip> --port 5173`. The Ionic CLI's `ionic cap run ios -l --external` is a different tool.

## Workflow

1. **Inspect.** Read `package.json` (test runner, framework, `@capacitor/*` versions), `capacitor.config.*`, existing test config (`vitest.config.*`, `playwright.config.*`, `wdio.conf.*`, `.maestro/`), and for plugins `Package.swift`, the podspec, `ios/Tests/`, `android/src/test/`.
2. **Ask** which layer the user wants if the request is general. Suggest the cheapest one that covers the risk.
3. **Write tests** using the matching reference. Follow the project's existing runner and style; do not add a second runner.
4. **Run them** and show the output. A test that was never run is not done.
5. **For UI-affecting changes, run the device verification loop** ([references/device-verification-loop.md](references/device-verification-loop.md)) and report screenshots and findings.

## Verify

```bash
# Web layer
npx vitest run
npx playwright test

# Plugin, iOS (from the plugin repo)
xcodebuild test -scheme <PluginPackageName> \
  -destination "platform=iOS Simulator,name=$(xcrun simctl list devices available | grep -m1 -o 'iPhone [^(]*' | sed 's/ *$//')"

# Plugin, Android (from the plugin repo)
cd android && ./gradlew test

# App native tests, if the app has a test target
xcodebuild test -project ios/App/App.xcodeproj -scheme App -destination 'platform=iOS Simulator,name=<device>'
# CocoaPods projects: -workspace ios/App/App.xcworkspace
```

Report: tests added, command run, pass/fail counts, and anything that could not run locally (no simulator, no device, missing Android SDK).

## Error Handling

| Symptom | Cause | Fix |
|---|---|---|
| `"<Plugin>" plugin is not implemented on web` in Vitest | Real plugin running in jsdom | `vi.mock('<plugin package>')` in the setup file |
| Mock ignored, real plugin still called | Mock path differs from the import path, or the mock is registered after import | Mock the exact specifier the app imports. Put `vi.mock` in `setupFiles` or at the top of the test file |
| Appium cannot find `data-testid` elements | Still in the `NATIVE_APP` context | `await driver.switchContext(webviewContext)` after waiting for `getContexts()` to list a `WEBVIEW_*` entry |
| No `WEBVIEW_*` context | WebView not inspectable (release build) | Use a debug build, or enable `webContentsDebuggingEnabled` for the test build only |
| Android WebView context fails with a chromedriver version error | Chromedriver does not match the device WebView | Enable Appium's chromedriver autodownload (an insecure feature flag) or pin a matching chromedriver; check the Appium UiAutomator2 docs |
| `No such module 'Testing'` | Old Xcode | Swift Testing needs the Xcode 16+ toolchain. Capacitor 9 needs Xcode 27 anyway |
| `error: no such module 'UIKit'` from `swift test` | macOS host build of an iOS package | Use `xcodebuild test` with an iOS Simulator destination |
| `'init(callbackId:options:success:error:)' is deprecated` / unavailable | Old test helper | Add `methodName:` |
| Live reload: `error: unknown option '-l'` | Capacitor 9 CLI | Use `--url http://<lan-ip>:<port>` |
| Live reload app shows a blank page | Dev server bound to localhost, or wrong IP | Bind to `0.0.0.0` (Vite: `--host`), use the LAN IP, same Wi-Fi |

## Related Skills

- `debugging-capacitor`: inspect the WebView and native debuggers
- `ios-android-logs`: stream logs during device runs
- `capacitor-ci-cd`: build and release pipelines
- `capacitor-ios-resizability`: what to check in resized windows during device runs
- `capacitor-plugin-upgrade-v8-to-v9`: plugin API removals that affect test helpers
