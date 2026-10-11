# iOS: Capacitor 8 -> 9 (app)

## Requirements

- Xcode 27+ (ships Swift 6). Xcode 27 requires the UIScene lifecycle; apps on 8.4 or earlier must first follow `capacitor-uiscene-migration`. Apps already on the 8.5 scene template need nothing more for lifecycle.
- iOS deployment target 16.0.

## Deployment target

Xcode: Project and every app target -> Build Settings -> Deployment -> iOS Deployment Target = 16.0. Or check the file:

```bash
grep -n 'IPHONEOS_DEPLOYMENT_TARGET' ios/App/App.xcodeproj/project.pbxproj
```

CocoaPods projects, `ios/App/Podfile`:

```ruby
platform :ios, '16.0'
```

Extension targets (widgets, notification service, share) need their own target raised only if they link Capacitor.

## `@main`

```diff
-@UIApplicationMain
+@main
 class AppDelegate: UIResponder, UIApplicationDelegate {
```

## Removed APIs that show up in app code

The full table is in the plugin skill (`capacitor-plugin-upgrade-v8-to-v9`, `references/ios-api-removals.md`). Most likely in an app:

| Removed | Replacement |
|---|---|
| `CAPBridge.handleOpenUrl(_:_:)` | `ApplicationDelegateProxy.shared.application(_:open:options:)`; under UIScene, `SceneDelegateProxy.shared.scene(_:openURLContexts:)` in the SceneDelegate |
| `CAPBridge.handleContinueActivity(_:_:)` | `ApplicationDelegateProxy.shared.application(_:continue:restorationHandler:)`; under UIScene, `SceneDelegateProxy.shared.scene(_:continue:)` |
| `CAPBridge.handleAppBecameActive(_:)` | Delete (was a no-op) |
| `CAPBridge.getLastUrl()` | `ApplicationDelegateProxy.shared.lastURL` |
| `CAPBridge.statusBarTappedNotification` | `Notification.Name.capacitorStatusBarTapped` |
| `bridge.getWebView()` | `bridge.webView` |
| `bridge.presentVC(...)` / `dismissVC(...)` | `bridge.viewController?.present(...)` / `dismiss(...)` |
| `CAPNotifications` enum | `Notification.Name.capacitor*` |

Typical hit: an old AppDelegate with

```swift
func application(_ app: UIApplication, open url: URL, options: ...) -> Bool {
    return CAPBridge.handleOpenUrl(url, options)
}
```

Under the scene lifecycle this method is not called at all. Delete it and make sure the SceneDelegate forwards to `SceneDelegateProxy`.

Custom `CAPBridgeViewController` subclasses: check overrides against the bridge property list (`isSimEnvironment`, `isDevEnvironment`, `statusBarStyle`, `config.localURL`).

## Cordova layer

If `npx cap ls` lists no Cordova plugins, `CapacitorCordova` is no longer added to the Podfile / `CapApp-SPM/Package.swift` on sync. Any `import Cordova` or `CDV*` symbol in app code then fails. Remove the reference, or keep a Cordova plugin installed if the layer is truly needed.

## SPM

New Capacitor projects default to SPM, and CocoaPods Trunk is expected to become read-only on December 2, 2026. After the v9 build is green, suggest the `cocoapods-to-spm` skill (docs: https://capacitorjs.com/docs/ios/spm). Do not combine it with the major upgrade.

## Build

```bash
# SPM
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -destination 'generic/platform=iOS Simulator' build
# CocoaPods
cd ios/App && pod install && xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination 'generic/platform=iOS Simulator' build
```
