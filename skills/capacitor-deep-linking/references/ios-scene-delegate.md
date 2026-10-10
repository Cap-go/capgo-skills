# iOS URL Handling Under UIScene (Capacitor 8.5+)

Load when the app has `UIApplicationSceneManifest` in Info.plist, or custom native URL logic lives in `AppDelegate.swift`.

## What changed

- Capacitor 8.5 adopted the iOS scene lifecycle; Xcode 27 and Capacitor 9 require it.
- Once the scene manifest exists, iOS stops calling AppDelegate `application(_:open:options:)` and `application(_:continue:restorationHandler:)`. Code inside them silently stops running. No error, no warning.
- URL events arrive in `SceneDelegate`. The template forwards them to `SceneDelegateProxy.shared`, which:
  - Updates `lastURL` (backs `App.getLaunchUrl()`).
  - Re-posts the legacy `.capacitorOpenURL`, `.capacitorOpenUniversalLink`, and Cordova `CDVPluginHandleOpenURL` notifications with the same payload, so `@capacitor/app` and older plugins keep working.
  - Posts scene-scoped `.capacitorSceneOpenURL` / `.capacitorSceneOpenUniversalLink` (8.5+ only; `UIScene` is the notification `object`, payload in `userInfo`).
- Cold launch: iOS does NOT call `scene(_:openURLContexts:)` or `scene(_:continue:)`. The URL / user activity is inside `connectionOptions` passed to `scene(_:willConnectTo:options:)`. `SceneDelegateProxy` defers delivering those until the first `.capacitorViewDidAppear`, when plugins are registered.
- The remote-notification callbacks stay on AppDelegate.

## Template SceneDelegate (8.5)

```swift
import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()
        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
```

If any of the three forwarders is missing, `appUrlOpen` stops firing for that path.

## Moving custom AppDelegate logic

Before editing, show the user the old AppDelegate bodies and ask whether the custom code consumes the same URL as Capacitor (e.g. a third-party SDK that must see the URL first).

| Old AppDelegate method | New SceneDelegate location |
|------------------------|----------------------------|
| `application(_:open:options:)` warm | `scene(_:openURLContexts:)` - iterate `URLContexts`, use `context.url`, `context.options.sourceApplication` |
| `application(_:open:options:)` cold | `scene(_:willConnectTo:options:)` - read `connectionOptions.urlContexts` |
| `application(_:continue:restorationHandler:)` warm | `scene(_:continue:)` - same `NSUserActivity` |
| `application(_:continue:...)` cold | `scene(_:willConnectTo:options:)` - read `connectionOptions.userActivities` |
| `ApplicationDelegateProxy.shared.application(...)` forwarders | `SceneDelegateProxy.shared.scene(...)` forwarders |

```swift
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
        MySDK.handle(context.url) // custom logic, previously in AppDelegate
    }
    SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
}
```

For cold launch, apply the same custom logic to `connectionOptions.urlContexts` / `connectionOptions.userActivities` inside `willConnectTo`, and keep the proxy call after window setup.

Keep the `SceneDelegateProxy` forwarders even when adding custom code. Leaving the old AppDelegate methods in place is harmless (they no longer run) but confusing; ask before deleting.

Capacitor 9 removes deprecated APIs such as `CAPBridge.handleOpenUrl`. If AppDelegate still calls it, delete the call and rely on the scene forwarders.

## Plugin authors

Observe `.capacitorOpenURL` / `.capacitorOpenUniversalLink` if the plugin must support Capacitor < 8.5. Use the scene-scoped names only when the plugin's minimum is 8.5.

## Checks

```bash
/usr/libexec/PlistBuddy -c "Print :UIApplicationSceneManifest" ios/App/App/Info.plist
grep -n "configurationForConnecting" ios/App/App/AppDelegate.swift
grep -n "SceneDelegateProxy.shared" ios/App/App/SceneDelegate.swift   # expect 3 hits
```

Then test custom scheme and Universal Link both cold and warm.
