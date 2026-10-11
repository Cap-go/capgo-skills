# Rule: Minimum SDK and UIScene Lifecycle
- **Guideline**: App Store Connect upload requirements (not an App Review Guideline number); 2.1 App Completeness if the build crashes
- **Severity**: UPLOAD BLOCKER / REJECTION
- **Category**: build

## What to Check

- Since April 28, 2026, iOS and iPadOS uploads must be built with Xcode 26+ against the iOS 26 SDK. Starting April 2027, the iOS 27 SDK (Xcode 27) is required. Apple announces exact dates at developer.apple.com/news/upcoming-requirements.
- Apps built with the iOS 27 SDK must use the UIScene lifecycle; an app still on the legacy AppDelegate-window lifecycle will not launch.
- Capacitor 8.5 adopted UIScene. Capacitor 8.0-8.4 projects need the 8.5 update plus three project changes; Capacitor 9 (Xcode 27 minimum) assumes them.

## How to Detect

```bash
xcodebuild -version
grep -n "\"@capacitor/ios\"" package.json
test -f ios/App/App/SceneDelegate.swift && echo "SceneDelegate present" || echo "MISSING SceneDelegate"
plutil -p ios/App/App/Info.plist | grep -A6 UIApplicationSceneManifest
grep -n "configurationForConnecting" ios/App/App/AppDelegate.swift
grep -n "@UIApplicationMain" ios/App/App/AppDelegate.swift   # Swift 6 / Xcode 27 rejects this; use @main
```

Native code that will silently stop running after scene adoption:

```bash
grep -n "func application(_ app: UIApplication, open url\|continue userActivity\|applicationDidBecomeActive\|applicationWillResignActive\|applicationDidEnterBackground\|applicationWillEnterForeground" ios/App/App/AppDelegate.swift
```

## Resolution

1. Update to `@capacitor/core`, `@capacitor/ios`, `@capacitor/cli` 8.5+ (`npm i @capacitor/core@^8.5.0 @capacitor/ios@^8.5.0 && npm i -D @capacitor/cli@^8.5.0`).
2. Run `npx cap migrate` (Capacitor CLI 8.5+) for template-shaped projects; it adds the scene files and prints what it could not change. Otherwise add `SceneDelegate.swift`, the `UIApplicationSceneManifest` entry, and `application(_:configurationForConnecting:options:)` in `AppDelegate` exactly as in the Capacitor 8.5 update guide (capacitorjs.com/docs/updating/8-5). Load `capacitor-app-upgrades` for the full steps.
3. Move custom URL/universal-link/lifecycle code from `AppDelegate` to the scene delegate or rely on `SceneDelegateProxy` forwarding (Capacitor plugins keep receiving `.capacitorOpenURL` / `.capacitorOpenUniversalLink`).
4. Replace `@UIApplicationMain` with `@main`.
5. Verify: app launches, JS `pause`/`resume` fire on background/foreground, custom-scheme and universal links reach `appUrlOpen` both cold and warm, `App.getLaunchUrl()` returns the cold-start URL.
6. Archive with the required Xcode and validate in Organizer.

## Example Upload Error

> ITMS-90725: SDK version issue - This app was built with the iOS 18.x SDK. All iOS and iPadOS apps must be built with the iOS 26 SDK or later, included in Xcode 26 or later, in order to be uploaded to App Store Connect or submitted for distribution.

Wording may differ; match on ITMS-90725 and the SDK version.
