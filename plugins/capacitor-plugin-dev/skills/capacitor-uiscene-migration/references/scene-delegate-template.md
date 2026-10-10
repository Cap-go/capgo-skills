# Scene Delegate Template and Merge Recipes

All three pieces must exist together. Two out of three is the "partial" state.

## 1. `ios/App/App/SceneDelegate.swift` (Capacitor 8.5 template, SPM and CocoaPods)

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

### Variant: custom bridge subclass

Replace `CAPBridgeViewController()` with the subclass, e.g. `MyViewController()`. If the subclass was only loaded from the storyboard and needs storyboard outlets, instantiate it from the storyboard instead:

```swift
window?.rootViewController = UIStoryboard(name: "Main", bundle: nil).instantiateInitialViewController()
```

### Variant: moved custom URL logic

Keep the proxy call first so Capacitor plugins and `appUrlOpen` still see the URL, then run the app's own code:

```swift
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    for context in URLContexts {
        // moved from AppDelegate.application(_:open:options:)
        MyRouter.handle(context.url)
    }
}
```

If that logic must also run on cold launch, read `connectionOptions.urlContexts` in `scene(_:willConnectTo:options:)` after the proxy call.

### Variant: moved lifecycle code

```swift
func sceneDidBecomeActive(_ scene: UIScene) { /* was applicationDidBecomeActive */ }
func sceneWillResignActive(_ scene: UIScene) { /* was applicationWillResignActive */ }
func sceneWillEnterForeground(_ scene: UIScene) { /* was applicationWillEnterForeground */ }
func sceneDidEnterBackground(_ scene: UIScene) { /* was applicationDidEnterBackground */ }
```

Alternative that does not depend on which delegate is active: observe `UIApplication.didBecomeActiveNotification` etc. from `didFinishLaunchingWithOptions`.

## 2. `Info.plist` manifest

Merge inside the top-level `<dict>`. If a manifest already exists, add only missing keys and keep `UISceneDelegateClassName` pointing at the class you actually use.

```xml
<key>UIApplicationSceneManifest</key>
<dict>
    <key>UIApplicationSupportsMultipleScenes</key>
    <false/>
    <key>UISceneConfigurations</key>
    <dict>
        <key>UIWindowSceneSessionRoleApplication</key>
        <array>
            <dict>
                <key>UISceneConfigurationName</key>
                <string>Default Configuration</string>
                <key>UISceneDelegateClassName</key>
                <string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
                <key>UISceneStoryboardFile</key>
                <string>Main</string>
            </dict>
        </array>
    </dict>
</dict>
```

Validate after editing: `plutil -lint ios/App/App/Info.plist`.

## 3. `AppDelegate.swift` hook

Insert before the class's closing brace; do not move other methods:

```swift
func application(_ application: UIApplication,
                 configurationForConnecting connectingSceneSession: UISceneSession,
                 options: UIScene.ConnectionOptions) -> UISceneConfiguration {
    let config = UISceneConfiguration(name: "Default Configuration",
                                      sessionRole: connectingSceneSession.role)
    config.delegateClass = SceneDelegate.self
    return config
}
```

The 8.5 template AppDelegate no longer has `application(_:open:options:)` or `application(_:continue:restorationHandler:)`. Removing forwarder-only copies is safe; they never run once the manifest exists.

Keep push callbacks (`didRegisterForRemoteNotificationsWithDeviceToken`, `didFailToRegisterForRemoteNotificationsWithError`) in the AppDelegate. They are app-level and unaffected.

For Capacitor 9 also change `@UIApplicationMain` to `@main` (Swift 6 rejects the old attribute). On 8.5 the template still uses `@UIApplicationMain`, and `@main` works there too.
