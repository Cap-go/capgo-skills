# Push Notifications

Native push notifications via FCM (Android) and APNs (iOS).

**Platforms:** Android, iOS

## Installation

```bash
npm install @capacitor/push-notifications
npx cap sync
```

## Configuration

### iOS

Enable the Push Notifications capability in Xcode, then add to `ios/App/App/AppDelegate.swift`:

```swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
  NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
}

func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
  NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
}
```

Without these, `register()` never fires the `registration` event on iOS.

### Android

- Add `google-services.json` to `android/app/`.
- Android 13+: `checkPermissions()` / `requestPermissions()`.
- Set `firebaseMessagingVersion` in `variables.gradle` (default: `25.0.1`).
- Notification icon in `android/app/src/main/AndroidManifest.xml` (white on transparent):

```xml
<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@mipmap/push_icon_name" />
```

### Capacitor Config

```json
{
  "plugins": {
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "banner", "list"]
    }
  }
}
```

## Usage

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

let permStatus = await PushNotifications.checkPermissions();
if (permStatus.receive === 'prompt') {
  permStatus = await PushNotifications.requestPermissions();
}

if (permStatus.receive !== 'granted') {
  console.warn('Push notification permission not granted');
} else {
  await PushNotifications.register();
}

PushNotifications.addListener('registration', (token) => {
  console.log('FCM/APNs token:', token.value);
});

PushNotifications.addListener('registrationError', (error) => {
  console.error('Registration failed:', error);
});

PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Received:', notification.title, notification.body);
});

PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
  console.log('Action:', action.actionId);
});
```

## Notes

- `presentationOptions`: use `banner` / `list` on iOS. `alert` is Android-only and is removed in Capacitor 9.
- iOS silent/background push (remote notifications) is not supported by this plugin; handle it natively.
- Android data-only notifications do not call `pushNotificationReceived` when the app is killed; use a native `FirebaseMessagingService`.
- Token registration callbacks are app-level, so they stay in `AppDelegate.swift` even after the Capacitor 8.5+ UIScene migration.
- Full setup, FCM/APNs keys, and troubleshooting: load the `capacitor-push-notifications` skill.
