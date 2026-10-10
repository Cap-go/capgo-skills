# Info.plist Keys and the Scene Lifecycle

## Keys that decide whether the app resizes

| Key | Capacitor template | Guidance |
|---|---|---|
| `UIRequiresFullScreen` | Absent | If present: iOS 27 ignores it. See TN3192: https://developer.apple.com/documentation/technotes/tn3192-migrating-your-app-from-the-deprecated-uirequiresfullscreen-key. Do not delete it, and do not add `UIRequiresFullScreenIgnoredStartingWithVersion`, without the user's decision after testing |
| `UISupportedInterfaceOrientations~ipad` | All four orientations | Keep all four. A resizable iPad window can take any shape |
| `UISupportedInterfaceOrientations` | Portrait, LandscapeLeft, LandscapeRight | Normal for iPhone. Also feeds the bridge's orientation mask on every device (see below) |
| `UILaunchStoryboardName` | `LaunchScreen` | Required. Missing launch screen = `ITMS-90870` on iOS 27 SDK uploads. TN3208: https://developer.apple.com/documentation/technotes/tn3208-preparing-your-apps-launch-screen-to-meet-app-store-requirements |
| `UIApplicationSceneManifest` | Present since Capacitor 8.5 | Required by Xcode 27 |
| `UIApplicationSupportsMultipleScenes` | `false` | Keep `false`. Multi-window would create a second bridge and WebView |
| `TARGETED_DEVICE_FAMILY` (build setting) | `1,2` | `1` = iPhone only; then the iPad runs the app in compatibility mode |

## The bridge orientation mask

`CAPBridgeViewController.setScreenOrientationDefaults()` reads only `UISupportedInterfaceOrientations` from Info.plist, and `supportedInterfaceOrientations` returns a mask built from it. On iPad, `UISupportedInterfaceOrientations~ipad` sets what the app declares, but the root view controller can still narrow it to the iPhone list (no upside-down in the template).

If the user wants the full iPad set, subclass the bridge:

```swift
import UIKit
import Capacitor

class MainViewController: CAPBridgeViewController {
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        traitCollection.userInterfaceIdiom == .pad ? .all : super.supportedInterfaceOrientations
    }
}
```

That idiom check is a legitimate device-class decision (what the hardware supports), not layout, and it reads the local trait collection. Instantiate the subclass in `SceneDelegate` (8.5+) or set it in `Main.storyboard` (before 8.5).

Orientation locks (`@capacitor/screen-orientation` `lock()`, Cordova orientation plugins) assume a full-screen app. Resizable windows can ignore them. For apps that must stay locked (games, camera-first apps), iOS 26 adds `prefersInterfaceOrientationLocked` on `UIViewController` with `setNeedsUpdateOfPrefersInterfaceOrientationLocked()`. Check Apple's current docs before you rely on it.

## Lifecycle under UIScene

After the scene manifest exists (Capacitor 8.5+):

| AppDelegate method | Status | Use instead |
|---|---|---|
| `applicationDidBecomeActive` / `WillResignActive` / `DidEnterBackground` / `WillEnterForeground` | Not called | `SceneDelegate` `sceneDidBecomeActive(_:)` etc., or observe `UIScene.*Notification` (filter to your scene) / `UIApplication.*Notification` |
| `application(_:open:options:)`, `application(_:continue:restorationHandler:)` | Not called | `SceneDelegate` forwarders to `SceneDelegateProxy` (see `capacitor-deep-linking`) |
| `didFinishLaunchingWithOptions`, `applicationWillTerminate`, push token callbacks | Still called | Keep one-time setup here |

Move all four lifecycle methods together, or none: mixing per-app and per-scene observation gives mismatched counts. The JS `pause` / `resume` events are already scene-driven in Capacitor 8.5+, filtered to the bridge's scene.

`UIApplication.shared.applicationState` still works with a single scene. Scene-aware code reads `view.window?.windowScene?.activationState` instead (Capacitor's `WebViewDelegationHandler` does this since 8.5).
