# iOS Push Setup (@capacitor/push-notifications)

Load when configuring iOS push or debugging iOS tokens.

## 1. Apple side

1. Xcode -> App target -> Signing & Capabilities -> + Push Notifications. This adds `aps-environment` to `App.entitlements`.
2. Optional: + Background Modes -> Remote notifications (only needed for content-available/background pushes handled natively).
3. Apple Developer -> Keys -> create a key with Apple Push Notifications service (APNs). Download the `.p8` once; note Key ID and Team ID. One key works for all apps in the team and for sandbox + production.

## 2. AppDelegate forwarding (APNs token)

Remote-notification callbacks are app-level. They stay in `AppDelegate.swift` even after the Capacitor 8.5 UIScene migration; do not move them to `SceneDelegate`.

```swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
}

func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
}
```

With this, `registration` returns the hex APNs token. Use it only if your backend talks to APNs directly.

## 3. FCM token on iOS (backend uses Firebase)

1. Add `GoogleService-Info.plist` to `ios/App/App/` through Xcode (must be in the App target).
2. Add the `FirebaseMessaging` dependency:
   - SPM (default for new Capacitor 8+ projects): Xcode -> Package Dependencies -> `https://github.com/firebase/firebase-ios-sdk` -> product `FirebaseMessaging` on the App target.
   - CocoaPods: `pod 'FirebaseMessaging'` in the App target of `ios/App/Podfile`, then `npx cap sync ios`. CocoaPods Trunk is expected to go read-only Dec 2, 2026; prefer SPM (`cocoapods-to-spm`).
3. Replace the forwarding:

```swift
import FirebaseCore
import FirebaseMessaging

// in application(_:didFinishLaunchingWithOptions:)
FirebaseApp.configure()

func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Messaging.messaging().apnsToken = deviceToken
    Messaging.messaging().token { token, error in
        if let error {
            NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
        } else if let token {
            NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: token)
        }
    }
}
```

4. Firebase Console -> Project Settings -> Cloud Messaging -> Apple app configuration -> upload the `.p8` with Key ID and Team ID.

Alternative without native edits: `@capgo/capacitor-firebase-messaging` returns the FCM token on both platforms via `getToken()`.

## 4. Rich notifications (images)

Requires a Notification Service Extension target (File -> New -> Target -> Notification Service Extension), payload with `"mutable-content": 1`, and code in the extension that downloads the attachment within the ~30 s budget. The extension is a separate target with its own bundle ID and provisioning profile; set its deployment target to match the app.

## 5. Environments

- Debug builds from Xcode use the APNs sandbox (`aps-environment = development`).
- TestFlight and App Store builds use production. A sandbox token sent to production APNs fails with `BadDeviceToken`.
- FCM picks the environment automatically from the APNs token type.

## Checks

```bash
grep -n "capacitorDidRegisterForRemoteNotifications" ios/App/App/AppDelegate.swift
plutil -p ios/App/App/App.entitlements | grep aps-environment
grep -n "FirebaseApp.configure" ios/App/App/AppDelegate.swift   # only if using FCM on iOS
```
