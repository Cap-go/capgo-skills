# UIScene Regressions (Capacitor 8.5+, Xcode 27)

Capacitor 8.5 adopted the iOS UIScene lifecycle; Xcode 27 requires it. Once `UIApplicationSceneManifest` exists in `Info.plist`, iOS routes URL, user-activity and foreground/background events to the **scene** delegate. This file maps symptoms to causes. To perform or repair the migration itself, switch to `capacitor-uiscene-migration`.

## What still works vs what silently stops

| AppDelegate method | Under UIScene |
|---|---|
| `application(_:didFinishLaunchingWithOptions:)` | still called |
| push token / remote notification callbacks | still called |
| `applicationWillTerminate` | still called |
| `application(_:open:options:)` | **not called** -> `scene(_:openURLContexts:)` |
| `application(_:continue:restorationHandler:)` | **not called** -> `scene(_:continue:)` |
| `applicationDidBecomeActive` / `WillResignActive` / `DidEnterBackground` / `WillEnterForeground` | **not called** -> `sceneDidBecomeActive` etc., or observe `UIApplication.*Notification` (still posted) |
| `launchOptions[.url]` in `didFinishLaunching` | nil for scene apps -> URL arrives in `connectionOptions.urlContexts` |

## Template SceneDelegate (8.5)

The shipped `ios/App/App/SceneDelegate.swift` creates the window with `CAPBridgeViewController` and forwards three calls to `SceneDelegateProxy.shared`: `scene(_:willConnectTo:options:)`, `scene(_:openURLContexts:)`, `scene(_:continue:)`. The proxy re-posts `.capacitorOpenURL` / `.capacitorOpenUniversalLink` (so `@capacitor/app` `appUrlOpen` keeps working), populates `App.getLaunchUrl()`, and replays cold-start `connectionOptions.urlContexts` / `userActivities` after plugins load.

## Symptom -> diagnosis

1. **`appUrlOpen` never fires (custom scheme), Android fine**
   - `grep -n "SceneDelegateProxy" ios/App/App/SceneDelegate.swift` -> missing `openURLContexts` forwarding.
   - Custom URL logic still lives in AppDelegate `open url` -> dead code now.
2. **Universal link opens the app but nothing routes**
   - `scene(_:continue:)` missing or not forwarding. Confirm the entitlement/AASA separately (`capacitor-deep-linking`).
3. **Link works warm, lost on cold start**
   - Custom `scene(_:willConnectTo:options:)` that does not call `SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)`; cold-start URLs only exist in `connectionOptions`.
   - JS reads the URL too early: call `App.getLaunchUrl()` once at bootstrap and also register `appUrlOpen`.
4. **JS `pause` / `resume` missing**
   - Capacitor 8.5 drives them from `UIScene.didEnterBackgroundNotification` / `willEnterForegroundNotification` filtered to the bridge's scene. If they never fire, the bridge view controller is not in a scene window (custom root VC setup) or the project is not actually on 8.5 (`npx cap doctor`).
5. **Custom analytics / lock-screen / SDK init on foreground stopped**
   - Code inside `applicationDidBecomeActive` etc. Move to SceneDelegate methods or `UIApplication.didBecomeActiveNotification` observers.
6. **Third-party plugin breaks after 8.5** (OAuth redirect, payment return URL, Facebook/Google SDK `open url`)
   - Plugin hooks AppDelegate `open url` directly. Check whether it observes `.capacitorOpenURL` (works) or needs its own forwarding call added to `scene(_:openURLContexts:)`; check for an updated plugin release.
7. **Build or runtime issue `tmpWindow` / `TmpViewController` not found** -> removed in 8.5; delete those references.
8. **Xcode 27 console: `CLIENT OF UIKIT REQUIRES UPDATE`** -> scene manifest not adopted; run the migration (`npx cap migrate` for template-shaped projects).

## Test matrix

```bash
# warm
xcrun simctl openurl booted "myapp://test/warm"
# cold: kill first
xcrun simctl terminate booted com.example.app && xcrun simctl openurl booted "myapp://test/cold"
# device equivalents
xcrun devicectl device process openURL --device <id> "myapp://test/warm"
xcrun devicectl device process launch --device <id> --terminate-existing --payload-url "myapp://test/cold" com.example.app
```

Background and foreground the app (Home gesture / `Cmd+Shift+H` in Simulator) and confirm `pause` then `resume` in the Safari inspector console.
